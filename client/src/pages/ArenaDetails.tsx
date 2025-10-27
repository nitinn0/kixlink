import React, { useEffect, useState } from "react";
import axios from "../api/axiosConfig";
import { useParams, useNavigate } from "react-router-dom";
import { Calendar, Users, MapPin, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

type Match = {
  _id: string;
  venue: string;
  date: string;
  time: string;
  teams?: { _id: string; teamName: string; players: string[]; totalMembers: number }[];
  players: string[];
};

type Arena = {
  _id: string;
  image_url?: string;
  arenaName: string;
  totalCapacity: number;
};

const ArenaDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [arena, setArena] = useState<Arena | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArenaDetails = async () => {
      try {
        const arenaRes = await axios.get<Arena>(`/arena/${id}`);
        setArena(arenaRes.data);

        const matchesRes = await axios.get<Match[]>(`/arena/${id}/matches`);
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
      <div className="flex justify-center items-center h-screen bg-white">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-black"></div>
      </div>
    );

  if (!arena)
    return (
      <div className="text-center text-gray-900 mt-20">
        <p className="text-xl">Arena not found.</p>
      </div>
    );

  return (
  <div className="flex flex-col lg:flex-row p-4 sm:p-6 lg:p-8 bg-white min-h-screen text-gray-900 gap-4 lg:gap-8">
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white rounded-xl overflow-hidden shadow-lg p-4 sm:p-6 w-full lg:w-1/3 border"
  >
    <img
      src={
        arena.image_url ||
        "https://images.unsplash.com/photo-1517747614396-d21a78b850e8?q=80&w=1600&auto=format&fit=crop"
      }
      alt={arena.arenaName}
      className="w-full h-48 sm:h-64 lg:h-80 object-cover rounded-lg mb-4 sm:mb-6 lg:mb-8"
    />

    <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-2 text-black">{arena.arenaName}</h1>

    <div className="flex items-center gap-4 sm:gap-6 text-gray-700">
      <div className="flex items-center gap-2">
        <Users size={16} className="sm:w-5 sm:h-5" />
        <span className="text-sm sm:text-base">{arena.totalCapacity ?? "N/A"} Capacity</span>
      </div>
    </div>
  </motion.div>

  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex-1"
  >
    <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-black mt-2">Matches</h2>

    {matches.length === 0 ? (
      <p className="text-gray-500">No matches scheduled in this arena yet.</p>
    ) : (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6"
      >
        {matches.map((match, index) => (
          <motion.div
            key={match._id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white rounded-xl overflow-hidden shadow-lg p-4 sm:p-5 border border-gray-200 hover:shadow-xl transition cursor-pointer"
            onClick={() => navigate(`/matches`)} // Navigate to matches page or specific match
          >
            <h3 className="font-semibold text-black text-lg sm:text-xl mb-2">{match.venue || "Unnamed Match"}</h3>
            <p className="text-sm text-gray-600 mb-3">
              {new Date(match.date).toLocaleDateString()} at {match.time}
            </p>
            <div className="space-y-2">
              <div className="text-sm text-gray-600">
                <p><strong>Teams ({match.teams?.length || 0}):</strong></p>
                {match.teams && match.teams.length > 0 ? (
                  <ul className="list-disc list-inside mt-1 text-xs">
                    {match.teams.slice(0, 2).map(team => (
                      <li key={team._id} className="truncate">{team.teamName}</li>
                    ))}
                    {match.teams.length > 2 && <li>+{match.teams.length - 2} more</li>}
                  </ul>
                ) : (
                  <p className="text-xs italic">No teams yet</p>
                )}
              </div>
              <p className="text-sm text-gray-600 flex items-center gap-1">
                <Users size={14} />
                Players: {match.players?.length || 0}
              </p>
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
