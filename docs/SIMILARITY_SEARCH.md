# Similarity Search with LangChain

This document describes the similarity search functionality implemented in the clinic AI agent using LangChain and OpenAI embeddings.

## Overview

The similarity search feature allows the AI agent to find semantically similar content by comparing a query string against a list of candidate strings. This is particularly useful for:

- **Medical symptom matching**: Finding similar symptoms in a knowledge base
- **Package recommendation**: Suggesting relevant consultation packages based on user queries
- **Content discovery**: Helping users find relevant information
- **Query understanding**: Improving the AI's ability to understand user intent

## Features

### Core Functionality
- **Semantic similarity search** using OpenAI embeddings
- **Fallback text-based similarity** using Jaccard similarity when OpenAI API is unavailable
- **Batch processing** for multiple queries
- **Configurable parameters** (top-K results, similarity threshold)
- **Comprehensive error handling** and validation

### Integration
- **Gemini function calling** integration for seamless AI agent usage
- **TypeScript support** with full type definitions
- **Caching support** through the existing Redis infrastructure
- **Medical domain helpers** for clinic-specific use cases

## Installation

The required dependencies are already installed:

```bash
bun add langchain @langchain/community @langchain/openai
```

## Configuration

Add your OpenAI API key to the `.env` file:

```env
OPENAI_API_KEY=your_openai_api_key_here
```

## Usage

### Basic Usage

```typescript
import { performSimilaritySearch } from './src/utils/similaritySearch';

const query = 'headache and fever';
const symptoms = [
  'severe headache with nausea',
  'high fever and chills',
  'stomach pain and vomiting',
  'headache with light sensitivity'
];

const results = await performSimilaritySearch(query, symptoms, 3, 0.1);
console.log(results);
```

### Gemini Function Calling

The similarity search is automatically available as a tool in the Gemini AI agent:

```json
{
  "userId": "user123",
  "message": "Find similar symptoms to 'chest pain and difficulty breathing' from the available symptoms list"
}
```

### Medical Domain Helpers

```typescript
import { findSimilarSymptoms, findSimilarPackages } from './src/tools/similaritySearch';

// Find similar symptoms
const similarSymptoms = await findSimilarSymptoms(
  'feeling tired all the time',
  knownSymptoms,
  3
);

// Find similar packages
const recommendedPackages = await findSimilarPackages(
  'I need a health checkup',
  availablePackages,
  5
);
```

### Batch Processing

```typescript
import { similaritySearchService } from './src/utils/similaritySearch';

const queries = ['back pain', 'skin rash', 'breathing problems'];
const symptoms = ['lower back pain', 'red itchy rash', 'shortness of breath'];

const batchResults = await similaritySearchService.batchSimilaritySearch(
  queries,
  symptoms,
  2,
  0.1
);
```

## API Reference

### SimilaritySearchService

#### `similaritySearch(query, candidates, topK?, threshold?)`

Performs semantic similarity search using OpenAI embeddings.

**Parameters:**
- `query` (string): The search query
- `candidates` (string[]): Array of candidate strings to search
- `topK` (number, optional): Number of top results to return (default: 5)
- `threshold` (number, optional): Minimum similarity score (default: 0.0)

**Returns:** `Promise<SimilaritySearchResult[]>`

#### `fallbackSimilaritySearch(query, candidates, topK?)`

Performs text-based similarity search using Jaccard similarity.

**Parameters:**
- `query` (string): The search query
- `candidates` (string[]): Array of candidate strings to search
- `topK` (number, optional): Number of top results to return (default: 5)

**Returns:** `Promise<SimilaritySearchResult[]>`

#### `batchSimilaritySearch(queries, candidates, topK?, threshold?)`

Performs similarity search for multiple queries.

**Parameters:**
- `queries` (string[]): Array of search queries
- `candidates` (string[]): Array of candidate strings to search
- `topK` (number, optional): Number of top results per query (default: 5)
- `threshold` (number, optional): Minimum similarity score (default: 0.0)

**Returns:** `Promise<Record<string, SimilaritySearchResult[]>>`

### SimilaritySearchResult

```typescript
interface SimilaritySearchResult {
  content: string;           // The matched content
  score: number;            // Similarity score (0.0 to 1.0)
  metadata?: Record<string, any>; // Additional metadata
}
```

## Examples

Run the comprehensive examples:

```bash
bun run src/examples/similaritySearchExample.ts
```

This will demonstrate:
1. Basic similarity search
2. Medical package recommendation
3. Symptom matching
4. Batch similarity search
5. Fallback similarity search

## Error Handling

The similarity search implementation includes comprehensive error handling:

- **Input validation**: Checks for empty queries and invalid candidates
- **API error handling**: Graceful fallback when OpenAI API is unavailable
- **Type safety**: Full TypeScript support with proper type checking
- **Logging**: Detailed logging for debugging and monitoring

## Performance Considerations

- **Embedding caching**: Consider implementing caching for frequently used embeddings
- **Batch processing**: Use batch operations for multiple queries to improve efficiency
- **Rate limiting**: Be aware of OpenAI API rate limits
- **Fallback mechanism**: The Jaccard similarity fallback ensures functionality even without OpenAI API

## Medical Domain Optimizations

The implementation includes specific optimizations for medical use cases:

- **Symptom matching**: Specialized function for finding similar symptoms
- **Package recommendation**: Tailored for consultation package suggestions
- **Medical terminology**: Optimized for healthcare-related content
- **Threshold tuning**: Default thresholds optimized for medical content

## Troubleshooting

### Common Issues

1. **OpenAI API Key Missing**: Ensure `OPENAI_API_KEY` is set in your `.env` file
2. **Empty Results**: Check if the similarity threshold is too high
3. **Performance Issues**: Consider using the fallback method for large datasets
4. **Type Errors**: Ensure all inputs are properly typed as strings

### Debug Mode

Enable detailed logging by setting the log level:

```typescript
console.log('Similarity search debug info:', {
  query,
  candidatesCount: candidates.length,
  topK,
  threshold
});
```

## Future Enhancements

Potential improvements for the similarity search functionality:

- **Vector database integration** (Pinecone, Weaviate, etc.)
- **Custom embedding models** for medical domain
- **Semantic caching** for improved performance
- **Multi-language support** for international use
- **Advanced filtering** based on metadata
- **Real-time similarity search** with streaming results
