import React from "react";

const FileTree = ({ files, onSelectFile }) => {
  return (
    <div className="text-white">
      <h3 className="text-lg font-semibold mb-2">Files</h3>
      <ul>
        {files.map((file, index) => (
          <li
            key={index}
            className="cursor-pointer p-1 hover:bg-gray-700"
            onClick={() => onSelectFile(file)}
          >
            {file.name}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FileTree;
