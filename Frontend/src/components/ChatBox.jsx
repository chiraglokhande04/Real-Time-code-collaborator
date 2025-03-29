import React, { useState, useRef, useEffect } from "react";

const ChatBox = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const chatEndRef = useRef(null);

  // Scroll to bottom when a new message is added
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;

    setMessages([...messages, { text: input, sender: "user" }]);
    setInput("");

    // Simulate bot response
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { text: "This is a bot response!", sender: "bot" },
      ]);
    }, 1000);
  };

  return (
    <div className="flex flex-col w-96 h-135 border border-gray-700 rounded-lg bg-gray-900">
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`p-2 rounded-lg text-sm max-w-[75%] ${
              msg.sender === "user"
                ? "bg-blue-500 text-white self-end ml-auto"
                : "bg-gray-700 text-gray-200 self-start"
            }`}
          >
            {msg.text}
          </div>
        ))}
        <div ref={chatEndRef}></div>
      </div>

      {/* Input Field (Fixed at Bottom) */}
      <div className=" p-2  bg-gray-800 border-t border-gray-700 flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          className="w-45 ml-2 bg-gray-700 text-white p-2 rounded-lg outline-none"
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button
          onClick={sendMessage}
          className="px-3 py-2 mr-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatBox;
