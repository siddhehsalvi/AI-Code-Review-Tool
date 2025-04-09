const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const aiService = require('./aiService');
const { validateApiKey } = require('./middleware/auth');

// Set environment to development explicitly
process.env.NODE_ENV = 'development';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5002;

// Middleware
app.use(cors({
  origin: '*', // Allow all origins
  methods: ['GET', 'POST'], // Allow these methods
  allowedHeaders: ['Content-Type', 'x-api-key'] // Allow these headers
}));
app.use(express.json({ limit: '10mb' })); // Increase request size limit

// Public routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Protected routes - require API key
// In development, the middleware will be bypassed
app.post('/api/review', validateApiKey, async (req, res) => {
  try {
    console.log('Received code review request');
    const { code, language } = req.body;
    
    if (!code) {
      console.log('Code is missing in request');
      return res.status(400).json({ error: 'Code is required' });
    }
    
    // Language validation disabled - skip language validation checks
    if (language) {
      console.log(`Language specified by user: ${language}`);
      // We're using the specified language regardless of the actual code language
      console.log(`Using specified language: ${language} (language validation disabled)`);
    }
    
    console.log('Calling AI service to analyze code...');
    // Call our AI service to analyze the code
    const review = await aiService.reviewCode(code);
    console.log('Code review completed successfully');
    res.json({ review });
    
  } catch (error) {
    console.error('Error processing code review:', error);
    res.status(500).json({ error: 'Failed to process code review' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 