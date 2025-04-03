// import { useState, useEffect } from "react";
// import Clients from "./Clients";

// const Navbar = ({ id, users = [] }) => { // Ensure users is always an array
//   const [clients, setClients] = useState([]);

//   useEffect(() => {
//     setClients(users);
//   }, [users]);

//   return (
//     <div className="w-full h-24 bg-gray-900 text-white p-4 flex justify-between items-center">
//       <h2 className="text-lg font-semibold">
//         Room ID: {typeof id === "string" ? id : JSON.stringify(id)}
//       </h2>
//       <div className="flex items-center gap-4 mr-8 my-2">
//         <button className="bg-gray-700 px-3 py-1 rounded">🌙</button>
//         <div className="flex gap-2 -space-x-2">
//           {users.length > 0 ? (
//             users.map((client) => (
//               <Clients key={client.socketId} username={client.username} />
//             ))
//           ) : (
//             <p>No Clients</p>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Navbar;


import { useState, useEffect } from "react";
import Clients from "./Clients";

const Navbar = ({ id, users = [] }) => {
  const [clients, setClients] = useState([]);

  useEffect(() => {
    setClients(users);
  }, [users]);

  const copyRoomId = () => {
    if (typeof id === "string") {
      navigator.clipboard.writeText(id);
      alert("Room ID copied to clipboard!");
    }
  };

  return (
    <div className="w-full h-24 bg-gray-900 text-white p-4 flex justify-between items-center">
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-semibold">
          Room ID: {typeof id === "string" ? id : JSON.stringify(id)}
        </h2>
        <button
          onClick={copyRoomId}
          className="ml-2 bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-white text-sm"
        >
          📋 Copy
        </button>
      </div>
      <div className="flex items-center gap-4 mr-8 my-2">
        <button className="bg-gray-700 px-3 py-1 rounded">🌙</button>
        <div className="flex gap-2 -space-x-2">
          {users.length > 0 ? (
            users.map((client) => (
              <Clients key={client.socketId} username={client.username} />
            ))
          ) : (
            <p>No Clients</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
