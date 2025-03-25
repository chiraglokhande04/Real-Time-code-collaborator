import { useState } from "react";
import Clients from "./Clients";
import { useParams } from "react-router-dom";
const Navbar = () => {
    const {id} = useParams()
    const [clients,setClients] = useState([
        {socketId: 1 , username: "willie john"},
        {socketId: 2 , username: "poi john"},
        {socketId: 3 , username: "alex carry"},
        {socketId: 4 , username: "smith watson"}
      ])

    setClients(rooms[id].users)
console.log(clients)

    return (
        
      <div className="w-full h-24 bg-gray-900 text-white p-4 flex justify-between items-center">
        <h2 className="text-lg font-semibold">Room Id :{id}</h2>
        <div className="flex items-center gap-4 mr-8 my-2">
          {/* Theme Toggle */}
          <button className="bg-gray-700 px-3 py-1 rounded">🌙</button>
  
        
          <div className="flex gap-2 -space-x-2">
          {
          clients.map((client)=>(<Clients username={client.username}/>))
         }
          </div>
        </div>
      </div>
    );
  };
  
  export default Navbar;
  