import React, { useState, useEffect } from "react";
import NavBar from "../components/NavBar";
import SlideBar from "../components/SlideBar";
import CodeEditor from "../components/CodeEditor";
import { useParams } from "react-router-dom";
import { useSocket } from "../context/socketContext";
import { useRef } from "react";
import { uploadToCloudinary } from "../utils/utils";
import { useNavigate } from "react-router-dom";

  import pLimit from "p-limit";

import * as Y from "yjs";

const ydoc = new Y.Doc();



const MainPage = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState(null);
  const [files, setFiles] = useState([]);
  const [openFiles, setOpenFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [username, setUsername] = useState("");
  const [userId, setUserId] = useState("");
  const [code, setCode] = useState("// Write your code here...");
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [slideBarWidth, setSlideBarWidth] = useState(0); // Track slidebar width
  const editorRef = useRef(null);
  const [language, setLanguage] = useState("javascript");
  const [isUploading, setIsUploading] = useState(false);
  //const [fileContentsMap, setFileContentsMap] = useState(new Map());

  const socket = useSocket();
  const navigate = useNavigate();

  const foldersMap = ydoc.getMap("folders");
  // const fileContentsMap = ydoc.getMap("fileContents");
  const filesMap = ydoc.getMap("files");

  // Handle sidebar tab clicks
  const handleTabClick = (tab) => {
    setActiveTab(activeTab === tab ? null : tab);

    // Reset unread count when opening chat tab
    if (socket && username) {
      const isChatNowOpen = tab === "chat";
      socket.emit("chat-open-status", { roomId: id, chatOpen: isChatNowOpen });
    }
    
    if (tab === "chat") {
      setUnreadCount(0);
    }
    
  };


//   useEffect(() => {
//   if (!socket) return;

//   // Join room on mount
//   socket.emit("join-room", id);

//   // Request full Yjs document state after joining
//   socket.emit("request-yjs-sync");

//   // Your existing handlers for yjs-updated, yjs-sync, etc.

// }, [socket, id]);

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

    // Handler references to clean up later
    const handleYjsUpdate = (update) => {
      socket.emit('yjs-update', update );
    };

    const handleSocketUpdate = (update) => {
      try {
        console.log("listening updated event")
        const updateUint8 = update instanceof Uint8Array ? update : new Uint8Array(update);
        Y.applyUpdate(ydoc, updateUint8);
      } catch (err) {
        console.error("Failed to apply update:", err);
      }
    };

    ydoc.on('update', handleYjsUpdate);
    socket.on('yjs-updated', handleSocketUpdate);

    //  socket.emit('join-room', id);
    //  socket.emit('request-yjs-sync');

    return () => {
      ydoc.off('update', handleYjsUpdate);
      socket.off('yjs-update', handleSocketUpdate);
    };
  }, [socket, id]);


  useEffect(() => {
    if (!socket) return;
  
    const syncToPeers = () => {
      const update = Y.encodeStateAsUpdate(ydoc);
      socket.emit("yjs-update",  update );
    };
  
    filesMap.observeDeep(syncToPeers);
  
    return () => {
      filesMap.unobserveDeep(syncToPeers);
    };
  }, [socket, filesMap]);


  useEffect(() => {
    if (!socket) return;
  
    const handleFileSelected = ({ fileName, language }) => {
      setSelectedFile(fileName);
      setLanguage(language);
    };
  
    socket.on("file-selected", handleFileSelected);
  
    return () => {
      socket.off("file-selected", handleFileSelected);
    };
  }, [socket]);
  



  // const handleUpload = async (e) => {
  //   setIsUploading(true);

    
  //   const files = Array.from(e.target.files);
  //   const roomId = id; // Get room ID from params

  //   const res = await uploadToCloudinary(files, roomId); // content upload (step 3)

  //   for (const file of res.files) {
  //     const path = file.path || file.name; // Use path if available, otherwise fallback to name
  //     const metadata = {
  //       filename: file.name,
  //       fileId: file.cloudinaryPublicId,
  //       cloudUrl: file.url,
  //       path: file.path,
  //       isFolder: false,
  //       type: file.type,
  //     };
  //     foldersMap.set(path, metadata); // Yjs folder structure sync
  //   }

  //   setIsUploading(false);
  // }


