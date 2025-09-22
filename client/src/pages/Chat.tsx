import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import axios from "axios";
import { motion } from "framer-motion";
import { Send, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

type Message = {
  _id: string;
  sender: {
    _id: string;
    name: string;
    username: string;
    image_url?: string;
  };
  message: string;
  timestamp: string;
};

const socket = io("http://localhost:4000"); // backend server

const ChatPage: React.FC = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");

  // ✅ Load chat history
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/auth/login");
      return;
    }

    const fetchMessages = async () => {
      const res = await axios.get<Message[]>("http://localhost:4000/match/find-players", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessages(res.data);
    };

    fetchMessages();
  }, [navigate]);

  // ✅ Listen for new real-time messages
  useEffect(() => {
    socket.on("receiveMessage", (msg: Message) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.off("receiveMessage");
    };
  }, []);

  // ✅ Send message
  const sendMessage = () => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId"); // ⚡ store this at login
    if (!newMessage.trim() || !token || !userId) return;

    socket.emit("sendMessage", {
      message: newMessage,
      userId,
    });

    setNewMessage("");
  };

  return (
    <div className="flex flex-col flex-1 h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white p-6">
      <motion.div
        initial={{ opacity: 0, y: -25 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 mb-6"
      >
        <Users size={28} className="text-cyan-400" />
        <h1 className="text-3xl font-extrabold">Public Chat</h1>
      </motion.div>

      {/* Chat window */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="glass flex-1 rounded-xl p-6 overflow-y-auto space-y-4"
      >
        {messages.map((msg, idx) => (
          <motion.div
            key={msg._id || idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.02 }}
            className="flex gap-3"
          >
            <img
              src={msg.sender?.image_url || "https://via.placeholder.com/40x40?text=U"}
              alt={msg.sender?.name}
              className="w-10 h-10 rounded-full border border-cyan-400 object-cover"
            />
            <div>
              <p className="font-semibold text-cyan-300">
                {msg.sender?.name}{" "}
                <span className="text-gray-400 text-sm">@{msg.sender?.username}</span>
              </p>
              <p className="text-white/90">{msg.message}</p>
              <p className="text-xs text-gray-500 mt-1">
                {new Date(msg.timestamp).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Input */}
      <div className="mt-4 flex items-center gap-3 bg-white/10 px-4 py-3 rounded-xl">
        <input
          type="text"
          placeholder="Type a message..."
          className="bg-transparent outline-none flex-1 text-white text-sm"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button
          onClick={sendMessage}
          className="p-2 bg-cyan-500/20 rounded-lg hover:scale-105 transition"
        >
          <Send size={20} className="text-cyan-400" />
        </button>
      </div>
    </div>
  );
};

export default ChatPage;
