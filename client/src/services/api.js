import axios from 'axios';

// Create axios instance with base URL
const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  }
});

// API service for code review
export const codeReviewService = {
  /**
   * Submit code for review
   * @param {string} code - Code to be reviewed
   * @returns {Promise} - Promise with the review result
   */
  submitCode: async (code) => {
    try {
      const response = await apiClient.post('/api/review', { code });
      return response.data.review;
    } catch (error) {
      console.error('Error submitting code for review:', error);
      throw error;
    }
  },
  
  /**
   * Check server health
   * @returns {Promise} - Promise with health status
   */
  checkHealth: async () => {
    try {
      const response = await apiClient.get('/api/health');
      return response.data;
    } catch (error) {
      console.error('Error checking server health:', error);
      throw error;
    }
  }
};

export default apiClient; 