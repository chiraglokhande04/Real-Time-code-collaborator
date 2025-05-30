import React, { useState, useRef, useEffect } from "react";
import MonacoEditor from "@monaco-editor/react";

const CodeEditor = ({ code, activeFile, onCodeChange, username, socket }) => {
  const [fontSize, setFontSize] = useState(14);
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [showOutput, setShowOutput] = useState(false);
  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const widgetsRef = useRef({});
  const [language, setLanguage] = useState("javascript");

  // Function to detect language based on file extension
  const getLanguage = (filename) => {
    if (!filename) return "javascript"; // Default language
    const ext = filename.split(".").pop().toLowerCase();
    const languageMap = {
      js: "javascript",
      jsx: "javascript",
      ts: "typescript",
      tsx: "typescript",
      py: "python",
      cpp: "cpp",
      c: "cpp",
      h: "cpp",
      hpp: "cpp",
      java: "java",
      html: "html",
      css: "css",
      json: "json",
      md: "markdown",
      php: "php",
      rb: "ruby",
      go: "go",
      rs: "rust",
      cs: "csharp",
      sql: "sql",
    };
    return languageMap[ext] || "plaintext";
  };

  // Update language whenever activeFile changes
  useEffect(() => {
    const detectedLanguage = getLanguage(activeFile);
    setLanguage(detectedLanguage);
    
    // If editor is already mounted, update the language model
    if (editorRef.current && monacoRef.current) {
      monacoRef.current.editor.setModelLanguage(
        editorRef.current.getModel(),
        detectedLanguage
      );
    }
  }, [activeFile]);

  // Function to create a username widget above the cursor
  const createUsernameWidget = (editor, monaco, user, position) => {
    if (!editor || !monaco || !position) return;

    // Remove existing widget if present
    if (widgetsRef.current[user]) {
      editor.removeContentWidget(widgetsRef.current[user]);
    }

    const domNode = document.createElement("div");
    domNode.innerText = `👤 ${user}`;
    domNode.className = "username-widget";

    // Define the content widget
    const widget = {
      getId: () => `username.widget.${user}`,
      getDomNode: () => domNode,
      getPosition: () => ({
        position,
        preference: [monaco.editor.ContentWidgetPositionPreference.ABOVE],
      }),
    };

    // Store widget reference
    widgetsRef.current[user] = widget;

    // Add widget to editor
    editor.addContentWidget(widget);
  };

  // Handle editor mount
  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Emit event when the cursor moves
    editor.onDidChangeCursorPosition((event) => {
      const position = event.position;
      socket.emit("cursor-move", { username, position });
    });
    
    // Layout update when editor size changes
    window.addEventListener('resize', () => {
      if (editor) {
        editor.layout();
      }
    });
  };

  // Layout update when component updates
  useEffect(() => {
    // Force Monaco editor to update its layout when content changes
    if (editorRef.current) {
      // Small delay to let the DOM update first
      setTimeout(() => {
        editorRef.current.layout();
      }, 50);
    }
  }, [code, showOutput]);

  // Listen for real-time cursor updates
  useEffect(() => {
    if (!socket) return;
    
    socket.on("update-cursor", ({ username, position }) => {
      if (editorRef.current && monacoRef.current) {
        createUsernameWidget(editorRef.current, monacoRef.current, username, position);
      }
    });

    return () => {
      socket.off("update-cursor");
    };
  }, [socket, username]);

  const runCode = async () => {
    setIsRunning(true);
    setOutput("");
    setShowOutput(true);
  
    try {
      const currentCode = editorRef.current.getValue();
  
      if (language === "javascript") {
        // Run JavaScript in sandbox
        const originalConsoleLog = console.log;
        let consoleOutput = [];
  
        console.log = (...args) => {
          consoleOutput.push(args.map(arg => 
            typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
          ).join(' '));
        };
  
        try {
          const sandboxFn = new Function(currentCode);
          await sandboxFn();
          setOutput(consoleOutput.join('\n'));
        } catch (error) {
          setOutput(`Error: ${error.message}`);
        } finally {
          console.log = originalConsoleLog;
        }
  
      } else if (language === "python") {
        // Send Python code to backend
        const response = await fetch("http://localhost:3000/run-python", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code: currentCode }),
        });
        
        const data = await response.json();
        setOutput(data.output || data.error);
  
      } else if (language === "html") {
        const iframe = document.createElement("iframe");
        iframe.srcdoc = currentCode;
        iframe.style.width = "100%";
        iframe.style.height = "300px";
        iframe.style.border = "none";
  
        const outputContainer = document.getElementById("output-container");
        if (outputContainer) {
          outputContainer.innerHTML = "";
          outputContainer.appendChild(iframe);
          setOutput("HTML preview rendered below:");
        } else {
          setOutput("HTML preview container not found.");
        }
      } else {
        setOutput(`Running ${language} code is not supported in this demo.`);
      }
    } catch (error) {
      setOutput(`Error: ${error.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Controls - Redesigned to be fully responsive */}
      <div className="flex flex-wrap items-center bg-gray-800 text-white p-2 gap-2">
        {/* Font size control - will wrap on smaller screens */}
        <div className="flex items-center mr-2 min-w-fit">
          <span className="text-sm whitespace-nowrap mr-1">Font:</span>
          <input
            type="range"
            min="12"
            max="24"
            value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value))}
            className="w-20"
          />
          <span className="text-xs ml-1">{fontSize}</span>
        </div>
        
        {/* File info - will shrink and eventually wrap */}
        <div className="flex-grow text-center overflow-hidden text-ellipsis whitespace-nowrap px-2 min-w-0">
          {activeFile ? `${activeFile} (${language})` : "No file selected"}
        </div>
        
        {/* Run button - fixed position regardless of content */}
        <div className="flex-shrink-0">
          <button
            onClick={runCode}
            disabled={isRunning}
            className={`px-3 py-1 rounded text-sm whitespace-nowrap ${
              isRunning 
                ? "bg-gray-600 cursor-not-allowed" 
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {isRunning ? "Running..." : "▶ Run"}
          </button>
        </div>
      </div>

      {/* Editor Container */}
      <div className={`flex flex-col ${showOutput ? "h-3/5" : "h-full"}`}>
        <MonacoEditor
          height="100%"
          theme="vs-dark"
          language={language}
          value={code}
          onChange={(value) => onCodeChange(value)}
          onMount={handleEditorDidMount}
          options={{
            fontSize: fontSize,
            automaticLayout: true,
            minimap: { enabled: true, maxColumn: 60 },
            wordWrap: "on",
            scrollBeyondLastLine: false,
          }}
        />
      </div>
      
      {/* Output Console */}
      {showOutput && (
        <div className="h-2/5 border-t-2 border-gray-700 flex flex-col">
          <div className="bg-gray-800 text-white p-2 flex justify-between items-center">
            <span className="text-sm">Output Console</span>
            <button 
              onClick={() => setShowOutput(false)}
              className="text-gray-400 hover:text-white"
              aria-label="Close console"
            >
              ✕
            </button>
          </div>
          <div 
            className="flex-grow bg-gray-900 text-green-400 p-3 font-mono text-sm overflow-auto whitespace-pre-wrap"
            id="output-container"
          >
            {output || "Code execution output will appear here..."}
          </div>
        </div>
      )}
    </div>
  );
};

export default CodeEditor;