import React, { useState } from 'react';
import './App.css';
import CodeDisplay from './components/CodeDisplay';
import IssuesFound from './components/IssuesFound';
import { codeReviewService } from './services/api';
import Editor from '@monaco-editor/react';
// eslint-disable-next-line no-unused-vars
import { Container, Row, Col, Button, Form, Spinner, Navbar, Nav, Card } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCode, faBolt, faShieldAlt, faVial, faWrench, faRobot, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

// Sample code for each supported language
const sampleCodeByLanguage = {
  javascript: `// JavaScript Sample
function calculateFactorial(n) {
  if (n === 0 || n === 1) {
    return 1;
  }
  
  let result = 1;
  for (let i = 2; i <= n; i++) {
    result *= i;
  }
  
  console.log("The factorial is:", result);
  return result;
}

// Example with a potential bug (== instead of ===)
function compareValues(a, b) {
  if (a == b) {
    return true;
  }
  return false;
}`,

  python: `# Python Sample with Security Vulnerability
import os

def delete_file():
    filename = input("Enter the filename to delete: ")
    os.system(f"rm {filename}")  # Command Injection Vulnerability!

# This could allow an attacker to execute arbitrary commands
# For example, input: "important.txt; rm -rf /"

# Safer version would be:
# import os
# def delete_file_safely():
#     filename = input("Enter the filename to delete: ")
#     os.remove(filename)  # Still needs validation, but better

delete_file()`,

  java: `// Java Sample
public class Factorial {
    public static void main(String[] args) {
        System.out.println(calculateFactorial(5));
    }
    
    public static int calculateFactorial(int n) {
        if (n == 0 || n == 1) {
            return 1;
        }
        
        int result = 1;
        for (int i = 2; i <= n; i++) {
            result *= i;
        }
        
        System.out.println("The factorial is: " + result);
        return result;
    }
    
    // Example with a potential bug (no null check)
    public static boolean isEmpty(String str) {
        return str.length() == 0;
    }
}`,

  cpp: `// C++ Sample
#include <iostream>

int calculateFactorial(int n) {
    if (n == 0 || n == 1) {
        return 1;
    }
    
    int result = 1;
    for (int i = 2; i <= n; i++) {
        result *= i;
    }
    
    std::cout << "The factorial is: " << result << std::endl;
    return result;
}

// Example with a potential memory leak
void createArray() {
    int* arr = new int[10];
    // No delete[] arr;
}

int main() {
    std::cout << calculateFactorial(5) << std::endl;
    createArray();
    return 0;
}`
};

