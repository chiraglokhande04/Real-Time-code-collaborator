import React from "react";



export default function FileTree({ tree}) {
 

  const renderTree = (nodes) => (
    <ul style={{ listStyle: "none", paddingLeft: 20 }}>
      {nodes.map((node) => (
        <li key={node._id}>
          {node.type === "folder" ? "📁" : "📄"} {node.name}
          {node.children && node.children.length > 0 && renderTree(node.children)}
        </li>
      ))}
    </ul>
  );

  return (
    <div>
      <h3>Project Explorer</h3>
      {renderTree(tree)}
    </div>
  );
}
