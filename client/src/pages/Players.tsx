import React, { useEffect, useState } from "react";
import axios from "axios";
import { User, Search, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

type Player = {
  _id: string;
  name: string;
  username: string;
  position?: string;
  createdAt: string;
  image_url?: string;
};

const PlayersPage: React.FC = () => {
  const navigate = useNavigate();
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // ✅ Check if user is logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/auth/login");
    }
  }, [navigate]);

  // ✅ Fetch players
  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return; // avoid request if not logged in

        const res = await axios.get<Player[]>("http://localhost:4000/players", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setPlayers(res.data);
      } catch (error) {
        console.error("Error fetching players:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlayers();
  }, []);

  const filteredPlayers = players.filter(
    (player) =>
      player.name.toLowerCase().includes(search.toLowerCase()) ||
      player.username.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col flex-1 h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white p-6">
      {/* Page Title + Search */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center mb-6"
      >
        <h1 className="text-3xl font-extrabold flex items-center gap-3">
          <User size={28} /> Players
        </h1>

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

      {/* Loading / Empty / Table */}
      {loading ? (
        <div className="flex justify-center items-center flex-1">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-cyan-400"></div>
        </div>
      ) : filteredPlayers.length === 0 ? (
        <p className="text-gray-400 text-center mt-10 text-lg">
          No players found ⚽
        </p>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass rounded-xl mt-10 p-10 shadow-lg overflow-x-auto"
        >
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="p-3">#</th>
                <th className="p-3">Avatar</th>
                <th className="p-3">Name</th>
                <th className="p-3">Username</th>
                <th className="p-3">Position</th>
                <th className="p-3">Joined</th>
              </tr>
            </thead>
            <tbody>
              {filteredPlayers.map((player, index) => (
                <motion.tr
                  key={player._id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="transition duration-200 ease-in-out"
                >
                  <td className="p-3 text-gray-300">{index + 1}</td>
                  <td className="p-3">
                    <img
                      src={
                        player.image_url ||
                        "https://via.placeholder.com/40x40?text=P"
                      }
                      alt={player.name}
                      className="w-10 h-10 object-cover rounded-full border border-cyan-400"
                    />
                  </td>
                  <td className="p-3 font-semibold">{player.name}</td>
                  <td className="p-3 text-gray-300">@{player.username}</td>
                  <td className="p-3 text-cyan-300">
                    {player.position || "N/A"}
                  </td>
                  <td className="p-3 flex items-center gap-2 text-gray-400">
                    <Calendar size={16} />{" "}
                    {new Date(player.createdAt).toLocaleDateString()}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      )}
    </div>
  );
};

export default PlayersPage;
