import { useState, useEffect } from "react";
import Clients from "./Clients";

const Navbar = ({ id, users = [] }) => {
  const [copied, setCopied] = useState(false);

  const copyRoomId = () => {
    if (typeof id === "string") {
      navigator.clipboard.writeText(id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
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

    </div>
  );
};

export default Navbar;
