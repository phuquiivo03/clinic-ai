import { SchemaType, type FunctionDeclaration } from '@google/generative-ai';

const getPackageInfo: FunctionDeclaration = {
  name: 'getPackages',
  description:
    'Get the consultation packages of the platform, when user ask about the consultation info like "i want to know about the packages" or "what are the packages available?"',
  parameters: {
    type: SchemaType.OBJECT,
    properties: {}, // No properties needed as getPackages takes no arguments
    required: [], // No required parameters
  },
};

export { getPackageInfo };
