// import React, { useEffect, useState } from "react";
// import { FiChevronRight, FiChevronDown } from "react-icons/fi"; // Chevron icons

// function buildTreeFromMap(foldersObj) {
//   const tree = {};

//   Object.entries(foldersObj).forEach(([fullPath, value]) => {
//     const parts = fullPath.split("/");
//     let current = tree;

//     parts.forEach((part, index) => {
//       const isFile = index === parts.length - 1 && !value.isFolder;

//       if (!current[part]) {
//         current[part] = {
//           name: part,
//           path: parts.slice(0, index + 1).join("/"),
//           isFolder: !isFile,
//           children: {},
//           cloudUrl: value.cloudUrl || null,
//           fileId: value.fileId || null,
//         };
//       }

//       current = current[part].children;
//     });
//   });

//   return tree;
// }

// function FolderTree({ tree, onFileClick }) {
//   const [expanded, setExpanded] = useState({});

//   const toggleFolder = (path) => {
//     setExpanded((prev) => ({ ...prev, [path]: !prev[path] }));
//   };

//   const renderTree = (node, level = 0) => {
//     return Object.values(node).map((item) => {
//       const isOpen = expanded[item.path];

//       return (
//         <div key={item.path}>
//           <div
//             className={`group flex items-center px-2 py-1.5 cursor-pointer text-sm select-none hover:bg-[#2c2c2c] transition`}
//             style={{
//               paddingLeft: `${level * 16 + 8}px`,
//               color: item.isFolder ? "#cccccc" : "#eeeeee",
//               fontWeight: item.isFolder ? 500 : 400,
//               borderBottom: "1px solid #1f1f1f",
//               fontFamily: "Consolas, 'Courier New', monospace",
//             }}
//             onClick={() => {
//               if (item.isFolder) {
//                 toggleFolder(item.path);
//               } else {
//                 onFileClick(item);
//               }
//             }}
//           >
//             {item.isFolder ? (
//               isOpen ? (
//                 <FiChevronDown className="mr-1 text-gray-400" size={14} />
//               ) : (
//                 <FiChevronRight className="mr-1 text-gray-400" size={14} />
//               )
//             ) : (
//               <span className="w-[14px] mr-1" />
//             )}
//             <span className="truncate">{item.name}</span>
//           </div>
//           {item.isFolder && isOpen && renderTree(item.children, level + 1)}
//         </div>
//       );
//     });
//   };

//   return <div>{renderTree(tree)}</div>;
// }

// export default function FileTree({ ydoc, onFileClick }) {
//   const foldersMap = ydoc.getMap("folders");
//   const [tree, setTree] = useState({});

//   useEffect(() => {
//     if (!foldersMap) return;

//     const updateTree = () => {
//       const obj = {};
//       foldersMap.forEach((value, key) => {
//         obj[key] = value;
//       });

//       const treeData = buildTreeFromMap(obj);
//       setTree(treeData);
//     };

//     updateTree();

//     foldersMap.observeDeep(updateTree);
//     return () => {
//       foldersMap.unobserveDeep(updateTree);
//     };
//   }, [foldersMap]);

//   return (
//     <div className="bg-[#1e1e1e] text-white h-screen overflow-y-auto border-r border-[#2a2a2a]">
//       <div className="px-3 py-2 text-xs text-gray-400 font-semibold border-b border-[#2a2a2a]">
//         EXPLORER
//       </div>
//       <div className="pb-2">
//         <FolderTree tree={tree} onFileClick={onFileClick} />
//       </div>
//     </div>
//   );
// }


import { VscNewFile } from "react-icons/vsc";
import { VscNewFolder} from "react-icons/vsc";
import { MdDelete } from "react-icons/md";
import { FaPen } from "react-icons/fa6";

import React, { useEffect, useState } from "react";
import { FiChevronRight, FiChevronDown } from "react-icons/fi";

function buildTreeFromMap(foldersObj) {
  const tree = {};

  Object.entries(foldersObj).forEach(([fullPath, value]) => {
    const parts = fullPath.split("/");
    let current = tree;

    parts.forEach((part, index) => {
      const isFile = index === parts.length - 1 && !value.isFolder;

      if (!current[part]) {
        current[part] = {
          name: part,
          path: parts.slice(0, index + 1).join("/"),
          isFolder: !isFile,
          children: {},
          cloudUrl: value.cloudUrl || null,
          fileId: value.fileId || null,
        };
      }

      current = current[part].children;
    });
  });

  return tree;
}