function App() {
  const [code, setCode] = useState('// Paste your code here for review');
  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [activeTab, setActiveTab] = useState('editor');
  const [metrics, setMetrics] = useState({
    bugs: 0,
    vulnerabilities: 0,
    codeSmells: 0,
    duplications: 0,
    coverage: 0
  });
  const [languageMismatch, setLanguageMismatch] = useState(null);

  const handleCodeChange = (value) => {
    setCode(value);
    // Clear any previous language mismatch error when code changes
    setLanguageMismatch(null);
  };

  const handleLanguageChange = (e) => {
    setLanguage(e.target.value);
    // Clear any previous language mismatch error when language changes
    setLanguageMismatch(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setReview(null);
    setLanguageMismatch(null);

    try {
      console.log('Submitting code for review...');
      console.log('Selected language:', language);
      const reviewResult = await codeReviewService.submitCode(code, language);
      
      // Process the review response to match our UI structure
      const processedReview = {
        originalCode: code,
        suggestions: [],
        recommendedFix: '',
        summary: reviewResult.summary || 'Code review completed.'
      };
      
      // Extract issues from the review result
      if (reviewResult.suggestions && reviewResult.suggestions.length > 0) {
        processedReview.suggestions = reviewResult.suggestions.map(suggestion => ({
          ...suggestion,
          formattedMessage: suggestion.formattedMessage || suggestion.message
        }));
      }
      
      // Extract recommended fix if available
      if (reviewResult.recommendedFix) {
        processedReview.recommendedFix = reviewResult.recommendedFix;
      }
      
      setReview(processedReview);
      
      // Update metrics based on review results
      if (reviewResult.metrics) {
        setMetrics(reviewResult.metrics);
      } else {
        // Generate mock metrics based on suggestions
        const bugs = reviewResult.suggestions.filter(s => s.severity === 'high' && s.category === 'bug').length;
        const vulnerabilities = reviewResult.suggestions.filter(s => s.severity === 'high' && s.category === 'security').length;
        const codeSmells = reviewResult.suggestions.filter(s => s.category === 'code-smell').length;
        const duplications = reviewResult.suggestions.filter(s => s.category === 'duplication').length;
        
        setMetrics({
          bugs,
          vulnerabilities,
          codeSmells,
          duplications,
          coverage: Math.floor(Math.random() * 100) // Mock coverage
        });
      }
    } catch (err) {
      console.error('Error in handleSubmit:', err);
      
      // Create a more detailed error message
      let errorMsg = 'Failed to get code review. Please try again.';
      
      if (err.connectionError) {
        errorMsg = `Connection error: Could not connect to server at ${err.serverUrl}. Please check if the server is running.`;
      } else if (err.status) {
        if (err.data?.error === 'Language mismatch') {
          // Handle language mismatch error specifically
          setLanguageMismatch(err.data.message);
          errorMsg = ''; // Don't set general error for language mismatch
        } else {
          errorMsg = `Server error (${err.status}): ${err.statusText || 'Unknown error'}`;
          if (err.data?.error) {
            errorMsg += ` - ${err.data.error}`;
          }
        }
      }
      
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const loadSampleCode = () => {
    setCode(sampleCodeByLanguage[language]);
  };

  // Calculate the ratings based on metrics
  const getBugRating = (count) => count === 0 ? 'A' : count < 3 ? 'B' : count < 5 ? 'C' : 'D';
  const getVulnerabilityRating = (count) => count === 0 ? 'A' : count < 2 ? 'B' : count < 4 ? 'C' : 'D';
  const getCodeSmellRating = (count) => count < 5 ? 'A' : count < 10 ? 'B' : count < 20 ? 'C' : 'D';
  const getCoverageRating = (percentage) => percentage > 80 ? 'A' : percentage > 70 ? 'B' : percentage > 50 ? 'C' : 'D';
  
  const renderMetrics = () => {
    return (
      <div className="metrics-container">
        <h3><FontAwesomeIcon icon={faVial} className="me-2" /> Code Quality Dashboard</h3>
        <div className="metrics-grid">
          <div className="metric-item">
            <div className="metric-header">
              <div className="metric-icon bug"><FontAwesomeIcon icon={faExclamationTriangle} /></div>
              <div className="metric-title">Bugs</div>
            </div>
            <div className={`metric-value bug rating-${getBugRating(metrics.bugs)}`}>{metrics.bugs}</div>
            <div className="metric-rating">Reliability: {getBugRating(metrics.bugs)}</div>
          </div>
          
          <div className="metric-item">
            <div className="metric-header">
              <div className="metric-icon security"><FontAwesomeIcon icon={faShieldAlt} /></div>
              <div className="metric-title">Vulnerabilities</div>
            </div>
            <div className={`metric-value security rating-${getVulnerabilityRating(metrics.vulnerabilities)}`}>{metrics.vulnerabilities}</div>
            <div className="metric-rating">Security: {getVulnerabilityRating(metrics.vulnerabilities)}</div>
          </div>
          
          <div className="metric-item">
            <div className="metric-header">
              <div className="metric-icon smell"><FontAwesomeIcon icon={faWrench} /></div>
              <div className="metric-title">Code Quality Issues</div>
            </div>
            <div className={`metric-value smell rating-${getCodeSmellRating(metrics.codeSmells)}`}>{metrics.codeSmells}</div>
            <div className="metric-rating">Maintainability: {getCodeSmellRating(metrics.codeSmells)}</div>
          </div>
          
          <div className="metric-item">
            <div className="metric-header">
              <div className="metric-icon duplication"><FontAwesomeIcon icon={faCode} /></div>
              <div className="metric-title">Duplications</div>
            </div>
            <div className="metric-value duplication">{metrics.duplications}</div>
          </div>
          
          <div className="metric-item">
            <div className="metric-header">
              <div className="metric-icon coverage"><FontAwesomeIcon icon={faBolt} /></div>
              <div className="metric-title">Coverage</div>
            </div>
            <div className={`metric-value coverage rating-${getCoverageRating(metrics.coverage)}`}>{metrics.coverage}%</div>
            <div className="metric-rating">Coverage: {getCoverageRating(metrics.coverage)}</div>
          </div>
        </div>
      </div>
    );
  };

  // Convert suggestions to the format expected by IssuesFound component
  const formatIssuesForComponent = () => {
    if (!review || !review.suggestions) return [];
    
    return review.suggestions.map(suggestion => {
      // Get specific solution based on issue category and details
      const { specificSolution, specificCode } = generateSpecificSolution(suggestion, language);
      
      return {
        title: suggestion.message,
        description: suggestion.formattedMessage || suggestion.message,
        severity: suggestion.severity || 'medium',
        location: `Line ${suggestion.line || 'unknown'}`,
        code: suggestion.codeSnippet || '',
        category: suggestion.category || 'code-smell',
        solution: specificSolution,
        solutionCode: specificCode
      };
    });
  };
  
  // Generate specific solutions for different types of issues
  const generateSpecificSolution = (suggestion, language) => {
    const category = suggestion.category?.toLowerCase() || 'code-smell';
    const message = suggestion.message || '';
    const codeSnippet = suggestion.codeSnippet || '';
    
    // Default solution
    let specificSolution = 'Consider addressing this issue to improve your code quality.';
    let specificCode = suggestion.fix || review.recommendedFix || '';
    
    switch(category) {
      case 'bug':
        if (message.includes('==') && message.includes('===')) {
          specificSolution = 'Use strict equality (===) instead of loose equality (==) to avoid unexpected type coercion. Loose equality can lead to bugs when comparing values of different types.';
          specificCode = codeSnippet.replace(/==/g, '===').replace(/!=/g, '!==');
        } else if (message.includes('null') || message.includes('undefined')) {
          specificSolution = 'Add null/undefined checks to prevent runtime errors. Always validate data before accessing properties or methods.';
          
          if (language === 'javascript' || language === 'typescript') {
            specificCode = generateNullCheckJs(codeSnippet);
          } else if (language === 'java') {
            specificCode = generateNullCheckJava(codeSnippet);
          }
        } else if (message.includes('error') && message.includes('handling')) {
          specificSolution = 'Implement proper error handling with try-catch blocks to prevent uncaught exceptions and provide graceful failure mechanisms.';
          specificCode = generateErrorHandlingCode(codeSnippet, language);
        }
        break;
        
      case 'security':
        if (message.includes('injection') || message.includes('command')) {
          specificSolution = 'Command injection vulnerability detected! Never pass unsanitized user input to system commands. Use safer alternatives like dedicated APIs instead of string concatenation.';
          
          if (language === 'python') {
            specificCode = `# SAFE ALTERNATIVE\nimport os\nimport re\n\ndef delete_file_safely(filename):\n    # Validate the filename with a whitelist approach\n    if not re.match(r'^[\\w\\-. ]+$', filename):\n        print("Invalid filename")\n        return False\n        \n    # Use a safer alternative\n    try:\n        os.remove(filename)  # Direct API call instead of shell command\n        return True\n    except Exception as e:\n        print(f"Error: {e}")\n        return False`;
          } else if (language === 'javascript') {
            specificCode = `// SAFE ALTERNATIVE\nconst { execFile } = require('child_process');\nconst path = require('path');\n\nfunction deleteFileSafely(filename) {\n  // Validate the filename\n  const basename = path.basename(filename);\n  if (basename !== filename) {\n    console.error("Path traversal attempt detected");\n    return;\n  }\n  \n  // Use execFile instead of exec - it doesn't invoke a shell\n  execFile('rm', [filename], (error) => {\n    if (error) {\n      console.error('Deletion error:', error);\n    } else {\n      console.log('File deleted successfully');\n    }\n  });\n}`;
          }
        } else if (message.includes('XSS') || message.includes('cross-site')) {
          specificSolution = 'Cross-Site Scripting (XSS) vulnerability detected! Always sanitize user input before inserting it into the DOM to prevent script injection attacks.';
          
          if (language === 'javascript') {
            specificCode = `// SAFE ALTERNATIVE\n// Instead of:\n// element.innerHTML = userInput;\n\n// Use textContent (safest)\nfunction displayUserContent(userInput, element) {\n  element.textContent = userInput;\n}\n\n// Or use a sanitization library\nfunction displayFormattedContent(userInput, element) {\n  // Using DOMPurify library\n  const sanitizedContent = DOMPurify.sanitize(userInput);\n  element.innerHTML = sanitizedContent;\n}`;
          }
        } else if (message.includes('SQL') || message.includes('database')) {
          specificSolution = 'SQL Injection vulnerability detected! Never concatenate user input directly into SQL queries. Use parameterized queries or prepared statements instead.';
          
          if (language === 'javascript') {
            specificCode = `// SAFE ALTERNATIVE - Using parameterized queries\n\n// Instead of:\n// const query = \`SELECT * FROM users WHERE username = '\${username}'\`;\n\n// Use parameterized queries:\nconst mysql = require('mysql2/promise');\n\nasync function getUserSafely(username) {\n  const connection = await mysql.createConnection({\n    host: 'localhost',\n    user: 'user',\n    database: 'my_db'\n  });\n  \n  // Use placeholders (?) for parameters\n  const [rows] = await connection.execute(\n    'SELECT * FROM users WHERE username = ?', \n    [username]\n  );\n  \n  await connection.end();\n  return rows;\n}`;
          } else if (language === 'python') {
            specificCode = `# SAFE ALTERNATIVE - Using parameterized queries\n\n# Instead of:\n# query = f"SELECT * FROM users WHERE username = '{username}'"\n\n# Use parameterized queries:\nimport sqlite3\n\ndef get_user_safely(username):\n    conn = sqlite3.connect('database.db')\n    cursor = conn.cursor()\n    \n    # Use placeholders (?) for parameters\n    cursor.execute(\"SELECT * FROM users WHERE username = ?\", (username,))\n    \n    result = cursor.fetchall()\n    conn.close()\n    return result`;
          }
        } else if (message.includes('CSRF') || message.includes('forgery')) {
          specificSolution = 'Cross-Site Request Forgery (CSRF) vulnerability detected! Implement anti-CSRF tokens for all state-changing operations to protect users from unwanted actions.';
          
          specificCode = `// Implement CSRF protection by adding a token\n\n// Server-side (Node.js Express example):\napp.use(require('csurf')());\n\napp.get('/form', (req, res) => {\n  // Pass the CSRF token to the view\n  res.render('form', { csrfToken: req.csrfToken() });\n});\n\n// Client-side:\n// <form action="/submit" method="POST">\n//   <input type="hidden" name="_csrf" value="{{csrfToken}}">\n//   <input type="text" name="data">\n//   <button type="submit">Submit</button>\n// </form>`;
        }
        break;
        
      case 'performance':
        if (message.includes('loop') || message.includes('iteration')) {
          specificSolution = 'Performance issue detected in loop implementation. Consider optimizing the loop to reduce unnecessary operations and improve execution time.';
          specificCode = generateOptimizedLoopCode(codeSnippet, language);
        } else if (message.includes('memory') || message.includes('leak')) {
          specificSolution = 'Memory leak detected! Always release allocated resources properly to prevent memory leaks.';
          
          if (language === 'cpp') {
            specificCode = `// FIXED CODE - Memory leak addressed\n#include <iostream>\n\nvoid createArray() {\n    int* arr = new int[10];\n    \n    // Use the array here...\n    \n    // Properly free the allocated memory\n    delete[] arr;  // Release the memory when done\n}\n\nint main() {\n    createArray();\n    return 0;\n}`;
          }
        } else {
          specificSolution = 'Performance issue detected. Consider optimizing by reducing unnecessary operations, caching results, or using more efficient data structures.';
        }
        break;
        
      case 'code-smell':
        if (message.includes('console.log')) {
          specificSolution = 'Remove or replace debugging console.log statements with proper logging for production code. Console statements can impact performance and may expose sensitive information.';
          
          if (language === 'javascript') {
            specificCode = `// BETTER ALTERNATIVE\n// Instead of:\n// console.log("Debug info:", data);\n\n// Use a proper logging utility:\nconst logger = require('your-logger-library');\n\n// Use appropriate log levels\nlogger.debug("Debug info:", data);  // Only shown in development\nlogger.info("Operation completed");  // Informational message\nlogger.warn("Potential issue detected");  // Warning\nlogger.error("Something went wrong", error);  // Error with details`;
          }
        } else if (message.includes('var ')) {
          specificSolution = 'Replace "var" with "const" or "let". Using "var" can lead to scope-related bugs and is considered outdated in modern JavaScript.';
          specificCode = codeSnippet.replace(/var /g, 'const ');
        } else if (message.includes('magic number')) {
          specificSolution = 'Replace magic numbers with named constants to improve code readability and maintainability.';
          specificCode = generateMagicNumberFix(codeSnippet, language);
        }
        break;
        
      case 'duplication':
        specificSolution = 'Code duplication detected. Extract the duplicated code into a reusable function or method to improve maintainability and reduce bugs.';
        specificCode = generateDuplicationFix(codeSnippet, language);
        break;
        
      default:
        // Default solutions already set
        break;
    }
    
    return { specificSolution, specificCode };
  };
  
  // Helper function to generate null check code in JavaScript
  const generateNullCheckJs = (codeSnippet) => {
    if (codeSnippet.includes('.length') || codeSnippet.includes('.')) {
      return `// FIXED CODE - With null/undefined check
function safeOperation(obj) {
  // Check if object exists before accessing properties
  if (obj && typeof obj === 'object') {
    // Safe to access properties
    return obj.property;
  }
  return null; // Or a default value
}

// For array or string length checks:
function isEmpty(str) {
  // Check if str exists and has length property
  return !str || typeof str.length !== 'number' || str.length === 0;
}`;
    }
    return `// FIXED CODE - With null/undefined check
// Add validation before using the value
if (value !== null && value !== undefined) {
  // It's safe to use value here
  const result = process(value);
} else {
  // Handle the null/undefined case
  console.error("Value is missing or invalid");
  // Provide a fallback or error handling
}`;
  };
  
  // Helper function to generate null check code in Java
  const generateNullCheckJava = (codeSnippet) => {
    return `// FIXED CODE - With null check
public static boolean isEmpty(String str) {
    // Check if str is null before accessing methods
    return str == null || str.length() == 0;
}

// For more complex objects:
public static void processObject(MyObject obj) {
    // Validate object before use
    if (obj != null) {
        // Safe to access object properties and methods
        obj.doSomething();
    } else {
        // Handle the null case
        System.err.println("Object is null");
        // Provide appropriate error handling
    }
}`;
  };
  
  // Helper function to generate error handling code
  const generateErrorHandlingCode = (codeSnippet, language) => {
    if (language === 'javascript') {
      return `// FIXED CODE - With proper error handling
try {
  // Potentially risky code that might throw an exception
  const result = riskyOperation();
  return result;
} catch (error) {
  // Properly handle the exception
  console.error("An error occurred:", error.message);
  // Provide fallback or recovery logic
  return defaultValue; // Or throw a more specific error
}`;
    } else if (language === 'python') {
      return `# FIXED CODE - With proper error handling
try:
    # Potentially risky code that might throw an exception
    result = risky_operation()
    return result
except Exception as e:
    # Properly handle the exception
    print(f"An error occurred: {e}")
    # Provide fallback or recovery logic
    return default_value  # Or raise a more specific error`;
    } else if (language === 'java') {
      return `// FIXED CODE - With proper error handling
try {
    // Potentially risky code that might throw an exception
    Result result = riskyOperation();
    return result;
} catch (Exception e) {
    // Properly handle the exception
    System.err.println("An error occurred: " + e.getMessage());
    // Provide fallback or recovery logic
    return defaultValue; // Or throw a more specific error
} finally {
    // Clean up resources regardless of success or failure
    closeResources();
}`;
    }
    return `// FIXED CODE - Add proper error handling around risky operations`;
  };
  
  // Helper function to generate optimized loop code
  const generateOptimizedLoopCode = (codeSnippet, language) => {
    if (language === 'javascript') {
      return `// OPTIMIZED LOOP
// Instead of:
// for (let i = 0; i < array.length; i++) {
//   // Body that doesn't change array length
// }

// Cache the length to avoid recalculating on each iteration:
const length = array.length;
for (let i = 0; i < length; i++) {
  // Loop body
}

// Or use modern array methods for better readability:
array.forEach(item => {
  // Process each item
});

// Or for transformations:
const results = array.map(item => {
  // Transform item
  return transformedItem;
});`;
    } else if (language === 'python') {
      return `# OPTIMIZED LOOP
# Instead of repeatedly calling len() in loop condition:
# for i in range(len(items)):
#     # Loop body

# Pre-calculate length:
items_length = len(items)
for i in range(items_length):
    # Loop body
    
# Or better yet, use Python's native iteration:
for item in items:
    # Process item directly
    
# For transformations, use list comprehension:
results = [transform(item) for item in items]`;
    }
    return `// OPTIMIZED LOOP
// Pre-calculate loop boundaries
// Use appropriate data structures
// Minimize work inside loops`;
  };
  
  // Helper function to fix magic number issues
  const generateMagicNumberFix = (codeSnippet, language) => {
    if (language === 'javascript' || language === 'typescript') {
      return `// FIXED CODE - Using named constants instead of magic numbers
// Instead of:
// if (status === 200) { ... }

// Use named constants:
const HTTP_STATUS_OK = 200;
const HTTP_STATUS_NOT_FOUND = 404;
const HTTP_STATUS_SERVER_ERROR = 500;

if (status === HTTP_STATUS_OK) {
  // Handle success
} else if (status === HTTP_STATUS_NOT_FOUND) {
  // Handle not found
} else if (status === HTTP_STATUS_SERVER_ERROR) {
  // Handle server error
}

// For configuration values:
const MAX_RETRY_ATTEMPTS = 3;
const TIMEOUT_MS = 5000;
const DEFAULT_PAGE_SIZE = 10;

// Then use these constants in your code`;
    } else if (language === 'python') {
      return `# FIXED CODE - Using named constants instead of magic numbers
# Instead of:
# if status == 200: ...

# Use named constants:
HTTP_STATUS_OK = 200
HTTP_STATUS_NOT_FOUND = 404
HTTP_STATUS_SERVER_ERROR = 500

if status == HTTP_STATUS_OK:
    # Handle success
elif status == HTTP_STATUS_NOT_FOUND:
    # Handle not found
elif status == HTTP_STATUS_SERVER_ERROR:
    # Handle server error
    
# For configuration values:
MAX_RETRY_ATTEMPTS = 3
TIMEOUT_SECONDS = 5
DEFAULT_PAGE_SIZE = 10

# Then use these constants in your code`;
    }
    return `// FIXED CODE - Replace magic numbers with named constants
// Define meaningful constants at the top of your file
// Use these constants instead of hardcoded values`;
  };
  
  // Helper function to fix code duplication
  const generateDuplicationFix = (codeSnippet, language) => {
    if (language === 'javascript') {
      return `// FIXED CODE - Extracted duplicated code
// Instead of repeating similar code in multiple places:

// Extract common functionality into a reusable function:
function processItem(item, options = {}) {
  // Common processing logic
  const result = {
    id: item.id,
    name: item.name,
    // Add more properties as needed
  };
  
  // Apply options if provided
  if (options.transform) {
    result.transformed = options.transform(item);
  }
  
  return result;
}

// Now use this function in different places:
const processedItemA = processItem(itemA, { transform: specialTransform });
const processedItemB = processItem(itemB);`;
    } else if (language === 'python') {
      return `# FIXED CODE - Extracted duplicated code
# Instead of repeating similar code in multiple places:

# Extract common functionality into a reusable function:
def process_item(item, **options):
    # Common processing logic
    result = {
        'id': item['id'],
        'name': item['name'],
        # Add more properties as needed
    }
    
    # Apply options if provided
    if 'transform' in options:
        result['transformed'] = options['transform'](item)
    
    return result

# Now use this function in different places:
processed_item_a = process_item(item_a, transform=special_transform)
processed_item_b = process_item(item_b)`;
    }
    return `// FIXED CODE - Extract duplicated code into a reusable method
// Create a shared function/method that accepts parameters
// Call this shared function from multiple places`;
  };

  return (
    <div className="app-container">
      <Navbar className="app-header">
        <div className="logo">
          <FontAwesomeIcon icon={faRobot} className="logo-icon" />
          <div className="logo-text">
            <h1>CodeVeda</h1>
            <span className="tagline">From Veda to Variables — Decoding Code with Vedic Precision</span>
          </div>
        </div>
      </Navbar>

      <div className="main-content">
        <div className="sidebar">
          <div className="language-selector">
            <h3><FontAwesomeIcon icon={faCode} className="me-2" /> Programming Language</h3>
            <Form.Group>
              <Form.Select value={language} onChange={handleLanguageChange}>
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="java">Java</option>
                <option value="cpp">C++</option>
              </Form.Select>
            </Form.Group>
          </div>

          <div className="action-buttons">
            <Button 
              className="sample-code-button"
              onClick={loadSampleCode}
            >
              <FontAwesomeIcon icon={faCode} className="me-2" />
              Load Sample Code
            </Button>
            <Button 
              className="review-button"
              onClick={handleSubmit}
              disabled={loading || !code.trim()}
            >
              {loading ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                    className="me-2"
                  />
                  Analyzing...
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faBolt} className="me-2" />
                  Review Code
                </>
              )}
            </Button>
          </div>
          
          {review && renderMetrics()}
        </div>

        <div className="content-area">
          {/* Language mismatch alert */}
          {languageMismatch && (
            <div className="alert alert-warning language-mismatch">
              <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
              {languageMismatch}
            </div>
          )}
          
          {/* Regular error alert - only shown for non-language errors */}
          {error && error.trim() !== '' && (
            <div className="error-alert">
              <FontAwesomeIcon icon={faExclamationTriangle} />
              <div className="error-message">
                {error}
              </div>
            </div>
          )}
          
          <div className="tabs">
            <Button 
              className={`tab ${activeTab === 'editor' ? 'active' : ''}`}
              onClick={() => setActiveTab('editor')}
            >
              <FontAwesomeIcon icon={faCode} className="me-2" />
              Editor
            </Button>
            <Button 
              className={`tab ${activeTab === 'review' ? 'active' : ''}`}
              onClick={() => setActiveTab('review')}
              disabled={!review}
            >
              <FontAwesomeIcon icon={faVial} className="me-2" />
              Review
            </Button>
          </div>

          <div className="tab-content">
            {activeTab === 'editor' && (
              <div className="editor-container">
                <Editor
                  height="70vh"
                  defaultLanguage={language}
                  language={language}
                  value={code}
                  onChange={handleCodeChange}
                  theme="vs-dark"
                  options={{
                    minimap: { enabled: true },
                    scrollBeyondLastLine: false,
                    fontSize: 14,
                    automaticLayout: true
                  }}
                />
              </div>
            )}
            
            {activeTab === 'review' && review && (
              <div className="review-container">
                <div className="review-header">
                  <h3><FontAwesomeIcon icon={faRobot} className="me-2" /> Code Review Results</h3>
                  <div className="review-summary">
                    <p>{review.summary}</p>
                  </div>
                  {renderMetrics()}
                </div>
                
                <div className="review-body">
                  {/* Replace renderReviewDetails() with IssuesFound component */}
                  <IssuesFound issues={formatIssuesForComponent()} />
                  
                  <div className="code-viewer">
                    <h3><FontAwesomeIcon icon={faCode} className="me-2" /> Reviewed Code</h3>
                    <div className="code-with-review">
                      <CodeDisplay code={code} language={language} />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;