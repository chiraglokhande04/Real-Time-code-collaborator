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

const SlideBar = ({ activeTab, handleTabClick, onFileUpload, files, onSelectFile }) => {
  const [fileList, setFileList] = useState([]);

  const handleDrop = async (acceptedFiles) => {
    const newFiles = [];

    for (const file of acceptedFiles) {
      if (file.webkitRelativePath) {
        // If it's part of a folder, get the relative path
        newFiles.push({
          name: file.name,
          path: file.webkitRelativePath,
          file: file,
        });
      } else {
        // Normal file upload
        newFiles.push({
          name: file.name,
          path: file.name,
          file: file,
        });
      }
    }

    setFileList((prevFiles) => [...prevFiles, ...newFiles]);
    onFileUpload(newFiles);
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: handleDrop,
    webkitdirectory: true,
    directory: true,
  });

  return (
    <div className="flex h-full">
      {/* Sidebar Icons */}
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

      {/* Expandable Content */}
      <div className={`bg-gray-800 text-white transition-all ${activeTab ? "w-64" : "w-0"} overflow-hidden`}>
        {/* File Manager */}
        {activeTab === "files" && (
          <div className="p-3">
            <div {...getRootProps()} className="border-dashed border-2 border-gray-600 p-4 text-center cursor-pointer">
              <input {...getInputProps()} webkitdirectory="true" directory="true" multiple />
              <p className="text-gray-400">Drag & Drop folders or Click to Upload</p>
            </div>

            {/* Display Uploaded Files */}
            <ul className="mt-4 text-sm">
              {fileList.length > 0 ? (
                fileList.map((file, index) => (
                  <li
                    key={index}
                    className="cursor-pointer p-2 hover:bg-gray-700 border-b border-gray-600"
                    onClick={() => onSelectFile(file)}
                  >
                    📂 {file.path}
                  </li>
                ))
              ) : (
                <p className="text-gray-400 text-sm mt-2">No files uploaded</p>
              )}
            </ul>
          </div>
        )}

        {/* Chat UI */}
        {activeTab === "chat" && <ChatBox />}

        {/* Video Call */}
        {activeTab === "video" && <VoiceCall />}
      </div>
    </div>
  );
};

export default SlideBar;
