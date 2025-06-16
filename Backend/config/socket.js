//
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const cookie = require("cookie");
const Room = require("../models/Room");
const Chat = require("../models/ChatBox");

const setupSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "*",
    },
  });

  io.use((socket, next) => {
    const cookies = cookie.parse(socket.handshake.headers.cookie || '');
    const token = cookies.token;
    
    if (!token) {
      return next(new Error("Authentication error"));
    }
    try{
      const token = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = token; // Attach user info to the socket
      next();

    }catch(err){
      return next(new Error("Authentication error"));
    }
  })

  io.on("connection", (socket) => {
    console.log("✅ Socket Connected:", socket.id);

    // 🟢 Create Room
    socket.on("create-room", async(roomName) => {
      try{
        console.log("🟢 Creating room with name:", roomName);
        const roomId = uuidv4();
        const userId = socket.user._id;
        
        const newRoom = await Room.create({
          roomId,
          roomName,
          owner: userId,
          members:[userId],
          chatHistory: [],
          folder:{
            default:"default.txt",
            content: "// Default content",
            type: "text",
            lastModified: new Date()
          }
        })
  
        socket.join(roomId);
        socket.emit("room-created", 
          { roomId:newRoom.roomId,
            roomName:newRoom.roomName, 
            folder:newRoom.folder,
            members:newRoom.members});
        console.log("🚀 Room Created:", roomId);
  
        io.to(roomId).emit("update-users", [socket.user]);


      }catch(err){
        console.error("❌ Failed to create room:", err);
      socket.emit("error", "Failed to create room");
      }
     
    });


    // 🟡 Join Room
    // socket.on("join-room", async (username, roomId) => {
    //   if (!rooms[roomId]) {
    //     socket.emit("error", "Room Not Found");
    //     return;
    //   }

    //   rooms[roomId].users[socket.id] = { id: socket.id, username };
    //   socket.join(roomId);
    //   console.log(`👤 ${username} joined Room: ${roomId}`);

    //   socket.emit("room-joined", roomId);

    //   // 📥 Send chat history
    //   try {
    //     const messages = await Chat.find({ roomId }).sort({ timestamp: 1 });
    //     socket.emit("loadMessages", messages);
    //   } catch (error) {
    //     console.error("❌ Error loading messages:", error);
    //   }

    //   io.to(roomId).emit("update-users", Object.values(rooms[roomId].users));
    // });

    socket.on("join-room",async(roomId)=>{
      try{
        if (!roomId) {
          socket.emit("error", "Room ID is required");
          return;
        }
        const userId = socket.user._id;
        socket.join(roomId);
        const room = await Room.findOne({ roomId }).populate('members', '_id username');
        if (!room) {
          socket.emit("error", "Room Not Found");
          return;
        }
        // Add user to room members if not already present
        room.members.push(userId)
        console.log(`👤 ${socket.user.username} joined Room: ${roomId}`);

        socket.emit("room-joined",roomId)
        try {
              const messages = await room.populate('chatHistory.sender', 'username').execPopulate()
              socket.emit("loadMessages", messages);
            } catch (error) {
              console.error("❌ Error loading messages:", error);
            }
      
        io.to(roomId).emit("update-users", [socket.users]);
      }catch(err){
        console.error("❌ Failed to join room:", err);
        socket.emit("error", "Failed to join room");

      }
    })

    // 🟠 Toggle Chat Open State
    socket.on("toggle", (isOpen) => {
      const roomId = rooms[socket.id];
      if (roomId && rooms[roomId]?.users[socket.id]) {
        rooms[roomId].users[socket.id].chatOpen = isOpen;
      }
    });


    // 🔄 Get Users in Room
    // socket.on("get-room-users", (roomId, callback) => {
    //   if (roomId) {
    //     callback(Object.values(roomId.users));
    //   } else {
    //     callback([]);
    //   }
    // });

    socket.on("get-room-users", async(roomId, callback) => {
      try{
        if (!roomId) {
          return callback([]);
        }
        const room = await  Room.findOne({ roomId }).populate('members', '_id username');
        if (!room) {
          return callback([]);
        }
        const users = room.members.map(member => ({
          id: member._id,
          username: member.username || "Guest", // Assuming members have a username field
        }));
        callback(users);
      }catch(err){
        console.error("❌ Error fetching room users:", err);
        callback([]);

      }
    })




    const roomFiles = new Map();

    // When a user uploads files
    socket.on("share-files", ({ roomId, files }) => {
      // Store the files for this room
      if (!roomFiles.has(roomId)) {
        roomFiles.set(roomId, []);
      }

      // Update existing files or add new ones
      const existingFiles = roomFiles.get(roomId);

      files.forEach(newFile => {
        const existingIndex = existingFiles.findIndex(f => f.name === newFile.name);
        if (existingIndex >= 0) {
          existingFiles[existingIndex] = newFile;
        } else {
          existingFiles.push(newFile);
        }
      });

      // Save updated files
      roomFiles.set(roomId, existingFiles);

      // Broadcast to all other users in the room
      socket.to(roomId).emit("receive-files", existingFiles);
    });

    // When a user requests room files
    socket.on("get-room-files", (roomId) => {
      if (roomFiles.has(roomId)) {
        socket.emit("receive-files", roomFiles.get(roomId));
      }
    });

    // 📝 Handle Code Changes
    socket.on("code-change", ({ roomId, newCode, fileName }) => {
      if (rooms[roomId]) {
        rooms[roomId].content = newCode;
        if (fileName && roomFiles.has(roomId)) {
          const files = roomFiles.get(roomId);
          const fileIndex = files.findIndex(f => f.name === fileName);

          if (fileIndex >= 0) {
            files[fileIndex].content = newCode;
            roomFiles.set(roomId, files);
          }
        }
        socket.to(roomId).emit("update-code", { newCode, fileName });
      }
    });

    // 💬 Handle Sending Messages
    socket.on("sendMessage", async ({ roomId, sender, message }) => {
      if (!roomId || !sender || !message.trim()) return;

      try {
        const chatMessage = new Chat({
          roomId,
          sender,
          message,
          timestamp: new Date(),
        });
        await chatMessage.save();

        const newMessage = {
          sender,
          message,
          timestamp: chatMessage.timestamp,
        };

        io.to(roomId).emit("newMessage", newMessage);
        // io.to(roomId).emit("chat:notification", { sender, message }); // 🔔 Emit notification
        Object.entries(rooms[roomId].users).forEach(([id, users]) => {
          if (!users.chatOpen) {
            io.to(id).emit("notification", { sender, message });
          }
        });
        console.log(`💬 Message Sent in ${roomId}: ${sender} -> ${message}`);
      } catch (error) {
        console.error("❌ Error sending message:", error);
      }
    });

    // 🔄 Get Username
    socket.on("get-username", (roomId, callback) => {
      if (rooms[roomId] && rooms[roomId].users[socket.id]) {
        callback(rooms[roomId].users[socket.id].username);
      } else {
        callback("Guest");
      }
    });

    // 🖱️ Cursor Position
    socket.on("cursor-move", ({ username, position }) => {
      socket.broadcast.emit("update-cursor", { username, position });
    });



    // Handle offer and answer signaling
    socket.on("offer", (data) => {
      socket.to(data.target).emit("offer", data);
    });

    socket.on("answer", (data) => {
      socket.to(data.target).emit("answer", data);
    });

    socket.on("ice-candidate", (data) => {
      socket.to(data.target).emit("ice-candidate", data);
    });

    // ❌ Handle Disconnect
    // socket.on("disconnect", () => {
    //   console.log("❌ Socket Disconnected:", socket.id);

    //   Object.keys(rooms).forEach((roomId) => {
    //     if (rooms[roomId]?.users[socket.id]) {
    //       delete rooms[roomId].users[socket.id];
    //       io.to(roomId).emit("update-users", Object.values(rooms[roomId].users));

    //       if (Object.keys(rooms[roomId].users).length === 0) {
    //         delete rooms[roomId];
    //         console.log(`🗑️ Room ${roomId} deleted (No users left)`);
    //       }
    //     }
    //   });
    // });
  });
};

module.exports = setupSocket;
