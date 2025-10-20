import React, { useState, useEffect } from "react";
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
import {
  Home,
  Users,
  Text,
  Table,
  Trophy,
  Settings,
  Bell,
  Search,
  LogOut,
  Building2,
  Moon,
  Sun,
  Menu,
  X
} from "lucide-react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import axios from "../api/axiosConfig";
import { useTheme } from "../contexts/ThemeContext";

// ---- Mock Data ----
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
  const { theme, toggleTheme } = useTheme();
  const [playerCount, setPlayerCount] = useState<number>(0);
  const [matchCount, setMatchCount] = useState<number>(0);
  const [teamCount, setTeamCount] = useState<number>(0);
    const [players, setPlayers] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    username: "",
  });

  // ---- Auth check ----
  useEffect(() => {
    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");
    if (!token) {
      navigate("/auth/login", { replace: true });
    } else {
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        setUser(parsed);
        setFormData({
          name: parsed.name || "",
          email: parsed.email || "",
          username: parsed.username || "",
        });
      }
      setLoading(false);
    }
  }, [navigate]);

  
  useEffect(() => {
  if (!searchQuery.trim()) {
    setSearchResults([]);
    return;
  }

  const query = searchQuery.toLowerCase();

  const filteredPlayers = players.filter((p) =>
    p.name?.toLowerCase().includes(query)
  );

  const filteredTeams = teams.filter((t) =>
    (t.name || t.teamName)?.toLowerCase().includes(query)
  );

  const filteredMatches = matches.filter((m) =>
    (m.title || m.matchTitle)?.toLowerCase().includes(query)
  );

  setSearchResults([
    ...filteredPlayers.map((p) => ({ type: "Player", label: p.name })),
    ...filteredTeams.map((t) => ({ type: "Team", label: t.teamName || t.name })),
    ...filteredMatches.map((m) => ({ type: "Match", label: m.title || m.matchTitle })),
  ]);
}, [searchQuery, players, teams, matches]);


  // ---- Fetch Counts ----
  useEffect(() => {
    const fetchPlayerCount = async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) return;

    const res = await axios.get("/players", {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (Array.isArray(res.data)) {
      setPlayers(res.data); // ✅ Store players
      setPlayerCount(res.data.length);
    } else if (Array.isArray(res.data.players)) {
      setPlayers(res.data.players); // ✅ Store players
      setPlayerCount(res.data.players.length);
    } else {
      setPlayers([]);
      setPlayerCount(0);
    }
  } catch (err) {
    console.error("Error fetching players:", err);
    setPlayers([]);
    setPlayerCount(0);
  }
};

    const fetchTeamCount = async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) return;

    const res = await axios.get("/teamMgmt/teams", {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log("✅ Teams fetched:", res.data);

    if (Array.isArray(res.data)) {
      setTeams(res.data); // ✅ Store teams
      setTeamCount(res.data.length);
    } else {
      setTeams([]);
      setTeamCount(0);
    }
  } catch (err) {
    console.error("Error fetching teams:", err);
    setTeams([]);
    setTeamCount(0);
  }
};

    const fetchMatchesCount = async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) return;

    const res = await axios.get("/match/matches", {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (Array.isArray(res.data)) {
      setMatches(res.data); // ✅ Store matches
      setMatchCount(res.data.length);
    } else {
      setMatches([]);
      setMatchCount(0);
    }
  } catch (err) {
    console.error("Error fetching matches:", err);
    setMatches([]);
    setMatchCount(0);
  }
};

    fetchTeamCount();
    fetchPlayerCount();
    fetchMatchesCount();
  }, []);

  if (loading) return null;

  // ---- Logout ----
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.clear();
    toast.success("Logged out successfully!");
    navigate("/auth/login", { replace: true });
  };

  // ---- Sidebar handlers ----
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  const handleNavigation = (path: string) => {
    navigate(path);
    closeSidebar(); // Close sidebar on mobile after navigation
  };

  // ---- Update Profile ----
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdateProfile = async () => {
     console.log("Save clicked"); // debug
    try {
      const token = localStorage.getItem("token");
      if (!token || !user?._id) return;

   const res = await axios.put(
  "/users/update",
  { id: user._id, name: formData.name, email: formData.email, username: formData.username },
  { headers: { Authorization: `Bearer ${token}` } }
);
console.log("Sending:", { id: user._id, ...formData });



      if (res.data.success) {
        setUser(res.data.user);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        toast.success("Profile updated!");
        setShowModal(false);
      }
    } catch (err) {
      console.error("❌ Error updating profile:", err);
      toast.error("Failed to update profile");
    }
  };

  // ---- Sidebar Links ----
  const sidebarLinks = [
    { label: "Dashboard", icon: <Home size={22} />, path: "/" },
    {
      label: "Players",
      icon: <Users size={22} />,
      path: "/players",
      badge: playerCount,
    },
    { label: "Arenas", icon: <Building2 size={22} />, path: "/arena" },
    { label: "Tournaments", icon: <Trophy size={22} />, path: "/tournaments" },
    { label: "Teams", icon: <Table size={22} />, path: "/teams" },
    { label: "Chat", icon: <Text size={22} />, path: "/chat" },
    { label: "Settings", icon: <Settings size={22} />, path: "/settings" },

  ];

  // ---- Stats ----
  const stats = [
    { title: "Total Players", value: playerCount, path: "/players" },
    { title: "Upcoming Matches", value: matchCount, path: "/matches" },
    { title: "Total Teams", value: teamCount, path: "/teams" },
    { title: "Active Tournaments", value: 3 },
    { title: "Registered Teams", value: teamCount, path:"/teams" },
  ];

  return (
    <div className="flex h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 bg-[var(--bg-secondary)] flex flex-col p-5 shadow-lg rounded-r-3xl lg:rounded-none border-r border-[var(--border)]
        transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
        transition-transform duration-300 ease-in-out
      `}>
        {/* Close button for mobile */}
        <div className="flex items-center justify-between mb-8 lg:hidden">
          <h1 className="text-3xl font-extrabold text-[var(--text-accent)] tracking-wide">
            KixLink
          </h1>
          <button
            onClick={closeSidebar}
            className="p-2 rounded-lg hover:bg-[var(--bg-tertiary)] transition"
          >
            <X size={24} className="text-[var(--text-primary)]" />
          </button>
        </div>

        {/* Desktop title (hidden on mobile) */}
        <h1 className="hidden lg:block text-3xl font-extrabold text-[var(--text-accent)] mb-8 tracking-wide">
          KixLink
        </h1>

        <nav className="flex flex-col gap-5 text-lg font-medium">
          {sidebarLinks.map((link, idx) => (
            <a
              key={idx}
              onClick={() => handleNavigation(link.path)}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-[var(--bg-tertiary)] transition cursor-pointer"
            >
              {link.icon}
              <span>{link.label}</span>
              {link.badge !== undefined && (
                <span className="ml-auto bg-[var(--text-accent)] text-white text-xs px-2 py-1 rounded-full">
                  {link.badge}
                </span>
              )}
            </a>
          ))}
        </nav>

        <div className="mt-auto">
          {localStorage.getItem("token") ? (
            <button
              onClick={() => {
                handleLogout();
                closeSidebar();
              }}
              className="flex items-center gap-3 text-red-500 hover:text-red-700 transition"
            >
              <LogOut size={20} /> Logout
            </button>
          ) : null}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-y-auto min-w-0">
        {/* Top Navbar */}
        <div className="bg-[var(--bg-secondary)] flex items-center justify-between p-5 m-4 rounded-2xl shadow-lg border border-[var(--border)]">
          {/* Mobile Menu Button */}
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg hover:bg-[var(--bg-tertiary)] transition mr-3"
          >
            <Menu size={24} className="text-[var(--text-primary)]" />
          </button>

          <div className="relative flex items-center gap-3 bg-[var(--bg-tertiary)] px-4 py-2 rounded-xl flex-1 max-w-md">
            <Search size={18} className="text-[var(--text-accent)]" />
            <input
              type="text"
              placeholder="Search players, teams, matches..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent outline-none text-sm text-[var(--text-primary)] w-full"
            />

            {searchResults.length > 0 && (
              <div className="absolute top-12 left-0 w-full bg-[var(--bg-secondary)] rounded-xl shadow-lg border border-[var(--border)] max-h-60 overflow-y-auto z-50">
                {searchResults.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      toast.info(`${item.type}: ${item.label}`);
                      setSearchQuery("");
                      setSearchResults([]);
                    }}
                    className="px-4 py-2 hover:bg-[var(--bg-tertiary)] cursor-pointer text-sm text-[var(--text-primary)]"
                  >
                    <span className="font-semibold text-[var(--text-accent)]">{item.type}</span> —{" "}
                    {item.label}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-6">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-[var(--bg-tertiary)] hover:bg-[var(--bg-secondary)] transition"
            >
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>
            <Bell size={24} className="text-[var(--text-accent)] cursor-pointer" />
            <img
              src="https://i.pravatar.cc/40"
              alt="profile"
              className="w-12 h-12 rounded-full border-2 border-[var(--text-accent)] cursor-pointer"
              onClick={() => {
                console.log("Avatar clicked ✅");
                setShowModal(true);
              }}
            />
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="p-4 lg:p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6">
            {stats.map((card, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.2 }}
                className="bg-[var(--bg-secondary)] p-4 lg:p-6 rounded-2xl text-center cursor-pointer shadow-lg border border-[var(--border)] hover:shadow-xl transition"
                onClick={() => card.path && navigate(card.path)}
              >
                <h3 className="text-[var(--text-secondary)] text-sm lg:text-md">{card.title}</h3>
                <p className="text-2xl lg:text-3xl font-extrabold text-[var(--text-accent)] mt-2">
                  {card.value}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
            {/* Line Chart */}
            <div className="bg-[var(--bg-secondary)] rounded-2xl p-4 lg:p-5 shadow-lg border border-[var(--border)]">
              <h3 className="text-lg lg:text-xl font-semibold mb-4 text-[var(--text-accent)]">
                Matches Played
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={matchData}>
                  <XAxis dataKey="day" stroke="#666" />
                  <YAxis stroke="#666" />
                  <Tooltip
                    contentStyle={{ background: "#fff", borderRadius: "10px", border: "1px solid #ddd" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="matches"
                    stroke="#2563eb"
                    strokeWidth={3}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            
          </div>

          {/* Pie Chart */}
          <div className="bg-[var(--bg-secondary)] rounded-2xl p-4 lg:p-5 shadow-lg border border-[var(--border)] mt-4 lg:mt-6">
            <h3 className="text-lg lg:text-xl font-semibold mb-4 text-[var(--text-accent)]">
              Player Positions
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={teamDistribution}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={120}
                  label
                >
                  {teamDistribution.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Profile Edit Modal */}
      {showModal && (
  <motion.div
    className="fixed inset-0 bg-black/30 dark:bg-black/60 flex items-center justify-center z-[9999] backdrop-blur-sm p-4"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.2 }}
  >
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="bg-[var(--bg-secondary)] p-4 lg:p-6 rounded-2xl w-full max-w-md text-[var(--text-primary)] shadow-xl border border-[var(--border)]"
    >
      <h2 className="text-lg lg:text-xl font-semibold mb-4 text-[var(--text-accent)]">Edit Profile</h2>

            <div className="flex flex-col gap-3">
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Name"
                className="bg-[var(--bg-tertiary)] px-3 py-2 rounded-lg outline-none text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:ring-2 focus:ring-[var(--text-accent)] border border-[var(--border)]"
              />
              <input
  type="text"
  name="username"
  value={formData.username}
  onChange={handleInputChange}
  placeholder="Username"
  className="bg-[var(--bg-tertiary)] px-3 py-2 rounded-lg outline-none text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:ring-2 focus:ring-[var(--text-accent)] border border-[var(--border)]"
/>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Email"
                className="bg-[var(--bg-tertiary)] px-3 py-2 rounded-lg outline-none text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:ring-2 focus:ring-[var(--text-accent)] border border-[var(--border)]"
              />
              
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-lg bg-[var(--bg-tertiary)] hover:bg-[var(--bg-secondary)] transition text-[var(--text-primary)] order-2 sm:order-1"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateProfile}
                className="px-4 py-2 rounded-lg bg-[var(--text-accent)] hover:bg-blue-700 transition text-white font-semibold shadow-md order-1 sm:order-2"
              >
                Save
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default Dashboard;
