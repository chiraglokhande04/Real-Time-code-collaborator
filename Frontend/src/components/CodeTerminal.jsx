import React, { useState } from "react";

const CodeTerminal = ({ editorRef, language }) => {
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [showOutput, setShowOutput] = useState(false);

  const runCode = async () => {
    setIsRunning(true);
    setOutput("");
    setShowOutput(true);

    try {
      const currentCode = editorRef.current.getValue();

      if (language === "javascript") {
        const originalConsoleLog = console.log;
        let consoleOutput = [];

        console.log = (...args) => {
          consoleOutput.push(
            args.map(arg => (typeof arg === "object" ? JSON.stringify(arg) : String(arg))).join(" ")
          );
        };

        try {
          const sandboxFn = new Function(currentCode);
          await sandboxFn();
          setOutput(consoleOutput.join("\n"));
        } catch (error) {
          setOutput(`Error: ${error.message}`);
        } finally {
          console.log = originalConsoleLog;
        }

      } else if (language === "python") {
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

        const container = document.getElementById("output-container");
        if (container) {
          container.innerHTML = "";
          container.appendChild(iframe);
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
    <div className="flex flex-col h-full">
      {/* Run Button */}
      <div className="flex flex-col items-center bg-gray-800 p-2 text-white gap-2">
        <button
          onClick={runCode}
          disabled={isRunning}
          className={`px-3 mt-2 h-9 rounded text-sm w-80 text-black font-bold ${
            isRunning ? "bg-gray-600 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
          }`}
        >
          {isRunning ? "Running..." : "▶ RUN"}
        </button>
        <span className="text-sm">Language: {language}</span>
      </div>

      {/* Output Console */}
      {showOutput && (
        <div className="flex-grow border-t border-gray-600 bg-gray-900 text-green-400 p-3 font-mono text-sm overflow-auto">
          {output || "Code execution output will appear here..."}
          <div id="output-container" />
        </div>
      )}
    </div>
  );
};

export default CodeTerminal;

