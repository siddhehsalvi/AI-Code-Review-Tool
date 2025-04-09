# CodeVeda - AI Code Review Tool

CodeVeda is an AI-powered code analysis tool that identifies code quality issues and suggests improvements in JavaScript, Python, Java, and C++ code.

## How to Run the Project

### Prerequisites
- Node.js (v14.x or higher)
- npm (v6.x or higher)

### Step 1: Set up and Start the Server
1. Navigate to the project directory:
   ```
   cd AI-Code-Review-Tool-Dev
   ```

2. Install server dependencies:
   ```
   cd server
   npm install
   cd ..
   ```

3. Start the server:
   ```
   node server/server.js
   ```
   
   You should see: "Server running on port 5002"

### Step 2: Start the Client Application
1. Open a new terminal window (keep the server running in the first one)

2. Navigate to the client directory:
   ```
   cd AI-Code-Review-Tool-Dev/client
   ```

3. Install client dependencies:
   ```
   npm install
   ```

4. Start the client application:
   ```
   npm start
   ```

5. The application will automatically open in your browser at:
   http://localhost:3000

### Step 3: Using the Application
1. Select a programming language (JavaScript, Python, Java, or C++)
2. Either paste your code in the editor or click "Load Sample Code"
3. Click "Review Code" to analyze the code
4. Switch to the "Review" tab to see the analysis results

## Features
- Code quality analysis for multiple languages
- Detection of "use this instead of that" patterns
- Severity rating for each issue (high/medium/low)
- Categorized suggestions (bugs, security, performance, code smells)
- Recommended fixes for identified issues
- Quality metrics dashboard

## Troubleshooting
- If you see "Failed to get code review" errors, make sure the server is running
- The server runs on port 5002, and the client accesses it via http://localhost:5002
- If port 5002 is already in use, edit server.js to use a different port (and update client/src/services/api.js and client/package.json accordingly)

## Notes
- This is a development version set up for local testing
- Authentication is bypassed in development mode 