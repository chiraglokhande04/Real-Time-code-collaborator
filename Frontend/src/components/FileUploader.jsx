// import React from "react";

// const FileUploader = ({ onUpload }) => {
//   const handleFileChange = (event) => {
//     const files = Array.from(event.target.files);
//     onUpload(files);
//   };

//   return (
//     <div className="border p-4 text-center bg-gray-900 text-white">
//       {/* Folder Upload Input */}
//       <input
//         type="file"
//         webkitdirectory="true"
//         directory="true"
//         multiple
//         onChange={handleFileChange}
//         className="hidden"
//         id="folderUpload"
//       />

//       {/* Label to Trigger Folder Selection */}
//       <label htmlFor="folderUpload" className="cursor-pointer block p-4">
//         <p>Click to upload a folder</p>
//       </label>
//     </div>
//   );
// };

// export default FileUploader;

import React, { useState } from "react";

const FileUploader = ({ getRootProps, getInputProps, onSelectFile }) => {
  const [files, setFiles] = useState([]);

  const handleFileUpload = (event) => {
    const uploadedFiles = event.target.files;
    const fileList = Array.from(uploadedFiles);
    setFiles(fileList);
    onSelectFile(fileList);
  };

  return (
    <div {...getRootProps()} className="p-4">
      <input {...getInputProps()} onChange={handleFileUpload} />
      <p>Drag & drop files here, or click to select</p>
      <ul>
        {files.map((file, index) => (
          <li key={index}>{file.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default FileUploader;

