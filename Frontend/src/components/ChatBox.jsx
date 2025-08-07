import React, { useState, useEffect, useRef } from "react";
import { FaPaperPlane, FaUsers } from "react-icons/fa";

const ChatBox = ({
  roomId,
  userId,
  username,
  messages = [],
  setMessages,
  setUnreadCount,
  isOpen,
  users = [],
  sendMessage,
}) => {
  const [messageText, setMessageText] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (messageText.trim() === "") return;
    sendMessage(messageText);
    setMessageText("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-[560px] max-w-md bg-gray-900 rounded-xl shadow-xl p-5 text-white select-none">
      {/* Connected Users */}
      <div
        className="bg-gray-800 rounded-md px-4 py-3 mb-5 shadow-inner flex items-center gap-3 overflow-x-auto whitespace-nowrap scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-900"
        title={users.length > 0 ? users.map((u) => u.username).join(", ") : undefined}
        aria-label="Connected users list"
      >
        <FaUsers className="text-green-400 text-lg" />
        <span className="text-gray-300 font-semibold">
          {users.length > 0
            ? users.map((user) => user.username).join(", ")
            : "No users connected"}
        </span>
      </div>

      {/* Messages Area */}
      <div
        className="flex-1 overflow-y-auto mb-4 px-3 py-2 space-y-4 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900"
        style={{ scrollBehavior: "smooth" }}
        aria-live="polite"
        aria-relevant="additions"
      >
        {messages.length === 0 && (
          <p className="text-gray-500 italic text-center mt-16 select-none">
            No messages yet. Say hello!
          </p>
        )}
        {messages.map((msg, index) => {
          const isSender = msg.sender?._id === userId;
          return (
            <div
              key={index}
              tabIndex={0}
              className={`max-w-[75%] break-words p-4 rounded-2xl shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500
                ${isSender
                  ? "bg-gradient-to-br from-blue-400 to-blue-500 text-white self-end text-right"
                  : "bg-gradient-to-br from-gray-700 to-gray-800 text-gray-200 self-start text-left border border-gray-600"
                }`}
              aria-label={`${msg.sender?.username || "Unknown"} said: ${msg.message}`}
            >
              {/* Sender name */}
              <div
                className={`mb-2 text-xs font-semibold tracking-wide uppercase select-text ${
                  isSender ? "text-gray-800" : "text-blue-400"
                }`}
              >
                {msg.sender?.username || "Unknown"}
              </div>
              <div className="whitespace-pre-wrap text-base leading-relaxed">
                {msg.message}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="flex items-center gap-3 border-t border-gray-700 pt-3"
      >
        <textarea
          rows={1}
          className="flex-1 resize-none bg-gray-800 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition
            scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-900"
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message..."
          spellCheck={false}
          autoComplete="off"
          aria-label="Type your message"
        />
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 transition rounded-xl p-3 flex items-center justify-center shadow-md"
          aria-label="Send message"
        >
          <FaPaperPlane className="text-white" size={18} />
        </button>
      </form>
    </div>
  );
};

export default ChatBox;
