import React, { useState } from "react";
import MonacoEditor from "@monaco-editor/react";

const CodeEditor = ({ code, setCode, activeFile }) => {
  const [fontSize, setFontSize] = useState(14);

  // Function to detect language based on file extension
  const getLanguage = (filename) => {
    if (!filename) return "javascript"; // Default language
    const ext = filename.split(".").pop();
    const languageMap = {
      js: "javascript",
      ts: "typescript",
      py: "python",
      cpp: "cpp",
      java: "java",
      html: "html",
      css: "css",
      json: "json",
    };
    return languageMap[ext] || "plaintext";
  };

  return (
    <div className="h-full flex flex-col">
      {/* Font Size Controls */}
      <div className="flex items-center justify-between bg-gray-800 text-white p-2">
        <span>Font Size:</span>
        <input
          type="range"
          min="12"
          max="24"
          value={fontSize}
          onChange={(e) => setFontSize(Number(e.target.value))}
        />
      </div>

      {/* Monaco Editor */}
      <MonacoEditor
        height="100%"
        theme="vs-dark"
        language={getLanguage(activeFile)}
        value={code}
        onChange={(value) => setCode(value)}
        options={{
          fontSize: fontSize,
          automaticLayout: true,
          minimap: { enabled: true },
          wordWrap: "on",
        }}
      />
    </div>
  );
};

export default CodeEditor;
