import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
  type Schema, // Changed: type-only import
  type Part, // Changed: type-only import
  FunctionCallingMode, // Added
  SchemaType, // Added
  type GenerationConfig, // Added
  type Content, // Added for chat history
} from '@google/generative-ai';
import dotenv from 'dotenv';
import { defaultSystemPrompt } from './prompts/default';
import {
  findWeatherForecast,
  getProductDetails,
  getPackageInfo,
  scheduleConsultationTool,
  getUserExaminationResults,
  getUserExaminationResultsTool, // Added new tool declaration
} from './tools/index';
import { scheduleConsultation } from './tools/scheduleConsultation'; // Added new tool implementation
import { getDb } from './config/db';
import { getRedisClient } from './config/redis'; // Added Redis client
import { type ChatMessage } from './interfaces/chat';
import { config } from './config';
import type { get } from 'mongoose';
import type { FewShotItem, GeminiHistory } from './types/chat';
import path from 'path';
import fs from 'fs';
dotenv.config();
const FEWSHOT_PATH = path.join(__dirname, 'fewshot.json');

let fewShotData: FewShotItem[] = [];
loadFewShotData(); // Load few-shot data at startup
const API_KEY = process.env.GENAI_API_KEY;
if (!API_KEY) {
  throw new Error('GEMINI_API_KEY is not set in the environment variables');
}

const genAI = new GoogleGenerativeAI(API_KEY);

// Define a sample function that the model can call
const availableFunctions = {
  getUserExaminationResults: getUserExaminationResults, // Added new function

  getPackages: async () => {
    const cacheKey = 'consultation-packages';
    const cacheExpirySeconds = 3600; // 1 hour

    let redisClient;
    try {
      redisClient = await getRedisClient();
    } catch (redisError) {
      console.warn(
        'Redis client acquisition failed, proceeding without cache for getPackages:',
        redisError
      );
      redisClient = null;
    }

    if (redisClient) {
      try {
        const cachedData = await redisClient.get(cacheKey);
        if (cachedData) {
          console.log('Serving getPackages from Redis cache');
          return JSON.parse(cachedData);
        }
      } catch (cacheError) {
        console.error('Redis GET error for getPackages:', cacheError);
        // Proceed to fetch from API if cache read fails
      }
    }

    // Cache miss or Redis unavailable, fetch from API
    console.log('Fetching getPackages from API');
    try {
      const response = await fetch(
        'https://devq-be0x7.site/api/v1/consultation-package'
      );
      if (!response.ok) {
        console.error(
          `API call failed for getPackages with status: ${response.status}`
        );
        return {
          error: `Failed to fetch packages, status: ${response.status}`,
        };
      }
      const data = await response.json();

      const typedData = data as any;
      let packagesData;

      if (typedData && typedData.data && Array.isArray(typedData.data)) {
        packagesData = typedData.data;
      } else if (Array.isArray(typedData)) {
        packagesData = typedData;
      } else {
        console.error(
          'Unexpected API response structure for packages:',
          typedData
        );
        return { error: 'Unexpected API response structure for packages.' };
      }

      // Store in Redis if client available and data is valid
      if (redisClient && packagesData && !packagesData.error) {
        try {
          await redisClient.setEx(
            cacheKey,
            cacheExpirySeconds,
            JSON.stringify(packagesData)
          );
          console.log('Stored getPackages response in Redis cache');
        } catch (cacheSetError) {
          console.error('Redis SETEX error for getPackages:', cacheSetError);
        }
      }
      return packagesData;
    } catch (fetchError) {
      console.error('Error fetching packages from API:', fetchError);
      return {
        error: 'Failed to fetch packages due to a network or parsing error.',
      };
    }
  },
  scheduleConsultation: scheduleConsultation,
};

const model = genAI.getGenerativeModel({
  model: config.modelName,
  systemInstruction: defaultSystemPrompt,
  tools: [
    {
      functionDeclarations: [
        getPackageInfo,
        scheduleConsultationTool,
        getUserExaminationResultsTool,
      ],
    },
  ],
  toolConfig: {
    functionCallingConfig: {
      mode: FunctionCallingMode.AUTO, // Changed: Or "ANY" or "NONE"
    },
  },
  safetySettings: [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
  ],
});

async function loadChatHistory(userId: string): Promise<Content[]> {
  try {
    const db = await getDb();
    const messagesCollection = db.collection<ChatMessage>('chat_messages');
    // Load last N messages, e.g., 20, to avoid overly long histories.
    // Adjust limit as needed. For simplicity, loading all for now, but consider limits.
    const messages = await messagesCollection
      .find({ userId })
      .sort({ timestamp: 1 })
      // .limit(20) // Example: limit history length
      .toArray();

    return messages
      .filter((msg) => msg.role === 'user' || msg.role === 'model') // Only user and model roles for history
      .map((msg) => ({
        role: msg.role as 'user' | 'model', // Type assertion
        parts: [{ text: msg.content }],
      }));
  } catch (error) {
    console.error('Failed to load chat history:', error);
    return []; // Return empty history on error
  }
}

