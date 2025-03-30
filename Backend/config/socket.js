const { Server } = require('socket.io');
const { v4: uuidv4 } = require("uuid");

const setupSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: '*',
    }
  });

  const rooms = {}; // Store all rooms

  io.on('connection', (socket) => {
    console.log('Socket Connected: ', socket.id);

    // Handle room creation
    socket.on('create-room', (username) => {
      const roomId = uuidv4();
      rooms[roomId] = { users: {}, content: '' };
      
      // Store users as { socketId: { id, username } }
      rooms[roomId].users[socket.id] = { id: socket.id, username: username };
      
      socket.join(roomId);
      socket.emit('room-created', roomId, rooms[roomId].content);
      console.log('Room Created: ', roomId);

      // Notify all users in the room
      io.to(roomId).emit('update-users', Object.values(rooms[roomId].users));
    });

    // Handle joining a room
    socket.on('join-room', (username, roomId) => {
      if (rooms[roomId]) {
        rooms[roomId].users[socket.id] = { id: socket.id, username: username };
        socket.join(roomId);
        console.log(`${username} joined Room: `, roomId);

        socket.emit('room-joined',  roomId );

        // Notify all users in the room
        io.to(roomId).emit('update-users', Object.values(rooms[roomId].users));
      } else {
        socket.emit('error', 'Room Not Found');
      }
    });

    // Get room users
    socket.on("get-room-users", (roomId, callback) => {
      if (rooms[roomId]) {
        callback(Object.values(rooms[roomId].users));
      } else {
        callback([]);
      }
    });

    // Handle code updates
    socket.on('code-change', ({ roomId, newCode }) => {
      if (rooms[roomId]) {
        rooms[roomId].content = newCode;
        socket.to(roomId).emit('update-code', newCode);
      }
    });

    // Handle user disconnection
    socket.on('disconnect', () => {
      console.log('Socket Disconnected: ', socket.id);

      Object.keys(rooms).forEach((roomId) => {
        if (rooms[roomId].users[socket.id]) {
          delete rooms[roomId].users[socket.id];

          // Notify all users in the room
          io.to(roomId).emit('update-users', Object.values(rooms[roomId].users));

          // If room is empty, delete it
          if (Object.keys(rooms[roomId].users).length === 0) {
            delete rooms[roomId];
            console.log(`Room ${roomId} deleted`);
          }
        }
      });
    });
  });
};

module.exports = setupSocket;
