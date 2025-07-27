import React, { useEffect, useState } from "react";

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
          cloudUrl : value.cloudUrl || null,
          fileId : value.fileId || null,
        };
      }

      current = current[part].children;
    });
  });

  return tree;
}


function FolderTree({ tree, onFileClick }) {
  const [expanded, setExpanded] = useState({});

  const toggleFolder = (path) => {
    setExpanded((prev) => ({ ...prev, [path]: !prev[path] }));
  };

  const renderTree = (node) => {
    return Object.values(node).map((item) => (
      <div key={item.path} style={{ marginLeft: 20 }}>
        <span
          style={{ cursor: item.isFolder ? "pointer" : "default", userSelect: "none" }}
          onClick={() => {
            if (item.isFolder) toggleFolder(item.path);
            else { console.log("File clicked:", item);
              onFileClick(item)};
          }}
        >
          {item.isFolder ? (expanded[item.path] ? "📂" : "📁") : "📄"} {item.name}
        </span>
        {item.isFolder && expanded[item.path] && renderTree(item.children)}
      </div>
    ));
  };

  return <div>{renderTree(tree)}</div>;
}


export default function FileTree({ ydoc,onFileClick }) {
  const foldersMap = ydoc.getMap("folders");

  const [tree, setTree] = useState({});

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
  
    foldersMap.observeDeep(updateTree); // use observeDeep for nested changes
  
    return () => {
      foldersMap.unobserveDeep(updateTree);
    };
  }, [foldersMap]);
  

  return (
    <div style={{ display: "flex", height: "100vh" }}>
    
        {/* <h3>📁 Folder Structure</h3> */}
        <FolderTree tree={tree} onFileClick={onFileClick} />
      </div>

   
  );
}

