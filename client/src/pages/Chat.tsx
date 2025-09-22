import React, { useEffect, useState } from "react";
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
  text: string;
  createdAt: string;
};

const ChatPage: React.FC = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);

  // ✅ Check login
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/auth/login");
    }
  }, [navigate]);

  // ✅ Fetch messages
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await axios.get<Message[]>(
          "http://localhost:4000/chat/public",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setMessages(res.data);
      } catch (err) {
        console.error("Error fetching messages:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 5000); // 🔄 simple polling (replace with websockets later)
    return () => clearInterval(interval);
  }, []);

  // ✅ Send message
  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await axios.post<Message>(
        "http://localhost:4000/chat/public",
        { text: newMessage },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessages((prev) => [...prev, res.data]);
      setNewMessage("");
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  return (
    <div className="flex flex-col flex-1 h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white p-6">
      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: -25 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 mb-6"
      >
        <Users size={28} className="text-cyan-400" />
        <h1 className="text-3xl font-extrabold">Public Chat</h1>
      </motion.div>

      {/* Chat messages */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="glass flex-1 rounded-xl p-6 overflow-y-auto space-y-4"
      >
        {loading ? (
          <div className="flex justify-center items-center flex-1">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-cyan-400"></div>
          </div>
        ) : messages.length === 0 ? (
          <p className="text-gray-400 text-center">No messages yet 💬</p>
        ) : (
          messages.map((msg, idx) => (
            <motion.div
              key={msg._id || idx}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.03 }}
              className="flex gap-3"
            >
              <img
                src={
                  msg.sender.image_url ||
                  "https://via.placeholder.com/40x40?text=U"
                }
                alt={msg.sender.name}
                className="w-10 h-10 rounded-full border border-cyan-400 object-cover"
              />
              <div>
                <p className="font-semibold text-cyan-300">
                  {msg.sender.name}{" "}
                  <span className="text-gray-400 text-sm">
                    @{msg.sender.username}
                  </span>
                </p>
                <p className="text-white/90">{msg.text}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(msg.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </motion.div>
          ))
        )}
      </motion.div>

      {/* Input bar */}
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
