import { SchemaType, type FunctionDeclaration } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

export const getBlogsTool: FunctionDeclaration = {
  name: 'getBlogs',
  description:
    'Search and retrieve blog posts from the platform. Use this when users ask about blogs, articles, or want to search for specific blog content.',
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      search: {
        type: SchemaType.STRING,
        description: 'The search term to find relevant blog posts',
      },
    },
    required: ['search'],
  },
};

export async function getBlogs(searchValue: string): Promise<any> {
  try {
    const response = await fetch(
      `${process.env.API_URL}/api/v1/blog?search=${encodeURIComponent(searchValue)}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Blogs fetched successfully:', data);
    return data;
  } catch (error) {
    console.error('Error fetching blogs:', error);
    throw new Error(
      `Error fetching blogs: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}
