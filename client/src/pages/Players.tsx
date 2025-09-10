import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Search, Users } from "lucide-react";
import { toast } from "react-toastify";

const Players = () => {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // ✅ Fetch Players from Backend
  const fetchPlayers = async () => {
    try {
      setLoading(true);

      // ✅ Get token from localStorage (assuming you store it at login)
      const token = localStorage.getItem("token");

      const { data } = await axios.get("http://localhost:4000/players", {
        headers: {
          Authorization: `Bearer ${token}`, // ✅ Send token
        },
      });

      setPlayers(data);
      setLoading(false);
    } catch (error: any) {
      console.error(error);
      if (error.response?.status === 404) {
        toast.warning("No players found!");
      } else if (error.response?.status === 401) {
        toast.error("Unauthorized! Please login again.");
      } else {
        toast.error("Failed to fetch players!");
      }
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlayers();
  }, []);

  // ✅ Filtered Players
  const filteredPlayers = players.filter((p: any) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col flex-1 h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white p-6">
      {/* Page Title */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center mb-6"
      >
        <h1 className="text-3xl font-extrabold neon-text flex items-center gap-3">
          <Users size={28} /> Players
        </h1>

        {/* Search Bar */}
        <div className="flex items-center gap-3 bg-white/10 px-4 py-2 rounded-xl w-72">
          <Search size={18} className="text-cyan-400" />
          <input
            type="text"
            placeholder="Search players..."
            className="bg-transparent outline-none text-sm text-white w-full"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </motion.div>

      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center items-center flex-1">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-cyan-400"></div>
        </div>
      ) : filteredPlayers.length === 0 ? (
        <p className="text-gray-400 text-center mt-10 text-lg">No players found 😕</p>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass neon-card rounded-2xl p-5 shadow-lg"
        >
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="p-3">#</th>
                <th className="p-3">Name</th>
                <th className="p-3">Position</th>
                <th className="p-3">Goals</th>
                <th className="p-3">Team</th>
              </tr>
            </thead>
            <tbody>
              {filteredPlayers.map((player: any, index: number) => (
                <motion.tr
                  key={player._id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-white/10 transition"
                >
                  <td className="p-3 text-gray-300">{index + 1}</td>
                  <td className="p-3 font-semibold">{player.name}</td>
                  <td className="p-3">{player.position}</td>
                  <td className="p-3 text-cyan-300">{player.goals}</td>
                  <td className="p-3">{player.team}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      )}
    </div>
  );
};

export default Players;
