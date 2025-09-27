import React, { useEffect, useState } from "react";
import axios from "axios";
import { Users, Search, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

type Team = {
  _id: string;
  team_name: string;
  createdAt: string;
  logo_url?: string;
};

const TeamsPage: React.FC = () => {
  const navigate = useNavigate();
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // ✅ Redirect if not logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/auth/login");
    }
  }, [navigate]);

  // ✅ Fetch teams dynamically
  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await axios.get<Team[]>("http://localhost:4000/teams", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setTeams(res.data);
      } catch (error) {
        console.error("Error fetching teams:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
  }, []);

  // ✅ Search filter
  const filteredTeams = teams.filter((team) =>
    team.team_name.toLowerCase().includes(search.toLowerCase())
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
          <Users size={28} /> Teams
        </h1>

        <div className="flex items-center gap-3 bg-white/10 px-4 py-2 rounded-xl w-72">
          <Search size={18} className="text-cyan-400" />
          <input
            type="text"
            placeholder="Search teams..."
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
      ) : filteredTeams.length === 0 ? (
        <p className="text-gray-400 text-center mt-10 text-lg">
          No teams found 🏆
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
                <th className="p-3">Logo</th>
                <th className="p-3">Team Name</th>
                <th className="p-3">Created</th>
              </tr>
            </thead>
            <tbody>
              {filteredTeams.map((team, index) => (
                <motion.tr
                  key={team._id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="transition duration-200 ease-in-out"
                >
                  <td className="p-3 text-gray-300">{index + 1}</td>
                  <td className="p-3">
                    <img
                      src={team.logo_url || "https://via.placeholder.com/40x40?text=T"}
                      alt={team.team_name}
                      className="w-10 h-10 object-cover rounded-full border border-cyan-400"
                    />
                  </td>
                  <td className="p-3 font-semibold">{team.team_name}</td>
                  <td className="p-3 flex items-center gap-2 text-gray-400">
                    <Calendar size={16} />{" "}
                    {new Date(team.createdAt).toLocaleDateString()}
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

export default TeamsPage;
