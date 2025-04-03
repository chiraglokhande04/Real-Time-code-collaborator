import React, { useState, useEffect } from "react";
import { FaPaperPlane } from "react-icons/fa";
import { useSocket } from "../context/socketContext";

const ChatBox = ({ roomId, username }) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const socket = useSocket();

  useEffect(() => {
    if (!socket || !roomId) return;

    // Load chat history
    const handleMessageHistory = (history) => {
      setMessages(history);
    };

    // Listen for new messages
    const handleIncomingMessage = (newMessage) => {
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    };

    // Update connected users
    const handleUserUpdate = (userList) => {
      setUsers(userList);
    };

    socket.on("loadMessages", handleMessageHistory);
    socket.on("new-message", handleIncomingMessage);
    socket.on("update-users", handleUserUpdate);

    return () => {
      socket.off("loadMessages", handleMessageHistory);
      socket.off("new-message", handleIncomingMessage);
      socket.off("update-users", handleUserUpdate);
    };
  }, [socket, roomId]);

  const sendMessage = () => {
    if (message.trim() === "") return;
    const newMessage = { roomId, sender: username, message };
    socket.emit("send-message", newMessage);
    setMessage("");
  };

  return (
    <div className="flex flex-col h-[550px] p-4 bg-gray-800 text-white">
      {/* Navbar Showing Connected Users */}
      <div className="bg-gray-900 p-2 rounded text-center mb-4">
        <strong>Connected Users:</strong> {users.map((user) => user.username).join(", ")}
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto mb-2 p-2">
        {messages.map((msg, index) => (
          <div key={index} className={`mb-2 p-2 rounded ${msg.sender === username ? "bg-blue-500 text-white text-right" : "bg-gray-700 text-left"}`}>
            <span className="font-bold">{msg.sender}: </span>
            <span>{msg.message}</span>
          </div>
        ))}
      </div>

      {/* Input Box */}
      <div className="flex items-center border-t border-gray-700 p-2 gap-1">
        <input
          type="text"
          className="flex-1 bg-gray-700 w-[180px] p-2 rounded text-white outline-none"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
        />
        <button className="mr-2 p-2 bg-blue-500 rounded" onClick={sendMessage}>
          <FaPaperPlane />
        </button>
      </div>
    </div>
  );
};

export default ChatBox;
