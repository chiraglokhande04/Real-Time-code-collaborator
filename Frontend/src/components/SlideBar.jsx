
// import React, { useState } from "react";
// import { FaFileAlt, FaComment, FaVideo, FaUser, FaTerminal } from "react-icons/fa";
// import { useDropzone } from "react-dropzone";
// import ChatBox from "./ChatBox";
// import VoiceCall from "./VoiceCall";
// import FileUploader from "./FileUploader";
// import Clients from "./Clients";
// import Users from "./Users";
// import CodeTerminal from "./CodeTerminal";
// import { User } from "lucide-react";

// const SlideBar = ({
//   editorRef, language ,setLanguage ,
//   users,
//   activeTab,
//   handleTabClick,
//   onFileUpload,
//   files,
//   onSelectFile,
//   roomId,
//   username,
//   messages,
//   setMessages,
//   unreadCount,
//   setUnreadCount,
//   sendMessage, // New prop from parent
//   socket
// }) => {
//   const [folderName, setFolderName] = useState(null);

//   const { getRootProps, getInputProps } = useDropzone({
//     onDrop: (acceptedFiles) => {
//       if (acceptedFiles.length > 0) {
//         const firstFilePath =
//           acceptedFiles[0].webkitRelativePath || acceptedFiles[0].name;
//         const extractedFolderName = firstFilePath.split("/")[0]; // Extract folder name
//         console.log("Folder Name:", extractedFolderName);
//         setFolderName(extractedFolderName);
//       }
//       onFileUpload(acceptedFiles);
//     },
//     multiple: true,
//     webkitdirectory: true,
//     directory: true,
//   });

//   return (
//     <div className="flex h-full">
//       {/* Sidebar Icons */}
//       <div className="bg-gray-900 text-white flex flex-col items-center py-4 w-14">
//         {folderName ? (
//           <div className="text-center text-blue-400 font-semibold p-3">
//             {folderName}
//           </div>
//         ) : (
//           <button
//             className={`p-3 rounded transition-colors ${
//               activeTab === "files" ? "bg-gray-700" : "hover:bg-gray-700"
//             }`}
//             onClick={() => handleTabClick("files")}
//           >
//             <FaFileAlt size={20} />
//           </button>
//         )}
//         <button
//           className={`relative p-3 rounded transition-colors ${
//             activeTab === "chat" ? "bg-gray-700" : "hover:bg-gray-700"
//           }`}
//           onClick={() => {
//             handleTabClick("chat");
//             setUnreadCount(0); // Reset on open
//           }}
//         >
//           <FaComment size={20} />
//           {unreadCount > 0 && activeTab !== "chat" && (
//             <div className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
//               {unreadCount}
//             </div>
//           )}
//         </button>
//         <button
//           className={`p-3 rounded transition-colors ${
//             activeTab === "video" ? "bg-gray-700" : "hover:bg-gray-700"
//           }`}
//           onClick={() => handleTabClick("video")}
//         >
//           <FaVideo size={20} />
          
//         </button>
//         <button
//           className={`p-3 rounded transition-colors ${
//             activeTab === "video" ? "bg-gray-700" : "hover:bg-gray-700"
//           }`}
//           onClick={() => handleTabClick("users")}
//         >
//           <FaUser size={20} />
          
//         </button>

//         <button
//           className={`p-3 rounded transition-colors ${
//             activeTab === "terminal" ? "bg-gray-700" : "hover:bg-gray-700"
//           }`}
//           onClick={() => handleTabClick("terminal")}
//         >
//           <FaTerminal size={20} />
          
//         </button>
//       </div>

//       {/* Expandable Content */}
//       <div
//         className={`bg-gray-800 text-white transition-all ${
//           activeTab ? "w-90" : "w-0"
//         } overflow-hidden`}
//       >
//         {activeTab === "files" && (
//           <div className="p-4">
//             <h2 className="text-lg font-semibold mb-2">Uploaded Files</h2>
//             {folderName ? (
//               <p className="text-blue-400 font-semibold mb-2">
//                 Folder: {folderName}
//               </p>
//             ) : (
//               <FileUploader
//                 getRootProps={getRootProps}
//                 getInputProps={getInputProps}
//                 onUpload={onFileUpload}
//               />
//             )}
//             <div className="max-h-40 overflow-y-auto border border-gray-600 rounded p-2">
//               <ul>
//                 {files.map((file, index) => (
//                   <li
//                     key={index}
//                     className="cursor-pointer hover:bg-gray-700 p-2  rounded"
//                     onClick={() => onSelectFile(file)}
//                   >
//                     {file.name}
//                   </li>
//                 ))}
//               </ul>
//             </div>
//           </div>
//         )}

//         {activeTab === "chat" && (
//           <ChatBox
//             username={username}
//             roomId={roomId}
//             messages={messages}
//             setMessages={setMessages}
//             setUnreadCount={setUnreadCount}
//             isOpen={activeTab === "chat"}
//             sendMessage={sendMessage} // Pass down the sendMessage function
//           />
//         )}
//         {activeTab === "video" && <VoiceCall socket={socket} />}
//         {activeTab === "users" && (
//            <Users users={users} />
          
          
//         )}
//         {activeTab === "terminal" && (
//            <CodeTerminal editorRef={editorRef} language={language} />
          
          
//         )}
//       </div>
//     </div>
//   );
// };

