const axios = require('axios');

// This is a mock implementation that simulates AI model integration
// In a real application, you would replace this with actual API calls to models like Code Llama
class AIService {
  async reviewCode(code) {
    try {
      // This is a mock implementation
      // For a real implementation with Code Llama or similar, use code like this:
      /*
      const apiKey = process.env.AI_API_KEY;
      const apiUrl = process.env.AI_API_ENDPOINT;
      
      // Example prompt for the AI model
      const prompt = `
        Please review the following code and provide feedback:
        
        ${code}
        
        Focus on the following aspects:
        1. Code quality
        2. Best practices
        3. Potential bugs
        4. Security issues
        5. Performance concerns
        
        Format the response as JSON with the following structure:
        {
          "suggestions": [
            {
              "line": <line_number>,
              "message": "<suggestion>",
              "severity": "<low|medium|high>",
              "category": "<bug|security|performance|duplication|code-smell>"
            }
          ],
          "summary": "<overall_summary>",
          "metrics": {
            "bugs": <number>,
            "vulnerabilities": <number>,
            "codeSmells": <number>,
            "duplications": <number>,
            "coverage": <percentage>
          }
        }
      `;
      
      const response = await axios.post(apiUrl, {
        model: "code-llama-34b", // or whatever model you're using
        prompt: prompt,
        temperature: 0.3,
        max_tokens: 1000,
        api_key: apiKey
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        }
      });
      
      // Parse the AI's response
      const aiResponse = response.data.choices[0].text;
      try {
        // Extract JSON from the response (may need to be adjusted based on the API's response format)
        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      } catch (parseError) {
        console.error('Error parsing AI response:', parseError);
      }
      */
      
      // For now, we'll use a mock implementation
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const suggestions = [];
      const lines = code.split('\n');
      
      // Language-specific analysis
      const language = this.detectLanguage(code);
      
      // Generate suggestions based on the detected language
      if (language === 'javascript') {
        this.addJavaScriptSuggestions(code, lines, suggestions);
      } else if (language === 'python') {
        this.addPythonSuggestions(code, lines, suggestions);
      } else if (language === 'java') {
        this.addJavaSuggestions(code, lines, suggestions);
      } else if (language === 'cpp') {
        this.addCppSuggestions(code, lines, suggestions);
      } else {
        // Generic suggestions for other languages
        this.addGenericSuggestions(code, lines, suggestions);
      }
      
      // Calculate metrics
      const metrics = {
        bugs: suggestions.filter(s => s.category === 'bug').length,
        vulnerabilities: suggestions.filter(s => s.category === 'security').length,
        codeSmells: suggestions.filter(s => s.category === 'code-smell').length,
        duplications: suggestions.filter(s => s.category === 'duplication').length,
        coverage: Math.floor(Math.random() * 100) // Mock coverage
      };
      
      // Generate an overall summary based on the code
      let summary = "Code looks generally well-structured.";
      
      if (suggestions.length > 3) {
        summary = "Several issues were found that should be addressed to improve code quality.";
      } else if (suggestions.length > 0) {
        summary = "Code is mostly solid with a few minor improvements suggested.";
      } else {
        summary = "Code looks clean and follows good practices!";
      }
      
      // Format the response with enhanced issues section
      const formattedResponse = {
        suggestions: suggestions.map(s => ({
          ...s,
          // Add formatted message in the style of the YouTube project
          formattedMessage: this.formatIssueMessage(s)
        })),
        summary,
        metrics,
        
        // Add the original code and recommended fix
        originalCode: code,
        recommendedFix: this.generateRecommendedFix(code, suggestions)
      };
      
      return formattedResponse;
      
    } catch (error) {
      console.error('Error in AI Service:', error);
      throw new Error('Failed to analyze code with AI model');
    }
  }
  
  detectLanguage(code) {
    // Simple language detection based on code patterns
    const isJavaScript = code.includes('function') && 
      (code.includes('const') || code.includes('let') || code.includes('var'));
    const isPython = code.includes('def ') || code.includes('import ') || code.includes('print(');
    const isJava = code.includes('public class') || code.includes('private ') || code.includes('import java.');
    const isCpp = code.includes('#include <') || code.includes('namespace ') || code.includes('std::');

    if (isJavaScript) return 'javascript';
    if (isPython) return 'python';
    if (isJava) return 'java';
    if (isCpp) return 'cpp';
    return 'javascript'; // Default
  }
  
  /**
   * Validates if the code matches the selected language
   * @param {string} code - The code to analyze
   * @param {string} selectedLanguage - The language selected by the user
   * @returns {Object} - Validation result with isValid flag and detected language
   */
  validateLanguage(code, selectedLanguage) {
    const detectedLanguage = this.detectLanguage(code);
    const isValid = detectedLanguage === selectedLanguage;
    
    return {
      isValid,
      detectedLanguage,
      selectedLanguage
    };
  }
  
