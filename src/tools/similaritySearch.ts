import { SchemaType, type FunctionDeclaration } from '@google/generative-ai';
import {
  performSimilaritySearch,
  similaritySearchService,
  type SimilaritySearchResult,
} from '../utils/similaritySearch';
import json from '../../documents.json';
export const similaritySearchTool: FunctionDeclaration = {
  name: 'similaritySearch',
  description:
    'Performs semantic similarity search between a query string and a list of candidate strings. Returns the most similar strings ranked by relevance score. Useful for finding related content, matching user queries to available options, or content recommendation.',
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      query: {
        type: SchemaType.STRING,
        description:
          'The input string to search for (e.g., user question, search term)',
      },
      topK: {
        type: SchemaType.INTEGER,
        description:
          'Number of top similar results to return (default: 5, max: 20)',
      },
      threshold: {
        type: SchemaType.NUMBER,
        description:
          'Minimum similarity score threshold (0.0 to 1.0, default: 0.0)',
      },
    },
    required: ['query'],
  },
};

export const batchSimilaritySearchTool: FunctionDeclaration = {
  name: 'batchSimilaritySearch',
  description:
    'Performs semantic similarity search for multiple queries against the same set of candidates. Efficient for processing multiple user questions or symptoms at once. Returns results for each query separately.',
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      queries: {
        type: SchemaType.ARRAY,
        description:
          'Array of query strings to search for (e.g., multiple symptoms, questions)',
        items: {
          type: SchemaType.STRING,
        },
      },

      topK: {
        type: SchemaType.INTEGER,
        description:
          'Number of top similar results to return per query (default: 5, max: 20)',
      },
      threshold: {
        type: SchemaType.NUMBER,
        description:
          'Minimum similarity score threshold (0.0 to 1.0, default: 0.0)',
      },
    },
    required: ['queries'],
  },
};

interface SimilaritySearchParams {
  query: string;
  topK?: number;
  threshold?: number;
}

interface BatchSimilaritySearchParams {
  queries: string[];
  topK?: number;
  threshold?: number;
}
const candidates = json;

export async function executeSimilaritySearch(
  authToken: string,
  params: SimilaritySearchParams
): Promise<{
  success: boolean;
  results?: SimilaritySearchResult[];
  error?: string;
  metadata?: {
    queryProcessed: string;
    totalCandidates: number;
    resultsReturned: number;
    processingTime: number;
  };
}> {
  const startTime = Date.now();

  try {
    const { query, topK = 6, threshold = 0.0 } = params;
    // Validate parameters
    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return {
        success: false,
        error: 'Query must be a non-empty string',
      };
    }

    if (!Array.isArray(candidates)) {
      return {
        success: false,
        error: 'Candidates must be an array of strings',
      };
    }

    if (candidates.length === 0) {
      return {
        success: true,
        results: [],
        metadata: {
          queryProcessed: query.trim(),
          totalCandidates: 0,
          resultsReturned: 0,
          processingTime: Date.now() - startTime,
        },
      };
    }

    // Validate and sanitize topK
    const sanitizedTopK = Math.min(Math.max(1, topK || 5), 20);

    // Validate threshold
    const sanitizedThreshold = Math.min(Math.max(0, threshold || 0), 1);

    // Filter out non-string candidates
    const validCandidates = candidates.filter(
      (candidate) =>
        typeof candidate === 'string' && candidate.trim().length > 0
    );

    if (validCandidates.length === 0) {
      return {
        success: true,
        results: [],
        metadata: {
          queryProcessed: query.trim(),
          totalCandidates: candidates.length,
          resultsReturned: 0,
          processingTime: Date.now() - startTime,
        },
      };
    }

    console.log(
      `Performing similarity search for query: "${query}" against ${validCandidates.length} candidates`
    );

    // Perform similarity search
    const results = await performSimilaritySearch(
      query.trim(),
      validCandidates,
      sanitizedTopK,
      sanitizedThreshold
    );

    const processingTime = Date.now() - startTime;

    console.log(
      `Similarity search completed in ${processingTime}ms, found ${results.length} results`
    );

    return {
      success: true,
      results,
      metadata: {
        queryProcessed: query.trim(),
        totalCandidates: validCandidates.length,
        resultsReturned: results.length,
        processingTime,
      },
    };
  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error('Error in similarity search tool:', error);

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Unknown error occurred during similarity search',
      metadata: {
        queryProcessed: params.query || '',
        totalCandidates: Array.isArray(candidates) ? candidates.length : 0,
        resultsReturned: 0,
        processingTime,
      },
    };
  }
}

