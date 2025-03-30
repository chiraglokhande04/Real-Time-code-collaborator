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
  const [code, setCode] = useState("// Write your code here...");
  const[users,setUsers] = useState([])
  const socket = useSocket();

  // Handle sidebar tab clicks
  const handleTabClick = (tab) => {
    setActiveTab(activeTab === tab ? null : tab);
  };

  // Handle file upload
  const handleFileUpload = (uploadedFiles) => {
    const newFiles = uploadedFiles.map((file) => ({
      name: file.name,
      content: "",
    }));
    setFiles([...files, ...newFiles]);
  };

  // Handle file selection
  const handleSelectFile = (file) => {
    if (!openFiles.some((f) => f.name === file.name)) {
      setOpenFiles([...openFiles, file]);
    }

    if (file.content) {
      setCode(file.content);
    } else {
      console.warn("File content is empty or not available.");
    }

    setSelectedFile(file);
  };

  // Get users in room
  useEffect(() => {
    if (!socket) return;

    const handleRoomUsers = (roomId) => {
      socket.emit("get-room-users", roomId, (users) => {
        console.log("Users in Room:", users);
        setUsers(users)
      });
    };

    handleRoomUsers(id);
  }, [id, socket]); // ✅ Added `socket`

  // Listen for user updates
  useEffect(() => {
    if (!socket) return;
  
    const handleUsersUpdate = (userList) => {
      console.log("👥 Users in room:", userList);
      setUsers(userList);
    };
  
    socket.on("update-users", handleUsersUpdate);
    return () => {
      socket.off("update-users", handleUsersUpdate);
    };
  }, [socket]);

  return (
    <div className="h-screen flex flex-col">
      {/* Navbar */}
      <NavBar id={id} users={users} />

      <div className="flex h-full">
        {/* Sidebar */}
        <SlideBar
          activeTab={activeTab}
          handleTabClick={handleTabClick}
          onFileUpload={handleFileUpload}
          files={files}
          onSelectFile={handleSelectFile}
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
