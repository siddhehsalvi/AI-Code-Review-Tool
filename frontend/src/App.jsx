import { useState } from "react";
import Editor from "@monaco-editor/react";
import "bootstrap/dist/css/bootstrap.min.css";

function App() {
  const [code, setCode] = useState("// Write your code here...");
  const [language, setLanguage] = useState("javascript");

  const handleCodeChange = (newCode) => setCode(newCode);
  const handleLanguageChange = (e) => setLanguage(e.target.value);
  const handleReview = async () => {
    try {
      const response = await fetch("http://localhost:5000/review", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code, language })
      });

      const data = await response.json();
      
      if (data.review) {
          alert(`AI Review:\n${data.review}`);  // Display AI feedback
      } else {
          alert("Error: No response from AI review.");
      }
  } catch (error) {
      console.error("Error connecting to backend:", error);
      alert("Error connecting to AI review system.");
  }
  };

  return (
    <>
      {/* <nav className="navbar navbar-dark bg-gradient shadow-sm" style={{ background: "linear-gradient(90deg, #4b6cb7, #182848)" }}>
        <div className="container d-flex justify-content-center">
          <a className="navbar-brand mx-auto text-center text-white fw-bold fs-3">
            🚀 AI Code Review Tool
          </a>
        </div>
      </nav> */}

      <div className="container mt-5">
        <div className="card p-5 shadow-lg border-0" style={{ backgroundColor: "#1e1e2e", color: "#ffffff", borderRadius: "15px" }}>
          <h2 className="text-center mb-4" style={{ color: "#00d4ff" }}>💡 Enter Your Code for Review</h2>

          <div className="mb-3">
            <label className="form-label fw-bold" style={{ color: "#b0bec5" }}>Select Language:</label>
            <select
              className="form-select border-0 shadow-sm"
              style={{ backgroundColor: "#33354d", color: "#ffffff" }}
              value={language}
              onChange={handleLanguageChange}
            >
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
              <option value="java">Java</option>
              <option value="cpp">C++</option>
            </select>
          </div>

          <div className="border rounded mb-3 shadow-sm" style={{ height: "400px", backgroundColor: "#2c2f48", border: "2px solid #00d4ff" }}>
            <Editor
              height="100%"
              width="100%"
              theme="vs-dark"
              language={language}
              value={code}
              onChange={handleCodeChange}
            />
          </div>

          <div className="text-center">
            <button className="btn btn-lg px-5" style={{ background: "#00d4ff", color: "#000", fontWeight: "bold" }} onClick={handleReview}>
              🔍 Review Code
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
