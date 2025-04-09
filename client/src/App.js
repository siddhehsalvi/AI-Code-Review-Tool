import React, { useState, useEffect } from 'react';
import './App.css';
import CodeDisplay from './components/CodeDisplay';
import { codeReviewService } from './services/api';
import Editor from '@monaco-editor/react';
// eslint-disable-next-line no-unused-vars
import { Container, Row, Col, Button, Form, Spinner, Navbar, Nav, Card } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCode, faServer, faBolt, faShieldAlt, faVial, faWrench, faRobot, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

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
  const [serverStatus, setServerStatus] = useState('checking');
  const [activeTab, setActiveTab] = useState('editor');
  const [metrics, setMetrics] = useState({
    bugs: 0,
    vulnerabilities: 0,
    codeSmells: 0,
    duplications: 0,
    coverage: 0
  });

  // Check server health on component mount
  useEffect(() => {
    const checkServerHealth = async () => {
      try {
        await codeReviewService.checkHealth();
        setServerStatus('online');
      } catch (err) {
        setServerStatus('offline');
        setError('Server is unavailable. Please try again later.');
      }
    };
    
    checkServerHealth();
  }, []);

  const handleCodeChange = (value) => {
    setCode(value);
  };

  const handleLanguageChange = (e) => {
    setLanguage(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setReview(null);

    try {
      const reviewResult = await codeReviewService.submitCode(code);
      
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
      setError('Failed to get code review. Please try again.');
      console.error(err);
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
              <div className="metric-title">Code Smells</div>
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

  const renderReviewDetails = () => {
    if (!review) return null;

    return (
      <div className="review-details">
        <h3><FontAwesomeIcon icon={faExclamationTriangle} className="me-2" /> Issues Found</h3>
        {review.suggestions && review.suggestions.length > 0 ? (
          <div className="suggestions-container">
            <div className="original-code-section">
              <h4>❌ Original Code</h4>
              <pre className="code-block">
                <code>{review.originalCode}</code>
              </pre>
            </div>
            
            <div className="issues-section">
              <h4>🔍 Issues</h4>
              <ul className="suggestions-list">
                {review.suggestions.map((suggestion, index) => (
                  <li key={index} className={`suggestion-item severity-${suggestion.severity}`}>
                    {suggestion.formattedMessage}
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="recommended-fix-section">
              <h4>✅ Recommended Fix</h4>
              <pre className="code-block">
                <code>{review.recommendedFix}</code>
              </pre>
            </div>
          </div>
        ) : (
          <div className="no-issues">
            <div className="no-issues-icon">✅</div>
            <p>No issues found. Your code looks great!</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="app-container">
      <Navbar className="app-header">
        <div className="logo">
          <FontAwesomeIcon icon={faRobot} className="logo-icon" />
          <h1>AI Code Review Tool</h1>
        </div>
        <div className="server-status-container">
          {serverStatus === 'online' && (
            <div className="server-status online">
              <FontAwesomeIcon icon={faServer} className="me-2" />
              Server Online
            </div>
          )}
          {serverStatus === 'offline' && (
            <div className="server-status offline">
              <FontAwesomeIcon icon={faServer} className="me-2" />
              Server Offline
            </div>
          )}
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
              disabled={loading || !code.trim() || serverStatus === 'offline'}
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
                  <div className="review-details">
                    {renderReviewDetails()}
                  </div>
                  
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
      
      {error && <div className="error-message">{error}</div>}
    </div>
  );
}

export default App; 