// // server/index.js
// const express = require("express");
// const http = require("http");
// const cors = require("cors");
// const { Server } = require("socket.io");
// const CodeRoom = require("./models/CodeRoom"); // Import model

// require("dotenv").config();
// const mongoose = require("mongoose");

// mongoose.connect(process.env.MONGO_URI, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// }).then(() => console.log("✅ MongoDB connected"))
//   .catch(err => console.error("❌ MongoDB connection error:", err));

// const app = express();
// const server = http.createServer(app);

// app.use(cors({
//   origin: "http://localhost:5173",
//   methods: ["GET", "POST"]
// }));

// const io = new Server(server, {
//   cors: {
//     origin: "http://localhost:5173",
//     methods: ["GET", "POST"]
//   }
// });

// const usersInRoom = {};

// io.on("connection", (socket) => {
//   console.log("✅ New client connected:", socket.id);

//   socket.on("join-room", async ({ roomId, username }) => {
//   socket.join(roomId);
//   if (!usersInRoom[roomId]) usersInRoom[roomId] = [];

//     usersInRoom[roomId].push({ socketId: socket.id, username });

//     io.to(roomId).emit("room-users", usersInRoom[roomId]);
//   console.log(`📁 User ${username} joined room: ${roomId}`);

//   // Fetch existing code and send to the user
//   let room = await CodeRoom.findOne({ roomId });
//   if (!room) {
//     room = await CodeRoom.create({ roomId });
//   }
//   socket.emit("code-change", room.code);
// });

  
//   socket.on("code-change", async ({ roomId, code }) => {
//   // Broadcast to other users
//   socket.to(roomId).emit("code-change", code);
//   // Save to DB
//   await CodeRoom.findOneAndUpdate({ roomId }, { code });
// });


//   socket.on("disconnect", () => {
//     for (const roomId in usersInRoom) {
//       usersInRoom[roomId] = usersInRoom[roomId].filter(user => user.socketId !== socket.id);
//       io.to(roomId).emit("room-users", usersInRoom[roomId]);
//     }
//     console.log("❌ Client disconnected:", socket.id);
//   });
// });

// server.listen(4000, () => {
//   console.log("🚀 Server running on http://localhost:4000");
// });
// 
const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const CodeRoom = require("./models/CodeRoom");
const Message = require("./models/Message");
const messageRoutes = require("./routes/messages");

require("dotenv").config();

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

const app = express();
const server = http.createServer(app);

app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST"]
}));
app.use(express.json());
app.use("/api/messages", messageRoutes);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

const usersInRoom = {};

io.on("connection", (socket) => {
  console.log("✅ New client connected:", socket.id);

  socket.on("join-room", async ({ roomId, username }) => {
    socket.join(roomId);
    if (!usersInRoom[roomId]) usersInRoom[roomId] = [];

    usersInRoom[roomId].push({ socketId: socket.id, username });
    io.to(roomId).emit("room-users", usersInRoom[roomId]);
    socket.to(roomId).emit("user-joined", username);

    let room = await CodeRoom.findOne({ roomId });
    if (!room) {
      room = await CodeRoom.create({ roomId });
    }
    socket.emit("code-change", room.code);
  });

  socket.on("code-change", async ({ roomId, code }) => {
    socket.to(roomId).emit("code-change", code);
    await CodeRoom.findOneAndUpdate({ roomId }, { code });
  });
  socket.on("get-messages", async (roomId) => {
  const messages = await Message.find({ roomId }).sort({ timestamp: 1 });
  socket.emit("load-messages", messages);
});
  socket.on("send-message", async ({ username, roomId, text }) => {
    const message = new Message({ roomId, username, text });
    await message.save();
    socket.to(roomId).emit("receive-message", { username, text });
  });

  socket.on("user-typing", ({ roomId, username }) => {
    socket.to(roomId).emit("user-typing", { username });
  });

  socket.on("disconnect", () => {
    for (const roomId in usersInRoom) {
      const user = usersInRoom[roomId].find(u => u.socketId === socket.id);
      usersInRoom[roomId] = usersInRoom[roomId].filter(u => u.socketId !== socket.id);
      io.to(roomId).emit("room-users", usersInRoom[roomId]);
      if (user) {
        socket.to(roomId).emit("user-left", user.username);
      }
    }
    console.log("❌ Client disconnected:", socket.id);
  });
});

server.listen(4000, () => {
  console.log("🚀 Server running on http://localhost:4000");
});
