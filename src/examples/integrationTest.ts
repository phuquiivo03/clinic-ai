import { executeSimilaritySearch } from '../tools/similaritySearch';

/**
 * Test the similarity search tool integration
 */
async function testSimilaritySearchTool() {
  console.log('🔧 Testing Similarity Search Tool Integration\n');

  // Test 1: Valid similarity search request
  console.log('✅ Test 1: Valid Similarity Search Request');
  const params1 = {
    query: 'headache and fever',
    candidates: [
      'severe headache with nausea',
      'high fever and chills',
      'stomach pain and vomiting',
      'headache with light sensitivity',
      'fever with body aches',
    ],
    topK: 3,
    threshold: 0.0,
  };

  try {
    const result1 = await executeSimilaritySearch('mock-auth-token', params1);
    console.log('Success:', result1.success);
    console.log('Results count:', result1.results?.length || 0);
    console.log('Metadata:', result1.metadata);
    if (result1.results && result1.results.length > 0) {
      console.log('Top result:', result1.results[0].content);
    }
    console.log();
  } catch (error) {
    console.error('Error in test 1:', error);
  }

  // Test 2: Invalid parameters
  console.log('❌ Test 2: Invalid Parameters');
  const params2 = {
    query: '',
    candidates: ['test'],
    topK: 3,
  };

  try {
    const result2 = await executeSimilaritySearch('mock-auth-token', params2);
    console.log('Success:', result2.success);
    console.log('Error:', result2.error);
    console.log();
  } catch (error) {
    console.error('Error in test 2:', error);
  }

  // Test 3: Empty candidates
  console.log('📭 Test 3: Empty Candidates');
  const params3 = {
    query: 'test query',
    candidates: [],
    topK: 3,
  };

  try {
    const result3 = await executeSimilaritySearch('mock-auth-token', params3);
    console.log('Success:', result3.success);
    console.log('Results count:', result3.results?.length || 0);
    console.log('Metadata:', result3.metadata);
    console.log();
  } catch (error) {
    console.error('Error in test 3:', error);
  }

  // Test 4: Large topK value (should be capped)
  console.log('📊 Test 4: Large topK Value');
  const params4 = {
    query: 'medical condition',
    candidates: ['condition 1', 'condition 2', 'condition 3'],
    topK: 100, // Should be capped to 20
    threshold: 0.0,
  };

  try {
    const result4 = await executeSimilaritySearch('mock-auth-token', params4);
    console.log('Success:', result4.success);
    console.log('Results count:', result4.results?.length || 0);
    console.log('Metadata:', result4.metadata);
    console.log();
  } catch (error) {
    console.error('Error in test 4:', error);
  }

  // Test 5: Mixed valid/invalid candidates
  console.log('🔀 Test 5: Mixed Valid/Invalid Candidates');
  const params5 = {
    query: 'test',
    candidates: ['valid candidate 1', '', 'valid candidate 2', null as any, 'valid candidate 3'],
    topK: 5,
  };

  try {
    const result5 = await executeSimilaritySearch('mock-auth-token', params5);
    console.log('Success:', result5.success);
    console.log('Original candidates:', params5.candidates.length);
    console.log('Valid candidates processed:', result5.metadata?.totalCandidates);
    console.log('Results count:', result5.results?.length || 0);
    console.log();
  } catch (error) {
    console.error('Error in test 5:', error);
  }

  // Test 6: Medical symptom scenario
  console.log('🏥 Test 6: Medical Symptom Scenario');
  const params6 = {
    query: 'patient complains of chest pain and shortness of breath',
    candidates: [
      'acute myocardial infarction',
      'pulmonary embolism',
      'pneumonia',
      'anxiety disorder',
      'gastroesophageal reflux',
      'asthma exacerbation',
      'costochondritis',
    ],
    topK: 3,
    threshold: 0.1,
  };

  try {
    const result6 = await executeSimilaritySearch('mock-auth-token', params6);
    console.log('Success:', result6.success);
    console.log('Medical conditions found:', result6.results?.length || 0);
    console.log('Processing time:', result6.metadata?.processingTime + 'ms');
    if (result6.results) {
      result6.results.forEach((result, index) => {
        console.log(`  ${index + 1}. ${result.content} (score: ${result.score.toFixed(3)})`);
      });
    }
    console.log();
  } catch (error) {
    console.error('Error in test 6:', error);
  }

  console.log('✅ All similarity search tool integration tests completed!');
  console.log('\n📝 Note: These tests use the fallback similarity search method.');
  console.log('With a valid OpenAI API key, the results would be more semantically accurate.');
}

// Export the test function
export { testSimilaritySearchTool };

// Run test if this file is executed directly
if (import.meta.main) {
  testSimilaritySearchTool().catch(console.error);
}