  addJavaScriptSuggestions(code, lines, suggestions) {
    // Check for var usage
    const varLines = lines.map((line, index) => 
      line.includes('var ') ? index + 1 : null).filter(Boolean);
    
    if (varLines.length > 0) {
      suggestions.push({
        line: varLines[0],
        message: "Consider using 'const' or 'let' instead of 'var' for better scoping",
        severity: "medium",
        category: "code-smell"
      });
    }
    
    // Check for console.log statements
    const consoleLogLines = lines.map((line, index) => 
      line.includes('console.log') ? index + 1 : null).filter(Boolean);
    
    if (consoleLogLines.length > 0) {
      suggestions.push({
        line: consoleLogLines[0],
        message: "Remove console.log statements in production code",
        severity: "low",
        category: "code-smell"
      });
    }
    
    // Check for == instead of ===
    const looseEqualityLines = lines.map((line, index) => 
      (line.includes(' == ') && !line.includes(' === ')) ? index + 1 : null).filter(Boolean);
    
    if (looseEqualityLines.length > 0) {
      suggestions.push({
        line: looseEqualityLines[0],
        message: "Use strict equality (===) instead of loose equality (==)",
        severity: "medium",
        category: "bug"
      });
    }
    
    // Check for missing error handling
    if (code.includes('try') && !code.includes('catch')) {
      const tryLine = lines.findIndex(line => line.includes('try')) + 1;
      suggestions.push({
        line: tryLine,
        message: "Missing error handling for try block",
        severity: "high",
        category: "bug"
      });
    }
    
    // Check for potential security issues
    if (code.includes('eval(') || code.includes('innerHTML = ')) {
      const securityLine = lines.findIndex(line => 
        line.includes('eval(') || line.includes('innerHTML = ')) + 1;
      suggestions.push({
        line: securityLine,
        message: "Avoid using eval() or directly setting innerHTML as it can lead to XSS vulnerabilities",
        severity: "high",
        category: "security"
      });
    }
  }
  
  addPythonSuggestions(code, lines, suggestions) {
    // Check for bare except
    const bareExceptLines = lines.map((line, index) => 
      line.includes('except:') ? index + 1 : null).filter(Boolean);
    
    if (bareExceptLines.length > 0) {
      suggestions.push({
        line: bareExceptLines[0],
        message: "Avoid bare except clauses, specify the exception type",
        severity: "medium",
        category: "bug"
      });
    }
    
    // Check for mutable default arguments
    const mutableDefaultLines = lines.map((line, index) => 
      (line.includes('def ') && (line.includes('=[]') || line.includes('={}'))) ? index + 1 : null).filter(Boolean);
    
    if (mutableDefaultLines.length > 0) {
      suggestions.push({
        line: mutableDefaultLines[0],
        message: "Avoid mutable default arguments as they can lead to unexpected behavior",
        severity: "high",
        category: "bug"
      });
    }
    
    // Check for command injection vulnerabilities
    const commandInjectionLines = lines.map((line, index) => 
      (line.includes('os.system(') && line.includes('f"')) || 
      (line.includes('subprocess.') && line.includes('shell=True') && (line.includes('f"') || line.includes('format') || line.includes('+'))) ? 
      index + 1 : null).filter(Boolean);
    
    if (commandInjectionLines.length > 0) {
      suggestions.push({
        line: commandInjectionLines[0],
        message: "Command Injection Vulnerability: User input is directly used in shell commands. Use os.remove() for file operations or subprocess with shell=False and proper argument lists instead.",
        severity: "high",
        category: "security"
      });
    }
    
    // Check for unused imports
    const importLines = lines.map((line, index) => 
      (line.startsWith('import ') || line.startsWith('from ')) ? index + 1 : null).filter(Boolean);
    
    if (importLines.length > 0) {
      suggestions.push({
        line: importLines[0],
        message: "Check for unused imports",
        severity: "low",
        category: "code-smell"
      });
    }
  }
  
  addJavaSuggestions(code, lines, suggestions) {
    // Check for raw types
    const rawTypeLines = lines.map((line, index) => 
      (line.includes('List ') || line.includes('Map ') || line.includes('Set ')) ? index + 1 : null).filter(Boolean);
    
    if (rawTypeLines.length > 0) {
      suggestions.push({
        line: rawTypeLines[0],
        message: "Use parameterized types instead of raw types",
        severity: "medium",
        category: "code-smell"
      });
    }
    
    // Check for System.out.println
    const printlnLines = lines.map((line, index) => 
      line.includes('System.out.println') ? index + 1 : null).filter(Boolean);
    
    if (printlnLines.length > 0) {
      suggestions.push({
        line: printlnLines[0],
        message: "Consider using a logging framework instead of System.out.println",
        severity: "low",
        category: "code-smell"
      });
    }
    
    // Check for potential NPE
    const npeLines = lines.map((line, index) => 
      (line.includes('.') && !line.includes('null') && !line.includes('if') && !line.includes('assert')) ? index + 1 : null).filter(Boolean);
    
    if (npeLines.length > 0) {
      suggestions.push({
        line: npeLines[0],
        message: "Potential NullPointerException, consider adding null checks",
        severity: "high",
        category: "bug"
      });
    }
  }
  
