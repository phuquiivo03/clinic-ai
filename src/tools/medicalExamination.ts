import { SchemaType, type FunctionDeclaration } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

export const getUserExaminationResultsTool: FunctionDeclaration = {
  name: 'getUserExaminationResults',
  description:
    'Get user getUserExaminationResults based on the userId. This tool retrieves the examination results for a specific user, which can include health symptoms and other relevant medical information.',
};

export async function getUserExaminationResults(
  authToken: string
): Promise<any> {
  const response = await fetch(
    `${process.env.API_URL}/api/v1/medical-examinations/user`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authToken,
      },
    }
  )
    .then(async (res) => {
      const result = await res.json();
      // @ts-ignore
      return result?.data.data || [];
    })
    .catch((err) => {
      throw new Error(`Error fetching examination results: ${err.message}`);
    });

  const data = (await response) as any[];
  console.log(
    'Examination results fetched successfully:',
    data.map((d) => d.finalDiagnosis)
  );
  return data.map((d) => d.finalDiagnosis);
}
