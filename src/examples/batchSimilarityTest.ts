import { executeBatchSimilaritySearch } from '../tools/similaritySearch';

/**
 * Test the batch similarity search tool functionality
 */
async function testBatchSimilaritySearchTool() {
  console.log('🔧 Testing Batch Similarity Search Tool\n');

  // Test 1: Valid batch similarity search request
  console.log('✅ Test 1: Valid Batch Similarity Search Request');
  const params1 = {
    queries: [
      'đau ngực và khó thở',
      'phát ban đỏ và ngứa',
      'đau đầu và sốt',
    ],
    candidates: [
      'nhồi máu cơ tim cấp tính với đau ngực',
      'hen suyễn với khó thở',
      'viêm phổi với đau ngực',
      'eczema với phát ban đỏ ngứa',
      'viêm da tiếp xúc với mẩn đỏ',
      'nấm da với ngứa và đỏ',
      'đau nửa đầu với buồn nôn',
      'sốt cao và ớn lạnh',
      'căng thẳng với đau đầu',
    ],
    topK: 2,
    threshold: 0.0,
  };

  try {
    const result1 = await executeBatchSimilaritySearch('mock-auth-token', params1);
    console.log('Success:', result1.success);
    console.log('Queries processed:', result1.metadata?.queriesProcessed.length || 0);
    console.log('Total results:', result1.metadata?.totalResultsReturned || 0);
    console.log('Processing time:', result1.metadata?.processingTime + 'ms');
    
    if (result1.results) {
      Object.entries(result1.results).forEach(([query, results]) => {
        console.log(`\n  Query: "${query}"`);
        results.forEach((result, index) => {
          console.log(`    ${index + 1}. "${result.content}" (score: ${result.score.toFixed(3)})`);
        });
      });
    }
    console.log();
  } catch (error) {
    console.error('Error in test 1:', error);
  }

  // Test 2: Empty queries array
  console.log('❌ Test 2: Empty Queries Array');
  const params2 = {
    queries: [],
    candidates: ['test candidate'],
    topK: 3,
  };

  try {
    const result2 = await executeBatchSimilaritySearch('mock-auth-token', params2);
    console.log('Success:', result2.success);
    console.log('Error:', result2.error);
    console.log();
  } catch (error) {
    console.error('Error in test 2:', error);
  }

  // Test 3: Invalid queries (non-strings)
  console.log('🔀 Test 3: Mixed Valid/Invalid Queries');
  const params3 = {
    queries: ['valid query', '', null as any, 'another valid query', undefined as any],
    candidates: ['candidate 1', 'candidate 2', 'candidate 3'],
    topK: 2,
  };

  try {
    const result3 = await executeBatchSimilaritySearch('mock-auth-token', params3);
    console.log('Success:', result3.success);
    console.log('Original queries:', params3.queries.length);
    console.log('Valid queries processed:', result3.metadata?.queriesProcessed.length || 0);
    console.log('Results count:', result3.metadata?.totalResultsReturned || 0);
    console.log();
  } catch (error) {
    console.error('Error in test 3:', error);
  }

  // Test 4: Medical symptoms batch analysis
  console.log('🏥 Test 4: Medical Symptoms Batch Analysis');
  const medicalQueries = [
    'bệnh nhân than phiền đau ngực và khó thở',
    'da bị ngứa và có mẩn đỏ',
    'đau đầu kéo dài và mệt mỏi',
    'ho khan và sốt nhẹ',
  ];
  
  const medicalConditions = [
    'nhồi máu cơ tim cấp tính',
    'thuyên tắc phổi',
    'viêm phổi',
    'rối loạn lo âu',
    'trào ngược dạ dày thực quản',
    'hen suyễn',
    'eczema (chàm)',
    'viêm da tiếp xúc',
    'nấm da',
    'đau nửa đầu',
    'căng thẳng',
    'thiếu máu',
    'nhiễm trùng đường hô hấp trên',
    'cảm lạnh thông thường',
    'COVID-19',
  ];

  const params4 = {
    queries: medicalQueries,
    candidates: medicalConditions,
    topK: 3,
    threshold: 0.1,
  };

  try {
    const result4 = await executeBatchSimilaritySearch('mock-auth-token', params4);
    console.log('Success:', result4.success);
    console.log('Medical analysis completed in:', result4.metadata?.processingTime + 'ms');
    console.log('Total medical conditions found:', result4.metadata?.totalResultsReturned || 0);
    
    if (result4.results) {
      Object.entries(result4.results).forEach(([query, results]) => {
        console.log(`\n  Triệu chứng: "${query}"`);
        console.log('  Các tình trạng có thể:');
        results.forEach((result, index) => {
          console.log(`    ${index + 1}. ${result.content} (độ tương đồng: ${result.score.toFixed(3)})`);
        });
      });
    }
    console.log();
  } catch (error) {
    console.error('Error in test 4:', error);
  }

  // Test 5: Performance test with many queries
  console.log('⚡ Test 5: Performance Test with Many Queries');
  const manyQueries = Array.from({ length: 10 }, (_, i) => `triệu chứng số ${i + 1}`);
  const manyCandidates = Array.from({ length: 20 }, (_, i) => `tình trạng bệnh lý ${i + 1}`);

  const params5 = {
    queries: manyQueries,
    candidates: manyCandidates,
    topK: 3,
    threshold: 0.0,
  };

  try {
    const startTime = Date.now();
    const result5 = await executeBatchSimilaritySearch('mock-auth-token', params5);
    const endTime = Date.now();
    
    console.log('Success:', result5.success);
    console.log(`Processed ${manyQueries.length} queries against ${manyCandidates.length} candidates`);
    console.log('Total processing time:', endTime - startTime + 'ms');
    console.log('Tool processing time:', result5.metadata?.processingTime + 'ms');
    console.log('Total results found:', result5.metadata?.totalResultsReturned || 0);
    console.log();
  } catch (error) {
    console.error('Error in test 5:', error);
  }

  // Test 6: Empty candidates
  console.log('📭 Test 6: Empty Candidates');
  const params6 = {
    queries: ['test query 1', 'test query 2'],
    candidates: [],
    topK: 3,
  };

  try {
    const result6 = await executeBatchSimilaritySearch('mock-auth-token', params6);
    console.log('Success:', result6.success);
    console.log('Results structure:', typeof result6.results);
    console.log('Number of query results:', Object.keys(result6.results || {}).length);
    console.log();
  } catch (error) {
    console.error('Error in test 6:', error);
  }

  console.log('✅ All batch similarity search tool tests completed!');
  console.log('\n📝 Note: These tests use the fallback similarity search method.');
  console.log('With a valid OpenAI API key, the results would be more semantically accurate.');
}

// Export the test function
export { testBatchSimilaritySearchTool };

// Run test if this file is executed directly
if (import.meta.main) {
  testBatchSimilaritySearchTool().catch(console.error);
}
