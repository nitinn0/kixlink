import React, { useEffect, useState } from "react";
import axios from "axios";
import { Calendar, MapPin, Users } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

type Match = {
  _id: string;
  venue: string;
  date: string; // ISO string
  players: { name: string }[];
};

const MatchesPage: React.FC = () => {
  const navigate = useNavigate();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // ✅ Check if user is logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/auth/login");
    }
  }, [navigate]);

  // ✅ Fetch matches
  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await axios.get<Match[]>("http://localhost:4000/match/matches", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data: Match[] = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data.matches)
          ? res.data.matches
          : [];

        setMatches(data);
      } catch (error) {
        console.error("Error fetching matches:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, []);

  const filteredMatches = matches.filter(
    (match) =>
      match.venue.toLowerCase().includes(search.toLowerCase()) ||
      match.players.some((p) =>
        p.name.toLowerCase().includes(search.toLowerCase())
      )
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
          <Calendar size={28} /> Matches
        </h1>

        <div className="flex items-center gap-3 bg-white/10 px-4 py-2 rounded-xl w-72">
          <Users size={18} className="text-cyan-400" />
          <input
            type="text"
            placeholder="Search by venue or player..."
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
      ) : filteredMatches.length === 0 ? (
        <p className="text-gray-400 text-center mt-10 text-lg">
          No matches found ⚽
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
                <th className="p-3">Venue</th>
                <th className="p-3">Date</th>
                <th className="p-3">Players</th>
              </tr>
            </thead>
            <tbody>
              {filteredMatches.map((match, index) => (
                <motion.tr
                  key={match._id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="transition duration-200 ease-in-out"
                >
                  <td className="p-3 text-gray-300">{index + 1}</td>
                  <td className="p-3 flex items-center gap-2">
                    <MapPin size={16} /> {match.venue}
                  </td>
                  <td className="p-3 flex items-center gap-2">
                    <Calendar size={16} /> {new Date(match.date).toLocaleString()}
                  </td>
                  <td className="p-3 text-cyan-300">
                    {match.players.map((p) => p.name).join(", ")}
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

export default MatchesPage;
