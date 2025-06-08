
import React, { useState, useEffect, useRef } from "react";
import { FaPaperPlane } from "react-icons/fa";

<<<<<<< HEAD
const ChatBox = ({
  roomId,
  username,
  messages,
  setMessages,
  setUnreadCount,
  isOpen,
}) => {
  const [message, setMessage] = useState("");
=======
const ChatBox = ({ 
  roomId, 
  username, 
  messages, 
  setMessages, 
  setUnreadCount, 
  isOpen,
  sendMessage // Receive the sendMessage function from props
}) => {
  const [messageText, setMessageText] = useState("");
>>>>>>> main
  const [users, setUsers] = useState([]);
  const messagesEndRef = useRef(null);
  
  // Get users list from parent component via socket
  useEffect(() => {
<<<<<<< HEAD
    if (!socket || !roomId) return;

    const loadMessages = (history) => {
      setMessages(history);
    };

    const receiveMessage = (newMessage) => {
      setMessages((prevMessages) => [...prevMessages, newMessage]);
      if (!isOpen) {
        setUnreadCount((prev) => prev + 1);
      }
    };

    const updateUsers = (userList) => {
      setUsers(userList);
    };

    socket.on("loadMessages", loadMessages);
    socket.on("newMessage", receiveMessage);
    socket.on("updateUsers", updateUsers);

    return () => {
      socket.off("loadMessages", loadMessages);
      socket.off("newMessage", receiveMessage);
      socket.off("updateUsers", updateUsers);
    };
  }, [socket, roomId, isOpen, setMessages, setUnreadCount]);

  // 🔥 emit chat open/close toggle to server when 'isOpen' changes
  useEffect(() => {
    if (socket && roomId) {
      socket.emit("toggle", isOpen); // Emit toggle event
    }
  }, [isOpen, socket, roomId]);

  const sendMessage = () => {
    if (message.trim() === "") return;

    const newMessage = { roomId, sender: username, message };
    socket.emit("sendMessage", newMessage); // 🔹 Just emit, don’t add locally

    setMessage(""); // ✅ Just clear input, do not push into state here
  };
=======
    // This would be handled in the MainPage component now
  }, []);
  
  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (messageText.trim() === "") return;
    
    // Call the sendMessage function passed down from parent
    sendMessage(messageText);
    
    // Clear the input field
    setMessageText("");
  };
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };
>>>>>>> main

  return (
    <div className="flex flex-col h-[550px] p-4 bg-gray-800 text-white">
      <div className="bg-gray-900 p-2 rounded text-center mb-4">
        <strong>Connected Users:</strong>{" "}
        {users.map((user) => user.username).join(", ")}
      </div>

      <div className="flex-1 overflow-y-auto mb-2 p-2">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`mb-2 p-2 rounded ${
              msg.sender === username
                ? "bg-blue-500 text-white text-right"
                : "bg-gray-700 text-left"
            }`}
          >
            <span className="font-bold">{msg.sender}: </span>
            <span>{msg.message}</span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex items-center border-t border-gray-700 p-2 gap-1">
        <input
          type="text"
          className="flex-1 bg-gray-700 w-[180px] p-2 rounded text-white outline-none"
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
        />
        <button 
          className="mr-2 p-2 bg-blue-500 rounded" 
          onClick={handleSendMessage}
        >
          <FaPaperPlane />
        </button>
      </div>
    </div>
  );
};

<<<<<<< HEAD
export default ChatBox;
=======
export default ChatBox;
>>>>>>> main
