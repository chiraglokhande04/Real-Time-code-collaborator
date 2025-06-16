
import React, { useState, useEffect } from "react";
import { Code, Users, ArrowRight, Sparkles, Terminal, Coffee, Code2 } from "lucide-react";
import { useSocket } from "../context/socketContext";
import { useNavigate, Link } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";

const CreateRoom = () => {
  const [roomId, setRoomId] = useState("");
  const [roomName, setRoomName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const socket = useSocket(); // ✅ Use the global socket reference
  const navigate = useNavigate();

  const createRoom = () => {
    console.log("🟢 Creating room with name:", roomName);
    if (!socket) {
      toast.error("⚠️ Socket not connected!");
      console.log("❌ Socket not connected");
      return;
    }

    socket.emit("create-room", roomName);
    console.log("🟢 Emitted create-room event with roomName:", roomName);

    // ✅ Listen for room-created event (only once)
    socket.once("room-created", ({ roomId,roomName, folder, members }) => {
      console.log("✅ Received roomId:", roomId);
      setRoomId(roomId);
    
      // Optional: Store folder content or members if needed
      // setFolder(folder);
      // setMembers(members);
    
      toast.success("🎉 Room Created!");
    });
  };

  useEffect(() => {
    if (roomId !== "") {
      navigate(`/room/${roomId}`);
    }
  }, [roomId]);


  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-4 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-8 -right-4 w-72 h-72 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 w-full max-w-4xl">
        {/* Header */}
        <header className="relative -top-24 -left-64 z-10 flex justify-between items-center p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
              <Code2 className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">
              Coddy
            </span>
          </div>
        </header>

        {/* Main Card */}
        <div className="bg-slate-800/70 backdrop-blur-xl border border-slate-700/50 rounded-3xl shadow-2xl p-8 mx-auto max-w-md">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-cyan-400 mr-2" />
              <h2 className="text-2xl font-semibold text-white">Get Started</h2>
            </div>
            <p className="text-slate-400">Enter your details to begin collaboration</p>
          </div>

          {/* Username Input */}
          {/* <div className="mb-6">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Username
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Enter your username"
                className="w-full p-4 rounded-xl bg-slate-700/50 border border-slate-600/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 text-white placeholder-slate-400 transition-all duration-200"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <Terminal className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            </div>
          </div> */}

          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Enter Room Name
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Enter your Room Name"
                className="w-full p-4 rounded-xl bg-slate-700/50 border border-slate-600/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 text-white placeholder-slate-400 transition-all duration-200"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
              />
              <Terminal className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            <button
              onClick={createRoom}
              disabled={isLoading}
              className="w-full group relative overflow-hidden bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              <div className="flex items-center justify-center">
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                    Creating Room...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2 group-hover:animate-pulse" />
                    Create New Room
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </div>
            </button>

            <Link
              to="/joinroom"
              className="w-full group  text-white font-semibold py-4 px-6 transition-all duration-300 transform hover:scale-105"
            >
              <div className="flex items-center justify-center">
                <Users className="w-5 h-5 mr-2" />
                Join Existing Room
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-slate-500 text-sm">
            Built for developers, by developers. Start collaborating in seconds.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CreateRoom;