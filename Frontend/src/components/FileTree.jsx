import React, { useEffect, useState } from "react";
import { FiChevronRight, FiChevronDown } from "react-icons/fi"; // Chevron icons

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

function FolderTree({ tree, onFileClick }) {
  const [expanded, setExpanded] = useState({});

  const toggleFolder = (path) => {
    setExpanded((prev) => ({ ...prev, [path]: !prev[path] }));
  };

  const renderTree = (node, level = 0) => {
    return Object.values(node).map((item) => {
      const isOpen = expanded[item.path];

      return (
        <div key={item.path}>
          <div
            className={`group flex items-center px-2 py-1.5 cursor-pointer text-sm select-none hover:bg-[#2c2c2c] transition`}
            style={{
              paddingLeft: `${level * 16 + 8}px`,
              color: item.isFolder ? "#cccccc" : "#eeeeee",
              fontWeight: item.isFolder ? 500 : 400,
              borderBottom: "1px solid #1f1f1f",
              fontFamily: "Consolas, 'Courier New', monospace",
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
                <FiChevronDown className="mr-1 text-gray-400" size={14} />
              ) : (
                <FiChevronRight className="mr-1 text-gray-400" size={14} />
              )
            ) : (
              <span className="w-[14px] mr-1" />
            )}
            <span className="truncate">{item.name}</span>
          </div>
          {item.isFolder && isOpen && renderTree(item.children, level + 1)}
        </div>
      );
    });
  };

  return <div>{renderTree(tree)}</div>;
}

export default function FileTree({ ydoc, onFileClick }) {
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

    foldersMap.observeDeep(updateTree);
    return () => {
      foldersMap.unobserveDeep(updateTree);
    };
  }, [foldersMap]);

  return (
    <div className="bg-[#1e1e1e] text-white h-screen overflow-y-auto border-r border-[#2a2a2a]">
      <div className="px-3 py-2 text-xs text-gray-400 font-semibold border-b border-[#2a2a2a]">
        EXPLORER
      </div>
      <div className="pb-2">
        <FolderTree tree={tree} onFileClick={onFileClick} />
      </div>
    </div>
  );
}
