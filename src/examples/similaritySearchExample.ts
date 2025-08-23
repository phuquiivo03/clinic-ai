import { performSimilaritySearch, similaritySearchService } from '../utils/similaritySearch';
import { findSimilarSymptoms, findSimilarPackages } from '../tools/similaritySearch';

/**
 * Example usage of the similarity search functionality
 */
async function runSimilaritySearchExamples() {
  console.log('🔍 Similarity Search Examples\n');

  // Example 1: Basic similarity search
  console.log('📝 Example 1: Basic Similarity Search');
  const query1 = 'headache and fever';
  const symptoms = [
    'severe headache with nausea',
    'high fever and chills',
    'stomach pain and vomiting',
    'chest pain and shortness of breath',
    'headache with light sensitivity',
    'fever with body aches',
    'dizziness and fatigue',
  ];

  try {
    const results1 = await performSimilaritySearch(query1, symptoms, 3, 0.1);
    console.log(`Query: "${query1}"`);
    console.log('Top 3 similar symptoms:');
    results1.forEach((result, index) => {
      console.log(`  ${index + 1}. "${result.content}" (score: ${result.score.toFixed(3)})`);
    });
    console.log();
  } catch (error) {
    console.error('Error in basic similarity search:', error);
  }

  // Example 2: Medical package recommendation
  console.log('🏥 Example 2: Medical Package Recommendation');
  const query2 = 'I need a general health checkup';
  const packages = [
    'Comprehensive Health Screening Package - Full body checkup with blood tests',
    'Cardiac Health Assessment - Heart-focused examination and tests',
    'Women\'s Health Package - Specialized screening for women',
    'Executive Health Package - Premium health screening for professionals',
    'Basic Health Checkup - Essential health screening tests',
    'Diabetes Management Package - Specialized care for diabetic patients',
    'Senior Citizen Health Package - Health screening for elderly patients',
  ];

  try {
    const results2 = await findSimilarPackages(query2, packages, 3);
    console.log(`Query: "${query2}"`);
    console.log('Recommended packages:');
    results2.forEach((result, index) => {
      console.log(`  ${index + 1}. "${result.content}" (score: ${result.score.toFixed(3)})`);
    });
    console.log();
  } catch (error) {
    console.error('Error in package recommendation:', error);
  }

  // Example 3: Symptom matching
  console.log('🩺 Example 3: Symptom Matching');
  const userSymptom = 'I have been feeling very tired lately';
  const knownSymptoms = [
    'chronic fatigue and weakness',
    'extreme tiredness after minimal activity',
    'persistent exhaustion',
    'lack of energy and motivation',
    'feeling drowsy during the day',
    'muscle weakness and fatigue',
    'mental fatigue and brain fog',
  ];

  try {
    const results3 = await findSimilarSymptoms(userSymptom, knownSymptoms, 3);
    console.log(`User symptom: "${userSymptom}"`);
    console.log('Similar known symptoms:');
    results3.forEach((result, index) => {
      console.log(`  ${index + 1}. "${result.content}" (score: ${result.score.toFixed(3)})`);
    });
    console.log();
  } catch (error) {
    console.error('Error in symptom matching:', error);
  }

  // Example 4: Batch similarity search
  console.log('📊 Example 4: Batch Similarity Search');
  const queries = ['back pain', 'skin rash', 'breathing problems'];
  const allSymptoms = [
    'lower back pain and stiffness',
    'upper back muscle strain',
    'red itchy skin rash',
    'allergic skin reaction',
    'difficulty breathing',
    'shortness of breath during exercise',
    'wheezing and coughing',
    'chronic back pain',
    'skin irritation and inflammation',
    'respiratory distress',
  ];

  try {
    const batchResults = await similaritySearchService.batchSimilaritySearch(
      queries,
      allSymptoms,
      2,
      0.1
    );

    console.log('Batch search results:');
    Object.entries(batchResults).forEach(([query, results]) => {
      console.log(`\n  Query: "${query}"`);
      results.forEach((result, index) => {
        console.log(`    ${index + 1}. "${result.content}" (score: ${result.score.toFixed(3)})`);
      });
    });
    console.log();
  } catch (error) {
    console.error('Error in batch similarity search:', error);
  }

  // Example 5: Fallback similarity search (without OpenAI API)
  console.log('🔄 Example 5: Fallback Similarity Search');
  const query5 = 'joint pain';
  const conditions = [
    'arthritis and joint inflammation',
    'muscle pain and soreness',
    'bone fracture and injury',
    'joint stiffness and swelling',
    'ligament strain and sprain',
  ];

  try {
    const results5 = await similaritySearchService.fallbackSimilaritySearch(query5, conditions, 3);
    console.log(`Query: "${query5}" (using fallback method)`);
    console.log('Similar conditions:');
    results5.forEach((result, index) => {
      console.log(`  ${index + 1}. "${result.content}" (score: ${result.score.toFixed(3)})`);
    });
    console.log();
  } catch (error) {
    console.error('Error in fallback similarity search:', error);
  }

  console.log('✅ All similarity search examples completed!');
}

// Export the example function for use in other files
export { runSimilaritySearchExamples };

// Run examples if this file is executed directly
if (import.meta.main) {
  runSimilaritySearchExamples().catch(console.error);
}
