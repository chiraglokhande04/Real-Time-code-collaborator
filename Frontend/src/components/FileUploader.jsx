import React from "react";
import { FaFolderOpen } from "react-icons/fa"; // Optional: For folder icon

export default function FileUploader({ handleUpload }) {
  return (
    <div className="flex justify-center items-center w-full py-6">
      {/* Hidden Input for folder selection */}
      <input
        type="file"
        id="folderUpload"
        webkitdirectory="true"
        directory="true"
        multiple
        onChange={handleUpload}
        className="hidden"
      />

      {/* Styled Label to trigger file input */}
      <label
        htmlFor="folderUpload"
        className="flex items-center gap-3 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg cursor-pointer shadow-md transition-all duration-200"
      >
        <FaFolderOpen className="text-xl" />
        <span>Upload Folder</span>
      </label>
    </div>
  );
}
