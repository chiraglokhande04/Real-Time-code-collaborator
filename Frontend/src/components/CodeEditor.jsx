// import React, { useState, useRef, useEffect } from "react";
// import MonacoEditor from "@monaco-editor/react";

// const CodeEditor = ({
//   code,
//   activeFile,
//   onCodeChange,
//   username,
//   socket,
//   editorRef,
//   language,
//   setLanguage,
// }) => {
//   const [fontSize, setFontSize] = useState(14);
//   const monacoRef = useRef(null);
//   const widgetsRef = useRef({});

//   // Function to detect language based on file extension
//   const getLanguage = (filename) => {
//     if (!filename) return "javascript"; // Default language
//     const ext = filename.split(".").pop().toLowerCase();
//     const languageMap = {
//       js: "javascript",
//       jsx: "javascript",
//       ts: "typescript",
//       tsx: "typescript",
//       py: "python",
//       cpp: "cpp",
//       c: "cpp",
//       h: "cpp",
//       hpp: "cpp",
//       java: "java",
//       html: "html",
//       css: "css",
//       json: "json",
//       md: "markdown",
//       php: "php",
//       rb: "ruby",
//       go: "go",
//       rs: "rust",
//       cs: "csharp",
//       sql: "sql",
//     };
//     return languageMap[ext] || "plaintext";
//   };

//   // Update language whenever activeFile changes
//   useEffect(() => {
//     const detectedLanguage = getLanguage(activeFile);
//     setLanguage(detectedLanguage);

//     // If editor is already mounted, update the language model
//     if (editorRef.current && monacoRef.current) {
//       monacoRef.current.editor.setModelLanguage(
//         editorRef.current.getModel(),
//         detectedLanguage
//       );
//     }
//   }, [activeFile]);

//   // Function to create a username widget above the cursor
//   const createUsernameWidget = (editor, monaco, user, position) => {
//     if (!editor || !monaco || !position) return;

//     // Remove existing widget if present
//     if (widgetsRef.current[user]) {
//       editor.removeContentWidget(widgetsRef.current[user]);
//     }

//     const domNode = document.createElement("div");
//     domNode.innerText = `👤 ${user}`;
//     domNode.className = "username-widget";

//     // Define the content widget
//     const widget = {
//       getId: () => `username.widget.${user}`,
//       getDomNode: () => domNode,
//       getPosition: () => ({
//         position,
//         preference: [monaco.editor.ContentWidgetPositionPreference.ABOVE],
//       }),
//     };

//     // Store widget reference
//     widgetsRef.current[user] = widget;

//     // Add widget to editor
//     editor.addContentWidget(widget);
//   };

//   // Handle editor mount
//   const handleEditorDidMount = (editor, monaco) => {
//     editorRef.current = editor;
//     monacoRef.current = monaco;

//     // Emit event when the cursor moves
//     editor.onDidChangeCursorPosition((event) => {
//       const position = event.position;
//       socket.emit("cursor-move", { username, position });
//     });

//     // Layout update when editor size changes
//     window.addEventListener("resize", () => {
//       if (editor) {
//         editor.layout();
//       }
//     });
//   };

//   // Layout update when component updates
//   useEffect(() => {
//     // Force Monaco editor to update its layout when content changes
//     if (editorRef.current) {
//       // Small delay to let the DOM update first
//       setTimeout(() => {
//         editorRef.current.layout();
//       }, 50);
//     }
//   }, [code, showOutput]);

//   // Listen for real-time cursor updates
//   useEffect(() => {
//     if (!socket) return;

//     socket.on("update-cursor", ({ username, position }) => {
//       if (editorRef.current && monacoRef.current) {
//         createUsernameWidget(
//           editorRef.current,
//           monacoRef.current,
//           username,
//           position
//         );
//       }
//     });

//     return () => {
//       socket.off("update-cursor");
//     };
//   }, [socket, username]);

