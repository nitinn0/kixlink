import React, { useEffect, useState } from "react";
import axios from "../api/axiosConfig";
import { Building2, Users, Search } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();

  useEffect(() => {
    const fetchArenas = async () => {
      try {
        const res = await axios.get("/arena");
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
    <div className="flex flex-col flex-1 h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] p-6">
      {/* Page Title + Search */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center mb-6"
      >
        <h1 className="text-3xl font-extrabold text-[var(--text-accent)] flex items-center gap-3">
          <Building2 size={28} /> Arenas
        </h1>

        <div className="flex items-center gap-3 bg-[var(--bg-tertiary)] px-4 py-2 rounded-xl w-72 border border-[var(--border)]">
          <Search size={18} className="text-[var(--text-accent)]" />
          <input
            type="text"
            placeholder="Search arenas..."
            className="bg-transparent outline-none text-sm text-[var(--text-primary)] w-full"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </motion.div>

      {/* Loading */}
      {loading ? (
        <div className="flex justify-center items-center flex-1">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-[var(--text-accent)]"></div>
        </div>
      ) : filteredArenas.length === 0 ? (
        <p className="text-[var(--text-secondary)] text-center mt-10 text-lg">No arenas found 😕</p>
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
  className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition w-[300px] mx-auto cursor-pointer"
  onClick={() => navigate(`/arena/${arena._id}`)}
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
    <div className="flex items-center text-[var(--text-accent)]">
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
