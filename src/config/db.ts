import { MongoClient, Db } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    'Please define the MONGODB_URI environment variable inside .env'
  );
}

let db: Db;
let client: MongoClient;

export async function connectToDatabase(): Promise<Db> {
  if (db) {
    return db;
  }

  try {
    client = new MongoClient(MONGODB_URI!); // Added non-null assertion
    await client.connect();
    // Extract database name from URI or use a default
    const dbName =
      MONGODB_URI!.split('/').pop()?.split('?')[0] || 'ai_agent_chat'; // Added non-null assertion
    db = client.db(dbName);
    console.log(`Successfully connected to database: ${db.databaseName}`);
    return db;
  } catch (error) {
    console.error('Could not connect to MongoDB', error);
    throw error; // Re-throw error to be handled by the caller
  }
}

export async function getDb(): Promise<Db> {
  if (!db) {
    return await connectToDatabase();
  }
  return db;
}

// Graceful shutdown
export async function closeDatabaseConnection(): Promise<void> {
  if (client) {
    await client.close();
    console.log('MongoDB connection closed.');
  }
}
