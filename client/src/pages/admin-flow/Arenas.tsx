import React, { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Building2, PlusCircle } from "lucide-react";

const AddArenaPage: React.FC = () => {
  const [arenaName, setArenaName] = useState("");
  const [totalCapacity, setTotalCapacity] = useState<number | "">("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    if (!arenaName.trim() || !totalCapacity) {
      setMessage("All fields are required.");
      return;
    }

    try {
      setLoading(true);

      const token = localStorage.getItem("token"); // if you store admin JWT
      await axios.post(
        "http://localhost:4000/admin/addArena",
        { arenaName, totalCapacity },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage("✅ Arena added successfully!");
      setArenaName("");
      setTotalCapacity("");
      setTimeout(() => navigate("/admin/arenas"), 1200);
    } catch (error: any) {
      console.error(error);
      setMessage(error.response?.data?.message || "Error adding arena");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white px-6">
      {/* Header */}
      <motion.h1
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-4xl font-extrabold mb-8 flex items-center gap-3"
      >
        <Building2 className="text-cyan-400" size={36} /> Add New Arena
      </motion.h1>

      {/* Form Card */}
      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-2xl shadow-lg w-full max-w-md flex flex-col gap-6"
      >
        {/* Arena Name */}
        <div className="flex flex-col">
          <label className="text-sm mb-2 font-semibold">Arena Name *</label>
          <input
            type="text"
            placeholder="Enter arena/venue name"
            value={arenaName}
            onChange={(e) => setArenaName(e.target.value)}
            className="p-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-cyan-400"
          />
        </div>

        {/* Capacity */}
        <div className="flex flex-col">
          <label className="text-sm mb-2 font-semibold">Total Capacity *</label>
          <input
            type="number"
            placeholder="Enter total capacity"
            value={totalCapacity}
            onChange={(e) => setTotalCapacity(Number(e.target.value))}
            className="p-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-cyan-400"
          />
        </div>

        {/* Submit Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="submit"
          disabled={loading}
          className="bg-gradient-to-r from-[#06b6d4] to-[#3b82f6] py-3 px-5 rounded-lg text-white font-bold flex justify-center items-center gap-2 disabled:opacity-50 shadow-[0_0_15px_rgba(6,182,212,0.5)]"
        >
          {loading ? (
            <div className="animate-spin h-5 w-5 border-t-2 border-white rounded-full"></div>
          ) : (
            <>
              <PlusCircle size={18} /> Add Arena
            </>
          )}
        </motion.button>

        {/* Message */}
        {message && (
          <p
            className={`text-center mt-3 text-sm ${
              message.includes("✅") ? "text-green-400" : "text-red-400"
            }`}
          >
            {message}
          </p>
        )}
      </motion.form>
    </div>
  );
};

export default AddArenaPage;
