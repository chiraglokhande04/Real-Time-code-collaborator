//
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const cookie = require("cookie");
const Room = require("../models/Room");
const User = require("../models/User");
const mongoose = require("mongoose");

const setupSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "*",
    },
  });

  //const global._io = io; // Make io globally accessible
  global._io = io; // Make io globally accessible


  io.use((socket, next) => {
    const cookies = cookie.parse(socket.handshake.headers.cookie || '');
    const token = cookies.token;
      
    if (!token) {
      console.log("❌ No token found in cookies");
      return next(new Error("Authentication error"));
    }
    try{
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      User.findById(decoded._id)
        .then(user => {
          if (!user) {
            console.log("❌ User not found");
            return next(new Error("Authentication error"));
          }
          socket.user = user; // Attach user to socket
          console.log("✅ User authenticated:", user.displayName);
          socket.emit("user-authenticated", user); // Emit event to client    
        })
        .catch(err => {
          console.error("❌ Error fetching user:", err);
          return next(new Error("Authentication error"));
        });
      console.log("✅ Token verified successfully");
         
      next();
    }catch(err){      
      return next(new Error("Authentication error"));
    }
  })

  io.on("connection", (socket) => {
    console.log("✅ Socket Connected:", socket.id);

    // 🟢 Create Room
    socket.on("create-room", async (roomName) => {
      try {
        console.log("🟢 Creating room with name:", roomName);
        const roomId = uuidv4();
        const userId = socket.user._id;

        // Create the room
        const newRoom = await Room.create({
          roomId,
          name: roomName,
          owner: userId,
          members: [userId],
          chatHistory: [],
          folder: {
            default: "default.js",
            content: "// Default content",
            type: "javascript",
            lastModified: new Date(),
          },
        });
    
        // Join room
        socket.join(roomId);
    
        // Emit room creation event to the user
        socket.emit("room-created", {
          roomId: newRoom.roomId,
          roomName: newRoom.name, // fix: use `newRoom.name`, not `roomName`
          folder: newRoom.folder,
          members: newRoom.members,
        });
    
        console.log("🚀 Room Created:", roomId);
    
        // Notify all in room (including self) about users
        io.to(roomId).emit("update-users", [socket.user]);
    
        // 🔁 Update user's document to add room reference
        await User.findByIdAndUpdate(userId, {
          $push: { rooms: newRoom._id }
        });
    
      } catch (err) {
        console.error("❌ Failed to create room:", err);
        socket.emit("error", "Failed to create room");
      }
    });
    


    // 🟡 Join Room
    socket.on("join-room", async (roomId) => {
      try {
        if (!roomId) {
          socket.emit("error", "Room ID is required");
          return;
        }
    
        const userId = socket.user._id;
        const displayName = socket.user.displayName;
    
        socket.join(roomId);
    
        let room = await Room.findOne({ roomId }).populate('members', '_id username');
    
        if (!room) {
          socket.emit("error", "Room Not Found");
          return;
        }

        const userObjectId = new mongoose.Types.ObjectId(userId);
    
        // Add user to room members only if not already present
        if (!room.members.some(member => member.toString() === userObjectId.toString())) {
          room.members.push(userObjectId);
          await room.save();
        }
         
        console.log(`👤 ${displayName} joined Room: ${roomId}`);
        socket.emit("room-joined", roomId);
        // Load chat history with sender usernames
        try {
          await room.populate({
            path: 'chatHistory.sender',
            select: 'username',
          });
    
          socket.emit("loadMessages", room.chatHistory);
        } catch (error) {
          console.error("❌ Error loading messages:", error);
        }
    
        // Emit updated list of users
        const updatedUsers = room.members.map(member => ({
          _id: member._id,
          username: member.username,
        }));
    
        io.to(roomId).emit("update-users", updatedUsers);
    
      } catch (err) {
        console.error("❌ Failed to join room:", err);
        socket.emit("error", "Failed to join room");
      }
    });
    
    //🟠 Toggle Chat Open State
    // socket.on("toggle", (isOpen) => {
    //   const roomId = rooms[socket.id];
    //   if (roomId && rooms[roomId]?.users[socket.id]) {
    //     rooms[roomId].users[socket.id].chatOpen = isOpen;
    //   }
    // });


    // 🔄 Get Users in Room
    socket.on("get-room-users", async(roomId, callback) => {
      try{
        if (!roomId) {
          return callback([]);
        }

        const room = await Room.findOne({roomId}).populate('members', '_id displayName');
        if (!room) {
          return callback([]);
        }
        const users = room.members.map(member => ({
          id: member._id,
          username: member.displayName || "Guest", // Assuming members have a username field
        }));
        callback(users);

      }catch(err){
        console.error("❌ Error fetching room users:", err);
        callback([]);
      }
  
    });

    // socket.on("share-files", async ({ roomId, files }) => {
    //   try {
    //     if (!roomId || !files || files.length === 0) {
    //       socket.emit("error", "Invalid room ID or files");
    //       return;
    //     }

    //     // Ensure the room exists
    //     const room = await Room.findOne({ roomId });
    //     if (!room) {
    //       socket.emit("error", "Room not found");
    //       return;
    //     }

    //     console.log(`📂 Sharing files in room: ${roomId}`,files);

    //     // Process each file
    //     const filePromises = files.map(async (file) => {
    //       // Here you would typically upload the file to a storage service
    //       // For simplicity, we just return the file name and size
    //       return {
    //         name: file.name,
    //         size: file.size,
    //         type: file.type,
    //         lastModified: new Date(file.lastModified),
    //       };
    //     });

    //     const uploadedFiles = await Promise.all(filePromises);

    //     // Emit the files to all users in the room
    //     io.to(roomId).emit("files-shared", { roomId, files: uploadedFiles });

    //   } catch (error) {
    //     console.error("❌ Error sharing files:", error);
    //     socket.emit("error", "Failed to share files");
    //   }
    // });

    socket.on("yjs-update", ({ roomId, update }) => {
      
       console.log("📥 Yjs update received in backend for room:", roomId);
       socket.to(roomId).emit("yjs-updated", { update });
      console.log("📤 Yjs update emitted to room:", roomId);
    });



    // 📝 Handle Code Changes
    // socket.on("code-change", ({ roomId, newCode, fileName }) => {
    //   if (rooms[roomId]) {
    //     rooms[roomId].content = newCode;
    //     if (fileName && files.has(roomId)) {
    //       const files = files.get(roomId);
    //       const fileIndex = files.findIndex(f => f.name === fileName);

    //       if (fileIndex >= 0) {
    //         files[fileIndex].content = newCode;
    //         files.set(roomId, files);
    //       }
    //     }
    //     socket.to(roomId).emit("update-code", { newCode, fileName });
    //   }
    // });

    // 💬 Handle Sending Messages
    // socket.on("sendMessage", async ({ roomId, sender, message }) => {
    //   if (!roomId || !sender || !message.trim()) return;

    //   try {
    //     const chatMessage = new Chat({
    //       roomId,
    //       sender,
    //       message,
    //       timestamp: new Date(),
    //     });
    //     await chatMessage.save();

    //     const newMessage = {
    //       sender,
    //       message,
    //       timestamp: chatMessage.timestamp,
    //     };

    //     io.to(roomId).emit("newMessage", newMessage);
    //     // io.to(roomId).emit("chat:notification", { sender, message }); // 🔔 Emit notification
    //     Object.entries(rooms[roomId].users).forEach(([id, users]) => {
    //       if (!users.chatOpen) {
    //         io.to(id).emit("notification", { sender, message });
    //       }
    //     });
    //     console.log(`💬 Message Sent in ${roomId}: ${sender} -> ${message}`);
    //   } catch (error) {
    //     console.error("❌ Error sending message:", error);
    //   }
    // });

    // 🔄 Get Username
    // socket.on("get-username", (roomId, callback) => {
    //   if (rooms[roomId] && rooms[roomId].users[socket.id]) {
    //     callback(rooms[roomId].users[socket.id].username);
    //   } else {
    //     callback("Guest");
    //   }
    // });

    // 🖱️ Cursor Position
    // socket.on("cursor-move", ({ username, position }) => {
    //   socket.broadcast.emit("update-cursor", { username, position });
    // });



    

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
