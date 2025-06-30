# AI Agent with Express, TypeScript, Bun, and Gemini Function Calling

This project is a backend service for an AI agent built with Express.js, TypeScript, and Bun. It integrates with the Google Gemini API and is set up for function calling.

## Prerequisites

- [Bun](https://bun.sh) (v1.2.5 or later recommended)
- A Google Gemini API Key
- MongoDB (running locally or a cloud instance like MongoDB Atlas)
- Redis (running locally or a cloud instance)

## Setup

1.  **Clone the repository (if applicable):**

    ```bash
    # git clone <repository-url>
    # cd clinic-agent-ts
    ```

2.  **Install dependencies:**

    ```bash
    bun install
    ```

3.  **Set up environment variables:**
    Create a `.env` file in the root of the project by copying the example file:

    ```bash
    cp .env.example .env
    ```

    Open the `.env` file and add your Google Gemini API Key and MongoDB URI:

    ```env
    # Ensure you use the API key variable name that src/gemini.ts expects (currently GENAI_API_KEY)
    GENAI_API_KEY=YOUR_GEMINI_API_KEY_HERE
    # GEMINI_API_KEY=YOUR_GEMINI_API_KEY_HERE # Alternative if you change it in the code

    PORT=3000 # You can change the port if needed
    MONGODB_URI=mongodb://localhost:27017/ai_agent_chat # Or your MongoDB Atlas URI
    REDIS_URL=redis://localhost:6379 # Or your Redis connection URL
    ```

## Running the Application

To start the development server:

```bash
bun run dev
```

The server will typically start on `http://localhost:3000` (or the port specified in your `.env` file).

## API Endpoints

- **`GET /`**

  - Description: A simple health check endpoint.
  - Response: `AI Agent is running!`

- **`POST /chat`**
  - Description: Send a message to the AI agent and get a reply. Supports function calling.
  - Request Body (JSON):
    ```json
    {
      "userId": "some-unique-user-id",
      "message": "What's the weather like in Paris?"
    }
    ```
  - Response Body (JSON):
    ```json
    {
      "reply": "Sunny with a high of 25°C in Paris."
    }
    ```
    (The reply will vary based on the message and any function calls made by the AI)

## Project Structure

- `src/`: Contains the main source code.
  - `index.ts`: Main application entry point, sets up Express server.
  - `routes.ts`: Defines API routes.
  - `gemini.ts`: Handles interaction with the Gemini API, including function calling logic and chat history saving.
  - `prompts/default.ts`: Contains the default system prompt for the AI.
  - `config/db.ts`: Handles MongoDB connection.
  - `config/redis.ts`: Handles Redis connection for caching.
  - `interfaces/chat.ts`: Defines TypeScript interfaces for chat messages and sessions.
  - `tools/index.ts`: Exports tool definitions for Gemini function calling.
- `.env.example`: Example environment file.
- `package.json`: Project metadata and dependencies.
- `tsconfig.json`: TypeScript configuration.

This project was initialized using `bun init`.
