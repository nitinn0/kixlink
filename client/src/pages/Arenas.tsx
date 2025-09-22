import React, { useEffect, useState } from "react";
import axios from "axios";
import { Building2, Users, Search } from "lucide-react";
import { motion } from "framer-motion";

type Arena = {
  _id: string;
  image_url?: string;
  arenaName: string;
  totalCapacity: number;
};

const ArenasPage: React.FC = () => {
  const [arenas, setArenas] = useState<Arena[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchArenas = async () => {
      try {
        const res = await axios.get<Arena[]>("http://localhost:4000/arena");
        setArenas(res.data);
      } catch (error) {
        console.error("Error fetching arenas:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchArenas();
  }, []);

  const filteredArenas = arenas.filter((arena) =>
    arena.arenaName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col flex-1 h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white p-6">
      {/* Page Title + Search */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center mb-6"
      >
        <h1 className="text-3xl font-extrabold neon-text flex items-center gap-3">
          <Building2 size={28} /> Arenas
        </h1>

        <div className="flex items-center gap-3 bg-white/10 px-4 py-2 rounded-xl w-72">
          <Search size={18} className="text-cyan-400" />
          <input
            type="text"
            placeholder="Search arenas..."
            className="bg-transparent outline-none text-sm text-white w-full"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </motion.div>

      {/* Loading */}
      {loading ? (
        <div className="flex justify-center items-center flex-1">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-cyan-400"></div>
        </div>
      ) : filteredArenas.length === 0 ? (
        <p className="text-gray-400 text-center mt-10 text-lg">No arenas found 😕</p>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-4 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-10"
        >
          {filteredArenas.map((arena, index) => (
           <motion.div
  key={arena._id}
  initial={{ opacity: 0, y: 15 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: index * 0.05 }}
  className="glass neon-card rounded-xl overflow-hidden shadow-lg hover:shadow-[0_0_20px_rgba(34,211,238,0.6)] transition w-[300px] mx-auto"
  onClick={() => window.location.href = `/arena/${arena._id}`} 
>
  {/* Arena Image */}
  <img
    src={
      arena.image_url ||
      "https://images.unsplash.com/photo-1517747614396-d21a78b850e8?q=80&w=1600&auto=format&fit=crop"
    }
    alt={arena.arenaName}
    className="w-full h-56 object-cover"
  />

  {/* Arena Info */}
  <div className="p-5">
    <h2 className="text-lg font-semibold mb-2">
      {arena.arenaName || "Unnamed Arena"}
    </h2>
    <div className="flex items-center text-cyan-300">
      <Users size={18} className="mr-2" />
      Capacity: {arena.totalCapacity ?? "N/A"}
    </div>
  </div>
</motion.div>


          ))}
        </motion.div>
      )}
    </div>
  );
};

export default ArenasPage;