export async function saveChatMessage(message: ChatMessage): Promise<void> {
  try {
    const db = await getDb();
    const collection = db.collection<ChatMessage>('chat_messages');
    await collection.insertOne(message);
  } catch (error) {
    console.error('Failed to save chat message:', error);
    // Decide if this error should propagate or be handled silently
  }
}

export async function runChat(
  authenToken: string,
  userId: string,
  userMessage: string,
  image?: string
): Promise<string> {
  await saveChatMessage({
    userId,
    role: 'user',
    content: userMessage,
    image,
    timestamp: new Date(),
  });

  const userChatHistory = await loadChatHistory(userId);
  const fewshotHistory = getFewShotExamples({ maxExamples: 5 });
  const history = [...fewshotHistory, ...userChatHistory];
  // console.log(`Loaded history for user ${userId}:`, JSON.stringify(history, null, 2));

  const chat = model.startChat({
    history: history,
    // systemInstruction: defaultSystemPrompt, // System prompt is now part of model config
  });
  console.log(`Starting chat for user ${userId} with message:`, userMessage);

  // send the user message and image (if provided) to the chat
  const result = image
    ? await chat.sendMessage([
        {
          inlineData: {
            mimeType: 'image/jpeg',
            data: image,
          },
        },
        {
          text: 'The patient has itchy red spots on their neck. Based on the image, what condition is likely?',
        },
      ])
    : await chat.sendMessage(userMessage);
  let responseText = '';
  const candidate = result.response.candidates?.[0];

  if (candidate) {
    if (candidate.content && candidate.content.parts) {
      for (const part of candidate.content.parts) {
        if (part.text) {
          responseText += part.text;
        } else if (part.functionCall) {
          const { name, args } = part.functionCall;
          console.log(`Function call detected: ${name} with args`, args);
          // @ts-ignore
          const fn = availableFunctions[name];
          if (fn) {
            const rawFunctionResponse = await fn(authenToken, args);

            let structuredResponsePayload;
            if (name === 'getPackages') {
              structuredResponsePayload = { packages: rawFunctionResponse };
            } else {
              structuredResponsePayload = rawFunctionResponse; // Assumes other functions return objects
            }

            const result2 = await chat.sendMessage([
              {
                functionResponse: {
                  name,
                  response: structuredResponsePayload,
                },
              },
            ] as Part[]);
            const candidate2 = result2.response.candidates?.[0];
            if (candidate2?.content?.parts) {
              candidate2.content.parts.forEach((p) => {
                if (p.text) responseText += p.text;
              });
            } else {
              responseText =
                "Model didn't return further content after function call.";
            }
          } else {
            responseText = `Function ${name} is not available.`;
          }
        }
      }
    }
    if (!responseText && candidate.finishReason === 'SAFETY') {
      responseText = 'The response was blocked due to safety settings.';
    }
  }

  if (!responseText) {
    const fallbackGenerationConfig = {
      maxOutputTokens: 100,
    };
    const fallbackResult = await model.generateContent(
      `The user said: "${userMessage}". Briefly acknowledge or ask for clarification if the query was unclear.`,
      fallbackGenerationConfig as any // Cast to any as a last resort for this stubborn type error
    );
    responseText =
      fallbackResult.response.candidates?.[0]?.content?.parts?.[0]?.text ??
      "I'm sorry, I couldn't process your request. The model did not return a response.";
  }

  if (responseText) {
    await saveChatMessage({
      userId,
      role: 'model',
      content: responseText,
      timestamp: new Date(),
    });
  }
  return responseText;
}

// ✅ Load dữ liệu khi start server (cache vào RAM)
export function loadFewShotData() {
  if (!fs.existsSync(FEWSHOT_PATH)) {
    throw new Error('Fewshot data file not found.');
  }
  const raw = fs.readFileSync(FEWSHOT_PATH, 'utf-8');
  fewShotData = JSON.parse(raw);
}

// ✅ Hàm chọn ngẫu nhiên N ảnh theo label (hoặc tất cả nếu không lọc)
export function getFewShotExamples(options: {
  maxExamples?: number;
  labels?: string[];
}): Content[] {
  const { maxExamples = 5, labels } = options;

  let pool = fewShotData;
  if (labels && labels.length > 0) {
    pool = fewShotData.filter((item) => labels.includes(item.label));
  }

  const shuffled = [...pool]
    .sort(() => Math.random() - 0.5)
    .slice(0, maxExamples);

  return shuffled.map((item) => ({
    role: 'user',
    parts: [
      {
        inlineData: {
          mimeType: item.mimeType,
          data: item.data,
        },
      },
      {
        text: `This is an example of ${item.label}.`,
      },
    ],
  }));
}
