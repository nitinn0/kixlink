import React, { useEffect, useState } from "react";
import axios from "axios";
import { Users, Calendar, LogIn, LogOut } from "lucide-react";
import { motion } from "framer-motion";

type Team = {
  _id: string;
  teamName: string;
  createdAt: string;
  players?: string[];
  image_url?: string;
};

const TeamsPage: React.FC = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("username");

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const res = await axios.get("http://localhost:4000/teamMgmt/teams", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTeams(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Error fetching teams:", err);
        setTeams([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTeams();
  }, [token]);

  const filteredTeams = search
    ? teams.filter((t) =>
        t.teamName.toLowerCase().includes(search.toLowerCase())
      )
    : teams;

  const joinTeam = async (teamId: string) => {
    if (!userId) return;
    try {
      await axios.post(
        `http://localhost:4000/teamMgmt/teams/${teamId}/members`,
        { player: userId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTeams((prev) =>
        prev.map((t) =>
          t._id === teamId
            ? { ...t, players: [...(t.players || []), userId] }
            : t
        )
      );
    } catch (err) {
      console.error("Error joining team:", err);
    }
  };

  const leaveTeam = (teamId: string) => {
    if (!userId) return;
    setTeams((prev) =>
      prev.map((t) =>
        t._id === teamId
          ? { ...t, players: (t.players || []).filter((p) => p !== userId) }
          : t
      )
    );
    // Optional: call backend to remove player
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
        Loading teams...
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center mb-6"
      >
        <h1 className="text-3xl font-extrabold text-[var(--text-accent)] flex items-center gap-3">
          <Users size={28} /> Teams
        </h1>
        <input
          type="text"
          placeholder="Search teams..."
          className="bg-[var(--bg-tertiary)] border border-[var(--border)] px-4 py-2 rounded-xl w-72 text-[var(--text-primary)] outline-none"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </motion.div>

      {/* Teams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto">
        {filteredTeams.length > 0 ? (
          filteredTeams.map((team) => {
            const members = Array.isArray(team.players) ? team.players : [];
            const isMember = userId ? members.includes(userId) : false;

            return (
              <motion.div
                key={team._id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl p-5 shadow-lg flex flex-col gap-3"
              >
                {/* Join/Leave Button Top-Right */}
                <div className="absolute top-10 right-10">
                  <button
                    onClick={() =>
                      isMember ? leaveTeam(team._id) : joinTeam(team._id)
                    }
                    className={`px-10 py-2 rounded-md text-sm font-semibold transition ${
                      isMember
                        ? "bg-red-500 hover:bg-red-600"
                        : "bg-[var(--text-accent)] hover:opacity-80"
                    } text-white`}
                  >
                    {isMember ? "Leave" : "Join"}
                  </button>
                </div>

                {team.image_url && (
                  <img
                    src={team.image_url}
                    alt={team.teamName}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                )}
                <h2 className="text-xl font-bold">{team.teamName}</h2>
                <p className="text-sm text-[var(--text-secondary)] flex items-center gap-2">
                  <Calendar size={16} />{" "}
                  {team.createdAt
                    ? new Date(team.createdAt).toLocaleDateString()
                    : "—"}
                </p>
                <p className="text-sm text-[var(--text-secondary)]">Members: {members.length}</p>
              </motion.div>
            );
          })
        ) : (
          <div className="col-span-full flex justify-center items-center text-[var(--text-secondary)] text-lg">
            🚫 No teams found
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamsPage;
