import { useState, useEffect } from "react";
import Clients from "./Clients";
import { useParams } from "react-router-dom";

const Navbar = () => {
  const { id } = useParams();
  const [clients, setClients] = useState([]);

  useEffect(() => {
    // Simulated users for testing (Replace with real API or WebSocket data)
    const users = [
      { socketId: 1, username: "Willie John" },
      { socketId: 2, username: "Poi John" },
      { socketId: 3, username: "Alex Carry" },
      { socketId: 4, username: "Smith Watson" }
    ];
    
    setClients(users);
  }, [id]); // Run when `id` changes

  return (
    <div className="w-full h-24 bg-gray-900 text-white p-4 flex justify-between items-center">
      <h2 className="text-lg font-semibold">Room ID: {id}</h2>
      <div className="flex items-center gap-4 mr-8 my-2">
        <button className="bg-gray-700 px-3 py-1 rounded">🌙</button>
        <div className="flex gap-2 -space-x-2">
          {clients.length > 0 ? (
            clients.map((client) => (
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
