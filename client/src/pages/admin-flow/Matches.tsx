import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import { Users, Calendar, PlusCircle } from "lucide-react";

const Matches = () => {
  const { id } = useParams(); // arena ID
  const [arena, setArena] = useState<any>(null);
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  const [formData, setFormData] = useState({
    date: "",
    time: "",
  });

  // Fetch arena info and matches
  useEffect(() => {
    const fetchArenaAndMatches = async () => {
      try {
        const arenaRes = await axios.get(`http://localhost:4000/arena/${id}`);
        setArena(arenaRes.data);

        const matchesRes = await axios.get(
          `http://localhost:4000/arena/${id}/matches`
        );
        setMatches(matchesRes.data);
      } catch (err) {
        console.error("Error fetching arena/matches:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchArenaAndMatches();
  }, [id]);

  // Handle add match
  const handleAddMatch = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
    setAdding(true);
    const token = localStorage.getItem("token");

    await axios.post(
      "http://localhost:4000/admin/addMatch",
      {
        arenaId: id,
        venue: arena?.arenaName,
        date: formData.date,
        time: formData.time,
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    alert("✅ Match added successfully!");
    setFormData({ date: "", time: "" });

    // Refresh matches correctly
    const updated = await axios.get(`http://localhost:4000/arena/${id}/matches`);
    setMatches(updated.data);
  } catch (err: any) {
    console.error("Error adding match:", err);
    alert(err.response?.data?.error || "Error adding match");
  } finally {
    setAdding(false);
  }
};

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
      </div>
    );

  if (!arena)
    return (
      <div className="text-center text-gray-900 mt-20">
        <p className="text-xl">Arena not found.</p>
      </div>
    );

  return (
    <div className="flex flex-col lg:flex-row p-8 bg-gray-50 min-h-screen text-gray-900 gap-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl p-6 w-full lg:w-1/3 shadow-lg border"
      >
        <img
          src={
            arena.image_url ||
            "https://images.unsplash.com/photo-1517747614396-d21a78b850e8?q=80&w=1600&auto=format&fit=crop"
          }
          alt={arena.arenaName}
          className="w-full h-64 object-cover rounded-lg mb-6"
        />
        <h1 className="text-3xl font-bold mb-3 text-blue-600">
          {arena.arenaName}
        </h1>
        <p className="flex items-center gap-2 text-blue-500">
          <Users size={18} /> Capacity: {arena.totalCapacity ?? "N/A"}
        </p>

        {/* Add Match Form */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4 text-blue-600 flex items-center gap-2">
            <PlusCircle size={20} /> Add New Match
          </h2>
          <form onSubmit={handleAddMatch} className="space-y-4">
            <div>
              <label className="block text-sm mb-1 text-gray-700">Venue</label>
              <input
                type="text"
                value={arena.arenaName}
                readOnly
                className="w-full bg-gray-100 text-gray-500 p-2 rounded-lg border border-gray-300"
              />
            </div>
            <div>
              <label className="block text-sm mb-1 text-gray-700">Date</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                required
                className="w-full bg-white p-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm mb-1 text-gray-700">Time</label>
              <input
                type="time"
                value={formData.time}
                onChange={(e) =>
                  setFormData({ ...formData, time: e.target.value })
                }
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
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-1"
      >
        <h2 className="text-2xl font-semibold mb-6 text-blue-600">
          Upcoming Matches
        </h2>
        {matches.length === 0 ? (
          <p className="text-gray-500">No matches scheduled yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {matches.map((match, index) => (
              <motion.div
                key={match._id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-xl p-4 shadow-lg border hover:shadow-xl transition"
              >
                <h3 className="text-xl font-semibold mb-2">
                  {match.venue || "Unnamed Match"}
                </h3>
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

export default Matches;