  addCppSuggestions(code, lines, suggestions) {
    // Check for using namespace std
    const usingNamespaceLines = lines.map((line, index) => 
      line.includes('using namespace std;') ? index + 1 : null).filter(Boolean);
    
    if (usingNamespaceLines.length > 0) {
      suggestions.push({
        line: usingNamespaceLines[0],
        message: "Avoid 'using namespace std;' in header files",
        severity: "medium",
        category: "code-smell"
      });
    }
    
    // Check for raw pointers
    const rawPointerLines = lines.map((line, index) => 
      (line.includes('*') && !line.includes('new') && !line.includes('delete')) ? index + 1 : null).filter(Boolean);
    
    if (rawPointerLines.length > 0) {
      suggestions.push({
        line: rawPointerLines[0],
        message: "Consider using smart pointers instead of raw pointers",
        severity: "high",
        category: "bug"
      });
    }
    
    // Check for potential memory leaks
    if (code.includes('new') && !code.includes('delete')) {
      const newLine = lines.findIndex(line => line.includes('new')) + 1;
      suggestions.push({
        line: newLine,
        message: "Potential memory leak, ensure proper cleanup with delete or use smart pointers",
        severity: "high",
        category: "bug"
      });
    }
  }
  
  addGenericSuggestions(code, lines, suggestions) {
    // Check for TODO comments
    const todoLines = lines.map((line, index) => 
      line.toLowerCase().includes('todo') ? index + 1 : null).filter(Boolean);
    
    if (todoLines.length > 0) {
      suggestions.push({
        line: todoLines[0],
        message: "Address TODO comment before finalizing code",
        severity: "low",
        category: "code-smell"
      });
    }
    
    // Check for long functions
    if (lines.length > 30) {
      suggestions.push({
        line: 1,
        message: "Function is too long, consider breaking it down into smaller functions",
        severity: "medium",
        category: "code-smell"
      });
    }
    
    // Check for magic numbers
    const magicNumberLines = lines.map((line, index) => 
      /\b\d{3,}\b/.test(line) ? index + 1 : null).filter(Boolean);
    
    if (magicNumberLines.length > 0) {
      suggestions.push({
        line: magicNumberLines[0],
        message: "Avoid magic numbers, use named constants instead",
        severity: "low",
        category: "code-smell"
      });
    }
  }

  formatIssueMessage(suggestion) {
    // Format the issue message in the style of the YouTube project
    let formattedMessage = `❌ ${suggestion.message}`;
    
    // Add severity indicator
    if (suggestion.severity === 'high') {
      formattedMessage = `🔴 ${formattedMessage}`;
    } else if (suggestion.severity === 'medium') {
      formattedMessage = `🟡 ${formattedMessage}`;
    } else {
      formattedMessage = `🟢 ${formattedMessage}`;
    }
    
    // Add category indicator
    if (suggestion.category === 'bug') {
      formattedMessage = `🐛 ${formattedMessage}`;
    } else if (suggestion.category === 'security') {
      formattedMessage = `🔒 ${formattedMessage}`;
    } else if (suggestion.category === 'performance') {
      formattedMessage = `⚡ ${formattedMessage}`;
    } else if (suggestion.category === 'code-smell') {
      formattedMessage = `👃 ${formattedMessage}`;
    } else if (suggestion.category === 'duplication') {
      formattedMessage = `🔄 ${formattedMessage}`;
    }
    
    return formattedMessage;
  }

  generateRecommendedFix(code, suggestions) {
    // Generate a fixed version of the code based on suggestions
    let fixedCode = code;
    const lines = code.split('\n');
    
    suggestions.forEach(suggestion => {
      if (suggestion.line && lines[suggestion.line - 1]) {
        const line = lines[suggestion.line - 1];
        
        // Apply fixes based on suggestion type
        if (suggestion.category === 'code-smell' && line.includes('var ')) {
          lines[suggestion.line - 1] = line.replace('var ', 'const ');
        } else if (suggestion.category === 'bug' && line.includes(' == ')) {
          lines[suggestion.line - 1] = line.replace(' == ', ' === ');
        }
        // Add more fix patterns as needed
      }
    });
    
    return lines.join('\n');
  }

  generateImprovements(suggestions) {
    return suggestions.map(s => ({
      message: s.message,
      applied: false // This can be used to track which improvements have been applied
    }));
  }
}

module.exports = new AIService(); 