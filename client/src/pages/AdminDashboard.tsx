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
    title: "View Venue/Arena",
    description: "View venues and arenas",
    path: "/admin/arenas/view",
    icon: FileText,
  },
  {
    title: "Post Upcoming Matches",
    description: "Add upcoming matches and its details.",
    path: "/admin/matches",
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
    <div className="min-h-screen w-full flex flex-col items-center justify-start bg-[var(--bg-primary)] text-[var(--text-primary)] p-8">
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
              whileHover={{ scale: 1.02 }}
              className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer shadow-lg hover:shadow-xl transition"
              onClick={() => navigate(route.path)}
            >
              <Icon className="w-10 h-10 mb-3 text-[var(--text-accent)]" />
              <h2 className="text-xl font-bold mb-2 text-[var(--text-primary)]">{route.title}</h2>
              <p className="text-[var(--text-secondary)] text-center">{route.description}</p>
            </motion.div>
          );
        })}
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleLogout}
        className="mt-12 bg-[var(--text-accent)] py-3 px-8 rounded-xl font-bold uppercase tracking-wide shadow-lg hover:shadow-xl transition duration-300 text-[var(--bg-secondary)]"
      >
        Logout
      </motion.button>
    </div>
  );
};

export default AdminDashboard;
