

import React, { useState, useEffect } from "react";
import NavBar from "../components/NavBar";
import SlideBar from "../components/SlideBar";
import CodeEditor from "../components/CodeEditor";
import TerminalComponent from "../components/TerminalComponent";
import { useParams } from "react-router-dom";
import { useSocket } from "../context/socketContext";

const MainPage = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState(null);
  const [files, setFiles] = useState([]);
  const [openFiles, setOpenFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [username, setUsername] = useState("");
  const [code, setCode] = useState("// Write your code here...");
  const [users, setUsers] = useState([]);
  const socket = useSocket();

  // Handle sidebar tab clicks
  const handleTabClick = (tab) => {
    setActiveTab(activeTab === tab ? null : tab);
  };

  // Handle file upload and read content
  // const handleFileUpload = (uploadedFiles) => {
  //   const newFiles = [];
  //   uploadedFiles.forEach((file) => {
  //     const reader = new FileReader();
  //     reader.onload = (e) => {
  //       const fileContent = e.target.result;
  //       const newFile = { name: file.webkitRelativePath || file.name, content: fileContent };
  //       newFiles.push(newFile);
  
  //       if (newFiles.length === uploadedFiles.length) {
  //         setFiles((prevFiles) => [...prevFiles, ...newFiles]);
  
  //         // Open the first uploaded file
  //         if (newFiles.length > 0 && !selectedFile) {
  //           handleSelectFile(newFiles[0]);
  //         }
  //       }
  //     };
  //     reader.readAsText(file);
  //   });
  // };

  const handleFileUpload = (uploadedFiles) => {
    const newFiles = [];
  
    uploadedFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const fileContent = e.target.result;
        const newFile = {
          name: file.webkitRelativePath || file.name, // ✅ Keep original file structure
          content: fileContent,
          file: file, // ✅ Store the original file reference
        };
        newFiles.push(newFile);
  
        if (newFiles.length === uploadedFiles.length) {
          setFiles((prevFiles) => [...prevFiles, ...newFiles]); // ✅ Update state with all files
        }
      };
      reader.readAsText(file);
    });
  };
  
  


  // Handle file selection
  // const handleSelectFile = (file) => {
  //   if (!openFiles.some((f) => f.name === file.name)) {
  //     setOpenFiles([...openFiles, file]);
  //   }
  //   setCode(file.content);
  //   setSelectedFile(file);
  // };


  // const handleSelectFile = (file) => {
  //   const reader = new FileReader();
  
  //   reader.onload = (event) => {
  //     const fileContent = event.target.result;
  
  //     setCode(fileContent); // Update the editor with the file's content
  
  //     // Emit the content after it has been successfully read
  //     socket.emit("code-change", { roomId, newCode: fileContent });
  //   };
  
  //   reader.readAsText(file.file); // Read the file as text
  
  //   if (!openFiles.some((f) => f.name === file.name)) {
  //     setOpenFiles([...openFiles, file]);
  //   }
  
  //   setSelectedFile(file);
  // };

  const handleSelectFile = (file) => {
    if (!file.file) return; // Ensure there's a file to read
  
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
  
      // Emit socket event *after* state updates
      setTimeout(() => {
        socket.emit("code-change", { roomId, newCode: fileContent });
      }, 100);
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

    const handleCodeUpdate = (newCode) => {
      setCode(newCode);
    };
    socket.on("update-code", handleCodeUpdate);
    return () => {
      socket.off("update-code", handleCodeUpdate);
    };
  }, [socket]);

  const handleCodeChange = (newCode) => {
    setCode(newCode);
    socket.emit("code-change", { roomId: id, newCode });
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Navbar */}
      <NavBar id={id} users={users} />

      <div className="flex h-full">
        {/* Sidebar */}
        {/* <SlideBar
          activeTab={activeTab}
          handleTabClick={handleTabClick}
          onFileUpload={handleFileUpload}
          files={files}
          onSelectFile={handleSelectFile}
          roomId = {id}
          username={username}
        /> */}

<SlideBar
  activeTab={activeTab}
  handleTabClick={handleTabClick}
  onFileUpload={handleFileUpload}
  files={files}  // ✅ Pass files to SlideBar
  onSelectFile={handleSelectFile}
  roomId={id}
  username={username}
/>

        {/* Main Content */}
        <div className="flex-1 flex flex-col transition-all duration-300">
          {/* Code Editor */}
          <div className="flex-1 bg-gray-900">
            <CodeEditor
              code={code}
              setCode={setCode}
              activeFile={selectedFile ? selectedFile.name : ""}
              openFiles={openFiles}
              setOpenFiles={setOpenFiles}
              setSelectedFile={setSelectedFile}
              onCodeChange={handleCodeChange}
              username={username}
              socket = {socket}
            />
          </div>

          {/* Terminal */}
          <div className="h-1/4 bg-gray-800 border-t border-gray-700">
            <TerminalComponent />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainPage;