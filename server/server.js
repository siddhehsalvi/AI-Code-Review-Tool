const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const aiService = require('./aiService');
const { validateApiKey } = require('./middleware/auth');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Public routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Protected routes - require API key
// In development, the middleware will be bypassed
app.post('/api/review', validateApiKey, async (req, res) => {
  try {
    const { code } = req.body;
    
    if (!code) {
      return res.status(400).json({ error: 'Code is required' });
    }
    
    // Call our AI service to analyze the code
    const review = await aiService.reviewCode(code);
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