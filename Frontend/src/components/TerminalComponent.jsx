import React, { useEffect, useRef, useState } from "react";
import { Terminal } from "xterm";
import "xterm/css/xterm.css";
import { FitAddon } from "xterm-addon-fit";

const TerminalComponent = () => {
  const terminalRef = useRef(null);
  const term = useRef(null);
  const fitAddon = useRef(new FitAddon());
  const [input, setInput] = useState("");
  const [commandHistory, setCommandHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const promptLength = 2; // The length of the prompt ($ )

  useEffect(() => {
    if (!terminalRef.current) return;

    // Initialize terminal
    term.current = new Terminal({
      cursorBlink: true,
      fontSize: 14,
      fontFamily: 'Menlo, Monaco, "Courier New", monospace',
      theme: { 
        background: "#1e1e1e", 
        foreground: "#ffffff",
        cursor: "#ffffff",
        selection: "#264f78"
      },
      convertEol: true,
      scrollback: 5000,
    });

    term.current.loadAddon(fitAddon.current);
    term.current.open(terminalRef.current);

    // Handle window resize
    const handleResize = () => {
      fitAddon.current.fit();
    };

    window.addEventListener('resize', handleResize);
    
    // Fit terminal to container
    setTimeout(() => {
      fitAddon.current.fit();
    }, 100);

    // Initial terminal message
    term.current.writeln("JavaScript Terminal v1.0");
    term.current.writeln("Type 'help' for available commands");
    promptInput();

    // Handle key input - Use direct event listeners for better control
    term.current.onKey(({ key, domEvent }) => {
      handleKeyInput(key, domEvent);
    });

    // Focus the terminal on mount
    term.current.focus();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (term.current) {
        term.current.dispose();
      }
    };
  }, []);

  // Function to display the command prompt
  const promptInput = () => {
    term.current.write("\r\n$ ");
    setInput("");
  };

  // Function to handle user key input
  const handleKeyInput = (key, domEvent) => {
    const keyCode = domEvent.keyCode;

    // Prevent default behavior for some keys to avoid double handling
    if ([8, 9, 13, 37, 38, 39, 40].includes(keyCode)) {
      domEvent.preventDefault();
    }

    // Handle special keys
    if (keyCode === 13) { // Enter
      const trimmedInput = input.trim();
      term.current.writeln("");
      
      if (trimmedInput) {
        // Add to command history only if not empty
        setCommandHistory(prev => [trimmedInput, ...prev.slice(0, 49)]);
        
        if (trimmedInput === 'clear') {
          term.current.clear();
        } else if (trimmedInput === 'help') {
          showHelp();
        } else {
          executeJavaScript(trimmedInput);
        }
      }
      
      setHistoryIndex(-1);
      promptInput();
      
    } else if (keyCode === 8) { // Backspace
      if (input.length > 0) {
        // Remove the last character from input
        setInput(prev => prev.slice(0, -1));
        
        // Move cursor back and erase character
        term.current.write('\b \b');
      }
      
    } else if (keyCode === 38) { // Up arrow - previous command
      if (commandHistory.length > 0 && historyIndex < commandHistory.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        const historyCommand = commandHistory[newIndex];
        
        // Clear current input
        clearCurrentLine();
        
        // Set new input and display it
        setInput(historyCommand);
        term.current.write(historyCommand);
      }
      
    } else if (keyCode === 40) { // Down arrow - next command
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        const historyCommand = commandHistory[newIndex];
        
        // Clear current input
        clearCurrentLine();
        
        // Set new input and display it
        setInput(historyCommand);
        term.current.write(historyCommand);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        
        // Clear current input
        clearCurrentLine();
        setInput("");
      }
      
    } else if (keyCode === 67 && domEvent.ctrlKey) { // Ctrl+C
      term.current.writeln("^C");
      promptInput();
      
    } else if (!domEvent.ctrlKey && !domEvent.altKey && key.length === 1) { // Regular character
      // Add character to input state
      setInput(prev => prev + key);
      
      // Write character to terminal
      term.current.write(key);
    }
  };

  // Clear the current line (used for history navigation)
  const clearCurrentLine = () => {
    // Move to start of line and clear to end
    term.current.write('\r');
    term.current.write('$ ');
    term.current.write(' '.repeat(input.length));
    term.current.write('\r');
    term.current.write('$ ');
  };

  // Show help information
  const showHelp = () => {
    term.current.writeln("Available commands:");
    term.current.writeln("  help     - Display this help information");
    term.current.writeln("  clear    - Clear the terminal screen");
    term.current.writeln("  [js code] - Execute JavaScript code directly");
    term.current.writeln("");
    term.current.writeln("Examples:");
    term.current.writeln("  console.log('Hello world')");
    term.current.writeln("  const x = 10; x * 5");
    term.current.writeln("  [1,2,3].map(n => n*2)");
  };

  // Function to execute JavaScript code dynamically
  const executeJavaScript = (code) => {
    try {
      // Create a sandbox for capturing console outputs
      const capturedOutputs = [];
      const sandboxConsole = {
        log: (...args) => {
          const output = args.map(formatOutput).join(" ");
          capturedOutputs.push(output);
        },
        error: (...args) => {
          const output = args.map(formatOutput).join(" ");
          capturedOutputs.push(`\x1b[31m${output}\x1b[0m`); // Red text for errors
        },
        warn: (...args) => {
          const output = args.map(formatOutput).join(" ");
          capturedOutputs.push(`\x1b[33m${output}\x1b[0m`); // Yellow text for warnings
        },
        info: (...args) => {
          const output = args.map(formatOutput).join(" ");
          capturedOutputs.push(`\x1b[36m${output}\x1b[0m`); // Cyan text for info
        },
        clear: () => {
          term.current.clear();
        }
      };

      // Execute the code with our sandboxed console
      const execFunc = new Function('console', `
        try {
          const result = eval(${JSON.stringify(code)});
          if (result !== undefined) {
            return result;
          }
        } catch(e) {
          console.error(e.message);
          return undefined;
        }
      `);
      
      const result = execFunc(sandboxConsole);

      // Output any console logs
      capturedOutputs.forEach(output => {
        term.current.writeln(output);
      });

      // Output the result if there is one
      if (result !== undefined) {
        term.current.writeln(formatOutput(result));
      }
    } catch (error) {
      term.current.writeln(`\x1b[31mError: ${error.message}\x1b[0m`);
    }
  };

  // Format various types of output for terminal display
  const formatOutput = (value) => {
    if (value === undefined) return "undefined";
    if (value === null) return "null";
    
    if (typeof value === "object") {
      try {
        if (Array.isArray(value)) {
          return JSON.stringify(value);
        } else {
          return JSON.stringify(value, null, 2);
        }
      } catch (e) {
        return String(value);
      }
    }
    
    return String(value);
  };

  return (
    <div 
      ref={terminalRef} 
      className="w-full h-full bg-black" 
      style={{ padding: '4px' }}
      onClick={() => {
        // Focus the terminal when container is clicked
        if (term.current) {
          term.current.focus();
        }
      }}
    />
  );
};

export default TerminalComponent;