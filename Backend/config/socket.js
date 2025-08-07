//
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const cookie = require("cookie");
const Room = require("../models/Room");
const User = require("../models/User");
const mongoose = require("mongoose");
const Chat =  require("../models/ChatBox")

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
    try {
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
    } catch (err) {
      return next(new Error("Authentication error"));
    }
  })

  io.on("connection", (socket) => {
    console.log("✅ Socket Connected:", socket.id);

    // Add this line at the top of your socket.js file


    const yjsStates = new Map();
    


    socket.on("get-user", (callback) => {
      if (socket.user) {
        callback({ username: socket.user.displayName, _id: socket.user._id });
      }
    });
    


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
        socket.roomId = roomId;

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
        socket.roomId = roomId;

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
    socket.on("get-room-users", async (roomId, callback) => {
      try {
        if (!roomId) {
          return callback([]);
        }

        const room = await Room.findOne({ roomId }).populate('members', '_id displayName');
        if (!room) {
          return callback([]);
        }
        const users = room.members.map(member => ({
          id: member._id,
          username: member.displayName || "Guest", // Assuming members have a username field
        }));
        callback(users);

      } catch (err) {
        console.error("❌ Error fetching room users:", err);
        callback([]);
      }

    });


    socket.on("yjs-update", (update) => {
      const id = socket.roomId;
      if (!id) {
        console.error("❌ No room ID found for Yjs update");
        return
      };

      // Store/update the state for future syncs
      if (!yjsStates.has(id)) {
        yjsStates.set(id, []);
      }
      yjsStates.get(id).push(update);

      socket.to(id).emit("yjs-updated", update);
    });

    // Handle Yjs state request
    socket.on("request-yjs-sync", () => {
      const id = socket.roomId;
      const updates = yjsStates.get(id) || [];
      updates.forEach(update => {
        socket.emit("yjs-updated", update);
      });
    });

    socket.on("file-selected", ({ fileName, language }) => {
      const roomId = socket.roomId;
  
      // Broadcast to all other users in the room except the sender
      socket.to(roomId).emit("file-selected", {
        fileName,
        language,
        // selectedBy: selectedBy || "Someone",
      });
    });

    socket.on("sendMessage", async ({ roomId, message }) => {
      if (!roomId || !message?.trim()) return;
    
      try {
        const sender = socket.user._id;
        const username = socket.user.displayName || "Unknown";
    
        const timestamp = new Date();
    
        // Push message directly into Room.chatHistory (not separate Chat model)
        await Room.findOneAndUpdate(
          { roomId },
          {
            $push: {
              chatHistory: {
                message,
                sender,
                timestamp
              }
            }
          }
        );
    
        // Emit to all users in the room
        const newMessage = {
          sender: {
            _id: sender,
            username: username,
          },
          message,
          timestamp,
        };
    
        io.to(roomId).emit("newMessage", newMessage);
    
        console.log(`💬 Message Sent in ${roomId}: ${username} -> ${message}`);
      } catch (error) {
        console.error("❌ Error sending message:", error);
      }
    });
    
    
  




  });
};

module.exports = setupSocket;
