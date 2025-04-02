import React from "react";
import { useDropzone } from "react-dropzone";

const FileUploader = ({ onUpload }) => {
  const onDrop = (acceptedFiles) => {
    onUpload(acceptedFiles);
  };

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  return (
    <div {...getRootProps()} className="border p-4 text-center bg-gray-900 text-white">
      <input {...getInputProps()} />
      <p>Drag & drop files here, or click to select files</p>
    </div>
  );
};

export default FileUploader;
