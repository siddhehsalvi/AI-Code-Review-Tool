import axios from 'axios';

// Create axios instance with base URL
const apiClient = axios.create({
  baseURL: 'http://localhost:5002',  // Hardcoded to ensure correct port
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': 'test-api-key', // Add a test API key
  },
  withCredentials: false, // Disable sending cookies
  timeout: 30000, // Increase timeout for large code submissions
});

// Log all requests in development
apiClient.interceptors.request.use(request => {
  console.log('Starting API Request', request);
  return request;
});

// Log all responses in development
apiClient.interceptors.response.use(
  response => {
    console.log('API Response:', response);
    return response;
  },
  error => {
    console.error('API Error:', error.response || error);
    return Promise.reject(error);
  }
);

// API service for code review
export const codeReviewService = {
  /**
   * Submit code for review
   * @param {string} code - Code to be reviewed
   * @param {string} language - Selected programming language
   * @returns {Promise} - Promise with the review result
   */
  submitCode: async (code, language) => {
    try {
      console.log('Submitting code to API at:', apiClient.defaults.baseURL);
      console.log('Selected language:', language);
      const response = await apiClient.post('/api/review', { code, language });
      console.log('Received response:', response.data);
      return response.data.review;
    } catch (error) {
      console.error('Error submitting code for review:', error);
      
      // Enhanced error details
      const errorDetails = {
        message: 'Failed to get code review.',
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        isAxiosError: error.isAxiosError,
        connectionError: !error.response,
        serverUrl: apiClient.defaults.baseURL
      };
      
      console.error('Error details:', errorDetails);
      throw errorDetails;
    }
  }
};

export default apiClient; 