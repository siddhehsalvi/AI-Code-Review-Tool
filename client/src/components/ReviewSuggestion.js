import React, { useState } from 'react';

const ReviewSuggestion = ({ suggestion }) => {
  const { line, message, severity, category = 'code-smell' } = suggestion;
  const [showFix, setShowFix] = useState(false);
  
  // Get icon based on category
  const getCategoryIcon = () => {
    switch (category) {
      case 'bug':
        return '🐛';
      case 'security':
        return '🔒';
      case 'performance':
        return '⚡';
      case 'duplication':
        return '📋';
      case 'code-smell':
      default:
        return '💡';
    }
  };
  
  // Get severity icon
  const getSeverityIcon = () => {
    switch (severity) {
      case 'high':
        return '🔴';
      case 'medium':
        return '🟡';
      case 'low':
        return '🔵';
      default:
        return '⚪';
    }
  };
  
  // Get category label
  const getCategoryLabel = () => {
    switch (category) {
      case 'bug':
        return 'Bug';
      case 'security':
        return 'Security';
      case 'performance':
        return 'Performance';
      case 'duplication':
        return 'Duplication';
      case 'code-smell':
      default:
        return 'Code Smell';
    }
  };
  
  // Get mock fix suggestion based on the issue
  const getFixSuggestion = () => {
    switch (category) {
      case 'bug':
        if (message.includes('===')) {
          return `// Replace loose equality with strict equality\n// Bad\nif (x == y) { ... }\n\n// Good\nif (x === y) { ... }`;
        } else if (message.includes('error handling')) {
          return `// Add proper error handling\n// Bad\ntry {\n  riskyOperation();\n}\n\n// Good\ntry {\n  riskyOperation();\n} catch (error) {\n  console.error('Operation failed:', error);\n}`;
        }
        return `// Add null checks and error handling\n// Example fix\ntry {\n  // Your fixed code here\n} catch (error) {\n  console.error('Error occurred:', error);\n}`;
      
      case 'security':
        if (message.includes('XSS')) {
          return `// Use safer alternatives\n// Bad\nelement.innerHTML = userInput;\n\n// Good\nelement.textContent = userInput;\n// or\nconst sanitizedInput = DOMPurify.sanitize(userInput);\nelement.innerHTML = sanitizedInput;`;
        } else if (message.includes('Command Injection')) {
          return `# Vulnerable code with command injection\nimport os\n\ndef delete_file_vulnerable():\n    filename = input("Enter the filename to delete: ")\n    os.system(f"rm {filename}")  # VULNERABLE!\n\n# Safe alternative\nimport os\n\ndef delete_file_safe():\n    filename = input("Enter the filename to delete: ")\n    # Validate filename first (example validation)\n    if '/' not in filename and '\\\\' not in filename:\n        try:\n            os.remove(filename)  # Safe alternative\n        except Exception as e:\n            print(f"Error: {e}")\n    else:\n        print("Invalid filename")`;
        }
        return `// Use proper input validation and sanitization\n// Example fix\nconst sanitizedInput = sanitizeInput(userInput);\n// then use sanitizedInput`;
      
      case 'performance':
        return `// Optimize for better performance\n// Example fix\n// Consider caching results or using memoization`;
      
      case 'duplication':
        return `// Extract duplicated code into a reusable function\n// Example fix\nfunction extractedFunction(params) {\n  // Shared functionality\n}`;
      
      case 'code-smell':
        if (message.includes('var')) {
          return `// Replace var with const/let\n// Bad\nvar x = 5;\n\n// Good\nconst x = 5; // Or let x = 5; if reassignment is needed`;
        } else if (message.includes('console.log')) {
          return `// Remove console.log or use proper logging\n// Bad\nconsole.log('Debug info');\n\n// Good\nlogger.debug('Debug info');`;
        }
        return `// Improve code readability and maintainability\n// Example fix\n// Rename variables for clarity\n// Break down complex functions\n// Add appropriate comments`;
      
      default:
        return `// Example fix\n// Refactor this code according to best practices`;
    }
  };
  
  return (
    <div className={`suggestion ${severity}`}>
      <div className="suggestion-content">
        <div className="suggestion-header">
          <span className="severity-icon">{getSeverityIcon()}</span>
          <span className="category-icon">{getCategoryIcon()}</span>
          <span className="category-label">{getCategoryLabel()}: </span>
          <span className="suggestion-title">{message}</span>
        </div>
        <div className="suggestion-details">
          <div className="line-number">Line {line}</div>
          <div className="suggestion-message">
            {message}
          </div>
          <div className="suggestion-actions">
            <button 
              className="toggle-fix-button"
              onClick={() => setShowFix(!showFix)}
            >
              {showFix ? 'Hide Fix' : 'Show Suggested Fix'}
            </button>
          </div>
          {showFix && (
            <div className="suggested-fix">
              <h4>💡 Suggested Fix:</h4>
              <pre className="fix-code">{getFixSuggestion()}</pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewSuggestion; 