const limit = pLimit(5); // max 5 parallel uploads

const handleUpload = async (e) => {
  setIsUploading(true);

  const files = Array.from(e.target.files);
  const roomId = id; // get room ID from params or context

  // 1️⃣ Extract folder tree metadata from files first
  const foldersMapUpdate = new Map();

  files.forEach((file) => {
    const path = file.webkitRelativePath || file.name;
    const pathParts = path.split("/");
    // Mark all parent folders as isFolder: true
    for (let i = 0; i < pathParts.length - 1; i++) {
      const folderPath = pathParts.slice(0, i + 1).join("/");
      if (!foldersMapUpdate.has(folderPath)) {
        foldersMapUpdate.set(folderPath, {
          filename: pathParts[i],
          fileId: null,
          cloudUrl: null,
          path: folderPath,
          isFolder: true,
          type: "folder",
        });
      }
    }
  });

  // 2️⃣ Update Yjs folder map with folders (no content yet)
  foldersMapUpdate.forEach((metadata, path) => {
    if (!foldersMap.has(path)) {
      foldersMap.set(path, metadata);
    }
  });

  // Also add all files as file entries with empty metadata, real content will come later
  files.forEach((file) => {
    const path = file.webkitRelativePath || file.name;
    if (!foldersMap.has(path)) {
      foldersMap.set(path, {
        filename: file.name,
        fileId: null,
        cloudUrl: null,
        path,
        isFolder: false,
        type: file.type,
      });
    }
  });

  // 3️⃣ Start background upload, but don’t block UI
  (async () => {
    try {
      const res = await uploadToCloudinary(files, roomId);

      // 4️⃣ Update Yjs with real file metadata from server response
      for (const file of res.files) {
        const path = file.path || file.name;
        foldersMap.set(path, {
          filename: file.name,
          fileId: file.cloudinaryPublicId,
          cloudUrl: file.url,
          path: file.path,
          isFolder: false,
          type: file.type,
        });
      }
    } catch (err) {
      console.error("Upload error:", err);
    } finally {
      setIsUploading(false);
    }
  })();
};

  const handleSelectFile = async (item) => {
    if (!item || item.isFolder) return;

    const ext = item.path.split(".").pop();
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
      // add more if needed
    }

    // Load file content into Yjs if not already loaded
    if (!filesMap.has(item.name)) {
      try {
        const res = await fetch(item.cloudUrl);
        const content = await res.text();
        // const yText = new Y.Text();
        // yText.insert(0, content);
        // filesMap.set(item.name, yText);
        ydoc.transact(() => {
          if (!filesMap.has(item.name)) {
            const yText = new Y.Text();
            yText.insert(0, content);
            filesMap.set(item.name, yText);
          }
        });
      } catch (err) {
        console.error("Error loading file content:", err);
        alert("Failed to load file");
        return; // Don't continue if loading failed
      }
    }

    socket.emit("file-selected", {
      fileName: item.name,
      language: lang,
    });

    // Only set file once it's safely loaded
    setSelectedFile(item.name);
    setLanguage(lang);
  };


   const handleLeaveRoom = () => {
    if (socket && id) {
      socket.emit("leave-room", id);
      socket.once("room-left", () => {
        navigate("/logged"); // Redirect to homepage
      });
    }
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

    socket.emit("get-user", (user) => {
      setUsername(user.username);
      setUserId(user._id);
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
      if (activeTab !== "chat" && newMessage.sender?._id !== userId) {
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
      <NavBar id={id} leaveRoom={handleLeaveRoom} ydoc ={ydoc} />

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
            userId={userId}
            username={username}
            messages={messages}
            setMessages={setMessages}
            unreadCount={unreadCount}
            setUnreadCount={setUnreadCount}
            sendMessage={sendMessage}
            socket={socket}
            ydoc={ydoc}
            CodeEditor={CodeEditor}
            onFileUpload={handleUpload}
            isUploading = {isUploading}
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
              filesMap={filesMap}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainPage;
