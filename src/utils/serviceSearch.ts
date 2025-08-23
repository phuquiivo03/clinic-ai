import json from '../../documents.json';
import { SimilaritySearchService } from './similaritySearch';

const names = json;

const search = async (query: string[]) => {
  const similaritySearch = new SimilaritySearchService();
  const result1 = await similaritySearch.batchSimilaritySearch(
    query,
    names,
    3,
    0.1
  );
  return result1;
};

export default { search };
