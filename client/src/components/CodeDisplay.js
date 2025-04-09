import React from 'react';
import Editor from '@monaco-editor/react';

const CodeDisplay = ({ code, language = 'javascript' }) => {
  return (
    <div className="code-display">
      <Editor
        height="50vh"
        defaultLanguage={language}
        language={language}
        value={code}
        theme="vs-dark"
        options={{
          readOnly: true,
          minimap: { enabled: true },
          scrollBeyondLastLine: false,
          fontSize: 14,
          automaticLayout: true
        }}
      />
    </div>
  );
};

export default CodeDisplay; 