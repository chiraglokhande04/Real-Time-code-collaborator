// import React, { useState, useRef } from "react";

// const VoiceCall = () => {
//   const [isCalling, setIsCalling] = useState(false);
//   const [participants, setParticipants] = useState([
//     { id: 1, name: "You" }, // Default user
//   ]);
//   const localAudioRef = useRef(null);
//   const remoteAudioRef = useRef(null);
//   const peerConnection = useRef(null);

//   const startCall = async () => {
//     setIsCalling(true);

//     // Create WebRTC connection
//     peerConnection.current = new RTCPeerConnection({
//       iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
//     });

//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
//       localAudioRef.current.srcObject = stream;

//       stream.getTracks().forEach((track) => peerConnection.current.addTrack(track, stream));

//       peerConnection.current.ontrack = (event) => {
//         if (remoteAudioRef.current) {
//           remoteAudioRef.current.srcObject = event.streams[0];
//         }
//       };

//       const offer = await peerConnection.current.createOffer();
//       await peerConnection.current.setLocalDescription(offer);

//       // In a real-world scenario, send offer to the signaling server
//       console.log("Offer Created:", offer);

//       // Simulate other participants joining (Replace with real data)
//       setTimeout(() => {
//         setParticipants((prev) => [
//           ...prev,
//           { id: 2, name: "Alice" },
//           { id: 3, name: "Bob" },
//         ]);
//       }, 2000);
//     } catch (error) {
//       console.error("Error accessing microphone:", error);
//       setIsCalling(false);
//     }
//   };

//   const endCall = () => {
//     setIsCalling(false);
//     setParticipants([{ id: 1, name: "You" }]);

//     if (peerConnection.current) {
//       peerConnection.current.close();
//       peerConnection.current = null;
//     }

//     if (localAudioRef.current?.srcObject) {
//       localAudioRef.current.srcObject.getTracks().forEach((track) => track.stop());
//       localAudioRef.current.srcObject = null;
//     }

//     if (remoteAudioRef.current?.srcObject) {
//       remoteAudioRef.current.srcObject.getTracks().forEach((track) => track.stop());
//       remoteAudioRef.current.srcObject = null;
//     }
//   };

//   return (
//     <div className="flex flex-col p-4 w-80 h-130 bg-gray-900 rounded-lg text-white">
//       <h2 className="text-lg font-semibold mb-3">Voice Call</h2>

//       {/* Participants List */}
//       <div className="bg-gray-800 p-2 rounded-lg m-2 w-55">
//         <h3 className="text-sm text-gray-400 mb-2">Participants</h3>
//         {participants.map((user) => (
//           <div key={user.id} className="p-2 bg-gray-700 rounded-lg mb-1">
//             {user.name}
//           </div>
//         ))}
//       </div>

//       {/* Audio Elements */}
//       <audio ref={localAudioRef} autoPlay playsInline controls className="hidden" />
//       <audio ref={remoteAudioRef} autoPlay playsInline controls className="hidden" />

//       {/* Call Controls */}
//       {!isCalling ? (
//         <button
//           onClick={startCall}
//           className="px-4 py-2 w-55 m-2 bg-green-600 rounded-lg hover:bg-green-700"
//         >
//           Start Call
//         </button>
//       ) : (
//         <button
//           onClick={endCall}
//           className="px-4 py-2 w-55 m-2 bg-red-600 rounded-lg hover:bg-red-700"
//         >
//           End Call
//         </button>
//       )}
//     </div>
//   );
// };

// export default VoiceCall;



import React, { useState, useRef, useEffect } from "react";




const VoiceCall = ({socket}) => {
  const [isCalling, setIsCalling] = useState(false);
  const [participants, setParticipants] = useState([{ id: "You", name: "You" }]);
  const localAudioRef = useRef(null);
  const peerConnections = useRef({});

  useEffect(() => {
    socket.on("user-joined", (userId) => {
      console.log("User joined:", userId);
      createOffer(userId);
    });

    socket.on("offer", async (data) => {
      const { sender, offer } = data;
      await peerConnections.current[sender].setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await peerConnections.current[sender].createAnswer();
      await peerConnections.current[sender].setLocalDescription(answer);
      socket.emit("answer", { target: sender, answer });
    });

    socket.on("answer", async (data) => {
      const { sender, answer } = data;
      await peerConnections.current[sender].setRemoteDescription(new RTCSessionDescription(answer));
    });

    socket.on("ice-candidate", (data) => {
      const { sender, candidate } = data;
      peerConnections.current[sender].addIceCandidate(new RTCIceCandidate(candidate));
    });

    return () => socket.off();
  }, []);

  const startCall = async () => {
    setIsCalling(true);
    socket.emit("join-room", "room1");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      localAudioRef.current.srcObject = stream;

      socket.on("user-joined", (userId) => {
        if (!peerConnections.current[userId]) {
          const pc = new RTCPeerConnection({
            iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
          });

          stream.getTracks().forEach((track) => pc.addTrack(track, stream));

          pc.onicecandidate = (event) => {
            if (event.candidate) {
              socket.emit("ice-candidate", { target: userId, candidate: event.candidate });
            }
          };

          peerConnections.current[userId] = pc;
          createOffer(userId);
        }
      });
    } catch (error) {
      console.error("Error accessing microphone:", error);
      setIsCalling(false);
    }
  };

  const createOffer = async (target) => {
    const pc = peerConnections.current[target];
    if (pc) {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socket.emit("offer", { target, offer });
    }
  };

  const endCall = () => {
    setIsCalling(false);
    Object.values(peerConnections.current).forEach((pc) => pc.close());
    peerConnections.current = {};
  };

  return (
    <div className="flex flex-col p-4 w-80 h-130 bg-gray-900 rounded-lg text-white">
      <h2 className="text-lg font-semibold mb-3">Voice Call</h2>

      {/* Participants */}
      <div className="bg-gray-800 p-2 rounded-lg m-2 w-55">
        <h3 className="text-sm text-gray-400 mb-2">Participants</h3>
        {participants.map((user) => (
          <div key={user.id} className="p-2 bg-gray-700 rounded-lg mb-1">
            {user.name}
          </div>
        ))}
      </div>

      {/* Audio Element */}
      <audio ref={localAudioRef} autoPlay playsInline controls className="hidden" />

      {/* Call Controls */}
      {!isCalling ? (
        <button
          onClick={startCall}
          className="px-4 py-2 w-55 m-2 bg-green-600 rounded-lg hover:bg-green-700"
        >
          Start Call
        </button>
      ) : (
        <button
          onClick={endCall}
          className="px-4 py-2 w-55 m-2 bg-red-600 rounded-lg hover:bg-red-700"
        >
          End Call
        </button>
      )}
    </div>
  );
};

export default VoiceCall;
