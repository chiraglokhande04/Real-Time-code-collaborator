import React, { useState } from "react";
import { Code2, Users, Rocket } from "lucide-react";
import { useNavigate } from "react-router-dom";

const LandingPage = () => {
  const [isSignInOpen, setIsSignInOpen] = useState(false);

  const navigate = useNavigate();

  const handleCreateRoom = () => {
   navigate("/createroom");
  };

  const handleJoinRoom = () => {
    navigate("/joinroom");
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative">
      {/* Code snippets background */}
      <div className="absolute inset-0 overflow-hidden opacity-20">
        <div className="absolute top-10 left-10 text-green-400 font-mono text-sm transform rotate-12">
          <pre>{`const magic = await collaborate();`}</pre>
        </div>
        <div className="absolute top-32 right-20 text-cyan-400 font-mono text-sm transform -rotate-6">
          <pre>{`function realTime() { return "🔥"; }`}</pre>
        </div>
        <div className="absolute bottom-40 left-20 text-purple-400 font-mono text-sm transform rotate-6">
          <pre>{`npm install collaboration`}</pre>
        </div>
        <div className="absolute top-1/2 right-10 text-blue-400 font-mono text-sm transform -rotate-12">
          <pre>{`// Code together, ship faster`}</pre>
        </div>
        <div className="absolute bottom-20 right-1/3 text-yellow-400 font-mono text-sm transform rotate-3">
          <pre>{`git commit -m "Amazing teamwork"`}</pre>
        </div>
        <div className="absolute top-20 left-1/3 text-pink-400 font-mono text-sm transform -rotate-3">
          <pre>{`export { Innovation } from "team";`}</pre>
        </div>
        <div className="absolute bottom-1/3 left-1/2 text-teal-400 font-mono text-sm transform rotate-12">
          <pre>{`const [users, setUsers] = useState([]);`}</pre>
        </div>
      </div>

      {/* Purple glow overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-900/30 via-transparent to-blue-900/30"></div>

      {/* Header with logo */}
      <header className="relative z-10 flex justify-between items-center p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
            <Code2 className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold text-white">
            Coddy
          </span>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 flex flex-col items-center justify-center px-6 pt-20 pb-32">
        {/* Hero section */}
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 text-white leading-tight">
            Code Together,
            <br />
            <span className="text-4xl md:text-6xl text-gray-300">Build Faster</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-300 mb-12 leading-relaxed">
            Real-time collaborative coding environment where teams create, share, and debug code together seamlessly.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <button 
              onClick={handleCreateRoom}
              className="group relative px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 rounded-xl font-semibold text-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/25 min-w-[200px] border border-purple-400/30"
            >
              <span className="relative z-10 flex items-center gap-2 justify-center text-white">
                <Rocket className="w-5 h-5" />
                Create Room
              </span>
            </button>
            
            <button 
              onClick={handleJoinRoom}
              className="group px-8 py-4 border-2 border-purple-400/50 hover:border-purple-300 bg-white/5 hover:bg-white/10 backdrop-blur-sm rounded-xl font-semibold text-lg transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-purple-500/20 min-w-[200px] flex items-center gap-2 justify-center text-white"
            >
              <Users className="w-5 h-5" />
              Join Room
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LandingPage;