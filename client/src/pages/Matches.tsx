import React, { useEffect, useState } from "react";
import axios from "axios";
import { Calendar, MapPin, Users, Clock, Eye, LogIn, LogOut } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

type Match = {
  _id: string;
  venue: string;
  time: string;
  date: string;
  players: string[];
};

const MatchesPage: React.FC = () => {
  const navigate = useNavigate();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [userJoinedMatchId, setUserJoinedMatchId] = useState<string | null>(null);

  const username = localStorage.getItem("username");
  const token = localStorage.getItem("token");

  // ✅ Check login
  useEffect(() => {
    if (!token) navigate("/auth/login");
  }, [navigate, token]);

  // ✅ Fetch matches and determine if user has joined one
  useEffect(() => {
    const fetchMatches = async () => {
      try {
        if (!token) return;
        const res = await axios.get("http://localhost:4000/match/matches", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data: Match[] = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data.matches)
          ? res.data.matches
          : [];

        setMatches(data);

        // Check if user has already joined a match
        const joined = data.find((m) => username && m.players.includes(username));
        setUserJoinedMatchId(joined?._id || null);
        setError("");
      } catch (err) {
        console.error("Error fetching matches:", err);
        setError("Failed to fetch matches. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, [token, username]);

  // ✅ Join Match handler
  const handleJoinMatch = async (matchId: string) => {
    if (!token || !username) return;

    if (userJoinedMatchId) {
      alert("You can only join one match at a time!");
      return;
    }

    try {
      const res = await axios.post(
        `http://localhost:4000/match/joinMatch/${matchId}`,
        { playerName: username },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("Joined match:", res.data);

      // Update state locally
      setMatches((prev) =>
        prev.map((m) =>
          m._id === matchId ? { ...m, players: [...m.players, username] } : m
        )
      );
      setUserJoinedMatchId(matchId);
    } catch (err) {
      console.error("Error joining match:", err);
      alert("Failed to join match");
    }
  };

  // ✅ Exit Match handler
  const handleExitMatch = async (matchId: string) => {
    if (!token || !username) return;

    try {
      const res = await axios.post(
        `http://localhost:4000/match/exitMatch/${matchId}`,
        { playerName: username },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("Exited match:", res.data);

      setMatches((prev) =>
        prev.map((m) =>
          m._id === matchId
            ? { ...m, players: m.players.filter((p) => p !== username) }
            : m
        )
      );
      setUserJoinedMatchId(null);
    } catch (err) {
      console.error("Error exiting match:", err);
      alert("Failed to exit match");
    }
  };

  // Filter matches
  const filteredMatches = matches.filter(
    (match) =>
      match.venue.toLowerCase().includes(search.toLowerCase()) ||
      match.players.some((p) => p.toLowerCase().includes(search.toLowerCase()))
  );

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "Invalid Date";
    }
  };

  return (
    <div className="flex flex-col flex-1 h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white p-6">
      {/* Title + Search */}
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

      {/* Error */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-3 rounded-xl mb-4"
        >
          {error}
        </motion.div>
      )}

      {/* Matches Table */}
      {loading ? (
        <div className="flex justify-center items-center flex-1">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-cyan-400"></div>
        </div>
      ) : filteredMatches.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1">
          <Calendar size={64} className="mx-auto mb-4 text-gray-500" />
          <p className="text-gray-400 text-xl">
            {search ? "No matches found" : "No upcoming matches"} ⚽
          </p>
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
                <th className="p-4 text-gray-300 font-semibold">Players</th>
                <th className="p-4 text-gray-300 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMatches.map((match, index) => {
                const userInThisMatch = username && match.players.includes(username);
                return (
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
                        <span className="text-cyan-300">{match.players.length}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        {!userInThisMatch ? (
                          <button
                            onClick={() => handleJoinMatch(match._id)}
                            disabled={!!userJoinedMatchId}
                            title={userJoinedMatchId ? "You can only join one match at a time" : ""}
                            className="bg-cyan-600 hover:bg-cyan-700 px-3 py-1 rounded-md flex items-center gap-1 text-sm disabled:opacity-50"
                          >
                            <LogIn size={14} /> Join
                          </button>
                        ) : (
                          <button
                            onClick={() => handleExitMatch(match._id)}
                            className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded-md flex items-center gap-1 text-sm"
                          >
                            <LogOut size={14} /> Exit
                          </button>
                        )}

                        <button
                          onClick={() => setSelectedMatch(match)}
                          className="bg-indigo-600 hover:bg-indigo-700 px-3 py-1 rounded-md flex items-center gap-1 text-sm"
                        >
                          <Eye size={14} /> View
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </motion.div>
      )}

      {/* Players Modal */}
      {selectedMatch && (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50">
          <div className="bg-[#1e1e2f] p-6 rounded-xl w-96">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Users size={20} className="text-cyan-400" /> Players in{" "}
              {selectedMatch.venue}
            </h2>
            {selectedMatch.players.length > 0 ? (
              <ul className="space-y-2">
                {selectedMatch.players.map((p, i) => (
                  <li
                    key={i}
                    className="bg-white/10 px-3 py-2 rounded-md text-white"
                  >
                    {p}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-400 italic">No players joined yet.</p>
            )}
            <button
              onClick={() => setSelectedMatch(null)}
              className="mt-4 w-full bg-red-600 hover:bg-red-700 px-3 py-2 rounded-md"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MatchesPage;
