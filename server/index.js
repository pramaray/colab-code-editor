//server/index.js

const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const CodeRoom = require("./models/CodeRoom");
const Message = require("./models/Message");
require("dotenv").config();
const session = require("express-session");
const passport = require("passport");
require("./config/passport"); // ⬅️ this file you'll create in /server/passport.js

const cookieParser = require("cookie-parser");



mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB connection error:", err));




const app = express();
const server = http.createServer(app);
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST","PUT", "DELETE", "OPTIONS","PATCH"],
  credentials: true
}));


app.use(session({
  secret: process.env.SESSION_SECRET || "supersecret",
  resave: false,
  saveUninitialized: true,
}));
app.use(passport.initialize());
app.use(passport.session());
// OAuth Routes
app.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));
app.get("/auth/google/callback", passport.authenticate("google", {
  successRedirect: "http://localhost:5173/dashboard",
  failureRedirect: "http://localhost:5173/login"
}));

app.get("/auth/github", passport.authenticate("github", { scope: ["user:email"] }));
app.get("/auth/github/callback", passport.authenticate("github", {
  successRedirect: "http://localhost:5173/dashboard",
  failureRedirect: "http://localhost:5173/login"
}));

const authRoutes = require("./routes/auth");
app.use("/api/auth", authRoutes);
const roomRoutes = require("./routes/rooms");
app.use("/api/rooms", roomRoutes);
const messageRoutes = require("./routes/messages");
app.use("/api/messages", messageRoutes);
const userRoutes = require("./routes/user");
app.use("/api/user", userRoutes);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST","PUT","DELETE","PATCH"],
    credentials: true
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
