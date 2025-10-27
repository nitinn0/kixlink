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
  X,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import axios from "../api/axiosConfig";
import { useTheme } from "../contexts/ThemeContext";
import "../styles/space-and-form.css";

  const [matchData, setMatchData] = useState([]);

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
  const [userJoinedMatches, setUserJoinedMatches] = useState<any[]>([]);
  const [upcomingMatches, setUpcomingMatches] = useState<any[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [lastActivity, setLastActivity] = useState<number>(Date.now());
  const [carouselIndex, setCarouselIndex] = useState(0);

  const INACTIVITY_TIMEOUT = 15 * 60 * 1000; // 15 minutes in milliseconds
  const SESSION_CHECK_INTERVAL = 5 * 60 * 1000; // Check session every 5 minutes

  const carouselSlides = [
    {
      title: "🏆 Championship Finals",
      description: "Watch the intense battle between top teams this weekend!",
      bg: "bg-gradient-to-r from-yellow-400 to-orange-500",
      bgImage: "https://images.unsplash.com/photo-1574623452334-1e0ac2b3ccb4?w=800&auto=format&fit=crop&q=60"
    },
    {
      title: "⚽ New Training Sessions",
      description: "Join our expert coaches for skill-building workshops.",
      bg: "bg-gradient-to-r from-green-400 to-blue-500",
      bgImage: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&auto=format&fit=crop&q=60"
    },
    {
      title: "🎉 Community Events",
      description: "Connect with fellow players at our monthly meetups.",
      bg: "bg-gradient-to-r from-purple-400 to-pink-500",
      bgImage: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800&auto=format&fit=crop&q=60"
    },
    {
      title: "💬 Community Chat",
      description: "Join the conversation! Connect with players worldwide.",
      bg: "bg-gradient-to-r from-blue-400 to-indigo-500",
      bgImage: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&auto=format&fit=crop&q=60",
      action: () => navigate("/chat")
    }
  ];

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

    fetchTeamCount();
    fetchPlayerCount();
    fetchMatches();
  }, []);

  // Fetch upcoming matches
  useEffect(() => {
    const fetchUpcomingMatches = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const res = await axios.get("/match/matches", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUpcomingMatches(res.data.slice(0, 4)); // Show top 4
      } catch (err) {
        console.error("Error fetching upcoming matches:", err);
      }
    };
    fetchUpcomingMatches();
  }, []);

  // Activity tracking and automatic logout
  useEffect(() => {
    const updateActivity = () => setLastActivity(Date.now());
    
    // Track user activity
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    events.forEach(event => window.addEventListener(event, updateActivity));

    // Check for inactivity
    const inactivityTimer = setInterval(() => {
      if (Date.now() - lastActivity > INACTIVITY_TIMEOUT) {
        handleLogout();
        alert('You have been logged out due to inactivity.');
      }
    }, 60000); // Check every minute

    // Check session validity
    const sessionCheckTimer = setInterval(async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          // Try to make a request to verify token
          await axios.get("/match/matches", {
            headers: { Authorization: `Bearer ${token}` },
          });
        } catch (error: any) {
          if (error.response?.status === 401) {
            handleLogout();
            alert('Your session has expired. Please login again.');
          }
        }
      }
    }, SESSION_CHECK_INTERVAL);

    return () => {
      events.forEach(event => window.removeEventListener(event, updateActivity));
      clearInterval(inactivityTimer);
      clearInterval(sessionCheckTimer);
    };
  }, []); // Remove lastActivity dependency to prevent re-running

  if (loading) return null;

  // ---- Logout ----
  const nextSlide = () => {
    setCarouselIndex((prev) => (prev + 1) % carouselSlides.length);
  };

  const prevSlide = () => {
    setCarouselIndex((prev) => (prev - 1 + carouselSlides.length) % carouselSlides.length);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.clear();
    toast.success("Logged out successfully!");
    navigate("/auth/login", { replace: true });
  };
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


  const fetchMatches = async() => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const res = await axios.get("/match/matches", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMatches(res.data);
      setMatchCount(res.data.length);
      // Process for chart
      const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
      const countByDay = days.map(day => {
        const count = res.data.filter(m => {
          const matchDate = new Date(m.date);
          const weekday = matchDate.toLocaleDateString('en-US', { weekday: 'short' });
          return weekday === day;
        }).length;
        return { day, matches: count };
      });
      setMatchData(countByDay);
    } catch (err) {
      console.error("Error fetching matches:", err);
      setMatches([]);
      setMatchCount(0);
      setMatchData([]);
    }
  }

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
    <div className="flex h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] relative overflow-hidden">
      {/* Animated Starry Background */}
      <div id="stars"></div>
      <div id="stars2"></div>
      <div id="stars3"></div>
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
      <div className="flex-1 flex flex-col overflow-y-auto min-w-0 z-10">
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
          {/* Welcome Section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-[var(--text-accent)] to-blue-600 text-white p-6 rounded-2xl mb-6 shadow-lg"
          >
            <h1 className="text-2xl lg:text-3xl font-bold">Welcome back, {user?.name || "Player"}! 👋</h1>
            <p className="text-lg opacity-90 mt-2">Ready for your next match? Check out upcoming games below.</p>
          </motion.div>

          {/* Interactive Carousel */}
          <div className="relative mb-6 overflow-hidden rounded-2xl shadow-lg">
            <motion.div
              className="flex"
              animate={{ x: `-${carouselIndex * 100}%` }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              {carouselSlides.map((slide, index) => (
                <div
                  key={index}
                  className={`w-full flex-shrink-0 p-8 text-white text-center relative min-h-[300px] flex items-center justify-center ${
                    slide.action ? 'cursor-pointer hover:opacity-90 transition' : ''
                  }`}
                  style={{
                    backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${slide.bgImage})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                  onClick={slide.action}
                >
                  <div className="relative z-10">
                    <h3 className="text-2xl lg:text-3xl font-bold mb-2">{slide.title}</h3>
                    <p className="text-lg opacity-90">{slide.description}</p>
                  </div>
                </div>
              ))}
            </motion.div>

            {/* Navigation Buttons */}
            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 rounded-full p-3 transition"
            >
              <ChevronLeft size={24} className="text-white" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 rounded-full p-3 transition"
            >
              <ChevronRight size={24} className="text-white" />
            </button>

            {/* Indicators */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
              {carouselSlides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCarouselIndex(index)}
                  className={`w-3 h-3 rounded-full transition ${
                    index === carouselIndex ? "bg-white" : "bg-white/50"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Upcoming Matches */}
          <div className="mb-6">
            <h2 className="text-xl lg:text-2xl font-semibold mb-4 text-[var(--text-accent)]">Upcoming Matches</h2>
            {upcomingMatches.length > 0 ? (
              <div className="grid grid-cols-3 gap-4">
                {upcomingMatches.map((match, index) => (
                  <motion.div
                    key={match._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-[var(--bg-secondary)] p-4 rounded-xl shadow-lg border border-[var(--border)] hover:shadow-xl transition cursor-pointer"
                    onClick={() => navigate("/matches")}
                  >
                    <h3 className="font-semibold text-[var(--text-accent)] text-lg">{match.venue}</h3>
                    <p className="text-sm text-[var(--text-secondary)] mt-1 mb-2">
                      {new Date(match.date).toLocaleDateString()} at {match.time}
                    </p>
                    <div className="text-sm text-[var(--text-secondary)]">
                      <p><strong>Teams ({match.teams?.length || 0}):</strong></p>
                      {match.teams && match.teams.length > 0 ? (
                        <ul className="list-disc list-inside mt-1">
                          {match.teams.slice(0, 2).map(team => (
                            <li key={team._id} className="truncate">{team.teamName}</li>
                          ))}
                          {match.teams.length > 2 && <li className="text-xs">+{match.teams.length - 2} more</li>}
                        </ul>
                      ) : (
                        <p className="text-xs italic">No teams yet</p>
                      )}
                    </div>
                    <p className="text-sm text-[var(--text-secondary)] mt-2">
                      Players: {match.players?.length || 0}
                    </p>
                  </motion.div>
                ))}
              </div>
            ) : (
              <p className="text-[var(--text-secondary)]">No upcoming matches.</p>
            )}
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-4 lg:gap-6 mb-6">
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

          {/* Quick Actions */}
          <div className="bg-[var(--bg-secondary)] rounded-2xl p-6 mb-6 shadow-lg border border-[var(--border)]">
            <h2 className="text-xl lg:text-2xl font-semibold mb-4 text-[var(--text-accent)]">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => navigate("/matches")}
                className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-xl font-semibold transition flex items-center justify-center gap-2 shadow-lg"
              >
                <Users size={20} /> Join Match
              </button>
              <button
                onClick={() => navigate("/teams")}
                className="bg-green-600 hover:bg-green-700 text-white p-4 rounded-xl font-semibold transition flex items-center justify-center gap-2 shadow-lg"
              >
                <Table size={20} /> View Teams
              </button>
              <button
                onClick={() => navigate("/players")}
                className="bg-purple-600 hover:bg-purple-700 text-white p-4 rounded-xl font-semibold transition flex items-center justify-center gap-2 shadow-lg"
              >
                <Users size={20} /> Players
              </button>
              <button
                onClick={() => setShowModal(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-xl font-semibold transition flex items-center justify-center gap-2 shadow-lg"
              >
                <Settings size={20} /> Edit Profile
              </button>
            </div>
          </div>

          {/* Your Matches */}
          <div className="bg-[var(--bg-secondary)] rounded-2xl p-6 mb-6 shadow-lg border border-[var(--border)]">
            <h2 className="text-xl lg:text-2xl font-semibold mb-4 text-[var(--text-accent)]">Your Matches</h2>
            {upcomingMatches.filter(m => user?.username && m.players?.includes(user.username)).length > 0 ? (
              <div className="space-y-2">
                {upcomingMatches
                  .filter(m => user?.username && m.players?.includes(user.username))
                  .map(match => (
                    <div key={match._id} className="bg-[var(--bg-tertiary)] p-3 rounded-lg border border-[var(--border)]">
                      <h4 className="font-semibold">{match.venue}</h4>
                      <p className="text-sm text-[var(--text-secondary)]">
                        {new Date(match.date).toLocaleDateString()} at {match.time}
                      </p>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-[var(--text-secondary)]">You haven't joined any matches yet.</p>
            )}
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
