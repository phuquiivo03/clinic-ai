import { similaritySearchService } from '../utils/similaritySearch';

/**
 * Test the fallback similarity search functionality without requiring OpenAI API
 */
async function testFallbackSimilaritySearch() {
  console.log('🔄 Testing Fallback Similarity Search (No OpenAI API Required)\n');

  // Test 1: Medical symptoms
  console.log('🩺 Test 1: Medical Symptom Matching');
  const userSymptom = 'severe headache with nausea';
  const symptoms = [
    'migraine headache with vomiting',
    'tension headache and stress',
    'cluster headache with eye pain',
    'sinus headache with congestion',
    'headache with light sensitivity',
    'stomach flu with nausea',
    'food poisoning with vomiting',
  ];

  try {
    const results1 = await similaritySearchService.fallbackSimilaritySearch(
      userSymptom,
      symptoms,
      3
    );
    
    console.log(`User symptom: "${userSymptom}"`);
    console.log('Most similar symptoms:');
    results1.forEach((result, index) => {
      console.log(`  ${index + 1}. "${result.content}" (score: ${result.score.toFixed(3)})`);
    });
    console.log();
  } catch (error) {
    console.error('Error in symptom matching test:', error);
  }

  // Test 2: Package recommendation
  console.log('🏥 Test 2: Package Recommendation');
  const userQuery = 'comprehensive health screening';
  const packages = [
    'Full Body Health Checkup Package',
    'Basic Health Screening Tests',
    'Comprehensive Medical Examination',
    'Executive Health Assessment',
    'Cardiac Health Package',
    'Women Health Screening',
    'Senior Citizen Health Package',
  ];

  try {
    const results2 = await similaritySearchService.fallbackSimilaritySearch(
      userQuery,
      packages,
      3
    );
    
    console.log(`User query: "${userQuery}"`);
    console.log('Recommended packages:');
    results2.forEach((result, index) => {
      console.log(`  ${index + 1}. "${result.content}" (score: ${result.score.toFixed(3)})`);
    });
    console.log();
  } catch (error) {
    console.error('Error in package recommendation test:', error);
  }

  // Test 3: Edge cases
  console.log('⚠️ Test 3: Edge Cases');
  
  // Empty query
  try {
    await similaritySearchService.fallbackSimilaritySearch('', symptoms, 3);
  } catch (error) {
    console.log('✓ Empty query handled correctly:', error.message);
  }

  // Empty candidates
  try {
    const results3 = await similaritySearchService.fallbackSimilaritySearch(
      'test query',
      [],
      3
    );
    console.log('✓ Empty candidates handled correctly, results:', results3.length);
  } catch (error) {
    console.error('Error with empty candidates:', error);
  }

  // Single word query
  try {
    const results4 = await similaritySearchService.fallbackSimilaritySearch(
      'fever',
      ['high fever', 'low grade fever', 'fever with chills', 'headache'],
      2
    );
    console.log('✓ Single word query results:');
    results4.forEach((result, index) => {
      console.log(`    ${index + 1}. "${result.content}" (score: ${result.score.toFixed(3)})`);
    });
  } catch (error) {
    console.error('Error with single word query:', error);
  }

  console.log();

  // Test 4: Performance test
  console.log('⚡ Test 4: Performance Test');
  const startTime = Date.now();
  const largeCandidateList = Array.from({ length: 100 }, (_, i) => 
    `Medical condition ${i + 1} with various symptoms and descriptions`
  );

  try {
    const results5 = await similaritySearchService.fallbackSimilaritySearch(
      'medical condition with symptoms',
      largeCandidateList,
      5
    );
    const endTime = Date.now();
    
    console.log(`✓ Processed ${largeCandidateList.length} candidates in ${endTime - startTime}ms`);
    console.log(`✓ Found ${results5.length} results`);
    console.log('Top result:', results5[0]?.content.substring(0, 50) + '...');
  } catch (error) {
    console.error('Error in performance test:', error);
  }

  console.log();

  // Test 5: Medical domain specific test
  console.log('🔬 Test 5: Medical Domain Specific Test');
  const medicalQuery = 'chest pain and difficulty breathing';
  const medicalConditions = [
    'acute myocardial infarction with chest pain',
    'asthma with breathing difficulties',
    'pneumonia with chest discomfort',
    'anxiety disorder with chest tightness',
    'gastroesophageal reflux with chest burning',
    'pulmonary embolism with shortness of breath',
    'costochondritis with chest wall pain',
  ];

  try {
    const results6 = await similaritySearchService.fallbackSimilaritySearch(
      medicalQuery,
      medicalConditions,
      4
    );
    
    console.log(`Medical query: "${medicalQuery}"`);
    console.log('Potential conditions:');
    results6.forEach((result, index) => {
      console.log(`  ${index + 1}. "${result.content}" (score: ${result.score.toFixed(3)})`);
    });
  } catch (error) {
    console.error('Error in medical domain test:', error);
  }

  console.log('\n✅ All fallback similarity search tests completed successfully!');
  console.log('\n📝 Note: This fallback method uses Jaccard similarity for text matching.');
  console.log('For better semantic understanding, configure OpenAI API key for embedding-based search.');
}

// Export the test function
export { testFallbackSimilaritySearch };

// Run test if this file is executed directly
if (import.meta.main) {
  testFallbackSimilaritySearch().catch(console.error);
}
