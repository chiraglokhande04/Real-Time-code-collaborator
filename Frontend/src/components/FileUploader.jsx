import React from "react";
import axios from "axios";

export default function FileUploader({ roomId }) {
  const handleUpload = async (e) => {
    const files = Array.from(e.target.files);
    const formData = new FormData();

    // IMPORTANT: preserve webkitRelativePath
    files.forEach((file) => {
      formData.append("files", new File([file], file.webkitRelativePath, { type: file.type }));
      // formData.append("files", file, file.webkitRelativePath);


    });

    formData.append("roomId", roomId);

    await axios.post("http://localhost:3000/api/files/upload", formData);
  };

  return (
    <div>
      <input
        type="file"
        webkitdirectory="true"
        directory="true"
        multiple
        onChange={handleUpload}
      />
    </div>
  );
}