export async function executeBatchSimilaritySearch(
  authToken: string,
  params: BatchSimilaritySearchParams
): Promise<{
  success: boolean;
  results?: Record<string, SimilaritySearchResult[]>;
  error?: string;
  metadata?: {
    queriesProcessed: string[];
    totalCandidates: number;
    totalResultsReturned: number;
    processingTime: number;
  };
}> {
  const startTime = Date.now();

  try {
    const { queries, topK = 5, threshold = 0.0 } = params;

    // Validate parameters
    if (!Array.isArray(queries) || queries.length === 0) {
      return {
        success: false,
        error: 'Queries must be a non-empty array of strings',
      };
    }

    if (!Array.isArray(candidates)) {
      return {
        success: false,
        error: 'Candidates must be an array of strings',
      };
    }

    // Filter out invalid queries
    const validQueries = queries.filter(
      (query) => typeof query === 'string' && query.trim().length > 0
    );

    if (validQueries.length === 0) {
      return {
        success: true,
        results: {},
        metadata: {
          queriesProcessed: [],
          totalCandidates: candidates.length,
          totalResultsReturned: 0,
          processingTime: Date.now() - startTime,
        },
      };
    }

    // Filter out invalid candidates
    const validCandidates = candidates;
    if (validCandidates.length === 0) {
      const emptyResults: Record<string, SimilaritySearchResult[]> = {};
      validQueries.forEach((query) => {
        emptyResults[query] = [];
      });

      return {
        success: true,
        results: emptyResults,
        metadata: {
          queriesProcessed: validQueries,
          totalCandidates: 0,
          totalResultsReturned: 0,
          processingTime: Date.now() - startTime,
        },
      };
    }

    // Validate and sanitize parameters
    const sanitizedTopK = Math.min(Math.max(1, topK || 5), 20);
    const sanitizedThreshold = Math.min(Math.max(0, threshold || 0), 1);

    console.log(
      `Performing batch similarity search for ${validQueries.length} queries against ${validCandidates.length} candidates`
    );

    // Perform batch similarity search
    const results = await similaritySearchService.batchSimilaritySearch(
      validQueries,
      validCandidates,
      sanitizedTopK,
      sanitizedThreshold
    );

    const totalResultsReturned = Object.values(results).reduce(
      (sum, queryResults) => sum + queryResults.length,
      0
    );

    const processingTime = Date.now() - startTime;

    console.log(
      `Batch similarity search completed in ${processingTime}ms, found ${totalResultsReturned} total results`
    );

    return {
      success: true,
      results,
      metadata: {
        queriesProcessed: validQueries,
        totalCandidates: validCandidates.length,
        totalResultsReturned,
        processingTime,
      },
    };
  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error('Error in batch similarity search tool:', error);

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Unknown error occurred during batch similarity search',
      metadata: {
        queriesProcessed: Array.isArray(params.queries) ? params.queries : [],
        totalCandidates: Array.isArray(candidates) ? candidates.length : 0,
        totalResultsReturned: 0,
        processingTime,
      },
    };
  }
}

// Helper function for medical symptom matching (specific to clinic use case)
export async function findSimilarSymptoms(
  userSymptom: string,
  knownSymptoms: string[],
  topK: number = 3
): Promise<SimilaritySearchResult[]> {
  try {
    return await performSimilaritySearch(userSymptom, knownSymptoms, topK, 0.1);
  } catch (error) {
    console.error('Error finding similar symptoms:', error);
    return [];
  }
}

// Helper function for package recommendation (specific to clinic use case)
export async function findSimilarPackages(
  userQuery: string,
  packageDescriptions: string[],
  topK: number = 5
): Promise<SimilaritySearchResult[]> {
  try {
    return await performSimilaritySearch(
      userQuery,
      packageDescriptions,
      topK,
      0.2
    );
  } catch (error) {
    console.error('Error finding similar packages:', error);
    return [];
  }
}
