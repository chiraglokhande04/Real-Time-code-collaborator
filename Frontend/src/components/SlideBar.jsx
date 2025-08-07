import React, { useState } from "react";
import {
  FaFileAlt,
  FaComment,
  FaVideo,
  FaUser,
  FaTerminal,
} from "react-icons/fa";
import { useDropzone } from "react-dropzone";
import { FaSpinner } from "react-icons/fa";

import ChatBox from "./ChatBox";
import VoiceCall from "./VoiceCall";
import FileUploader from "./FileUploader";
import Users from "./Users";
import CodeTerminal from "./CodeTerminal";
import FileTree from "./FileTree";

const SlideBar = ({
  editorRef,
  language,
  setLanguage,
  users,
  activeTab,
  handleTabClick,
  files,
  onSelectFile,
  roomId,
  userId,
  username,
  messages,
  setMessages,
  unreadCount,
  setUnreadCount,
  sendMessage,
  socket,
  ydoc,
  CodeEditor,
  onFileUpload,
  isUploading
}) => {
  const [folderName, setFolderName] = useState(null);


  const { getRootProps, getInputProps } = useDropzone({
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        const firstFilePath =
          acceptedFiles[0].webkitRelativePath || acceptedFiles[0].name;
        const extractedFolderName = firstFilePath.split("/")[0];
        setFolderName(extractedFolderName);
      }
      onFileUpload(acceptedFiles);
    },
    multiple: true,
    webkitdirectory: true,
    directory: true,
  });

  return (
    <div className="flex h-full bg-gray-950 text-white">
      {/* Sidebar Navigation */}
      <div className="bg-gray-900 flex flex-col items-center py-4 w-14 space-y-4">
        <button
          className={`p-3 rounded transition-colors ${
            activeTab === "files" ? "bg-gray-700" : "hover:bg-gray-700"
          }`}
          onClick={() => handleTabClick("files")}
        >
          <FaFileAlt size={20} />
        </button>

        <button
          className={`relative p-3 rounded transition-colors ${
            activeTab === "chat" ? "bg-gray-700" : "hover:bg-gray-700"
          }`}
          onClick={() => {
            handleTabClick("chat");
            setUnreadCount(0);
          }}
        >
          <FaComment size={20} />
          {unreadCount > 0 && activeTab !== "chat" && (
            <div className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {unreadCount}
            </div>
          )}
        </button>

        <button
          className={`p-3 rounded transition-colors ${
            activeTab === "video" ? "bg-gray-700" : "hover:bg-gray-700"
          }`}
          onClick={() => handleTabClick("video")}
        >
          <FaVideo size={20} />
        </button>

        <button
          className={`p-3 rounded transition-colors ${
            activeTab === "users" ? "bg-gray-700" : "hover:bg-gray-700"
          }`}
          onClick={() => handleTabClick("users")}
        >
          <FaUser size={20} />
        </button>

        <button
          className={`p-3 rounded transition-colors ${
            activeTab === "terminal" ? "bg-gray-700" : "hover:bg-gray-700"
          }`}
          onClick={() => handleTabClick("terminal")}
        >
          <FaTerminal size={20} />
        </button>
      </div>

      {/* Expandable Panel */}
      <div
        className={`bg-gray-800 flex-1 transition-all duration-300 ${
          activeTab ? "w-80" : "w-0"
        } overflow-hidden flex flex-col`}
      >
       {activeTab === "files" && (
        <div className="flex flex-col h-full">
          {/* Upload Button / Folder Name */}
          <div
            className={`transition-all duration-300 ${
              folderName
                ? "h-12 px-4 py-2 text-sm bg-gray-900 border-b border-gray-700 flex items-center justify-between"
                : "p-4"
            }`}
          >
            {folderName ? (
              <p className="text-blue-400 font-semibold truncate">
                📁 {folderName}
              </p>
            ) : isUploading ? (
              <div className="flex items-center space-x-2 text-white text-sm">
                <FaSpinner className="animate-spin" />
                <span>Uploading...</span>
              </div>
            ) : (
              <FileUploader
                getRootProps={getRootProps}
                getInputProps={getInputProps}
                handleUpload={onFileUpload}
              />
            )}
          </div>

          {/* File Tree Scrollable */}
          <div className="flex-1 overflow-y-auto p-4 pt-2">
            <FileTree
              ydoc={ydoc}
              CodeEditor={CodeEditor}
              onFileClick={onSelectFile}
            />
          </div>
        </div>
      )}

        {activeTab === "chat" && (
          <ChatBox
            username={username}
            users={users}
            userId={userId}
            roomId={roomId}
            messages={messages}
            setMessages={setMessages}
            setUnreadCount={setUnreadCount}
            isOpen={activeTab === "chat"}
            sendMessage={sendMessage}
          />
        )}

        {activeTab === "video" && <VoiceCall socket={socket} />}
        {activeTab === "users" && <Users users={users} />}
        {activeTab === "terminal" && (
          <CodeTerminal editorRef={editorRef} language={language} />
        )}
      </div>
    </div>
  );
};

export default SlideBar;
