import React, { useEffect } from "react";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Home, Users, Trophy, Settings, Bell, Search, LogOut, Building2 } from "lucide-react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const matches = [
  { id: 1, teamA: "Red Hawks", teamB: "Blue Warriors", date: "2025-09-05", time: "4:30 PM", status: "upcoming" },
  { id: 2, teamA: "Sky Raiders", teamB: "Golden Titans", date: "2025-09-03", time: "5:00 PM", status: "ongoing" },
  { id: 3, teamA: "Shadow Strikers", teamB: "Iron Wolves", date: "2025-09-02", time: "6:00 PM", status: "completed" },
  { id: 4, teamA: "Royal Rangers", teamB: "Storm Breakers", date: "2025-09-04", time: "3:00 PM", status: "upcoming" },
];

const matchData = [
  { day: "Mon", matches: 3 },
  { day: "Tue", matches: 5 },
  { day: "Wed", matches: 4 },
  { day: "Thu", matches: 6 },
  { day: "Fri", matches: 7 },
  { day: "Sat", matches: 2 },
  { day: "Sun", matches: 1 },
];

const topPlayers = [
  { name: "Rohit Sharma", goals: 10 },
  { name: "Arjun Mehta", goals: 8 },
  { name: "Aman Singh", goals: 7 },
  { name: "Karan Verma", goals: 6 },
  { name: "Sahil Kapoor", goals: 5 },
];

const teamDistribution = [
  { name: "Defenders", value: 10 },
  { name: "Midfielders", value: 15 },
  { name: "Strikers", value: 8 },
  { name: "Goalkeepers", value: 4 },
];

const COLORS = ["#00f0ff", "#ff00f7", "#9dff00", "#ffae00"];

const Dashboard = () => {
  const navigate = useNavigate();

  // ✅ Logout Function
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.clear();
    toast.success("Logged out successfully!");
    navigate("/auth/login", { replace: true });
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white">
      {/* Sidebar */}
      <div className="w-64 glass flex flex-col p-5 text-white shadow-lg rounded-r-3xl">
        <h1 className="text-3xl font-extrabold neon-text mb-8 tracking-wide">KixLink</h1>
        <nav className="flex flex-col gap-5 text-lg font-medium">
          <a className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/10 transition cursor-pointer">
            <Home size={22} /> Dashboard
          </a>
          <a
  onClick={() => navigate("/players")}
  className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/10 transition cursor-pointer"
>
  <Users size={22} /> Players
</a>

        <a
  onClick={() => navigate("/")}
  className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/10 transition cursor-pointer"
>
  <Building2 size={22} /> Arenas
</a>

          <a className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/10 transition cursor-pointer">
            <Trophy size={22} /> Tournaments
          </a>
          <a className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/10 transition cursor-pointer">
            <Settings size={22} /> Settings
          </a>
        </nav>
        <div className="mt-auto">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 text-red-400 hover:text-red-500 transition"
          >
            <LogOut size={20} /> Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        {/* Top Navbar */}
        <div className="glass flex items-center justify-between p-5 m-4 rounded-2xl shadow-lg">
          <div className="flex items-center gap-3 bg-white/10 px-4 py-2 rounded-xl">
            <Search size={18} className="text-cyan-400" />
            <input
              type="text"
              placeholder="Search players, teams..."
              className="bg-transparent outline-none text-sm text-white w-64"
            />
          </div>
          <div className="flex items-center gap-6">
            <Bell size={24} className="text-pink-400 cursor-pointer" />
            <img
              src="https://i.pravatar.cc/40"
              alt="profile"
              className="w-12 h-12 rounded-full border-2 border-cyan-400"
            />
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            {[
              { title: "Total Players", value: "250+" },
              { title: "Upcoming Matches", value: "12" },
              { title: "Active Tournaments", value: "3" },
              { title: "Registered Teams", value: "45" },
            ].map((card, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.2 }}
                className="glass neon-card p-6 rounded-2xl text-center"
              >
                <h3 className="text-gray-200 text-md">{card.title}</h3>
                <p className="text-3xl font-extrabold text-cyan-300 mt-2">{card.value}</p>
              </motion.div>
            ))}
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Line Chart */}
            <div className="glass rounded-2xl p-5 neon-card">
              <h3 className="text-xl font-semibold mb-4 neon-text">Matches Played</h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={matchData}>
                  <XAxis dataKey="day" stroke="#ccc" />
                  <YAxis stroke="#ccc" />
                  <Tooltip contentStyle={{ background: "#222", borderRadius: "10px" }} />
                  <Line type="monotone" dataKey="matches" stroke="#00f0ff" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Bar Chart */}
            <div className="glass rounded-2xl p-5 neon-card">
              <h3 className="text-xl font-semibold mb-4 neon-text">Top Goal Scorers</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={topPlayers}>
                  <XAxis dataKey="name" stroke="#ccc" />
                  <YAxis stroke="#ccc" />
                  <Tooltip contentStyle={{ background: "#222", borderRadius: "10px" }} />
                  <Bar dataKey="goals" fill="#ff00f7" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pie Chart */}
          <div className="glass rounded-2xl p-5 neon-card mt-6">
            <h3 className="text-xl font-semibold mb-4 neon-text">Player Positions</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={teamDistribution} dataKey="value" nameKey="name" outerRadius={120} label>
                  {teamDistribution.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
