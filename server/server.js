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
  const jwt = require('jsonwebtoken');

  dotenv.config();

  app.use(cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (mobile apps, etc.)
      if (!origin) return callback(null, true);

      // Allow localhost for development
      if (origin.startsWith('http://localhost:')) return callback(null, true);

      // Allow local network IPs (192.168.x.x, 10.x.x.x, etc.)
      if (origin.match(/^https?:\/\/(192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[0-1])\.)/)) return callback(null, true);

      // Allow specific origins if needed
      const allowedOrigins = [
        'http://localhost:5173',
        'http://127.0.0.1:5173',
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        'http://192.168.1.3:5173' // Your current network IP
      ];

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.log('Blocked CORS origin:', origin);
      return callback(new Error('Not allowed by CORS'));
    },
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
      origin: function (origin, callback) {
        // Allow requests with no origin (mobile apps, etc.)
        if (!origin) return callback(null, true);

        // Allow localhost for development
        if (origin && origin.startsWith('http://localhost:')) return callback(null, true);

        // Allow local network IPs (192.168.x.x, 10.x.x.x, etc.)
        if (origin && origin.match(/^https?:\/\/(192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[0-1])\.)/)) return callback(null, true);

        // Allow specific origins if needed
        const allowedOrigins = [
          'http://localhost:5173',
          'http://127.0.0.1:5173',
          'http://localhost:3000',
          'http://127.0.0.1:3000',
          'http://192.168.1.3:5173' // Your current network IP
        ];

        if (allowedOrigins.includes(origin)) {
          return callback(null, true);
        }

        console.log('Socket.IO blocked CORS origin:', origin);
        return callback(new Error('Not allowed by CORS'));
      },
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  // Socket.IO authentication middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      console.error("❌ No token provided in socket connection");
      return next(new Error("Authentication error: No token provided"));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.userId;
      socket.isAdmin = decoded.isAdmin;
      console.log("✅ Socket authenticated for user:", decoded.userId);
      next();
    } catch (err) {
      console.error("❌ Socket authentication failed:", err.message);
      return next(new Error("Authentication error: Invalid token"));
    }
  });

  // Socket.IO real-time connection with error handling
  io.on("connection", (socket) => {
    console.log("🔌 User connected:", socket.id, "User ID:", socket.userId);

    // Fetch recent messages via WebSocket
    socket.on("getMessages", async (callback) => {
      try {
        const messages = await chatModel
          .find()
          .populate("sender", "name username image_url")
          .sort({ timestamp: 1 }) // ascending for display
          .limit(100);

        if (callback) callback({ success: true, messages });
        else socket.emit("messages", messages);
      } catch (err) {
        console.error("❌ Error fetching messages via WS:", err);
        if (callback) callback({ success: false, error: "Failed to fetch messages" });
      }
    });

    // Handle incoming messages
    socket.on("sendMessage", async ({ message, tempId }, callback) => {
      console.log("📩 Received message from user:", socket.id, "Content:", message);
      
      if (!message) {
        if (callback) callback({ success: false, error: "Message is required" });
        return;
      }

      try {
        // 1. Get user ID from socket (set by auth middleware)
        const userId = socket.userId;
        if (!userId) {
          throw new Error("User not authenticated");
        }

        // 2. Save message to database
        let chatMessage = new chatModel({ 
          message: message.trim(),
          sender: userId
        });
        
        await chatMessage.save();
        
        // 3. Populate sender info
        chatMessage = await chatMessage.populate("sender", "name username image_url");
        
        // 4. Convert to plain object and add to the response
        const messageObj = chatMessage.toObject({ virtuals: true });
        
        // 5. Add tempId to the response if it exists
        if (tempId) {
          messageObj.tempId = tempId;
        }
        
        
        // 6. Broadcast to all connected clients including sender
        io.emit("receiveMessage", messageObj);
        
        // 7. Acknowledge to sender with server-generated ID
        if (callback) {
          callback({ 
            success: true, 
            message: messageObj,
            tempId: tempId // Echo back the tempId for client-side matching
          });
        }
        
      } catch (err) {
        console.error("❌ Error processing message:", err);
        if (callback) { 
          callback({ 
            success: false, 
            error: err.message || "Failed to process message",
            tempId: tempId // Still return tempId on error
          });
        }
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

const PORT = process.env.PORT || 4000;
const HOST = process.env.HOST || '0.0.0.0';

server.listen(PORT, HOST, () => {
  console.log(`✅ Server + Socket.IO running on http://${HOST}:${PORT}`);
  console.log(`🌐 Accessible from network at: http://[your-ip]:${PORT}`);
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