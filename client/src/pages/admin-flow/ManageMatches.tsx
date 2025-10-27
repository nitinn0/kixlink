import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Users, Calendar, PlusCircle, Trash2 } from "lucide-react";

interface Arena {
  _id: string;
  arenaName: string;
  totalCapacity: number;
  image_url?: string;
}

interface Match {
  _id: string;
  venue: string;
  date: string;
  time: string;
  arenaId: { arenaName: string };
  teams?: { _id: string; teamName: string; players: string[]; totalMembers: number }[];
}

const ManageMatches = () => {
  const [arenas, setArenas] = useState<Arena[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [selectedArena, setSelectedArena] = useState<string>("");
  const [creatingTeams, setCreatingTeams] = useState<{ [key: string]: boolean }>({});

  const [showTeamModal, setShowTeamModal] = useState(false);
  const [selectedMatchId, setSelectedMatchId] = useState<string>("");
  const [showManageModal, setShowManageModal] = useState(false);
  const [selectedMatchForManage, setSelectedMatchForManage] = useState<any>(null);
  const [teamForm, setTeamForm] = useState({
    teamName: "",
    totalMembers: 5
  });

  const [formData, setFormData] = useState({
    date: "",
    time: "",
  });
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const [arenasRes, matchesRes] = await Promise.all([
          axios.get<Arena[]>("http://localhost:4000/arena"),
          axios.get<Match[]>("http://localhost:4000/match/matches", {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);
        setArenas(arenasRes.data);
        setMatches(matchesRes.data);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle add match
  const handleAddMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedArena) {
      alert("Please select an arena");
      return;
    }
    try {
      setAdding(true);
      const token = localStorage.getItem("token");
      const selectedArenaObj = arenas.find(a => a._id === selectedArena);

      await axios.post(
        "http://localhost:4000/admin/addMatch",
        {
          arenaId: selectedArena,
          venue: selectedArenaObj?.arenaName,
          date: formData.date,
          time: formData.time,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("✅ Match added successfully!");
      setFormData({ date: "", time: "" });
      setSelectedArena("");

      // Refresh matches
      const updated = await axios.get<Match[]>("http://localhost:4000/match/matches", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMatches(updated.data);
    } catch (err: any) {
      console.error("Error adding match:", err);
      alert(err.response?.data?.error || "Error adding match");
    } finally {
      setAdding(false);
    }
  };

  // Handle delete match
  const handleDeleteMatch = async (matchId: string) => {
    if (!confirm("Are you sure you want to delete this match?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `http://localhost:4000/admin/deleteMatch/${matchId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Match deleted successfully!");
      // Refresh matches
      const updated = await axios.get<Match[]>("http://localhost:4000/match/matches", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMatches(updated.data);
    } catch (err: any) {
      console.error("Error deleting match:", err);
      alert("Error deleting match");
    }
  };

  // Handle open create team modal
  const handleOpenCreateTeam = (matchId: string) => {
    setSelectedMatchId(matchId);
    setTeamForm({ teamName: "", totalMembers: 5 });
    setShowTeamModal(true);
  };

  // Handle submit team creation
  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingTeams(prev => ({ ...prev, [selectedMatchId]: true }));
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `http://localhost:4000/admin/createTeamForMatch/${selectedMatchId}`,
        teamForm,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Team created successfully!");
      setShowTeamModal(false);
      // Refresh matches
      const updated = await axios.get<Match[]>("http://localhost:4000/match/matches", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMatches(updated.data);
    } catch (err: any) {
      console.error("Error creating team:", err);
      alert(err.response?.data?.error || "Error creating team");
    } finally {
      setCreatingTeams(prev => ({ ...prev, [selectedMatchId]: false }));
    }
  };

  // Handle remove player from team
  const handleRemovePlayer = async (teamId: string, playerName: string) => {
    if (!confirm(`Remove ${playerName} from this team?`)) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `http://localhost:4000/teamMgmt/teams/${teamId}/members`,
        {
          data: { player: playerName },
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      alert("Player removed successfully!");
      // Refresh matches
      const updated = await axios.get<Match[]>("http://localhost:4000/match/matches", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMatches(updated.data);
      setSelectedMatchForManage(updated.data.find(m => m._id === selectedMatchForManage._id));
    } catch (err: any) {
      console.error("Error removing player:", err);
      alert(err.response?.data?.error || "Error removing player");
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen bg-white">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-black"></div>
      </div>
    );

  return (
    <div className="flex flex-col p-8 bg-white min-h-screen text-gray-900 gap-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-50 rounded-xl p-6 shadow-lg border border-gray-200"
      >
        <h1 className="text-3xl font-bold mb-6 text-black flex items-center gap-2">
          <PlusCircle size={28} /> Post Upcoming Match
        </h1>
        <form onSubmit={handleAddMatch} className="space-y-4">
          <div>
            <label className="block text-sm mb-1 text-gray-700">Select Arena</label>
            <select
              value={selectedArena}
              onChange={(e) => setSelectedArena(e.target.value)}
              required
              className="w-full bg-white p-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-black"
            >
              <option value="">Choose an arena</option>
              {arenas.map((arena) => (
                <option key={arena._id} value={arena._id}>
                  {arena.arenaName}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm mb-1 text-gray-700">Venue</label>
            <input
              type="text"
              value={selectedArena ? arenas.find(a => a._id === selectedArena)?.arenaName || "" : ""}
              readOnly
              className="w-full bg-gray-100 text-gray-500 p-2 rounded-lg border border-gray-300"
            />
          </div>
          <div>
            <label className="block text-sm mb-1 text-gray-700">Date</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
              className="w-full bg-white p-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-black"
            />
          </div>
          <div>
            <label className="block text-sm mb-1 text-gray-700">Time</label>
            <input
              type="time"
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              required
              className="w-full bg-white p-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-black"
            />
          </div>
          <button
            type="submit"
            disabled={adding}
            className="w-full bg-black hover:bg-gray-800 text-white py-2 rounded-lg font-semibold transition-all"
          >
            {adding ? "Adding..." : "Add Match"}
          </button>
        </form>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-2xl font-semibold mb-6 text-black">
          All Upcoming Matches
        </h2>
        {matches.length === 0 ? (
          <p className="text-gray-500">No upcoming matches.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {matches.map((match, index) => (
              <motion.div
                key={match._id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-xl p-4 shadow-lg border border-gray-200 hover:shadow-xl transition relative"
              >
                <button
                  onClick={() => handleDeleteMatch(match._id)}
                  className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                >
                  <Trash2 size={16} />
                </button>
                <h3 className="text-xl font-semibold mb-2">
                  {match.venue || "Unnamed Match"}
                </h3>
                <p className="text-gray-600 mb-1">
                  Arena: {match.arenaId?.arenaName || "Unknown"}
                </p>
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar size={18} />
                  <span>{new Date(match.date).toLocaleString()}</span>
                </div>
                <div className="mt-4 flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={() => handleOpenCreateTeam(match._id)}
                    className="bg-black hover:bg-gray-800 text-white px-3 py-2 rounded-lg font-semibold transition text-sm flex-1"
                  >
                    Add Team
                  </button>
                  {match.teams && match.teams.length > 0 && (
                    <button
                      onClick={() => {
                        setSelectedMatchForManage(match);
                        setShowManageModal(true);
                      }}
                      className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded-lg font-semibold transition text-sm flex-1"
                    >
                      Manage Teams ({match.teams.length})
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Team Creation Modal */}
      {showTeamModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <h2 className="text-xl font-bold mb-4 text-black">Create Team</h2>
            <form onSubmit={handleCreateTeam}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1 text-gray-700">Team Name</label>
                <input
                  type="text"
                  value={teamForm.teamName}
                  onChange={(e) => setTeamForm({ ...teamForm, teamName: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-black"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1 text-gray-700">Total Members</label>
                <input
                  type="number"
                  value={teamForm.totalMembers}
                  onChange={(e) => setTeamForm({ ...teamForm, totalMembers: parseInt(e.target.value) })}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-black"
                  min="1"
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowTeamModal(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingTeams[selectedMatchId]}
                  className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 disabled:opacity-50"
                >
                  {creatingTeams[selectedMatchId] ? "Creating..." : "Create Team"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Team Management Modal */}
      {showManageModal && selectedMatchForManage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 text-black">Manage Teams - {selectedMatchForManage.venue}</h2>
            
            {selectedMatchForManage.teams && selectedMatchForManage.teams.length > 0 ? (
              <div className="space-y-4">
                {selectedMatchForManage.teams.map((team: any) => (
                  <div key={team._id} className="border border-gray-300 rounded-lg p-4">
                    <h3 className="font-semibold text-lg mb-2 text-black">{team.teamName}</h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Members: {team.players.length}/{team.totalMembers}
                    </p>
                    
                    {team.players && team.players.length > 0 ? (
                      <div className="space-y-2">
                        <h4 className="font-medium text-gray-700">Team Members:</h4>
                        {team.players.map((player: string, index: number) => (
                          <div key={index} className="flex justify-between items-center bg-gray-50 p-2 rounded border border-gray-200">
                            <span className="text-gray-800">{player}</span>
                            <button
                              onClick={() => handleRemovePlayer(team._id, player)}
                              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 italic">No members in this team</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No teams found for this match</p>
            )}
            
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowManageModal(false)}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageMatches;
