// import React, { useState } from "react";
// import MonacoEditor from "@monaco-editor/react";

// const CodeEditor = ({ code,  activeFile ,onCodeChange}) => {
//   const [fontSize, setFontSize] = useState(14);

//   // Function to detect language based on file extension
//   const getLanguage = (filename) => {
//     if (!filename) return "javascript"; // Default language
//     const ext = filename.split(".").pop();
//     const languageMap = {
//       js: "javascript",
//       ts: "typescript",
//       py: "python",
//       cpp: "cpp",
//       java: "java",
//       html: "html",
//       css: "css",
//       json: "json",
//     };
//     return languageMap[ext] || "plaintext";
//   };

//   return (
//     <div className="h-full flex flex-col">
//       {/* Font Size Controls */}
//       <div className="flex items-center justify-between bg-gray-800 text-white p-2">
//         <span>Font Size:</span>
//         <input
//           type="range"
//           min="12"
//           max="24"
//           value={fontSize}
//           onChange={(e) => setFontSize(Number(e.target.value))}
//         />
//       </div>

//       {/* Monaco Editor */}
//       <MonacoEditor
//         height="100%"
//         theme="vs-dark"
//         language={getLanguage(activeFile)}
//         value={code}
//         onChange={(value) => onCodeChange(value)}
//         options={{
//           fontSize: fontSize,
//           automaticLayout: true,
//           minimap: { enabled: true },
//           wordWrap: "on",
//         }}
//       />
//     </div>
//   );
// };

// export default CodeEditor;

import React, { useState, useRef, useEffect } from "react";
import MonacoEditor from "@monaco-editor/react";

const CodeEditor = ({ code, activeFile, onCodeChange, username, socket }) => {
  const [fontSize, setFontSize] = useState(14);
  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const widgetsRef = useRef({});

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
  };

  // Listen for real-time cursor updates
  useEffect(() => {
    socket.on("update-cursor", ({ username, position }) => {
      if (editorRef.current && monacoRef.current) {
        createUsernameWidget(editorRef.current, monacoRef.current, username, position);
      }
    });

    return () => {
      socket.off("update-cursor");
    };
  }, [socket]);

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
        onChange={(value) => onCodeChange(value)}
        onMount={handleEditorDidMount}
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
