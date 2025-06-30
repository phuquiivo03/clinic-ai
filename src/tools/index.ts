import { SchemaType, type FunctionDeclaration } from '@google/generative-ai';

const findWeatherForecast: FunctionDeclaration = {
  name: 'findWeatherForecast',
  description: 'Get the weather forecast for a a specific location',
  parameters: {
    type: SchemaType.OBJECT, // Changed
    properties: {
      location: {
        type: SchemaType.STRING, // Changed
        description: 'The city and state, e.g. San Francisco, CA',
      },
    },
    required: ['location'],
  },
};

const getProductDetails: FunctionDeclaration = {
  name: 'getProductDetails',
  description: 'Get details for a specific product ID',
  parameters: {
    type: SchemaType.OBJECT, // Changed
    properties: {
      productId: {
        type: SchemaType.STRING, // Changed
        description: 'The ID of the product',
      },
    },
    required: ['productId'],
  },
};

export { findWeatherForecast, getProductDetails };
export * from './getPakcages'; // Exporting getPackageInfo for use in other files
export * from './medicalExamination'; // Exporting getUserExaminationResults for use in other files
export { scheduleConsultationTool } from './scheduleConsultation';
