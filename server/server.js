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
const matchModel = require("../server/models/User")
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

// ✅ Create HTTP + Socket server
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // your frontend URL
    methods: ["GET", "POST"],
  },
});

// ✅ Socket.IO real-time connection
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // Receive message from frontend
  socket.on("sendMessage", async ({ message, userId }) => {
    try {
      const chatMessage = new chatModel({
        message,
        sender: userId,
      });
      await chatMessage.save();

      const populatedMsg = await chatMessage.populate("sender", "name username image_url");

      // Broadcast message to all connected clients
      io.emit("receiveMessage", populatedMsg);
    } catch (err) {
      console.error("Error saving message:", err);
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 4000;

server.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
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