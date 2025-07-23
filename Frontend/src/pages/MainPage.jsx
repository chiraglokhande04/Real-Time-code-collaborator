import React, { useState, useEffect } from "react";
import NavBar from "../components/NavBar";
import SlideBar from "../components/SlideBar";
import CodeEditor from "../components/CodeEditor";
import { useParams } from "react-router-dom";
import { useSocket } from "../context/socketContext";
import { useRef } from "react";
import axios from "axios";
import * as Y from "yjs";

const ydoc = new Y.Doc();



const MainPage = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState(null);
  const [files, setFiles] = useState([]);
  const [openFiles, setOpenFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [username, setUsername] = useState("");
  const [code, setCode] = useState("// Write your code here...");
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [slideBarWidth, setSlideBarWidth] = useState(0); // Track slidebar width
  const editorRef = useRef(null);
  const [language, setLanguage] = useState("javascript");
  //const [fileContentsMap, setFileContentsMap] = useState(new Map());

  const socket = useSocket();


  const foldersMap = ydoc.getMap("folders");
  const fileContentsMap = ydoc.getMap("fileContents");

  // Handle sidebar tab clicks
  const handleTabClick = (tab) => {
    setActiveTab(activeTab === tab ? null : tab);

    // Reset unread count when opening chat tab
    if (tab === "chat") {
      setUnreadCount(0);
    }
  };

  useEffect(() => {
    if (!foldersMap) return;

    const updateFilesFromMap = () => {
      const filesArray = [];
      foldersMap.forEach((value) => {
        filesArray.push(value);
      });
      setFiles(filesArray);
    };

    // Initial sync from Yjs map to React state
    updateFilesFromMap();

    // Listen for any changes inside foldersMap or its children
    foldersMap.observeDeep(updateFilesFromMap);

    return () => {
      foldersMap.unobserveDeep(updateFilesFromMap);
    };
  }, [foldersMap]);

  useEffect(() => {
    if (!socket) return;
  
    const handleYjsUpdated = ({ update: base64Update }) => {
      const binaryStr = atob(base64Update);
      const update = new Uint8Array(binaryStr.length);
      for (let i = 0; i < binaryStr.length; i++) {
        update[i] = binaryStr.charCodeAt(i);
      }
      Y.applyUpdate(ydoc, update);
    };
  
    socket.on("yjs-updated", handleYjsUpdated);
  
    return () => {
      socket.off("yjs-updated", handleYjsUpdated);
    };
  }, [socket]);
  
  




  const handleUpload = async (e) => {
    const files = Array.from(e.target.files);

 
    for (const file of files) {
      const path = file.webkitRelativePath || file.name;

      // Store folder metadata
      foldersMap.set(path, {
        name: file.name,
        path: path,
        isFolder: false,
      });

      // Read content
      const content = await file.text();
      const ytext = new Y.Text();
      ytext.insert(0, content);

      // Store file content
      fileContentsMap.set(path, ytext);
    }
    // Encode Yjs doc update
    const update = Y.encodeStateAsUpdate(ydoc);
const base64Update = btoa(String.fromCharCode(...update));

    if (!socket) {
      console.warn("❌ socket is not initialized");
      return;
    } 
    // Emit update to backend
    socket.emit("yjs-update", { roomId: id, update: base64Update });


    alert("Files uploaded and synced!");
  };






  const handleSelectFile = (item) => {
    if (!item || item.isFolder) return;

    setSelectedFile(item.path);
    // Optional: Auto-set language based on file extension
    const ext = item.path.split('.').pop();
    let lang = "plaintext";

    switch (ext) {
      case "js":
        lang = "javascript";
        break;
      case "ts":
        lang = "typescript";
        break;
      case "py":
        lang = "python";
        break;
      case "html":
        lang = "html";
        break;
      case "css":
        lang = "css";
        break;
      case "json":
        lang = "json";
        break;
      // add more cases as needed
    }

    setLanguage(lang);
  };

  // Get users in room
  useEffect(() => {
    if (!socket) return;
    const handleRoomUsers = (roomId) => {
      socket.emit("get-room-users", roomId, (users) => {
        console.log("Users in Room:", users);
        setUsers(users);
      });
    };
    handleRoomUsers(id);
  }, [id, socket]);

  // Listen for user updates
  useEffect(() => {
    if (!socket) return;
    const handleUsersUpdate = (userList) => {
      console.log("\ud83d\udc65 Users in room:", userList);
      setUsers(userList);
    };
    socket.on("update-users", handleUsersUpdate);
    socket.emit("get-room-content", id, (content) => {
      setCode(content);
    });
    return () => {
      socket.off("update-users", handleUsersUpdate);
    };
  }, [socket, id]);

  useEffect(() => {
    if (!socket) return;

    socket.emit("get-username", id, (name) => {
      setUsername(name);
    });

    const handleCodeUpdate = (data) => {
      setCode(data.newCode);

      // If file name is provided, update the selected file
      if (data.fileName) {
        // Find the file in our files array
        const file = files.find((f) => f.name === data.fileName);
        if (file) {
          // Update the file content
          file.content = data.newCode;

          // Set as selected file and ensure it's in open files
          setSelectedFile(file);
          setOpenFiles((prev) => {
            if (!prev.some((f) => f.name === file.name)) {
              return [...prev, file];
            }
            return prev;
          });
        }
      }
    };

    socket.on("update-code", handleCodeUpdate);
    return () => {
      socket.off("update-code", handleCodeUpdate);
    };
  }, [socket, files]);

  // Chat message handling
  useEffect(() => {
    if (!socket || !id) return;

    // Load chat history
    const loadMessages = (history) => {
      setMessages(history);
    };

    // Handle new messages
    const receiveMessage = (newMessage) => {
      setMessages((prevMessages) => [...prevMessages, newMessage]);

      // Only increment unread count if chat is not open and message is from another user
      if (activeTab !== "chat" && newMessage.sender !== username) {
        setUnreadCount((prev) => prev + 1);
      }
    };

    socket.on("loadMessages", loadMessages);
    socket.on("newMessage", receiveMessage);

    return () => {
      socket.off("loadMessages", loadMessages);
      socket.off("newMessage", receiveMessage);
    };
  }, [socket, id, activeTab, username, setMessages, setUnreadCount]);

  // Send message function to be passed to ChatBox
  const sendMessage = (messageText) => {
    if (!socket || messageText.trim() === "") return;

    const newMessage = {
      roomId: id,
      sender: username,
      message: messageText,
    };

    socket.emit("sendMessage", newMessage);
  };

  const handleCodeChange = (newCode) => {
    setCode(newCode);
    // Update the content of the selected file if any
    if (selectedFile) {
      selectedFile.content = newCode;
      // Update the files array with the updated file
      setFiles((prevFiles) => {
        return prevFiles.map((file) =>
          file.name === selectedFile.name ? { ...file, content: newCode } : file
        );
      });
    }

    // Send both code and file name to other users
    socket.emit("code-change", {
      roomId: id,
      newCode,
      fileName: selectedFile ? selectedFile.name : null,
    });
  };

  // Update slideBarWidth when activeTab changes
  useEffect(() => {
    // We need to measure the actual width of the sidebar when it's open
    // For now, let's use a reasonable default width when a tab is active
    setSlideBarWidth(activeTab ? 420 : 64); // Default width when closed is 64px
  }, [activeTab]);

  return (
    <div className="h-screen flex flex-col">
      {/* Navbar */}
      <NavBar id={id} />

      <div className="flex h-full overflow-hidden ">
        {/* SlideBar - now using absolute positioning */}
        <div className="h-full z-10" style={{ width: slideBarWidth }}>
          <SlideBar
            users={users}
            editorRef={editorRef}
            language={language}
            setLanguage={setLanguage}
            activeTab={activeTab}
            handleTabClick={handleTabClick}
            // onFileUpload={handleFileUpload}
            files={files}
            onSelectFile={handleSelectFile}
            roomId={id}
            username={username}
            messages={messages}
            setMessages={setMessages}
            unreadCount={unreadCount}
            setUnreadCount={setUnreadCount}
            sendMessage={sendMessage}
            socket={socket}
            ydoc={ydoc}
            CodeEditor={CodeEditor}
            onFileUpload = {handleUpload}
          />
        </div>

        {/* Main Content - now using flex-1 to take remaining space */}
        <div className="flex-1 flex flex-col  h-full overflow-hidden">
          {/* Code Editor */}
          <div className="flex-1 bg-gray-900 overflow-hidden">
            <CodeEditor
              ydoc={ydoc}
              editorRef={editorRef}
              language={language}
              setLanguage={setLanguage}
              code={code}
              setCode={setCode}
              activeFile={selectedFile || ""}
              openFiles={openFiles}
              setOpenFiles={setOpenFiles}
              setSelectedFile={setSelectedFile}
              onCodeChange={handleCodeChange}
              username={username}
              socket={socket}
              fileContentsMap={fileContentsMap}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainPage;