//   return (
//     <div className="h-full flex flex-col">
//       {/* Controls - Redesigned to be fully responsive */}
//       <div className="flex flex-wrap items-center bg-gray-800 text-white p-2 gap-2">
//         {/* Font size control - will wrap on smaller screens */}
//         <div className="flex items-center mr-2 min-w-fit">
//           <span className="text-sm whitespace-nowrap mr-1">Font:</span>
//           <input
//             type="range"
//             min="12"
//             max="24"
//             value={fontSize}
//             onChange={(e) => setFontSize(Number(e.target.value))}
//             className="w-20"
//           />
//           <span className="text-xs ml-1">{fontSize}</span>
//         </div>

//         {/* File info - will shrink and eventually wrap */}
//         <div className="flex-grow text-center overflow-hidden text-ellipsis whitespace-nowrap px-2 min-w-0">
//           {activeFile ? `${activeFile} (${language})` : "No file selected"}
//         </div>
//       </div>

//       {/* Editor Container */}
//       <div className={`flex flex-col ${showOutput ? "h-3/5" : "h-full"}`}>
//         <MonacoEditor
//           height="100%"
//           theme="vs-dark"
//           language={language}
//           value={code}
//           onChange={(value) => onCodeChange(value)}
//           onMount={handleEditorDidMount}
//           options={{
//             fontSize: fontSize,
//             automaticLayout: true,
//             minimap: { enabled: true, maxColumn: 60 },
//             wordWrap: "on",
//             scrollBeyondLastLine: false,
//           }}
//         />
//       </div>
//     </div>
//   );
// };

// export default CodeEditor;

import React, { useState, useRef, useEffect } from "react";
import MonacoEditor from "@monaco-editor/react";

const CodeEditor = ({
  code,
  activeFile,
  onCodeChange,
  username,
  socket,
  editorRef,
  language,
  setLanguage,
}) => {
  const [fontSize, setFontSize] = useState(14);
  const monacoRef = useRef(null);
  const widgetsRef = useRef({});

  const getLanguage = (filename) => {
    if (!filename) return "javascript";
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

  useEffect(() => {
    const detectedLanguage = getLanguage(activeFile);
    setLanguage(detectedLanguage);
    if (editorRef.current && monacoRef.current) {
      monacoRef.current.editor.setModelLanguage(
        editorRef.current.getModel(),
        detectedLanguage
      );
    }
  }, [activeFile]);

  const createUsernameWidget = (editor, monaco, user, position) => {
    if (!editor || !monaco || !position) return;

    if (widgetsRef.current[user]) {
      editor.removeContentWidget(widgetsRef.current[user]);
    }

    const domNode = document.createElement("div");
    domNode.innerText = `👤 ${user}`;
    domNode.className = "username-widget";

    const widget = {
      getId: () => `username.widget.${user}`,
      getDomNode: () => domNode,
      getPosition: () => ({
        position,
        preference: [monaco.editor.ContentWidgetPositionPreference.ABOVE],
      }),
    };

    widgetsRef.current[user] = widget;
    editor.addContentWidget(widget);
  };

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    if (socket) {
      editor.onDidChangeCursorPosition((event) => {
        const position = event.position;
        if (socket) {
          socket.emit("cursor-move", { username, position });
        }
      });
    }

    window.addEventListener("resize", () => {
      if (editor) editor.layout();
    });
  };

  useEffect(() => {
    if (editorRef.current) {
      setTimeout(() => {
        editorRef.current.layout();
      }, 50);
    }
  }, [code]);

  useEffect(() => {
    if (!socket) return;

    const handleUpdateCursor = ({ username, position }) => {
      if (editorRef.current && monacoRef.current) {
        createUsernameWidget(
          editorRef.current,
          monacoRef.current,
          username,
          position
        );
      }
    };

    socket.on("update-cursor", handleUpdateCursor);

    return () => {
      socket.off("update-cursor", handleUpdateCursor);
    };
  }, [socket, username]);

  return (
    <div className="h-full flex flex-col">
      <div className="flex flex-wrap items-center bg-gray-800 text-white p-2 gap-2">
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
        <div className="flex-grow text-center overflow-hidden text-ellipsis whitespace-nowrap px-2 min-w-0">
          {activeFile ? `${activeFile} (${language})` : "No file selected"}
        </div>
      </div>

      <div className="flex flex-col h-full">
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
    </div>
  );
};

export default CodeEditor;


