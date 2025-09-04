const express = require('express');
const app = express();
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const matchRoutes = require('./routes/matchRoutes');
const profileRoutes = require('./routes/profileRoutes');
const connectDB = require('./config/db');
const teamManagement = require('./routes/teamManagement');
const cors = require('cors');

const dotenv = require('dotenv');

dotenv.config();

app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use(express.json());
app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);
app.use('/match', matchRoutes);
app.use('/teamMgmt', teamManagement);
app.use('/dashboard', profileRoutes);

connectDB();

const PORT = 4000;
app.listen(PORT, () => {
    console.log(`Server running on ${PORT}`);
});