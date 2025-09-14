import React, { useEffect, useState } from "react";
import axios from "axios";
import { Calendar, MapPin, Users, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

type Match = {
  _id: string;
  venue: string;
  time: string; // Added time field
  date: string; // ISO string
  players: string[]; // Changed from objects to array of strings
};

const MatchesPage: React.FC = () => {
  const navigate = useNavigate();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

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

        console.log("API Response:", res.data); // Debug log

        const data: Match[] = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data.matches)
          ? res.data.matches
          : [];

        setMatches(data);
        setError("");
      } catch (error) {
        console.error("Error fetching matches:", error);
        setError("Failed to fetch matches. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, []);

  const filteredMatches = matches.filter(
    (match) =>
      match.venue.toLowerCase().includes(search.toLowerCase()) ||
      match.players.some((playerName) =>
        playerName.toLowerCase().includes(search.toLowerCase())
      )
  );

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return "Invalid Date";
    }
  };

  return (
    <div className="flex flex-col flex-1 h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white p-6">
      {/* Page Title + Search */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center mb-6"
      >
        <h1 className="text-3xl font-extrabold flex items-center gap-3">
          <Calendar size={28} /> Upcoming Matches
        </h1>

        <div className="flex items-center gap-3 bg-white/10 px-4 py-2 rounded-xl w-72">
          <Users size={18} className="text-cyan-400" />
          <input
            type="text"
            placeholder="Search by venue or player..."
            className="bg-transparent outline-none text-sm text-white w-full placeholder-gray-400"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </motion.div>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-3 rounded-xl mb-4"
        >
          {error}
        </motion.div>
      )}

      {/* Loading / Empty / Table */}
      {loading ? (
        <div className="flex justify-center items-center flex-1">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-cyan-400"></div>
        </div>
      ) : filteredMatches.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <Calendar size={64} className="mx-auto mb-4 text-gray-500" />
            <p className="text-gray-400 text-xl mb-2">
              {search ? "No matches found" : "No upcoming matches"} ⚽
            </p>
            {search && (
              <p className="text-gray-500 text-sm">
                Try searching for a different venue or player
              </p>
            )}
          </motion.div>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white/5 backdrop-blur-sm rounded-xl p-6 shadow-2xl overflow-x-auto"
        >
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-600/50">
                <th className="p-4 text-gray-300 font-semibold">#</th>
                <th className="p-4 text-gray-300 font-semibold">Venue</th>
                <th className="p-4 text-gray-300 font-semibold">Date</th>
                <th className="p-4 text-gray-300 font-semibold">Time</th>
                <th className="p-4 text-gray-300 font-semibold">
                  Players ({matches.reduce((acc, match) => acc + match.players.length, 0)})
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredMatches.map((match, index) => (
                <motion.tr
                  key={match._id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-b border-gray-700/30 hover:bg-white/5 transition-colors duration-200"
                >
                  <td className="p-4 text-gray-400">{index + 1}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <MapPin size={16} className="text-emerald-400" />
                      <span className="text-white font-medium">{match.venue}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Calendar size={16} className="text-blue-400" />
                      <span className="text-gray-200">{formatDate(match.date)}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Clock size={16} className="text-purple-400" />
                      <span className="text-gray-200">{match.time}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Users size={16} className="text-cyan-400" />
                      <span className="text-cyan-300">
                        {match.players.length > 0 ? (
                          <span className="inline-flex items-center gap-1">
                            {match.players.length} 
                            <span className="text-gray-400">
                              ({match.players.slice(0, 2).join(", ")}
                              {match.players.length > 2 && `, +${match.players.length - 2} more`})
                            </span>
                          </span>
                        ) : (
                          <span className="text-gray-500 italic">No players yet</span>
                        )}
                      </span>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      )}

      {/* Summary Stats */}
      {matches.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 flex gap-4 text-sm"
        >
          <div className="bg-white/5 px-4 py-2 rounded-lg">
            <span className="text-gray-400">Total Matches: </span>
            <span className="text-white font-semibold">{matches.length}</span>
          </div>
          <div className="bg-white/5 px-4 py-2 rounded-lg">
            <span className="text-gray-400">Total Players: </span>
            <span className="text-cyan-400 font-semibold">
              {matches.reduce((acc, match) => acc + match.players.length, 0)}
            </span>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default MatchesPage;