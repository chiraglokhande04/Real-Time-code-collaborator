import React, { useEffect, useState, useRef } from "react";
import MonacoEditor from "@monaco-editor/react";

const CodeEditor = ({
  activeFile,
  filesMap,
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
      js: "javascript", jsx: "javascript", ts: "typescript", tsx: "typescript",
      py: "python", cpp: "cpp", c: "cpp", h: "cpp", hpp: "cpp",
      java: "java", html: "html", css: "css", json: "json",
      md: "markdown", php: "php", rb: "ruby", go: "go",
      rs: "rust", cs: "csharp", sql: "sql",
    };
    return map[ext] || "plaintext";
  };

  // --- Sync local value with Y.Text ---
  useEffect(() => {
    if (!activeFile || !filesMap) {
      yTextRef.current = null;
      setValue("");
      return;
    }

    const yText = filesMap.get(activeFile);
    if (!yText) {
      yTextRef.current = null;
      setValue("");
      return;
    }

    yTextRef.current = yText;
    setValue(yText.toString());

    const updateFromYText = () => setValue(yText.toString());
    yText.observe(updateFromYText);
    return () => yText.unobserve(updateFromYText);
  }, [activeFile, filesMap]);

  // --- Detect language ---
  useEffect(() => {
    const detectedLang = getLanguage(activeFile);
    setLanguage(detectedLang);

    if (editorRef.current && monacoRef.current) {
      const model = editorRef.current.getModel();
      monacoRef.current.editor.setModelLanguage(model, detectedLang);
    }
  }, [activeFile]);

  // --- Sync edits to Yjs ---
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

  // --- Cursor widget ---
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

  // --- Final fallback value if nothing is selected or created ---
  const editorValue =
    yTextRef.current && value.trim() !== ""
      ? value
      : ``;

  return (
    <div className="h-full w-full flex flex-col bg-[#1e1e1e]">
      <div className="flex items-center justify-between px-4 py-2 bg-[#2d2d2d] text-white shadow-sm border-b border-gray-700">
        <div className="flex items-center gap-3">
          <label htmlFor="fontSize" className="text-sm font-medium">
            Font Size
          </label>
          <input
            id="fontSize"
            type="range"
            min="12"
            max="24"
            value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value))}
            className="accent-green-400"
          />
          <span className="text-sm w-6 text-center">{fontSize}</span>
        </div>

        <div className="text-sm font-mono truncate text-gray-300">
          {activeFile ? `${activeFile} (${language})` : "No file selected"}
        </div>
      </div>

      <div className="flex-grow">
        <MonacoEditor
          height="100%"
          theme="vs-dark"
          language={language || "javascript"}
          value={editorValue}
          onChange={handleEditorChange}
          onMount={handleEditorDidMount}
          options={{
            fontSize,
            automaticLayout: true,
            minimap: { enabled: true },
            wordWrap: "on",
            scrollBeyondLastLine: false,
          }}
        />
      </div>
    </div>
  );
};

export default CodeEditor;
