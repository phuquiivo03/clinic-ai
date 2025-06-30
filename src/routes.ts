import { type Express, type Request, type Response } from 'express';
import { runChat, saveChatMessage } from './gemini';
import { middlewares } from './middlewares';
import type { ChatMessage } from './interfaces/chat';

export function setupRoutes(app: Express): void {
  app.post(
    '/chat',
    middlewares.userAuthen,
    async (req: Request, res: Response): Promise<void> => {
      try {
        const { message } = req.body;
        const userId = req.userId;
        if (!message) {
          res.status(400).json({ error: 'Message is required' });
          return;
        }
        if (!userId) {
          res.status(400).json({ error: 'userId is required' });
          return;
        }
        const reply = await runChat(req.headers.authorization || '', userId, message);
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
        res.status(500).json({ error: (error as Error).message || 'Failed to process chat message' });
      }
    }
  )

  app.get('/', (req: Request, res: Response): void => {
    res.send('AI Agent is running!');
  });
}
