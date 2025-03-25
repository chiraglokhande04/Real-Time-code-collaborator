import React, { useState } from "react";
import NavBar from "../components/NavBar";
import SlideBar from "../components/SlideBar";
import CodeEditor from "../components/CodeEditor";
import TerminalComponent from "../components/TerminalComponent";

const MainPage = () => {
  const [activeTab, setActiveTab] = useState(null);
  const [files, setFiles] = useState([]);
  const [openFiles, setOpenFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [code, setCode] = useState("// Write your code here...");

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

    // Read file content
    const reader = new FileReader();
    reader.onload = (e) => setCode(e.target.result);
    reader.readAsText(file);
    setSelectedFile(file);
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Navbar */}
      <NavBar />

      <div className="flex h-full">
        {/* Sidebar (Fixed Icons, Expandable Content) */}
        <SlideBar
          activeTab={activeTab}
          handleTabClick={handleTabClick}
          onFileUpload={handleFileUpload}
          files={files}
          onSelectFile={handleSelectFile}
        />

        {/* Main Content (Editor & Terminal) */}
        <div className="flex-1 flex flex-col transition-all duration-300">
          {/* Code Editor with Tabs for Open Files */}
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

          {/* Terminal (Fixed at Bottom) */}
          <div className="h-1/4 bg-gray-800 border-t border-gray-700">
            <TerminalComponent />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainPage;
