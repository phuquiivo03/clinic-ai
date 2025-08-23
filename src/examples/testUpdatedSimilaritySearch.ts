import { executeSimilaritySearch, executeBatchSimilaritySearch } from '../tools/similaritySearch';

/**
 * Test the updated similarity search tools with predefined candidates
 */
async function testUpdatedSimilaritySearch() {
  console.log('🔧 Testing Updated Similarity Search Tools with Predefined Candidates\n');

  // Test 1: Single similarity search
  console.log('✅ Test 1: Single Similarity Search');
  const params1 = {
    query: 'khám tim mạch',
    topK: 3,
    threshold: 0.0,
  };

  try {
    const result1 = await executeSimilaritySearch('mock-auth-token', params1);
    console.log('Success:', result1.success);
    console.log('Results count:', result1.results?.length || 0);
    console.log('Total candidates:', result1.metadata?.totalCandidates || 0);
    console.log('Processing time:', result1.metadata?.processingTime + 'ms');
    
    if (result1.results && result1.results.length > 0) {
      console.log('Top results:');
      result1.results.forEach((result, index) => {
        console.log(`  ${index + 1}. "${result.content}" (score: ${result.score.toFixed(3)})`);
      });
    }
    console.log();
  } catch (error) {
    console.error('Error in test 1:', error);
  }

  // Test 2: Batch similarity search
  console.log('✅ Test 2: Batch Similarity Search');
  const params2 = {
    queries: [
      'khám tim mạch',
      'xét nghiệm máu',
      'chụp X-quang',
      'phẫu thuật não'
    ],
    topK: 2,
    threshold: 0.0,
  };

  try {
    const result2 = await executeBatchSimilaritySearch('mock-auth-token', params2);
    console.log('Success:', result2.success);
    console.log('Queries processed:', result2.metadata?.queriesProcessed.length || 0);
    console.log('Total candidates:', result2.metadata?.totalCandidates || 0);
    console.log('Total results:', result2.metadata?.totalResultsReturned || 0);
    console.log('Processing time:', result2.metadata?.processingTime + 'ms');
    
    if (result2.results) {
      Object.entries(result2.results).forEach(([query, results]) => {
        console.log(`\n  Query: "${query}"`);
        results.forEach((result, index) => {
          console.log(`    ${index + 1}. "${result.content}" (score: ${result.score.toFixed(3)})`);
        });
      });
    }
    console.log();
  } catch (error) {
    console.error('Error in test 2:', error);
  }

  // Test 3: Medical procedure search
  console.log('🏥 Test 3: Medical Procedure Search');
  const params3 = {
    query: 'điều trị ung thư',
    topK: 5,
    threshold: 0.1,
  };

  try {
    const result3 = await executeSimilaritySearch('mock-auth-token', params3);
    console.log('Success:', result3.success);
    console.log('Medical procedures found:', result3.results?.length || 0);
    
    if (result3.results && result3.results.length > 0) {
      console.log('Related medical procedures:');
      result3.results.forEach((result, index) => {
        console.log(`  ${index + 1}. "${result.content}" (score: ${result.score.toFixed(3)})`);
      });
    }
    console.log();
  } catch (error) {
    console.error('Error in test 3:', error);
  }

  // Test 4: Dermatology search
  console.log('🩺 Test 4: Dermatology Search');
  const params4 = {
    queries: [
      'điều trị mụn',
      'laser da',
      'chăm sóc da'
    ],
    topK: 3,
    threshold: 0.0,
  };

  try {
    const result4 = await executeBatchSimilaritySearch('mock-auth-token', params4);
    console.log('Success:', result4.success);
    console.log('Dermatology procedures found:', result4.metadata?.totalResultsReturned || 0);
    
    if (result4.results) {
      Object.entries(result4.results).forEach(([query, results]) => {
        console.log(`\n  Tìm kiếm: "${query}"`);
        results.forEach((result, index) => {
          console.log(`    ${index + 1}. "${result.content}" (score: ${result.score.toFixed(3)})`);
        });
      });
    }
    console.log();
  } catch (error) {
    console.error('Error in test 4:', error);
  }

  // Test 5: Empty query test
  console.log('❌ Test 5: Empty Query Test');
  const params5 = {
    query: '',
    topK: 3,
  };

  try {
    const result5 = await executeSimilaritySearch('mock-auth-token', params5);
    console.log('Success:', result5.success);
    console.log('Error message:', result5.error);
    console.log();
  } catch (error) {
    console.error('Error in test 5:', error);
  }

  // Test 6: Performance test
  console.log('⚡ Test 6: Performance Test');
  const params6 = {
    queries: Array.from({ length: 5 }, (_, i) => `dịch vụ y tế ${i + 1}`),
    topK: 3,
    threshold: 0.0,
  };

  try {
    const startTime = Date.now();
    const result6 = await executeBatchSimilaritySearch('mock-auth-token', params6);
    const endTime = Date.now();
    
    console.log('Success:', result6.success);
    console.log(`Processed ${params6.queries.length} queries`);
    console.log('Total processing time:', endTime - startTime + 'ms');
    console.log('Tool processing time:', result6.metadata?.processingTime + 'ms');
    console.log('Total results found:', result6.metadata?.totalResultsReturned || 0);
    console.log();
  } catch (error) {
    console.error('Error in test 6:', error);
  }

  console.log('✅ All updated similarity search tests completed!');
  console.log('\n📝 Note: These tests use predefined medical procedures from documents.json');
  console.log('The similarity search now works with a curated list of Vietnamese medical services.');
}

// Export the test function
export { testUpdatedSimilaritySearch };

// Run test if this file is executed directly
if (import.meta.main) {
  testUpdatedSimilaritySearch().catch(console.error);
}
