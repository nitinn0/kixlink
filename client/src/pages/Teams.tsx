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
  members?: string[]; // optional at runtime
};

const TeamsPage: React.FC = () => {
  const navigate = useNavigate();
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [userId] = useState("12345"); // replace with your auth user id

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const res = await axios.get("/api/teams");
        let payload: any = res.data;

        // Normalize common API shapes to an array
        if (!Array.isArray(payload)) {
          if (payload && Array.isArray(payload.teams)) payload = payload.teams;
          else if (payload && Array.isArray(payload.data)) payload = payload.data;
          else if (payload && Array.isArray(payload.result)) payload = payload.result;
          else {
            // unknown shape -> log for debugging and fallback to empty array
            console.warn("Unexpected /api/teams response shape:", res.data);
            payload = [];
          }
        }

        setTeams(payload as Team[]);
      } catch (err) {
        console.error("Error fetching teams", err);
        setTeams([]); // keep consistent type at runtime
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
  }, []);

  // ensure we always operate on an array
  const safeTeams = Array.isArray(teams) ? teams : [];

  const filteredTeams = search
    ? safeTeams.filter((team) =>
        team.team_name.toLowerCase().includes(search.toLowerCase())
      )
    : safeTeams;

  const joinTeam = async (teamId: string) => {
    try {
      await axios.post(`/api/teams/${teamId}/join`, { userId });
      setTeams((prev) =>
        prev.map((t) => {
          if (t._id !== teamId) return t;
          const members = Array.isArray(t.members) ? t.members : [];
          if (members.includes(userId)) return t;
          return { ...t, members: [...members, userId] };
        })
      );
    } catch (err) {
      console.error("Error joining team", err);
    }
  };

  const leaveTeam = async (teamId: string) => {
    try {
      await axios.post(`/api/teams/${teamId}/leave`, { userId });
      setTeams((prev) =>
        prev.map((t) => {
          if (t._id !== teamId) return t;
          const members = Array.isArray(t.members) ? t.members : [];
          return { ...t, members: members.filter((id) => id !== userId) };
        })
      );
    } catch (err) {
      console.error("Error leaving team", err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-white">
        Loading teams...
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white p-6">
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto">
        {filteredTeams.length > 0 ? (
          filteredTeams.map((team) => {
            const members = Array.isArray(team.members) ? team.members : [];
            const isMember = members.includes(userId);
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
                  {team.createdAt
                    ? new Date(team.createdAt).toLocaleDateString()
                    : "—"}
                </p>
                <p className="text-sm text-gray-300">Members: {members.length}</p>

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
          })
        ) : (
          <div className="col-span-full flex justify-center items-center text-gray-300 text-lg">
            🚫 No teams found
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamsPage;
