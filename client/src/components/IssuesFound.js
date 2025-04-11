import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationCircle, faInfoCircle, faLightbulb, faShieldAlt } from '@fortawesome/free-solid-svg-icons';

const IssuesFound = ({ issues }) => {
  // If no issues provided or empty array, show the "no issues found" message
  if (!issues || issues.length === 0) {
    return (
      <div className="issues-found-section">
        <h3>Issues Found</h3>
        <div className="no-issues-found">
          <div className="no-issues-found-icon">
            <FontAwesomeIcon icon={faLightbulb} />
          </div>
          <p>No issues found in the code! Good job!</p>
        </div>
      </div>
    );
  }

  // Group issues by category
  const groupedIssues = issues.reduce((acc, issue) => {
    const category = issue.category?.toLowerCase() || 'other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(issue);
    return acc;
  }, {});

  // Security issues should be displayed first
  const orderedCategories = Object.keys(groupedIssues).sort((a, b) => {
    if (a === 'security') return -1;
    if (b === 'security') return 1;
    return 0;
  });

  return (
    <div className="issues-found-section">
      <h3>Issues Found ({issues.length})</h3>
      <div className="issues-list">
        {orderedCategories.map(category => (
          <React.Fragment key={category}>
            {groupedIssues[category].map((issue, index) => (
              <IssueItem key={`${category}-${index}`} issue={issue} />
            ))}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

const IssueItem = ({ issue }) => {
  const { title, description, severity, location, code, solution, solutionCode, category = 'other' } = issue;
  const [showSolution, setShowSolution] = useState(false);
  
  // Get the right CSS class based on severity
  const getSeverityClass = () => {
    switch (severity.toLowerCase()) {
      case 'high':
        return 'high';
      case 'medium':
        return 'medium';
      case 'low':
        return 'low';
      default:
        return 'low';
    }
  };
  
  // Get a consistent icon based on category and severity
  const getIssueIcon = () => {
    // Special icon for security issues
    if (category.toLowerCase() === 'security') {
      return <FontAwesomeIcon icon={faShieldAlt} className={`severity-icon severity-${severity.toLowerCase()}`} />;
    }
    
    // For other categories, use severity icons
    switch (severity.toLowerCase()) {
      case 'high':
        return <FontAwesomeIcon icon={faExclamationCircle} className="severity-icon severity-high" />;
      case 'medium':
        return <FontAwesomeIcon icon={faExclamationCircle} className="severity-icon severity-medium" />;
      case 'low':
        return <FontAwesomeIcon icon={faInfoCircle} className="severity-icon severity-low" />;
      default:
        return <FontAwesomeIcon icon={faInfoCircle} className="severity-icon severity-low" />;
    }
  };
  
  // Format category name
  const getCategoryLabel = () => {
    switch (category.toLowerCase()) {
      case 'bug':
        return 'Bug';
      case 'security':
        return 'Security';
      case 'performance':
        return 'Performance';
      case 'duplication':
        return 'Duplication';
      case 'code-smell':
        return 'Code Smell';
      default:
        return category.charAt(0).toUpperCase() + category.slice(1);
    }
  };

  // Format issue title for better clarity
  const formatTitle = () => {
    // For security issues, display a more specific title
    if (category.toLowerCase() === 'security') {
      // Extract the vulnerability type from the title or description
      let vulnerabilityType = title;
      
      // Common patterns to identify vulnerability types
      const vulnerabilityPatterns = [
        'SQL Injection', 'XSS', 'CSRF', 'Command Injection',
        'Authentication', 'Authorization', 'Insecure Direct Object References',
        'Security Misconfiguration', 'Path Traversal'
      ];
      
      // Try to find a more specific vulnerability type
      for (const pattern of vulnerabilityPatterns) {
        if ((title && title.includes(pattern)) || (description && description.includes(pattern))) {
          vulnerabilityType = pattern;
          break;
        }
      }
      
      return vulnerabilityType;
    }
    
    return title;
  };
  
  // Format the description to avoid repetition with the title
  const formatDescription = () => {
    if (!description) return '';
    
    // If the description starts with the title, remove the redundant part
    if (title && description.startsWith(title)) {
      return description.substring(title.length).trim();
    }
    
    return description;
  };
  
  return (
    <div className={`issue-item ${getSeverityClass()}`}>
      <div className="issue-header">
        <div className="issue-title">
          {getIssueIcon()}
          <span className="issue-category">{getCategoryLabel()}</span>
          {formatTitle()}
        </div>
        <div className="issue-location">{location}</div>
      </div>
      
      <div className="issue-description">
        {formatDescription()}
      </div>
      
      {code && (
        <div className="issue-code-section">
          <div className="issue-code-header">Vulnerable Code</div>
          <pre className="issue-code-block">
            <code>{code}</code>
          </pre>
        </div>
      )}
      
      {solution && (
        <div className="issue-solution">
          <button 
            className="toggle-fix-button"
            onClick={() => setShowSolution(!showSolution)}
          >
            {showSolution ? 'Hide Solution' : 'Show Solution'}
          </button>
          
          {showSolution && (
            <>
              <h4>Recommended Solution</h4>
              <p>{solution}</p>
              {solutionCode && (
                <pre className="issue-solution-code">
                  <code>{solutionCode}</code>
                </pre>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default IssuesFound;