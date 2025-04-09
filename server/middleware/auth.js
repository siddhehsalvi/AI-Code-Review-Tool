// Simple middleware to validate API key
// In a real application, you would use a more robust authentication system

/**
 * Validates API key from request header
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const validateApiKey = (req, res, next) => {
  // Skip validation unless explicitly in production
  if (process.env.NODE_ENV !== 'production') {
    console.log('API key validation bypassed in development/test mode');
    return next();
  }
  
  const apiKey = req.header('x-api-key');
  
  // Check if API key is present
  if (!apiKey) {
    return res.status(401).json({ error: 'API key is required' });
  }
  
  // Check if API key is valid (simplified example)
  // In a real app, you would validate against a database
  if (apiKey !== process.env.API_KEY) {
    return res.status(403).json({ error: 'Invalid API key' });
  }
  
  // If valid, continue to the next middleware or route handler
  next();
};

module.exports = {
  validateApiKey
}; 