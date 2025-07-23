

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

//   const getLanguage = (filename) => {
//     if (!filename) return "javascript";
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

//   useEffect(() => {
//     const detectedLanguage = getLanguage(activeFile);
//     setLanguage(detectedLanguage);
//     if (editorRef.current && monacoRef.current) {
//       monacoRef.current.editor.setModelLanguage(
//         editorRef.current.getModel(),
//         detectedLanguage
//       );
//     }
//   }, [activeFile]);

//   const createUsernameWidget = (editor, monaco, user, position) => {
//     if (!editor || !monaco || !position) return;

//     if (widgetsRef.current[user]) {
//       editor.removeContentWidget(widgetsRef.current[user]);
//     }

//     const domNode = document.createElement("div");
//     domNode.innerText = `👤 ${user}`;
//     domNode.className = "username-widget";

//     const widget = {
//       getId: () => `username.widget.${user}`,
//       getDomNode: () => domNode,
//       getPosition: () => ({
//         position,
//         preference: [monaco.editor.ContentWidgetPositionPreference.ABOVE],
//       }),
//     };

//     widgetsRef.current[user] = widget;
//     editor.addContentWidget(widget);
//   };

//   const handleEditorDidMount = (editor, monaco) => {
//     editorRef.current = editor;
//     monacoRef.current = monaco;

//     if (socket) {
//       editor.onDidChangeCursorPosition((event) => {
//         const position = event.position;
//         if (socket) {
//           socket.emit("cursor-move", { username, position });
//         }
//       });
//     }

//     window.addEventListener("resize", () => {
//       if (editor) editor.layout();
//     });
//   };

//   useEffect(() => {
//     if (editorRef.current) {
//       setTimeout(() => {
//         editorRef.current.layout();
//       }, 50);
//     }
//   }, [code]);

//   useEffect(() => {
//     if (!socket) return;

//     const handleUpdateCursor = ({ username, position }) => {
//       if (editorRef.current && monacoRef.current) {
//         createUsernameWidget(
//           editorRef.current,
//           monacoRef.current,
//           username,
//           position
//         );
//       }
//     };

//     socket.on("update-cursor", handleUpdateCursor);

//     return () => {
//       socket.off("update-cursor", handleUpdateCursor);
//     };
//   }, [socket, username]);

//   return (
//     <div className="h-full flex flex-col">
//       <div className="flex flex-wrap items-center bg-gray-800 text-white p-2 gap-2">
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
//         <div className="flex-grow text-center overflow-hidden text-ellipsis whitespace-nowrap px-2 min-w-0">
//           {activeFile ? `${activeFile} (${language})` : "No file selected"}
//         </div>
//       </div>

//       <div className="flex flex-col h-full">
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



import React, { useEffect, useState, useRef } from "react";
import MonacoEditor from "@monaco-editor/react";

const CodeEditor = ({
  activeFile,
  fileContentsMap,
  username,
  socket,
  editorRef,
  language,
  setLanguage,
}) => {
  const [fontSize, setFontSize] = useState(14);
  const [value, setValue] = useState("");
  const monacoRef = useRef(null);
  const widgetsRef = useRef({});
  const yTextRef = useRef(null);


  const getLanguage = (filename) => {
    if (!filename) return "javascript";
    const ext = filename.split(".").pop().toLowerCase();
    const map = {
      js: "javascript", jsx: "javascript",
      ts: "typescript", tsx: "typescript",
      py: "python", cpp: "cpp", c: "cpp", h: "cpp", hpp: "cpp",
      java: "java", html: "html", css: "css", json: "json",
      md: "markdown", php: "php", rb: "ruby", go: "go",
      rs: "rust", cs: "csharp", sql: "sql",
    };
    return map[ext] || "plaintext";
  };

  // --- Sync local value with Y.Text ---
  useEffect(() => {
    if (!activeFile || !fileContentsMap) return;

    const yText = fileContentsMap.get(activeFile);
    console.log("YText actual value:", yText.toString());
    if (!yText) {
      console.warn("No Y.Text found for", activeFile);
      yTextRef.current = null;
      setValue("");
      return;
    }

    yTextRef.current = yText;
    setValue(yText.toString());

    const updateFromYText = () => {
      const newText = yText.toString();
      setValue(newText);
    };

    yText.observe(updateFromYText);
    return () => yText.unobserve(updateFromYText);
  }, [activeFile]);

  // --- Update Monaco language based on file type ---
  useEffect(() => {
    const detectedLang = getLanguage(activeFile);
    setLanguage(detectedLang);

    if (editorRef.current && monacoRef.current) {
      const model = editorRef.current.getModel();
      monacoRef.current.editor.setModelLanguage(model, detectedLang);
    }
  }, [activeFile]);

  // --- Handle local edits and sync to Yjs ---
  const handleEditorChange = (value) => {
    setValue(value);
    const yText = yTextRef.current;

    if (yText && value !== yText.toString()) {
      yText.doc?.transact(() => {
        yText.delete(0, yText.length);
        yText.insert(0, value);
      });
    }
  };

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    if (socket) {
      editor.onDidChangeCursorPosition((e) => {
        socket.emit("cursor-move", {
          username,
          position: e.position,
        });
      });
    }

    window.addEventListener("resize", () => editor.layout());
  };

  // --- Cursor widget (collab presence) ---
  useEffect(() => {
    if (!socket) return;

    const handleUpdateCursor = ({ username, position }) => {
      if (editorRef.current && monacoRef.current) {
        const editor = editorRef.current;
        const monaco = monacoRef.current;

        const domNode = document.createElement("div");
        domNode.innerText = `👤 ${username}`;
        domNode.className = "username-widget";

        const widget = {
          getId: () => `username.widget.${username}`,
          getDomNode: () => domNode,
          getPosition: () => ({
            position,
            preference: [monaco.editor.ContentWidgetPositionPreference.ABOVE],
          }),
        };

        if (widgetsRef.current[username]) {
          editor.removeContentWidget(widgetsRef.current[username]);
        }

        widgetsRef.current[username] = widget;
        editor.addContentWidget(widget);
      }
    };

    socket.on("update-cursor", handleUpdateCursor);
    return () => socket.off("update-cursor", handleUpdateCursor);
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
        {yTextRef.current ? (
          <MonacoEditor
            height="100%"
            theme="vs-dark"
            language={language}
            value={value}
            onChange={(val) => handleEditorChange(val)}
            onMount={handleEditorDidMount}
            options={{
              fontSize: fontSize,
              automaticLayout: true,
              minimap: { enabled: true },
              wordWrap: "on",
              scrollBeyondLastLine: false,
            }}
          />
        ) : (
          <div className="p-4 text-white">No file selected or file is not yet created.</div>
        )}
      </div>
    </div>
  );
};

export default CodeEditor;
