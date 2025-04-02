import React, { useState, useEffect } from "react";
import { useSocket } from "../context/socketContext";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";

const JoinRoom = () => {
  const [roomId, setRoomId] = useState("");
  const [username, setUsername] = useState("");
  const socket = useSocket(); // ✅ Use global socket reference
  const navigate = useNavigate();

  useEffect(() => {
    if (!socket) return;

    const handleRoomJoined = (roomId) => {
      console.log("✅ Received roomId:", roomId);
      toast.success("🎉 Room Joined!");
      navigate(`/room/${roomId}`);
    };

    socket.on("room-joined", handleRoomJoined);
    return () => {
      socket.off("room-joined", handleRoomJoined);
    };
  }, [socket, navigate]);

  const joinRoom = () => {
    if (!socket) {
      toast.error("⚠️ Socket not connected!");
      return;
    }
  
    const trimmedUsername = username.trim();
    const trimmedRoomId = roomId.trim();
  
    if (!trimmedUsername || !trimmedRoomId) {
      toast.error("⚠️ Username and Room ID are required!");
      return;
    }
  
    console.log("📡 Emitting join-room:", { username: trimmedUsername, roomId: trimmedRoomId });
  
    socket.emit("join-room", trimmedUsername, trimmedRoomId); // Ensure correct format
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-900 text-white">
      <Toaster />
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-96 text-center">
        <h2 className="text-2xl font-semibold my-4">Join a Room</h2>

        <input
          type="text"
          placeholder="Enter Username"
          className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="text"
          placeholder="Enter Room ID"
          className="w-full p-2 mt-3 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
        />

        <div className="mt-6">
          <button
            onClick={joinRoom}
            className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded-lg w-full"
          >
            Join Room
          </button>
        </div>
      </div>
    </div>
  );
};

export default JoinRoom;
