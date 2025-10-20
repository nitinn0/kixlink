import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { FileText, PlusCircle, List } from "lucide-react";

const adminRoutes = [
  {
    title: "Add Venue/Arena",
    description: "Add venues and arenas",
    path: "/admin/arenas",
    icon: FileText,
  },
  {
    title: "Post Upcoming Matches",
    description: "Add upcoming matches and its details.",
    path: "/admin/match",
    icon: PlusCircle,
  },
  {
    title: "Add your team",
    description: "Add and manage your team and its members.",
    path: "/admin/teams",
    icon: List,
  },
];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  // ✅ Detect role dynamically
  const isAdmin =
    user?.isAdmin || user?.email === "admin@gmail.com" || user?.username === "admin";
  const isCaptain =
    user?.isCaptain || user?.username?.toLowerCase()?.includes("captain");

  const handleLogout = () => {
    localStorage.clear();
    navigate("/auth/login");
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-start bg-gradient-to-r from-[#1f1c2c] via-[#928dab] to-[#1f1c2c] text-white p-8">
      <motion.h1
        className="text-4xl font-extrabold mb-8 drop-shadow-lg"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        {isCaptain
          ? "Captain Dashboard"
          : isAdmin
          ? "Admin Dashboard"
          : "Dashboard"}
      </motion.h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl">
        {adminRoutes.map((route) => {
          const Icon = route.icon;
          return (
            <motion.div
              key={route.path}
              whileHover={{ scale: 1.05 }}
              className="bg-white/10 backdrop-blur-2xl border border-white/30 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer shadow-lg"
              onClick={() => navigate(route.path)}
            >
              <Icon className="w-10 h-10 mb-3 text-blue-400" />
              <h2 className="text-xl font-bold mb-2">{route.title}</h2>
              <p className="text-gray-300 text-center">{route.description}</p>
            </motion.div>
          );
        })}
      </div>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleLogout}
        className="mt-12 bg-gradient-to-r from-[#ff53bb] via-[#8f51ea] to-[#3f7cff] py-3 px-8 rounded-xl font-bold uppercase tracking-wide shadow-[0_0_25px_rgba(255,83,187,0.6)] hover:shadow-[0_0_40px_rgba(143,81,234,0.8)] transition duration-300"
      >
        Logout
      </motion.button>
    </div>
  );
};

export default AdminDashboard;
