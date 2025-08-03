import express, { type Express, type Request, type Response } from 'express';
import { setupRoutes } from './routes';
import dotenv from 'dotenv';
import multer from 'multer';
dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

// Cấu hình multer để lưu file tạm

app.use(express.json());

setupRoutes(app);

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
