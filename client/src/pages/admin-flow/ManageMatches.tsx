import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Users, Calendar, PlusCircle, Trash2 } from "lucide-react";

interface Arena {
  _id: string;
  arenaName: string;
  totalCapacity: number;
  image_url?: string;
}

interface Match {
  _id: string;
  venue: string;
  date: string;
  time: string;
  arenaId: { arenaName: string };
}

const ManageMatches = () => {
  const [arenas, setArenas] = useState<Arena[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [selectedArena, setSelectedArena] = useState<string>("");

  const [formData, setFormData] = useState({
    date: "",
    time: "",
  });

  // Fetch arenas and matches
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const [arenasRes, matchesRes] = await Promise.all([
          axios.get<Arena[]>("http://localhost:4000/arena"),
          axios.get<Match[]>("http://localhost:4000/match/matches", {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);
        setArenas(arenasRes.data);
        setMatches(matchesRes.data);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle add match
  const handleAddMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedArena) {
      alert("Please select an arena");
      return;
    }
    try {
      setAdding(true);
      const token = localStorage.getItem("token");
      const selectedArenaObj = arenas.find(a => a._id === selectedArena);

      await axios.post(
        "http://localhost:4000/admin/addMatch",
        {
          arenaId: selectedArena,
          venue: selectedArenaObj?.arenaName,
          date: formData.date,
          time: formData.time,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("✅ Match added successfully!");
      setFormData({ date: "", time: "" });
      setSelectedArena("");

      // Refresh matches
      const updated = await axios.get<Match[]>("http://localhost:4000/match/matches", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMatches(updated.data);
    } catch (err: any) {
      console.error("Error adding match:", err);
      alert(err.response?.data?.error || "Error adding match");
    } finally {
      setAdding(false);
    }
  };

  // Handle delete match
  const handleDeleteMatch = async (matchId: string) => {
    if (!confirm("Are you sure you want to delete this match?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `http://localhost:4000/admin/deleteMatch/${matchId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Match deleted successfully!");
      // Refresh matches
      const updated = await axios.get<Match[]>("http://localhost:4000/match/matches", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMatches(updated.data);
    } catch (err: any) {
      console.error("Error deleting match:", err);
      alert("Error deleting match");
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
      </div>
    );

  return (
    <div className="flex flex-col p-8 bg-gray-50 min-h-screen text-gray-900 gap-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl p-6 shadow-lg border"
      >
        <h1 className="text-3xl font-bold mb-6 text-blue-600 flex items-center gap-2">
          <PlusCircle size={28} /> Post Upcoming Match
        </h1>
        <form onSubmit={handleAddMatch} className="space-y-4">
          <div>
            <label className="block text-sm mb-1 text-gray-700">Select Arena</label>
            <select
              value={selectedArena}
              onChange={(e) => setSelectedArena(e.target.value)}
              required
              className="w-full bg-white p-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Choose an arena</option>
              {arenas.map((arena) => (
                <option key={arena._id} value={arena._id}>
                  {arena.arenaName}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm mb-1 text-gray-700">Venue</label>
            <input
              type="text"
              value={selectedArena ? arenas.find(a => a._id === selectedArena)?.arenaName || "" : ""}
              readOnly
              className="w-full bg-gray-100 text-gray-500 p-2 rounded-lg border border-gray-300"
            />
          </div>
          <div>
            <label className="block text-sm mb-1 text-gray-700">Date</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
              className="w-full bg-white p-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm mb-1 text-gray-700">Time</label>
            <input
              type="time"
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              required
              className="w-full bg-white p-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            disabled={adding}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg font-semibold transition-all"
          >
            {adding ? "Adding..." : "Add Match"}
          </button>
        </form>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-2xl font-semibold mb-6 text-blue-600">
          All Upcoming Matches
        </h2>
        {matches.length === 0 ? (
          <p className="text-gray-500">No upcoming matches.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {matches.map((match, index) => (
              <motion.div
                key={match._id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-xl p-4 shadow-lg border hover:shadow-xl transition relative"
              >
                <button
                  onClick={() => handleDeleteMatch(match._id)}
                  className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                >
                  <Trash2 size={16} />
                </button>
                <h3 className="text-xl font-semibold mb-2">
                  {match.venue || "Unnamed Match"}
                </h3>
                <p className="text-blue-600 mb-1">
                  Arena: {match.arenaId?.arenaName || "Unknown"}
                </p>
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar size={18} />
                  <span>{new Date(match.date).toLocaleString()}</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default ManageMatches;
