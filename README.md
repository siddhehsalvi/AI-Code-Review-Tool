# AI Code Review Tool

A simple tool that uses AI to review code and provide feedback.

## Features

- Paste code and get instant AI-powered feedback
- Highlights issues and suggestions with different severity levels
- Simple and intuitive interface

## Project Structure

- `client/`: React frontend
- `server/`: Node.js/Express backend

## Setup

### Backend Setup

1. Navigate to the server directory:
   ```
   cd server
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file with your configuration (see `.env` example)

4. Start the server:
   ```
   npm run dev
   ```

### Frontend Setup

1. Navigate to the client directory:
   ```
   cd client
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the React application:
   ```
   npm start
   ```

4. Open your browser and go to `http://localhost:3000`

## Usage

1. Paste your code into the text area
2. Click "Review Code"
3. View the AI-generated feedback and suggestions

## Integrating with AI Models

To integrate with actual AI models like Code Llama:

1. Update the `/api/review` endpoint in `server.js` to call the appropriate AI API
2. Add your API keys to the `.env` file

## License

MIT 