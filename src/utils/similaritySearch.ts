import { OpenAIEmbeddings } from '@langchain/openai';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import { Document } from '@langchain/core/documents';
import dotenv from 'dotenv';

dotenv.config();

export interface SimilaritySearchResult {
  content: string;
  score: number;
  metadata?: Record<string, any>;
}

export class SimilaritySearchService {
  private embeddings: OpenAIEmbeddings;
  private vectorStore: MemoryVectorStore | null = null;

  constructor() {
    // Initialize OpenAI embeddings
    this.embeddings = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY,
      modelName: 'text-embedding-3-small', // Cost-effective embedding model
    });
  }

  /**
   * Performs similarity search between a query string and a list of candidate strings
   * @param query - The input string to search for
   * @param candidates - Array of strings to search within
   * @param topK - Number of top similar results to return (default: 5)
   * @param threshold - Minimum similarity score threshold (default: 0.0)
   * @returns Array of similarity search results sorted by relevance
   */
  async similaritySearch(
    query: string,
    candidates: string[],
    topK: number = 5,
    threshold: number = 0.0
  ): Promise<SimilaritySearchResult[]> {
    try {
      // Validate inputs
      if (!query || query.trim().length === 0) {
        throw new Error('Query string cannot be empty');
      }

      if (!candidates || candidates.length === 0) {
        return [];
      }

      // Filter out empty candidates
      const validCandidates = candidates.filter(
        (candidate) => candidate && candidate.trim().length > 0
      );

      if (validCandidates.length === 0) {
        return [];
      }

      // Create documents from candidates
      const documents = validCandidates.map(
        (candidate, index) =>
          new Document({
            pageContent: candidate,
            metadata: { originalIndex: index, source: 'candidate' },
          })
      );

      // Create vector store from documents
      this.vectorStore = await MemoryVectorStore.fromDocuments(
        documents,
        this.embeddings
      );

      // Perform similarity search
      const results = await this.vectorStore.similaritySearchWithScore(
        query,
        Math.min(topK, validCandidates.length)
      );

      // Filter by threshold and format results
      const formattedResults: SimilaritySearchResult[] = results
        .filter(([_, score]) => score >= threshold)
        .map(([document, score]) => ({
          content: document.pageContent,
          score: score,
          metadata: document.metadata,
        }))
        .sort((a, b) => b.score - a.score); // Sort by score descending

      return formattedResults;
    } catch (error) {
      console.error('Error in similarity search:', error);
      console.log('Falling back to text-based similarity search...');

      // Fallback to text-based similarity search
      try {
        return await this.fallbackSimilaritySearch(
          query,
          candidates.filter(
            (candidate) => candidate && candidate.trim().length > 0
          ),
          topK
        );
      } catch (fallbackError) {
        console.error('Fallback similarity search also failed:', fallbackError);
        throw new Error(
          `Both embedding and fallback similarity search failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    }
  }

  /**
   * Alternative similarity search using cosine similarity for cases where OpenAI API is not available
   * This is a fallback method using simple text-based similarity
   */
  async fallbackSimilaritySearch(
    query: string,
    candidates: string[],
    topK: number = 5
  ): Promise<SimilaritySearchResult[]> {
    try {
      if (!query || query.trim().length === 0) {
        throw new Error('Query string cannot be empty');
      }

      if (!candidates || candidates.length === 0) {
        return [];
      }

      const validCandidates = candidates.filter(
        (candidate) => candidate && candidate.trim().length > 0
      );

      if (validCandidates.length === 0) {
        return [];
      }

      // Simple text-based similarity using Jaccard similarity
      const results = validCandidates
        .map((candidate, index) => ({
          content: candidate,
          score: this.calculateJaccardSimilarity(
            query.toLowerCase(),
            candidate.toLowerCase()
          ),
          metadata: { originalIndex: index, source: 'candidate' },
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, topK);

      return results;
    } catch (error) {
      console.error('Error in fallback similarity search:', error);
      throw new Error(
        `Fallback similarity search failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Calculate Jaccard similarity between two strings
   */
  private calculateJaccardSimilarity(str1: string, str2: string): number {
    const set1 = new Set(str1.split(/\s+/));
    const set2 = new Set(str2.split(/\s+/));

    const intersection = new Set([...set1].filter((x) => set2.has(x)));
    const union = new Set([...set1, ...set2]);

    return intersection.size / union.size;
  }

  /**
   * Batch similarity search for multiple queries
   */
  async batchSimilaritySearch(
    queries: string[],
    candidates: string[],
    topK: number = 5,
    threshold: number = 0.0
  ): Promise<Record<string, SimilaritySearchResult[]>> {
    const results: Record<string, SimilaritySearchResult[]> = {};

    for (const query of queries) {
      try {
        results[query] = await this.similaritySearch(
          query,
          candidates,
          topK,
          threshold
        );
      } catch (error) {
        console.error(`Error processing query "${query}":`, error);
        results[query] = [];
      }
    }

    return results;
  }
}

// Export a singleton instance for easy use
export const similaritySearchService = new SimilaritySearchService();

/**
 * Convenience function for quick similarity search
 * @param query - The input string to search for
 * @param candidates - Array of strings to search within
 * @param topK - Number of top similar results to return
 * @param threshold - Minimum similarity score threshold
 * @returns Array of similarity search results
 */
export async function performSimilaritySearch(
  query: string,
  candidates: string[],
  topK: number = 5,
  threshold: number = 0.0
): Promise<SimilaritySearchResult[]> {
  return similaritySearchService.similaritySearch(
    query,
    candidates,
    topK,
    threshold
  );
}
