import React, { useState, useEffect } from "react";
import { useSocket } from "../context/socketContext";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";

const CreateRoom = () => {
  const [roomId, setRoomId] = useState("");
  const [username, setUsername] = useState("");
  const socket = useSocket();// ✅ Use the global socket reference
  const navigate = useNavigate();

  const createRoom = () => {
    if (!socket) {
      toast.error("⚠️ Socket not connected!");
      return;
    }

    socket.emit("create-room");

    // ✅ Listen for room-created event (only once)
    socket.once("room-created", (roomId) => {
      console.log("✅ Received roomId:", roomId);
      setRoomId(roomId);
      toast.success("🎉 Room Created!");
    });
  };

  useEffect(() => {
    if (roomId !== "") {
      navigate(`/room/${roomId}`);
    }
  }, [roomId]);

  return (
    <div className="flex justify-center items-center h-screen bg-gray-900 text-white">
      <Toaster />
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-96 h-90 text-center">
        <h2 className="text-2xl font-semibold my-4 mt-5">Create or Join a Room</h2>

        <input
          type="text"
          placeholder="Enter Username"
          className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <div className="flex justify-between mt-8">
          <button
            onClick={createRoom}
            className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded-lg"
          >
            Create Room
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateRoom;
