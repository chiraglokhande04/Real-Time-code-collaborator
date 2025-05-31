import React, { useState, useEffect } from 'react';

export default function LoginPage() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
    
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleGoogleLogin = () => {
    console.log('Google login clicked');
    alert('🚀 Launching CodeCollab with Google OAuth...');
  };

  const codeSnippets = [
    { code: 'const magic = await collaborate();', delay: '0s', position: 'top-16 left-16' },
    { code: 'function realTime() { return "🔥"; }', delay: '0.5s', position: 'top-32 right-20' },
    { code: 'git commit -m "Amazing teamwork"', delay: '1s', position: 'bottom-40 left-32' },
    { code: 'export { Innovation } from "team";', delay: '1.5s', position: 'bottom-20 right-16' },
    { code: 'npm install collaboration', delay: '2s', position: 'top-1/2 left-8' },
    { code: '// Code together, ship faster', delay: '2.5s', position: 'top-1/3 right-8' },
  ];

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        {/* Dynamic gradient that follows mouse */}
        <div 
          className="absolute inset-0 opacity-30 transition-all duration-1000 ease-out"
          style={{
            background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, 
              rgba(147, 51, 234, 0.4) 0%, 
              rgba(59, 130, 246, 0.3) 25%, 
              rgba(6, 182, 212, 0.2) 50%, 
              rgba(16, 185, 129, 0.1) 75%, 
              transparent 100%)`
          }}
        />
        
        {/* Animated grid */}
        <div className="absolute inset-0 opacity-20">
          <div className="h-full w-full" style={{
            backgroundImage: `
              linear-gradient(rgba(147, 51, 234, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(147, 51, 234, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
            animation: 'gridPulse 4s ease-in-out infinite'
          }} />
        </div>

        {/* Floating orbs */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0s' }} />
        <div className="absolute top-3/4 right-1/4 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-1/4 left-1/3 w-56 h-56 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Floating code snippets */}
      {codeSnippets.map((snippet, index) => (
        <div
          key={index}
          className={`absolute ${snippet.position} text-xs font-mono text-green-400/40 opacity-0 animate-fadeInFloat pointer-events-none select-none`}
          style={{ 
            animationDelay: snippet.delay,
            animationDuration: '3s',
            animationFillMode: 'forwards'
          }}
        >
          {snippet.code}
        </div>
      ))}

      {/* Main content */}
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className={`w-full max-w-lg transform transition-all duration-1000 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          
          {/* Glassmorphism card with enhanced effects */}
          <div className="relative group">
            {/* Glow effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 rounded-3xl blur-lg opacity-30 group-hover:opacity-50 animate-pulse transition-opacity duration-500" />
            
            {/* Main card */}
            <div className="relative bg-gray-900/80 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl">
              {/* Animated top border */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-purple-500 via-blue-500 via-cyan-500 to-transparent " />
              
              {/* Header section */}
              <div className="text-center mb-10">
                {/* Animated logo */}
                <div className="relative inline-block mb-6">
                  <div className="absolute -inset-4 bg-gradient-to-r from-purple-600 to-cyan-600 rounded-full blur-xl opacity-30 animate-pulse" />
                  <div className="relative w-20 h-20 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 rounded-2xl flex items-center justify-center shadow-2xl transform hover:scale-110 transition-transform duration-300">
                    <svg className="w-10 h-10 text-white animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                  </div>
                </div>
                
                {/* Title with gradient text */}
                <h1 className="text-4xl font-black mb-3">
                  <span className="bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent animate-pulse">
                    CodeCollab
                  </span>
                </h1>
                <p className="text-gray-300 text-base mb-2 font-medium">Real-time Code Collaboration Platform</p>
                <p className="text-gray-500 text-sm">Where brilliant minds code together</p>
              </div>

              {/* Enhanced Google Sign In Button */}
              <div className="mb-8">
                <button
                  onClick={handleGoogleLogin}
                  className="w-full group relative bg-white/95 hover:bg-white border-2 border-white/20 hover:border-white/40 rounded-2xl py-5 px-6 transition-all duration-500 ease-out hover:shadow-2xl hover:-translate-y-2 focus:outline-none focus:ring-4 focus:ring-purple-500/50 overflow-hidden"
                >
                  {/* Button glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />
                  
                  <div className="flex items-center justify-center space-x-4 relative z-10">
                    <svg className="w-7 h-7 flex-shrink-0 transform group-hover:scale-110 transition-transform duration-300" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <span className="text-gray-800 font-bold text-lg group-hover:text-gray-900 transition-colors">
                      Continue with Google
                    </span>
                  </div>
                </button>
              </div>

              {/* Enhanced feature grid */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                {[
                  { icon: '⚡', label: 'Lightning Fast', color: 'from-yellow-400 to-orange-500' },
                  { icon: '🤝', label: 'Team Sync', color: 'from-blue-400 to-purple-500' },
                  { icon: '🔒', label: 'Bank-grade Security', color: 'from-green-400 to-emerald-500' }
                ].map((feature, index) => (
                  <div key={index} className="group relative">
                    <div className={`absolute -inset-0.5 bg-gradient-to-r ${feature.color} rounded-xl blur opacity-20 group-hover:opacity-40 transition-opacity duration-300`} />
                    <div className="relative bg-gray-800/50 backdrop-blur-sm border border-white/10 rounded-xl p-4 text-center hover:bg-gray-800/70 transition-all duration-300 transform hover:scale-105">
                      <div className="text-2xl mb-2 " style={{ animationDelay: `${index * 0.2}s` }}>
                        {feature.icon}
                      </div>
                      <p className="text-xs text-gray-300 font-semibold">{feature.label}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Security badge with enhanced styling */}
              <div className="text-center">
                <div className="inline-flex items-center space-x-3 bg-gradient-to-r from-gray-800/50 to-gray-700/50 backdrop-blur-sm border border-white/10 px-6 py-3 rounded-full">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <span className="text-sm text-gray-300 font-semibold">Enterprise Security</span>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced footer */}
          <div className="text-center mt-8 px-4">
            <p className="text-sm text-gray-400 leading-relaxed">
              By continuing, you agree to our{' '}
              <a href="#" className="text-transparent bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text hover:from-purple-300 hover:to-cyan-300 underline decoration-purple-400/30 transition-all duration-300">
                Terms
              </a>{' '}
              and{' '}
              <a href="#" className="text-transparent bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text hover:from-purple-300 hover:to-cyan-300 underline decoration-purple-400/30 transition-all duration-300">
                Privacy Policy
              </a>
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeInFloat {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes gridPulse {
          0%, 100% { opacity: 0.1; }
          50% { opacity: 0.3; }
        }
        .animate-fadeInFloat {
          animation: fadeInFloat 3s ease-out forwards;
        }
        .animate-shimmer {
          animation: shimmer 2s linear infinite;
        }
      `}</style>
    </div>
  );
}

