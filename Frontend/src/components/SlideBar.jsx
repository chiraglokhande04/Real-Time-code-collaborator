import React, { useState } from "react";
import { FaFileAlt, FaComment, FaVideo } from "react-icons/fa";
import { useDropzone } from "react-dropzone";

const SlideBar = ({ activeTab, handleTabClick, onFileUpload, files, onSelectFile }) => {
  const handleDrop = (acceptedFiles) => {
    onFileUpload(acceptedFiles);
  };

  const { getRootProps, getInputProps } = useDropzone({ onDrop: handleDrop });

  return (
    <div className="flex h-full">
      {/* Sidebar Icons (Always Fixed) */}
      <div className="bg-gray-900 text-white flex flex-col items-center py-4 w-12">
        <button className="p-3 hover:bg-gray-700 rounded" onClick={() => handleTabClick("files")}>
          <FaFileAlt size={20} />
        </button>
        <button className="p-3 hover:bg-gray-700 rounded" onClick={() => handleTabClick("chat")}>
          <FaComment size={20} />
        </button>
        <button className="p-3 hover:bg-gray-700 rounded" onClick={() => handleTabClick("video")}>
          <FaVideo size={20} />
        </button>
      </div>

      {/* Expandable Content (Only Expands on Click) */}
      <div className={`bg-gray-800 text-white transition-all ${activeTab ? "w-64" : "w-0"} overflow-hidden`}>
        {/* File Manager */}
        {activeTab === "files" && (
          <div className="p-3">
            <div {...getRootProps()} className="border-dashed border-2 border-gray-600 p-4 text-center cursor-pointer">
              <input {...getInputProps()} />
              <p className="text-gray-400">Drag & Drop files or Click to Upload</p>
            </div>
            <ul className="mt-4">
              {files.map((file, index) => (
                <li key={index} className="cursor-pointer p-2 hover:bg-gray-700" onClick={() => onSelectFile(file)}>
                  {file.name}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Chat */}
        {activeTab === "chat" && <div className="p-3">Chat System Here</div>}

        {/* Video Call */}
        {activeTab === "video" && <div className="p-3">Video Call Feature Here</div>}
      </div>
    </div>
  );
};

export default SlideBar;
