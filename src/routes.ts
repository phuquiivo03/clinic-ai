import { type Express, type Request, type Response } from 'express';
import { runChat, saveChatMessage } from './gemini';
import { middlewares } from './middlewares';
import type { ChatMessage } from './interfaces/chat';
import fs from 'fs';
import path from 'path';
import multer from 'multer';
import { config } from './config';
const upload = multer({ dest: 'uploads/' });

export function setupRoutes(app: Express): void {
  app.post(
    '/chat',
    upload.single('image'),
    middlewares.userAuthen,
    async (req: Request, res: Response): Promise<void> => {
      try {
        console.log('Received file request:', req.file);
        const message = req.body.message;
        const file = req.file;

        let base64Image: string | undefined;

        if (file) {
          const filePath = path.resolve(file.path); // file.path là đường dẫn đến file do multer tạo
          const imageBuffer = fs.readFileSync(filePath);
          base64Image = imageBuffer.toString('base64');
        }

        // const imageMimeType = `data:${config.base64.mimeType};base64,${base64Image}`;

        const userId = req.userId;
        if (!message) {
          res.status(400).json({ error: 'Message is required' });
          return;
        }
        if (!userId) {
          res.status(400).json({ error: 'userId is required' });
          return;
        }
        const reply = await runChat(
          req.headers.authorization || '',
          userId,
          message,
          base64Image
        );
        res.json({ reply });
      } catch (error) {
        console.error('Error in chat route:', error);
        res.status(500).json({ error: 'Failed to process chat message' });
      }
    }
  );

  app.post(
    '/history',
    middlewares.userAuthen,
    async (req: Request, res: Response): Promise<void> => {
      try {
        const data: ChatMessage = req.body;
        const createdChat = await saveChatMessage(data);
        res.status(201).json(createdChat);
      } catch (error) {
        console.error('Error in chat route:', error);
        res.status(500).json({
          error: (error as Error).message || 'Failed to process chat message',
        });
      }
    }
  );

  app.get('/', (req: Request, res: Response): void => {
    res.send('AI Agent is running!');
  });
}
