  const express = require('express');
  const app = express();
  const authRoutes = require('./routes/authRoutes');
  const adminRoutes = require('./routes/adminRoutes');
  const matchRoutes = require('./routes/matchRoutes');
  const profileRoutes = require('./routes/profileRoutes');
  const connectDB = require('./config/db');
  const teamManagement = require('./routes/teamManagement');
  const cors = require('cors');
  const dashboard = require('./routes/dashboard');
  const cron = require("node-cron");  // ✅ require instead of import
  const { matchModel, chatModel } = require("../server/models/User")
  const http = require("http");
  const { Server } = require("socket.io");
  const dotenv = require('dotenv');

  dotenv.config();

  app.use(cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  }));

  app.use(express.json());
  app.use('/', dashboard);
  app.use('/auth', authRoutes);
  app.use('/admin', adminRoutes);
  app.use('/match', matchRoutes);
  app.use('/teamMgmt', teamManagement);
  app.use('/dashboard', profileRoutes);

  connectDB();

  // Create HTTP + Socket server
  const server = http.createServer(app);
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  // Socket.IO real-time connection with error handling
  io.on("connection", (socket) => {
  console.log("🔌 User connected:", socket.id);

  // Handle incoming messages
  socket.on("sendMessage", async ({ message, userId }, callback) => {
    console.log("📩 Received message from user:", userId, "Content:", message);
    
    if (!message || !userId) {
      console.error("❌ Invalid message or userId");
      if (callback) callback({ success: false, error: "Message and userId are required" });
      return;
    }

    try {
      // 1. Save message to database
      let chatMessage = new chatModel({ 
        message: message.trim(),
        sender: userId 
      });
      
      await chatMessage.save();
      
      // 2. Populate sender info
      chatMessage = await chatMessage.populate("sender", "name username image_url");
      
      // 3. Convert to plain object and add to the response
      const messageObj = chatMessage.toObject();
      messageObj.timestamp = messageObj.createdAt; // Ensure timestamp is set
      
      console.log("💾 Message saved:", messageObj);
      
      // 4. Broadcast to all connected clients
      io.emit("receiveMessage", messageObj);
      
      // 5. Acknowledge to sender
      if (callback) callback({ success: true, message: messageObj });
      
    } catch (err) {
      console.error("❌ Error processing message:", err);
      if (callback) callback({ 
        success: false, 
        error: "Failed to process message",
        details: err.message 
      });
    }
  });

  // Handle disconnection
  socket.on("disconnect", (reason) => {
    console.log("❌ User disconnected:", socket.id, "Reason:", reason);
  });
  
  // Handle connection errors
  socket.on("error", (error) => {
    console.error("❌ Socket error:", error);
  });
});

const PORT = 4000;
server.listen(PORT, () => {
  console.log(`✅ Server + Socket.IO running on port ${PORT}`);
});
  cron.schedule("0 0 * * *", async () => {
    try {
      const now = new Date();
      now.setHours(0, 0, 0, 0); // midnight today

      const result = await matchModel.deleteMany({ date: { $lt: now } });

      console.log(`[CRON] Removed ${result.deletedCount} expired matches`);
    } catch (err) {
      console.error("[CRON] Error while cleaning matches:", err);
    }
  });