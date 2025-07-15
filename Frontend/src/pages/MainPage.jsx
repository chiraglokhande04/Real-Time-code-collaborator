import React, { useState, useEffect } from "react";
import NavBar from "../components/NavBar";
import SlideBar from "../components/SlideBar";
import CodeEditor from "../components/CodeEditor";
import TerminalComponent from "../components/TerminalComponent";
import { useParams } from "react-router-dom";
import { useSocket } from "../context/socketContext";
import { useRef } from "react";
import axios from "axios";

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

  const [tree, setTree] = useState([]);

  const socket = useSocket();

  // Handle sidebar tab clicks
  const handleTabClick = (tab) => {
    setActiveTab(activeTab === tab ? null : tab);

    // Reset unread count when opening chat tab
    if (tab === "chat") {
      setUnreadCount(0);
    }
  };

  // const handleFileUpload = (uploadedFiles) => {
  //   const newFiles = [];

  //   uploadedFiles.forEach((file) => {
  //     const reader = new FileReader();
  //     reader.onload = (e) => {
  //       const fileContent = e.target.result;
  //       const newFile = {
  //         name: file.webkitRelativePath || file.name,
  //         content: fileContent,
  //         file: file,
  //       };
  //       newFiles.push(newFile);

  //       if (newFiles.length === uploadedFiles.length) {
  //         // Update local state
  //         setFiles((prevFiles) => {
  //           const updatedFiles = [...prevFiles, ...newFiles];

  //           // Share files with others in the room
  //           socket.emit("share-files", {
  //             roomId: id,
  //             files: updatedFiles.map((file) => ({
  //               name: file.name,
  //               content: file.content,
  //             })),
  //           });

  //           return updatedFiles;
  //         });
  //       }
  //     };
  //     reader.readAsText(file);
  //   });
  // };


  // Listen for file updates from other users
  // useEffect(() => {
  //   if (!socket) return;

  //   const handleReceivedFiles = (receivedFiles) => {
  //     // Convert received files to the format we use locally
  //     const formattedFiles = receivedFiles.map((file) => {
  //       // Create a blob from the file content
  //       const blob = new Blob([file.content], { type: "text/plain" });

  //       // Create a File object from the blob
  //       const fileObject = new File([blob], file.name, { type: "text/plain" });

  //       return {
  //         name: file.name,
  //         content: file.content,
  //         file: fileObject,
  //       };
  //     });

  //     // Update local files state, but don't duplicate files
  //     setFiles((prevFiles) => {
  //       const existingFileNames = new Set(prevFiles.map((f) => f.name));
  //       const newFiles = formattedFiles.filter(
  //         (file) => !existingFileNames.has(file.name)
  //       );

  //       if (newFiles.length > 0) {
  //         return [...prevFiles, ...newFiles];
  //       }
  //       return prevFiles;
  //     });
  //   };

  //   socket.on("receive-files", handleReceivedFiles);

  //   // When joining a room, request any existing files
  //   socket.emit("get-room-files", id);

  //   return () => {
  //     socket.off("receive-files", handleReceivedFiles);
  //   };
  // }, [socket, id]);

  useEffect(() => {


    if (!socket) {
      console.warn("❌ socket is not initialized");
      return;
    }

    const handleFileUploaded = () => {
      fetchTree();
    };
  
    socket.on("fileUploaded", handleFileUploaded);
  
    return () => {
      socket.off("fileUploaded", handleFileUploaded);
    };
  }, [id, socket]);
  

  const fetchTree = async () => {
    const res = await axios.get(`http://localhost:3000/api/files/tree/${id}`);
     console.log("Fetched file tree:", res.data);
    setTree(buildTree(res.data));

    const newFiles = [];

  const traverse = (nodes) => {
    for (let node of nodes) {
      if (node.type === "file") {
        newFiles.push(node);
      }
      if (node.children && node.children.length > 0) {
        traverse(node.children);
      }
    }
  };

  traverse(tree);
  setFiles(newFiles);
  console.log("Files fetched:", newFiles);
  setSelectedFile(newFiles.length > 0 ? newFiles[0] : null);
  };

  const buildTree = (items, parentId = null) => {
    return items
      .filter(item => String(item.parentId) === String(parentId))
      .map(item => ({
        ...item,
        children: buildTree(items, item._id)
      }));
  };







  const handleSelectFile = (file) => {
    if (!file.file) return;

    const reader = new FileReader();

    reader.onload = (event) => {
      const fileContent = event.target.result;

      // Update editor & selected file state
      setCode(fileContent);
      setSelectedFile(file);

      // Ensure file is added to open files
      setOpenFiles((prev) => {
        if (!prev.some((f) => f.name === file.name)) {
          return [...prev, file];
        }
        return prev;
      });

      // Emit socket event to notify others about file selection
      socket.emit("code-change", {
        roomId: id,
        newCode: fileContent,
        fileName: file.name,
      });
    };

    reader.readAsText(file.file);
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

            tree ={tree}
          />
        </div>

        {/* Main Content - now using flex-1 to take remaining space */}
        <div className="flex-1 flex flex-col  h-full overflow-hidden">
          {/* Code Editor */}
          <div className="flex-1 bg-gray-900 overflow-hidden">
            <CodeEditor
              editorRef={editorRef}
              language={language}
              setLanguage={setLanguage}
              code={code}
              setCode={setCode}
              activeFile={selectedFile ? selectedFile.name : ""}
              openFiles={openFiles}
              setOpenFiles={setOpenFiles}
              setSelectedFile={setSelectedFile}
              onCodeChange={handleCodeChange}
              username={username}
              socket={socket}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainPage;
