// import React, { useState } from "react";
// import { FaFileAlt, FaComment, FaVideo } from "react-icons/fa";
// import { useDropzone } from "react-dropzone";
// import ChatBox from "./ChatBox";
// import VoiceCall from "./VoiceCall";

// const SlideBar = ({ activeTab, handleTabClick, onFileUpload, files, onSelectFile }) => {
//   const [messages, setMessages] = useState([]);
//   const [newMessage, setNewMessage] = useState("");

//   const handleDrop = (acceptedFiles) => {
//     onFileUpload(acceptedFiles);
//   };

//   const { getRootProps, getInputProps } = useDropzone({ onDrop: handleDrop });

//   // Send message handler
//   const sendMessage = () => {
//     if (newMessage.trim()) {
//       setMessages([...messages, { text: newMessage, sender: "You" }]);
//       setNewMessage("");
//     }
//   };

//   return (
//     <div className="flex h-full">
//       {/* Sidebar Icons */}
//       <div className="bg-gray-900 text-white flex flex-col items-center py-4 w-12">
//         <button className="p-3 hover:bg-gray-700 rounded" onClick={() => handleTabClick("files")}>
//           <FaFileAlt size={20} />
//         </button>
//         <button className="p-3 hover:bg-gray-700 rounded" onClick={() => handleTabClick("chat")}>
//           <FaComment size={20} />
//         </button>
//         <button className="p-3 hover:bg-gray-700 rounded" onClick={() => handleTabClick("video")}>
//           <FaVideo size={20} />
//         </button>
//       </div>

//       {/* Expandable Content */}
//       <div className={`bg-gray-800 text-white transition-all ${activeTab ? "w-64" : "w-0"} overflow-hidden`}>
//         {/* File Manager */}
//         {activeTab === "files" && (
//           <div className="p-3">
//             <div {...getRootProps()} className="border-dashed border-2 border-gray-600 p-4 text-center cursor-pointer">
//               <input {...getInputProps()} />
//               <p className="text-gray-400">Drag & Drop files or Click to Upload</p>
//             </div>
//             <ul className="mt-4">
//               {files.map((file, index) => (
//                 <li key={index} className="cursor-pointer p-2 hover:bg-gray-700" onClick={() => onSelectFile(file)}>
//                   {file.name}
//                 </li>
//               ))}
//             </ul>
//           </div>
//         )}

//         {/* Chat UI */}
//         {activeTab === "chat" && <ChatBox/>}

//         {/* Video Call */}
//         {activeTab === "video" && <VoiceCall/>}
//       </div>
//     </div>
//   );
// };

// export default SlideBar;

import React, { useState } from "react";
import { FaFileAlt, FaComment, FaVideo } from "react-icons/fa";
import { useDropzone } from "react-dropzone";
import ChatBox from "./ChatBox";
import VoiceCall from "./VoiceCall";
import FileUploader from "./FileUploader";

const SlideBar = ({ activeTab, handleTabClick, onFileUpload, onSelectFile,roomId ,username}) => {
  const { getRootProps, getInputProps } = useDropzone({
    onDrop: onFileUpload,
    multiple: true,
    webkitdirectory: true,
    directory: true,
  });

  return (
    <div className="flex h-full">
      {/* Sidebar Icons */}
      <div className="bg-gray-900 text-white flex flex-col items-center py-4 w-14">
        <button className={`p-3 rounded transition-colors ${activeTab === "files" ? "bg-gray-700" : "hover:bg-gray-700"}`} onClick={() => handleTabClick("files")}>
          <FaFileAlt size={20} />
        </button>
        <button className={`p-3 rounded transition-colors ${activeTab === "chat" ? "bg-gray-700" : "hover:bg-gray-700"}`} onClick={() => handleTabClick("chat")}>
          <FaComment size={20} />
        </button>
        <button className={`p-3 rounded transition-colors ${activeTab === "video" ? "bg-gray-700" : "hover:bg-gray-700"}`} onClick={() => handleTabClick("video")}>
          <FaVideo size={20} />
        </button>
      </div>

      {/* Expandable Content */}
      <div className={`bg-gray-800 text-white transition-all ${activeTab ? "w-64" : "w-0"} overflow-hidden`}>        
        {activeTab === "files" && <FileUploader  getRootProps={getRootProps} getInputProps={getInputProps} onSelectFile={onSelectFile} onUpload={onFileUpload} />}
        {activeTab === "chat" && <ChatBox username={username} roomId = {roomId}/>}
        {activeTab === "video" && <VoiceCall />}
      </div>
    </div>
  );
};

export default SlideBar;
