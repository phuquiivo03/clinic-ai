import { executeSimilaritySearch, executeBatchSimilaritySearch } from '../tools/similaritySearch';

/**
 * Quick test of the similarity search functions
 */
async function quickTest() {
  console.log('🔧 Quick Similarity Search Test\n');

  // Test 1: Single search
  console.log('✅ Test 1: Single Search');
  try {
    const result = await executeSimilaritySearch('test-token', {
      query: 'khám tim mạch',
      topK: 3,
      threshold: 0.0,
    });
    
    console.log('Success:', result.success);
    if (result.success) {
      console.log('Results:', result.results?.length || 0);
      console.log('Candidates:', result.metadata?.totalCandidates || 0);
    } else {
      console.log('Error:', result.error);
    }
  } catch (error) {
    console.error('Test 1 failed:', error);
  }

  console.log();

  // Test 2: Batch search
  console.log('✅ Test 2: Batch Search');
  try {
    const result = await executeBatchSimilaritySearch('test-token', {
      queries: ['khám tim', 'xét nghiệm'],
      topK: 2,
      threshold: 0.0,
    });
    
    console.log('Success:', result.success);
    if (result.success) {
      console.log('Queries processed:', result.metadata?.queriesProcessed.length || 0);
      console.log('Total results:', result.metadata?.totalResultsReturned || 0);
    } else {
      console.log('Error:', result.error);
    }
  } catch (error) {
    console.error('Test 2 failed:', error);
  }

  console.log('\n✅ Quick test completed!');
}

if (import.meta.main) {
  quickTest().catch(console.error);
}
