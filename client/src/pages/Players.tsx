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
    <div className="flex flex-col flex-1 h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] p-6">
      {/* Page Title + Search */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center mb-6"
      >
        <h1 className="text-3xl font-extrabold text-[var(--text-accent)] flex items-center gap-3">
          <User size={28} /> Players
        </h1>

        <div className="flex items-center gap-3 bg-[var(--bg-tertiary)] px-4 py-2 rounded-xl w-72 border border-[var(--border)]">
          <Search size={18} className="text-[var(--text-accent)]" />
          <input
            type="text"
            placeholder="Search players..."
            className="bg-transparent outline-none text-sm text-[var(--text-primary)] w-full"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </motion.div>

      {/* Loading / Empty / Table */}
      {loading ? (
        <div className="flex justify-center items-center flex-1">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-[var(--text-accent)]"></div>
        </div>
      ) : filteredPlayers.length === 0 ? (
        <p className="text-[var(--text-secondary)] text-center mt-10 text-lg">
          No players found ⚽
        </p>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl mt-10 p-10 shadow-lg overflow-x-auto"
        >
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--border)]">
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
                  className="transition duration-200 ease-in-out hover:bg-[var(--bg-tertiary)]"
                >
                  <td className="p-3 text-[var(--text-secondary)]">{index + 1}</td>
                  <td className="p-3">
                    <img
                      src={
                        player.image_url ||
                        "/default-avatar.png"
                      }
                      alt={player.name}
                      className="w-10 h-10 object-cover rounded-full border border-[var(--text-accent)]"
                    />
                  </td>
                  <td className="p-3 font-semibold">{player.name}</td>
                  <td className="p-3 text-[var(--text-secondary)]">@{player.username}</td>
                  <td className="p-3 text-[var(--text-accent)]">
                    {player.position || "N/A"}
                  </td>
                  <td className="p-3 flex items-center gap-2 text-[var(--text-secondary)]">
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
