import React, { useEffect, useRef, useState } from "react";
import { Terminal } from "xterm";
import "xterm/css/xterm.css";
import { FitAddon } from "xterm-addon-fit";

const TerminalComponent = () => {
  const terminalRef = useRef(null);
  const term = useRef(null);
  const fitAddon = useRef(new FitAddon());
  const [input, setInput] = useState("");

  useEffect(() => {
    if (!terminalRef.current) return; // ✅ Ensure the terminal container exists

    term.current = new Terminal({
      cursorBlink: true,
      fontSize: 14,
      theme: { background: "#1e1e1e", foreground: "#ffffff" },
    });

    term.current.loadAddon(fitAddon.current);
    term.current.open(terminalRef.current);

    // ✅ Wait for a short delay before fitting
    setTimeout(() => {
      fitAddon.current.fit();
    }, 100);

    term.current.writeln("Welcome to the JavaScript Terminal!");
    promptInput();

    term.current.onKey(({ key, domEvent }) => {
      handleKeyInput(key, domEvent);
    });

    return () => term.current.dispose();
  }, []);

  // Function to handle user key input
  const handleKeyInput = (key, domEvent) => {
    if (domEvent.key === "Enter") {
      term.current.writeln(""); // Move to new line
      executeJavaScript(input);
      setInput(""); // Clear input state
      promptInput();
    } else if (domEvent.key === "Backspace") {
      if (input.length > 0) {
        setInput((prev) => prev.slice(0, -1));
        term.current.write("\b \b");
      }
    } else {
      setInput((prev) => prev + key);
      term.current.write(key);
    }
  };

  // Function to display the command prompt
  const promptInput = () => {
    term.current.write("\r\n$ ");
  };

  // Function to execute JavaScript code dynamically
  const executeJavaScript = (code) => {
    if (!code.trim()) return;
    
    try {
      let capturedLogs = [];
      const originalConsoleLog = console.log;

      console.log = (...args) => {
        const output = args.map(arg => JSON.stringify(arg, null, 2)).join(" ");
        capturedLogs.push(output);
        originalConsoleLog(output);
      };

      let result = eval(code);
      console.log = originalConsoleLog;

      if (capturedLogs.length > 0) {
        capturedLogs.forEach(line => term.current.writeln(line));
      }

      if (result !== undefined) {
        term.current.writeln(JSON.stringify(result, null, 2));
      }
    } catch (error) {
      term.current.writeln(`Error: ${error.message}`);
    }
  };

  return <div ref={terminalRef} className="w-full h-full bg-black"></div>;
};

export default TerminalComponent;
