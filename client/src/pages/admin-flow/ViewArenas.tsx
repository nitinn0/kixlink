// src/pages/admin-flow/ViewArenas.tsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Building2, Users, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

type Arena = {
  _id: string;
  image_url?: string;
  arenaName: string;
  totalCapacity: number;
};

const ViewArenas: React.FC = () => {
  const [arenas, setArenas] = useState<Arena[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchArenas = async () => {
      try {
        const res = await axios.get("http://localhost:4000/arena");
        setArenas(res.data);
      } catch (error) {
        console.error("Error fetching arenas:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchArenas();
  }, []);

  const filtered = arenas.filter((a) =>
    a.arenaName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <h1 className="text-3xl font-extrabold flex items-center gap-3">
          <Building2 /> View Arenas
        </h1>

        {/* Search bar */}
        <div className="flex items-center gap-3 bg-white/10 px-4 py-2 rounded-xl w-full sm:w-72">
          <Search size={18} className="text-cyan-400" />
          <input
            type="text"
            placeholder="Search arenas..."
            className="bg-transparent outline-none text-sm text-white w-full"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="flex justify-center items-center flex-1">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-cyan-400"></div>
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-gray-400 text-center mt-10 text-lg">
          No arenas found 😕
        </p>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid gap-6 grid-cols-[repeat(auto-fit,minmax(280px,1fr))]"
        >
          {filtered.map((arena, index) => (
            <motion.div
              key={arena._id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white/10 backdrop-blur-xl rounded-xl p-4 cursor-pointer hover:shadow-[0_0_20px_rgba(34,211,238,0.6)] transition"
              onClick={() => navigate(`/arena/${arena._id}/addMatch`)}
            >
              <img
                src={
                  arena.image_url ||
                  "https://images.unsplash.com/photo-1517747614396-d21a78b850e8?q=80&w=1600&auto=format&fit=crop"
                }
                alt={arena.arenaName}
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
              <h2 className="text-xl font-semibold">{arena.arenaName}</h2>
              <p className="text-cyan-300 flex items-center gap-2 mt-2">
                <Users size={18} /> Capacity: {arena.totalCapacity ?? "N/A"}
              </p>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default ViewArenas;
