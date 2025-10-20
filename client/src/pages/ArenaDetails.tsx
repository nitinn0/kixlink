import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import { Users, Calendar } from "lucide-react";

type Match = {
  _id: string;
  venue: string;
  date: string;
};

type Arena = {
  _id: string;
  image_url?: string;
  arenaName: string;
  totalCapacity: number;
};

const ArenaDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [arena, setArena] = useState<Arena | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArenaDetails = async () => {
      try {
        const arenaRes = await axios.get<Arena>(`http://localhost:4000/arena/${id}`);
        setArena(arenaRes.data);

        const matchesRes = await axios.get<Match[]>(`http://localhost:4000/arena/${id}/matches`);
        setMatches(matchesRes.data);
      } catch (error) {
        console.error("Error fetching arena details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchArenaDetails();
  }, [id]);

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
  <div className="flex flex-row p-8 bg-gray-50 min-h-screen text-gray-900 gap-8">
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white rounded-xl overflow-hidden shadow-lg p-6 w-1/3 border"
  >
    <img
      src={
        arena.image_url ||
        "https://images.unsplash.com/photo-1517747614396-d21a78b850e8?q=80&w=1600&auto=format&fit=crop"
      }
      alt={arena.arenaName}
      className="w-full h-80 object-cover rounded-lg mb-8"
    />

    <h1 className="text-3xl font-bold mb-2 text-blue-600">{arena.arenaName}</h1>

    <div className="flex items-center gap-6 text-blue-500">
      <div className="flex items-center gap-2">
        <Users size={18} />
        <span>{arena.totalCapacity ?? "N/A"} Capacity</span>
      </div>
    </div>
  </motion.div>

  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex-1 mx-4"
  >
    <h2 className="text-2xl font-semibold mb-4 text-blue-600 mt-2">Matches</h2>

    {matches.length === 0 ? (
      <p className="text-gray-500">No matches scheduled in this arena yet.</p>
    ) : (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="grid grid-cols-1 sm:grid-cols-2 gap-6"
      >
        {matches.map((match, index) => (
          <motion.div
            key={match._id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white rounded-xl overflow-hidden shadow-lg p-4 border hover:shadow-xl transition cursor-pointer"
          >
            <h3 className="text-xl font-semibold mb-2">{match.venue || "Unnamed Match"}</h3>
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar size={18} />
              <span>{new Date(match.date).toLocaleString()}</span>
            </div>
          </motion.div>
        ))}
      </motion.div>
    )}
  </motion.div>
</div>

  );
};

export default ArenaDetails;
