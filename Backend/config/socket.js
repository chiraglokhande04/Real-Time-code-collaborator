const {Server } = require('socket.io');
const { v4: uuidv4 } = require("uuid");

const setupSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: '*',
    }
  });

  const rooms = {}

  io.on('connection',(socket)=>{
     console.log('Socket Connected: ',socket.id)

     socket.on('create-room', ()=>{
      const roomId = uuidv4();
      rooms[roomId] = {users: [],content: ''};
      rooms[roomId].users.push(socket.id);
      socket.join(roomId);
    
      socket.emit('room-created', roomId, rooms[roomId].content);
      console.log('Room Created: ',roomId);
     })

      socket.on('join-room', (roomId)=>{
         if(rooms[roomId]){
             socket.join(roomId);
             rooms[roomId].users.push(socket.id);
             console.log('Room Joined: ',roomId);
             socket.emit("room-joined", { roomId });
         }
         console.log('Room Not Found');
      })

      socket.emit("get-room-users",(roomId,callback)=>{  
        if(rooms[roomId]){
          callback(rooms[roomId].users);
        }else{
          callback([])
        }
      });

      socket.on('code-change', ({ roomId, newCode }) => {
        rooms[roomId].content = newCode;
        socket.to(roomId).emit('update-code', newCode);
      })

      socket.on('disconnect',()=>{
        console.log('Socket Disconnected: ',socket.id)
      })
        
  })
}


module.exports = setupSocket;