// import React, { useState } from "react";
// import { FaFileAlt, FaComment, FaVideo } from "react-icons/fa";
// import { useDropzone } from "react-dropzone";
// import ChatBox from "./ChatBox";
// import VoiceCall from "./VoiceCall";
// import FileUploader from "./FileUploader";

// const SlideBar = ({ activeTab, handleTabClick, onFileUpload, files, onSelectFile, roomId, username }) => {
//   const [folderName, setFolderName] = useState(null);

//   const { getRootProps, getInputProps } = useDropzone({
//     onDrop: (acceptedFiles) => {
//       if (acceptedFiles.length > 0) {
//         const firstFilePath = acceptedFiles[0].webkitRelativePath || acceptedFiles[0].name;
//         const extractedFolderName = firstFilePath.split("/")[0]; // Extract folder name
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
//           <button className={`p-3 rounded transition-colors ${activeTab === "files" ? "bg-gray-700" : "hover:bg-gray-700"}`} onClick={() => handleTabClick("files")}>
//             <FaFileAlt size={20} />
//           </button>
//         )}
//         <button className={`p-3 rounded transition-colors ${activeTab === "chat" ? "bg-gray-700" : "hover:bg-gray-700"}`} onClick={() => handleTabClick("chat")}>
//           <FaComment size={20} />
//         </button>
//         <button className={`p-3 rounded transition-colors ${activeTab === "video" ? "bg-gray-700" : "hover:bg-gray-700"}`} onClick={() => handleTabClick("video")}>
//           <FaVideo size={20} />
//         </button>
//       </div>

//       {/* Expandable Content */}
//       <div className={`bg-gray-800 text-white transition-all ${activeTab ? "w-64" : "w-0"} overflow-hidden`}>
//         {activeTab === "files" && (
//           <div className="p-4">
//             <h2 className="text-lg font-semibold mb-2">Uploaded Files</h2>
//             {folderName ? (
//               <p className="text-blue-400 font-semibold mb-2">Folder: {folderName}</p>
//             ) : (
//               <FileUploader getRootProps={getRootProps} getInputProps={getInputProps} onUpload={onFileUpload} />
//             )}
//             <ul>
//               {files.map((file, index) => (
//                 <li
//                   key={index}
//                   className="cursor-pointer hover:bg-gray-700 p-2 rounded"
//                   onClick={() => onSelectFile(file)}
//                 >
//                   {file.name}
//                 </li>
//               ))}
//             </ul>
//           </div>
//         )}

//         {activeTab === "chat" && <ChatBox username={username} roomId={roomId} />}
//         {activeTab === "video" && <VoiceCall />}
//       </div>
//     </div>
//   );
// };

// export default SlideBar;

// 2nd part of the code


import React, { useState } from "react";
import { FaFileAlt, FaComment, FaVideo } from "react-icons/fa";
import { useDropzone } from "react-dropzone";
import ChatBox from "./ChatBox";
import VoiceCall from "./VoiceCall";
import FileUploader from "./FileUploader";

const SlideBar = ({
  activeTab,
  handleTabClick,
  onFileUpload,
  files,
  onSelectFile,
  roomId,
  username,
  messages,
  setMessages,
  unreadCount,
  setUnreadCount,
  toggleChat,
  chatNotification,
}) => {
  const [folderName, setFolderName] = useState(null);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        const firstFilePath =
          acceptedFiles[0].webkitRelativePath || acceptedFiles[0].name;
        const extractedFolderName = firstFilePath.split("/")[0]; // Extract folder name
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
            className={`p-3 rounded transition-colors ${
              activeTab === "files" ? "bg-gray-700" : "hover:bg-gray-700"
            }`}
            onClick={() => handleTabClick("files")}
          >
            <FaFileAlt size={20} />
          </button>
        )}
        <button
          className={`relative p-3 rounded transition-colors ${
            activeTab === "chat" ? "bg-gray-700" : "hover:bg-gray-700"
          }`}
          onClick={() => {
            handleTabClick("chat");
            setUnreadCount(0); // Reset on open
          }}
        >
          <FaComment size={20} />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 bg-red-600 text-white text-xs px-1 rounded-full">
              {unreadCount}
            </span>
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
      </div>

      {/* Expandable Content */}
      <div
        className={`bg-gray-800 text-white transition-all ${
          activeTab ? "w-64" : "w-0"
        } overflow-hidden`}
      >
        {activeTab === "files" && (
          <div className="p-4">
            <h2 className="text-lg font-semibold mb-2">Uploaded Files</h2>
            {folderName ? (
              <p className="text-blue-400 font-semibold mb-2">
                Folder: {folderName}
              </p>
            ) : (
              <FileUploader
                getRootProps={getRootProps}
                getInputProps={getInputProps}
                onUpload={onFileUpload}
              />
            )}
            <div className="max-h-40 overflow-y-auto border border-gray-600 rounded p-2">
              <ul>
                {files.map((file, index) => (
                  <li
                    key={index}
                    className="cursor-pointer hover:bg-gray-700 p-2 rounded"
                    onClick={() => onSelectFile(file)}
                  >
                    {file.name}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {activeTab === "chat" && (
          <ChatBox
            username={username}
            roomId={roomId}
            messages={messages}
            setMessages={setMessages}
            setUnreadCount={setUnreadCount}
            isOpen={activeTab === "chat"}
          />
        )}
        {activeTab === "video" && <VoiceCall />}
      </div>
    </div>
  );
};

export default SlideBar;

