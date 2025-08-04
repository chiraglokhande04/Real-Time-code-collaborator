// import React from "react";
// import axios from "axios";

// export default function FileUploader({ roomId }) {
//   const handleUpload = async (e) => {
//     const files = Array.from(e.target.files);
//     const formData = new FormData();

//     // IMPORTANT: preserve webkitRelativePath
//     files.forEach((file) => {
//       formData.append("files", new File([file], file.webkitRelativePath, { type: file.type }));
//       // formData.append("files", file, file.webkitRelativePath);


//     });

//     formData.append("roomId", roomId);

//     await axios.post("http://localhost:3000/api/files/upload", formData);
//   };

//   return (
//     <div>
//       <input
//         type="file"
//         webkitdirectory="true"
//         directory="true"
//         multiple
//         onChange={handleUpload}
//       />
//     </div>
//   );
// }


import React from "react";
import * as Y from "yjs";
// import { io } from "socket.io-client";

// const socket = io("http://localhost:3000"); // Adjust port if needed

export default function FileUploader({handleUpload }) {
  // const foldersMap = ydoc.getMap("folders");
  // const fileContentsMap = ydoc.getMap("fileContents");
 

  // const handleUpload = async (e) => {
  //   const files = Array.from(e.target.files);

  //   for (const file of files) {
  //     const path = file.webkitRelativePath || file.name;

  //     // Store folder metadata
  //     foldersMap.set(path, {
  //       name: file.name,
  //       path: path,
  //       isFolder: false,
  //     });

  //     // Read content
  //     const content = await file.text();
  //     const ytext = new Y.Text();
  //     ytext.insert(0, content);

  //     // Store file content
  //     fileContentsMap.set(path, ytext);
  //   }

  //   // Encode Yjs doc update
  //   const update = Y.encodeStateAsUpdate(ydoc);
  

  //   // Emit update to backend
  //   socket.emit("yjs-update", { roomId, update }, () => {
  //     console.log("Yjs update sent to backend:", update);
  //   });

 
  //   console.log("map ::: ",fileContentsMap);

  //   alert("Files uploaded and synced!");
  // };

  return (
    <div>
      <input
        type="file"
        webkitdirectory="true"
        directory="true"
        multiple
        onChange={handleUpload}
      />

      {/* Label to Trigger Folder Selection */}
      <label htmlFor="folderUpload" className="cursor-pointer block p-4">
        <p>Click to upload a folder</p>
      </label>
    </div>
  );
}