export default function FileTree({ ydoc, onFileClick }) {
  const foldersMap = ydoc.getMap("folders");
  const [tree, setTree] = useState({});
  const [expanded, setExpanded] = useState({});

  useEffect(() => {
    if (!foldersMap) return;

    const updateTree = () => {
      const obj = {};
      foldersMap.forEach((value, key) => {
        obj[key] = value;
      });
      const treeData = buildTreeFromMap(obj);
      setTree(treeData);
    };

    updateTree();

    foldersMap.observeDeep(updateTree);
    return () => {
      foldersMap.unobserveDeep(updateTree);
    };
  }, [foldersMap]);

  // --- Yjs helpers ---
  const createEntry = (path, isFolder = false) => {
    if (foldersMap.has(path)) {
      alert("Entry already exists: " + path);
      return;
    }
    foldersMap.set(path, { isFolder });
  };

  const deleteEntry = (path) => {
    if (!foldersMap.has(path)) return;
    const keysToDelete = [];
    foldersMap.forEach((_, key) => {
      if (key === path || key.startsWith(path + "/")) {
        keysToDelete.push(key);
      }
    });
    keysToDelete.forEach((key) => foldersMap.delete(key));
  };

  const renameEntry = (oldPath, newPath) => {
    if (!foldersMap.has(oldPath)) {
      alert("Entry does not exist: " + oldPath);
      return;
    }
    if (foldersMap.has(newPath)) {
      alert("New name already exists: " + newPath);
      return;
    }
    const data = foldersMap.get(oldPath);
    deleteEntry(oldPath);
    foldersMap.set(newPath, data);

    // Rename descendants if folder
    foldersMap.forEach((_, key) => {
      if (key.startsWith(oldPath + "/")) {
        const newChildKey = newPath + key.slice(oldPath.length);
        const childData = foldersMap.get(key);
        foldersMap.delete(key);
        foldersMap.set(newChildKey, childData);
      }
    });
  };

  // --- Handlers for buttons ---
  const handleCreateFile = (parentPath) => {
    const fileName = prompt("Enter new file name");
    if (fileName) {
      const fullPath = parentPath ? `${parentPath}/${fileName}` : fileName;
      createEntry(fullPath, false);
      setExpanded((prev) => ({ ...prev, [parentPath]: true }));
    }
  };

  const handleCreateFolder = (parentPath) => {
    const folderName = prompt("Enter new folder name");
    if (folderName) {
      const fullPath = parentPath ? `${parentPath}/${folderName}` : folderName;
      createEntry(fullPath, true);
      setExpanded((prev) => ({ ...prev, [parentPath]: true }));
    }
  };

  const handleDelete = (path) => {
    if (window.confirm(`Delete "${path}"? This will delete all its contents if folder.`)) {
      deleteEntry(path);
    }
  };

  const handleRename = (oldPath) => {
    const newName = prompt("Enter new name", oldPath.split("/").pop());
    if (!newName) return;

    const parentPath = oldPath.includes("/")
      ? oldPath.slice(0, oldPath.lastIndexOf("/"))
      : "";

    const newPath = parentPath ? `${parentPath}/${newName}` : newName;
    renameEntry(oldPath, newPath);
  };

  const toggleFolder = (path) => {
    setExpanded((prev) => ({ ...prev, [path]: !prev[path] }));
  };

  // --- Recursive tree renderer ---
  const renderTree = (node, level = 0) => {
    return Object.values(node).map((item) => {
      const isOpen = expanded[item.path];

      return (
        <div key={item.path}>
          <div
            className="tree-item flex items-center px-2 py-1.5 cursor-pointer text-sm select-none hover:bg-[#2c2c2c] transition"
            style={{
              paddingLeft: `${level * 16 + 8}px`,
              color: item.isFolder ? "#cccccc" : "#eeeeee",
              fontWeight: item.isFolder ? 500 : 400,
              borderBottom: "1px solid #1f1f1f",
              fontFamily: "Consolas, 'Courier New', monospace",
              gap: "6px",
              position: "relative",
            }}
            onClick={() => {
              if (item.isFolder) {
                toggleFolder(item.path);
              } else {
                onFileClick(item);
              }
            }}
          >
            {item.isFolder ? (
              isOpen ? (
                <FiChevronDown className="text-gray-400" size={14} />
              ) : (
                <FiChevronRight className="text-gray-400" size={14} />
              )
            ) : (
              <span style={{ width: 14, display: "inline-block" }} />
            )}
            <span className="truncate flex-1">{item.name}</span>

            {/* Action buttons container */}
            <div
              className="action-buttons"
              style={{
                display: "flex",
                gap: "6px",
                opacity: 0,
                visibility: "hidden",
                transition: "opacity 0.2s ease",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => handleRename(item.path)}
                title="Rename"
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#888",
                  cursor: "pointer",
                }}
              >
                <FaPen className="text-[12px]" />
              </button>

              <button
                onClick={() => handleDelete(item.path)}
                title="Delete"
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#888",
                  cursor: "pointer",
                }}
              >
                <MdDelete />
              </button>

              {item.isFolder && (
                <>
                  <button
                    onClick={() => handleCreateFile(item.path)}
                    title="New File"
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "#888",
                      cursor: "pointer",
                    }}
                  >
                   <VscNewFile />
                  </button>
                  <button
                    onClick={() => handleCreateFolder(item.path)}
                    title="New Folder"
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "#888",
                      cursor: "pointer",
                      marginRight: "8px",
                    }}
                  >
                    <VscNewFolder/>
                  </button>
                </>
              )}
            </div>
          </div>
          {item.isFolder && isOpen && renderTree(item.children, level + 1)}
        </div>
      );
    });
  };

  return (
    <>
      {/* Hover styles for action buttons */}
      <style>{`
        .tree-item:hover .action-buttons {
          opacity: 1 !important;
          visibility: visible !important;
        }
      `}</style>

      <div className="bg-[#1e1e1e] text-white h-screen overflow-y-auto border-r border-[#2a2a2a]">
        <div className="px-3 py-2 text-xs text-gray-400 font-semibold border-b border-[#2a2a2a] flex justify-between items-center">
          <span>EXPLORER</span>
          {/* Root-level create buttons */}
          <div>
            <button
              onClick={() => handleCreateFile("")}
              title="New File"
              style={{
                background: "transparent",
                border: "none",
                color: "#888",
                cursor: "pointer",
                marginRight: "8px",
              }}
            >
             <VscNewFile />
            </button>
            <button
              onClick={() => handleCreateFolder("")}
              title="New Folder"
              style={{
                background: "transparent",
                border: "none",
                color: "#888",
                cursor: "pointer",
              }}
            >
              <VscNewFolder  />
            </button>
          </div>
        </div>
        <div className="pb-2">{renderTree(tree)}</div>
      </div>  
    </>
  );
}
