// import { useState } from "react";
// import Clients from "./Clients";
// import JSZip from "jszip";
// import { saveAs } from "file-saver";
// import * as Y from "yjs"; // ✅ Needed for instanceof checks

// const Navbar = ({ id, leaveRoom, ydoc }) => {
//   const [copied, setCopied] = useState(false);
//   const [downloading, setDownloading] = useState(false);

//   const copyRoomId = () => {
//     if (typeof id === "string") {
//       navigator.clipboard.writeText(id);
//       setCopied(true);
//       setTimeout(() => setCopied(false), 2000);
//     }
//   };

//   // Recursively build folder tree from Y.Map
//   const buildFolderTreeFromYMap = (yMap) => {
//     const tree = {};
//     yMap.forEach((value, key) => {
//       if (value instanceof Y.Map) {
//         tree[key] = {
//           type: "folder",
//           children: buildFolderTreeFromYMap(value),
//         };
//       } else if (value instanceof Y.Text) {
//         tree[key] = {
//           type: "file",
//           content: value.toString(), // ✅ Reads actual text content
//         };
//       }
//     });
//     return tree;
//   };

//   // Recursively add folders & files to ZIP
//   const addFolderToZip = (zipFolder, currentNode) => {
//     for (const [name, value] of Object.entries(currentNode)) {
//       if (value.type === "folder") {
//         const newFolder = zipFolder.folder(name);
//         addFolderToZip(newFolder, value.children);
//       } else if (value.type === "file") {
//         zipFolder.file(name, value.content || ""); // ✅ Ensure not undefined
//       }
//     }
//   };

//   const downloadCode = async () => {
//     if (!ydoc) return alert("No Y.Doc found!");
//     setDownloading(true);

//     console.log('ydoc:', ydoc);

//     try {
//       const rootMap = ydoc.getMap("root"); // Change "root" if your top-level map is different
//       console.log("Root map:", rootMap);
//       const folderTree = buildFolderTreeFromYMap(rootMap);
//       console.log("Folder tree:", folderTree);

//       const zip = new JSZip();
//       addFolderToZip(zip, folderTree);

//       const blob = await zip.generateAsync({ type: "blob" });
//       saveAs(blob, "project.zip");
//     } catch (err) {
//       console.error("Error creating zip:", err);
//       alert("Failed to download code");
//     }

//     setDownloading(false);
//   };

//   return (
//     <div className="w-full h-20 bg-gray-900 text-white px-6 flex justify-between items-center shadow-md">
//       {/* Left Section - Room ID */}
//       <div className="flex items-center space-x-4">
//         <span className="bg-gray-800 text-sm px-3 py-1 rounded-full border border-gray-700">
//           Room ID: {typeof id === "string" ? id : JSON.stringify(id)}
//         </span>

//         <button
//           onClick={copyRoomId}
//           className="bg-blue-600 hover:bg-blue-700 transition-colors px-3 py-1.5 text-sm rounded-md"
//         >
//           📋 {copied ? "Copied!" : "Copy"}
//         </button>
//       </div>

//       {/* Right Section - Download + Leave */}
//       <div className="flex items-center space-x-3">
//         <button
//           onClick={downloadCode}
//           disabled={downloading}
//           className="bg-green-600 hover:bg-green-700 transition-colors px-4 py-1.5 text-sm rounded-md"
//         >
//           {downloading ? "Downloading..." : "⬇️ Download Code"}
//         </button>

//         <button
//           onClick={leaveRoom}
//           className="bg-red-600 hover:bg-red-700 transition-colors px-4 py-1.5 text-sm rounded-md"
//         >
//           Leave Room
//         </button>
//       </div>
//     </div>
//   );
// };

// export default Navbar;



import { useState } from "react";

import JSZip from "jszip";
import { saveAs } from "file-saver";
import { IoCodeDownloadOutline } from "react-icons/io5";

const Navbar = ({ id, leaveRoom, ydoc }) => {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const copyRoomId = () => {
    if (typeof id === "string") {
      navigator.clipboard.writeText(id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const downloadCode = async () => {
  if (!ydoc) {
    alert("No Yjs document found!");
    return;
  }

  const foldersMap = ydoc.getMap("folders");
  const filesMap = ydoc.getMap("files");
  const zip = new JSZip();

  // Recursive function to add folders/files to zip
  async function addEntriesToZip(zipFolder, pathPrefix = "") {
    // Find all entries whose path starts with pathPrefix and are immediate children
    const entries = [];
    foldersMap.forEach((meta, path) => {
      if (path.startsWith(pathPrefix)) {
        // get immediate child relative path part
        const rest = path.slice(pathPrefix.length);
        if (rest === "") return; // skip self
        if (!rest.includes("/")) {
          entries.push({ path, meta });
        }
      }
    });

    for (const entry of entries) {
      const { path, meta } = entry;
      if (meta.isFolder) {
        // create folder and recurse
        const folderName = meta.filename || path.split("/").slice(-1)[0];
        const newFolder = zipFolder.folder(folderName);
        await addEntriesToZip(newFolder, path + "/");
      } else {
        // It's a file, get content from filesMap or fetch from cloudUrl
        let content = "";

        if (filesMap.has(path)) {
          // content stored in Y.Text
          const yText = filesMap.get(path);
          content = yText.toString();
        } else if (meta.cloudUrl) {
          try {
            const res = await fetch(meta.cloudUrl);
            if (res.ok) {
              content = await res.text();
            } else {
              console.warn("Failed to fetch file content:", meta.cloudUrl);
            }
          } catch (err) {
            console.warn("Error fetching file content:", err);
          }
        } else {
          console.warn("No content found for file:", path);
        }

        zipFolder.file(meta.filename || path.split("/").slice(-1)[0], content);
      }
    }
  }

  await addEntriesToZip(zip);

  const blob = await zip.generateAsync({ type: "blob" });
  saveAs(blob, "project.zip");
};

  return (
    <div className="w-full h-20 bg-gray-900 text-white px-6 flex justify-between items-center shadow-md">
      {/* Left Section - Room ID */}
      <div className="flex items-center space-x-4">
        <span className="bg-gray-800 text-sm px-3 py-1 rounded-full border border-gray-700">
          Room ID: {typeof id === "string" ? id : JSON.stringify(id)}
        </span>

        <button
          onClick={copyRoomId}
          className="bg-blue-600 hover:bg-blue-700 transition-colors px-3 py-1.5 text-sm rounded-md"
        >
          📋 {copied ? "Copied!" : "Copy"}
        </button>
      </div>

      {/* Right Section - Download + Leave */}
      <div className="flex items-center space-x-3">
        <button
          onClick={downloadCode}
          disabled={downloading}
          className="bg-green-600 hover:bg-green-700 transition-colors px-4 py-1.5 text-sm rounded-md"
        >
          {downloading ? "Downloading..." : (<div className='flex items-center gap-x-1'> <span>Download Code</span><IoCodeDownloadOutline className='text-xl' /></div>)}
        </button>

        <button
          onClick={leaveRoom}
          className="bg-red-600 hover:bg-red-700 transition-colors px-4 py-1.5 text-sm rounded-md"
        >
          Leave Room
        </button>
      </div>
    </div>
  );
};

export default Navbar;
