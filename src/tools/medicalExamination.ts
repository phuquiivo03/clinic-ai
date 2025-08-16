import { SchemaType, type FunctionDeclaration } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();


export const getUserExaminationResultsTool: FunctionDeclaration = {
  name: 'getUserExaminationResults',
  description:
    'Get user getUserExaminationResults based on the userId. This tool retrieves the examination results for a specific user, which can include health symptoms and other relevant medical information.',
};

export async function getUserExaminationResults(authToken: string): Promise<any> {

  const response = await fetch(
    `${process.env.API_URL}/api/v1/medical-examinations/user`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authToken
      },
    }
  ).then(async res => {
    console.log('Response status:', res);
    const result = await res.json();
    console.log('result', result);
    return result;
  }).catch(err => {
    throw new Error(`Error fetching examination results: ${err.message}`);
  });

  const data = await response;
  console.log('Examination results fetched successfully:', data);
  return data;
  // return {
  // _id:  "685d5b61267560ac17ae9a96" ,
  // patient: "685fe35974d3e2a2c6bbf0b9" ,
  // examinationDate: "2025-03-29T17:56:01.615Z",
  // symptoms: [
  //   "Phát ban toàn thân",
  //   "Ngứa dữ dội sau khi ăn hải sản"
  // ],
  // subclinicalResults: [
  //   {
  //     service: { "$oid": "684d5a9e7b23c4d5e6f7a1b1" },
  //     resultData: "Nồng độ IgE tăng cao, xác định phản ứng dị ứng với protein trong tôm.",
  //     performedAt: "2025-03-29T18:15:42.000Z",
  //     performedBy: { "$oid": "685fe9bc123abcde4567def1" },
  //     notes: "Xét nghiệm máu ELISA"
  //   }
  // ],
  // finalDiagnosis: [
  //   {
  //     icdCode: "T78.1",
  //     description: "Phản ứng dị ứng với thức ăn"
  //   },
  //   {
  //     icdCode: "L23.0",
  //     description: "Viêm da tiếp xúc do thực phẩm"
  //   }
  // ],
  // prescription: { "$oid": "685acee93cd2bba4ac746530" },
  // followUp: {
  //   nextVisit: "2025-04-29T09:00:00.000Z",
  //   notes: "Theo dõi tái phát, xét nghiệm dị ứng chi tiết nếu có triệu chứng khác"
  // }
};