import React, { useState, useEffect } from 'react';
import { Code2 } from 'lucide-react';

export default function LoadingOverlay() {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [typedText, setTypedText] = useState('');
  const [cursorVisible, setCursorVisible] = useState(true);
  const [pulseIntensity, setPulseIntensity] = useState(0);

  const loadingSteps = [
    'Initializing workspace...',
    'Connecting to server...',
    'Establishing connection...',
    'Syncing environment...',
    'Loading dependencies...',
    'Preparing workspace...',
    'Almost ready...'
  ];

  const codeLines = [
    'import { CodeCollaborator } from "@/lib/sync";',
    'const workspace = new CodeCollaborator();',
    'await workspace.initialize();',
    'workspace.connect("realtime-session");',
    'console.log("Connecting...");'
  ];

  // Continuous buffering progress (never reaches 100%)
  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => {
        const increment = Math.random() * 2 + 0.5;
        const newProgress = prev + increment;
        // Keep it buffering between 15% and 85%
        if (newProgress > 85) return 15 + Math.random() * 10;
        return newProgress;
      });
    }, 200);

    return () => clearInterval(timer);
  }, []);

  // Cycle through loading steps
  useEffect(() => {
    const stepTimer = setInterval(() => {
      setCurrentStep(prev => (prev + 1) % loadingSteps.length);
    }, 2000);

    return () => clearInterval(stepTimer);
  }, []);

  // Typewriter effect for code
  useEffect(() => {
    const typeTimer = setInterval(() => {
      const currentLine = codeLines[currentStep % codeLines.length] || '';
      setTypedText(prev => {
        if (prev.length >= currentLine.length) {
          // Reset typing for next line
          setTimeout(() => setTypedText(''), 1000);
          return currentLine;
        }
        return currentLine.slice(0, prev.length + 1);
      });
    }, 100);

    return () => clearInterval(typeTimer);
  }, [currentStep]);

  // Cursor blinking
  useEffect(() => {
    const cursorTimer = setInterval(() => {
      setCursorVisible(prev => !prev);
    }, 500);

    return () => clearInterval(cursorTimer);
  }, []);

  // Pulse intensity for loading icon
  useEffect(() => {
    const pulseTimer = setInterval(() => {
      setPulseIntensity(Math.sin(Date.now() / 1000) * 0.5 + 0.5);
    }, 50);

    return () => clearInterval(pulseTimer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 overflow-hidden relative">
      {/* Animated background grid */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(139, 92, 246, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(139, 92, 246, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
          animation: 'slide 20s linear infinite'
        }} />
      </div>

      {/* Floating orbs */}
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-gradient-to-r from-purple-500/20 to-blue-500/20 blur-xl animate-pulse"
          style={{
            width: `${60 + Math.random() * 120}px`,
            height: `${60 + Math.random() * 120}px`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 4}s`,
            animationDuration: `${3 + Math.random() * 2}s`
          }}
        />
      ))}

      <div className="relative z-10 max-w-2xl w-full">
        {/* Main loading container */}
        <div className="bg-slate-800/40 backdrop-blur-2xl rounded-3xl p-8 shadow-2xl border border-purple-500/30 relative overflow-hidden">
          
          {/* Animated border glow */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-purple-600/20 via-blue-600/20 to-purple-600/20 animate-pulse" />
          <div className="absolute inset-[1px] rounded-3xl bg-slate-800/80 backdrop-blur-2xl" />
          
          <div className="relative z-10">
            {/* Logo and title */}
           

            {/* Code editor simulation */}
            <div className="bg-slate-900/80 rounded-2xl p-6 mb-8 border border-slate-700/50 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                <span className="text-slate-500 text-sm ml-4 font-mono">workspace.js</span>
              </div>
              
              <div className="font-mono text-sm min-h-[60px] flex items-center">
                <div className="text-emerald-400 text-lg">
                  {typedText}
                  <span className={`${cursorVisible ? 'opacity-100' : 'opacity-0'} transition-opacity bg-emerald-400 ml-1`}>|</span>
                </div>
              </div>
            </div>

            <div className="text-center mb-12">
              <div 
                className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl mb-6 relative"
                style={{
                  boxShadow: `0 0 ${20 + pulseIntensity * 40}px rgba(139, 92, 246, ${0.3 + pulseIntensity * 0.4})`
                }}
              >
                <Code2 className="w-12 h-12 text-white animate-pulse" />
                
                {/* Spinning ring around logo */}
                <div className="absolute inset-0 rounded-3xl border-2 border-transparent bg-gradient-to-r from-purple-400 via-transparent to-blue-400 animate-spin" style={{animationDuration: '3s'}} />
              </div>
              
              <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-3 animate-pulse">
                CodeSync
              </h1>
              <div className="text-slate-300 text-xl font-light tracking-wider">
                Real-time Code Collaboration
              </div>
            </div>

            {/* Loading status and progress */}
            <div className="space-y-6">
              <div className="text-center">
                <div className="text-slate-200 text-xl font-medium mb-2">
                  {loadingSteps[currentStep]}
                </div>
                <div className="flex justify-center items-center gap-2">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
                      style={{
                        animationDelay: `${i * 0.2}s`,
                        animationDuration: '1s'
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Animated progress bar */}
              
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slide {
          0% { transform: translate(0, 0); }
          100% { transform: translate(-50px, -50px); }
        }
      `}</style>
    </div>
  );
}