// export default SlideBar;


import React, { useState } from "react";
import { FaFileAlt, FaComment, FaVideo, FaUser, FaTerminal } from "react-icons/fa";
import { useDropzone } from "react-dropzone";
import ChatBox from "./ChatBox";
import VoiceCall from "./VoiceCall";
import FileUploader from "./FileUploader";
import Clients from "./Clients";
import Users from "./Users";
import CodeTerminal from "./CodeTerminal";
import { User } from "lucide-react";

import FileTree from "./FileTree"; // Import the FileTree component

const SlideBar = ({
  editorRef, language, setLanguage,
  users,
  activeTab,
  handleTabClick,
  // onFileUpload,
  files,
  onSelectFile,
  roomId,
  userId,
  username,
  messages,
  setMessages,
  unreadCount,
  setUnreadCount,
  sendMessage, // New prop from parent
  socket,
  ydoc,
  CodeEditor,
  onFileUpload
}) => {
  const [folderName, setFolderName] = useState(null);
  const [newFileName, setNewFileName] = useState("");

  const buildTree = (files) => {
    const tree = {};
    files.forEach((file) => {
      const parts = file.name.split("/");
      let current = tree;
      parts.forEach((part, index) => {
        if (!current[part]) {
          current[part] = index === parts.length - 1 ? file : {};
        }
        current = current[part];
      });
    });
    return tree;
  };

  const renderFileTree = (files, onSelectFile, level = 0) => {
    const tree = buildTree(files);

    const renderNode = (node, depth = 0) => {
      return Object.entries(node).map(([key, value]) => {
        if (value.file) {
          return (
            <div
              key={key}
              onClick={() => onSelectFile(value)}
              className="cursor-pointer hover:bg-gray-700 p-1 rounded"
              style={{ marginLeft: depth * 10 }}
            >
              📄 {key}
            </div>
          );
        } else {
          return (
            <div key={key}>
              <div
                className="text-blue-400 font-semibold p-1"
                style={{ marginLeft: depth * 10 }}
              >
                📁 {key}
              </div>
              {renderNode(value, depth + 1)}
            </div>
          );
        }
      });
    };

    return <div>{renderNode(tree)}</div>;
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        const firstFilePath =
          acceptedFiles[0].webkitRelativePath || acceptedFiles[0].name;
        const extractedFolderName = firstFilePath.split("/")[0];
        console.log("Folder Name:", extractedFolderName);
        setFolderName(extractedFolderName);
      }
      onFileUpload(acceptedFiles);
    },
    multiple: true,
    webkitdirectory: true,
    directory: true,
  });

  return (
    <div className="flex h-full">
      {/* Sidebar Icons */}
      <div className="bg-gray-900 text-white flex flex-col items-center py-4 w-14">
        {folderName ? (
          <div className="text-center text-blue-400 font-semibold p-3">
            {folderName}
          </div>
        ) : (
          <button
            className={`p-3 rounded transition-colors ${activeTab === "files" ? "bg-gray-700" : "hover:bg-gray-700"}`}
            onClick={() => handleTabClick("files")}
          >
            <FaFileAlt size={20} />
          </button>
        )}
        <button
          className={`relative p-3 rounded transition-colors ${activeTab === "chat" ? "bg-gray-700" : "hover:bg-gray-700"}`}
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
          className={`p-3 rounded transition-colors ${activeTab === "video" ? "bg-gray-700" : "hover:bg-gray-700"}`}
          onClick={() => handleTabClick("video")}
        >
          <FaVideo size={20} />
        </button>
        <button
          className={`p-3 rounded transition-colors ${activeTab === "users" ? "bg-gray-700" : "hover:bg-gray-700"}`}
          onClick={() => handleTabClick("users")}
        >
          <FaUser size={20} />
        </button>
        <button
          className={`p-3 rounded transition-colors ${activeTab === "terminal" ? "bg-gray-700" : "hover:bg-gray-700"}`}
          onClick={() => handleTabClick("terminal")}
        >
          <FaTerminal size={20} />
        </button>
      </div>

      {/* Expandable Content */}
      <div className={`bg-gray-800 text-white transition-all ${activeTab ? "w-90" : "w-0"} overflow-hidden`}>
        {activeTab === "files" && (
          <div className="p-4">
            <h2 className="text-lg font-semibold mb-2">Uploaded Files</h2>
            {folderName ? (
              <p className="text-blue-400 font-semibold mb-2">Folder: {folderName}</p>
            ) : (
              <FileUploader
                getRootProps={getRootProps}
                getInputProps={getInputProps}
                handleUpload={onFileUpload}
              />

            )}

            <FileTree ydoc ={ydoc} CodeEditor = {CodeEditor} onFileClick = {onSelectFile}/>
           
          </div>
        )}

        {activeTab === "chat" && (
          <ChatBox
            username={username}
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
        {activeTab === "terminal" && <CodeTerminal editorRef={editorRef} language={language} />}
      </div>
    </div>
  );
};

export default SlideBar;


