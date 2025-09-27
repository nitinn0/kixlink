import React, { useEffect, useState } from "react";
import axios from "axios";
import { Users, Calendar, LogIn, LogOut } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

type Team = {
  _id: string;
  team_name: string;
  createdAt: string;
  image_url?: string;
  members: string[]; // array of user IDs
};

const TeamsPage: React.FC = () => {
  const navigate = useNavigate();
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [userId] = useState("12345"); // replace with logged-in user ID

  // Fetch all teams
  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const res = await axios.get("/api/teams");
        setTeams(res.data);
      } catch (err) {
        console.error("Error fetching teams", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTeams();
  }, []);

  // Join a team
  const joinTeam = async (teamId: string) => {
    try {
      await axios.post(`/api/teams/${teamId}/join`, { userId });
      setTeams((prev) =>
        prev.map((t) =>
          t._id === teamId ? { ...t, members: [...t.members, userId] } : t
        )
      );
    } catch (err) {
      console.error("Error joining team", err);
    }
  };

  // Leave a team
  const leaveTeam = async (teamId: string) => {
    try {
      await axios.post(`/api/teams/${teamId}/leave`, { userId });
      setTeams((prev) =>
        prev.map((t) =>
          t._id === teamId
            ? { ...t, members: t.members.filter((id) => id !== userId) }
            : t
        )
      );
    } catch (err) {
      console.error("Error leaving team", err);
    }
  };

  const filteredTeams = teams.filter((team) =>
    team.team_name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-white">
        Loading teams...
      </div>
    );
  }

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
          <input
            type="text"
            placeholder="Search teams..."
            className="bg-transparent outline-none text-sm text-white w-full"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </motion.div>

      {/* Teams List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto">
        {filteredTeams.map((team) => {
          const isMember = team.members.includes(userId);
          return (
            <motion.div
              key={team._id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/10 rounded-xl p-5 shadow-lg flex flex-col gap-3"
            >
              {team.image_url && (
                <img
                  src={team.image_url}
                  alt={team.team_name}
                  className="w-full h-32 object-cover rounded-lg"
                />
              )}
              <h2 className="text-xl font-bold">{team.team_name}</h2>
              <p className="text-sm text-gray-300 flex items-center gap-2">
                <Calendar size={16} />{" "}
                {new Date(team.createdAt).toLocaleDateString()}
              </p>
              <p className="text-sm text-gray-300">
                Members: {team.members.length}
              </p>

              <button
                onClick={() =>
                  isMember ? leaveTeam(team._id) : joinTeam(team._id)
                }
                className={`px-4 py-2 rounded-lg flex items-center justify-center gap-2 font-medium transition ${
                  isMember
                    ? "bg-red-500 hover:bg-red-600"
                    : "bg-cyan-500 hover:bg-cyan-600"
                }`}
              >
                {isMember ? (
                  <>
                    <LogOut size={16} /> Leave
                  </>
                ) : (
                  <>
                    <LogIn size={16} /> Join
                  </>
                )}
              </button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default TeamsPage;
