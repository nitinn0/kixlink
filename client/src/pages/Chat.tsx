import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import axios from "axios";
import { motion } from "framer-motion";
import { Send, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { MessageBubble } from "../pages/MessageBubble";

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

// ✅ Attach token to socket handshake
const token = localStorage.getItem("token");
const socket = io("http://localhost:4000", {
  auth: { token },
});

const ChatPage: React.FC = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [user, setUser] = useState<any>(null);

  // ✅ Check auth + set user
  useEffect(() => {
    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    if (!token) {
      navigate("/auth/login", { replace: true });
    } else if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, [navigate]);

  // ✅ Send message with optimistic update
  const sendMessage = async () => {
    if (!newMessage.trim() || !user) return;

    const tempMessage: Message = {
      _id: `temp-${Date.now()}`,
      message: newMessage,
      sender: {
        _id: user.id || user._id,
        name: user.name || "You",
        username: user.username || "you",
        image_url: user.avatar_url || "/default-avatar.png",
      },
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, tempMessage]); // show instantly
    const optimisticText = newMessage;
    setNewMessage("");

    try {
      const res = await axios.post(
        "http://localhost:4000/match/find-players",
        { message: optimisticText },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const savedMessage = res.data;

      // replace temp message with real one
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === tempMessage._id ? savedMessage : msg
        )
      );

      // also emit via socket
      socket.emit("sendMessage", {
        message: optimisticText,
        userId: user.id || user._id,
      });
    } catch (err) {
      console.error("Error sending message:", err);
      // rollback if failed
      setMessages((prev) =>
        prev.filter((msg) => msg._id !== tempMessage._id)
      );
    }
  };

  // ✅ Load chat history
  useEffect(() => {
    if (!token) return;

    const fetchMessages = async () => {
      try {
        const res = await axios.get<Message[]>(
          "http://localhost:4000/match/find-players",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setMessages(res.data.reverse());
      } catch (err) {
        console.error("Failed to fetch chat history:", err);
      }
    };

    fetchMessages();
  }, []);

  // ✅ Listen for real-time messages
  useEffect(() => {
    socket.on("receiveMessage", (msg: Message) => {
      setMessages((prev) => {
        // avoid duplicate if already exists
        if (prev.find((m) => m._id === msg._id)) return prev;
        return [...prev, msg];
      });
    });

    socket.on("connect", () =>
      console.log("✅ Socket connected:", socket.id)
    );
    socket.on("disconnect", () =>
      console.log("❌ Socket disconnected")
    );

    return () => {
      socket.off("receiveMessage");
      socket.off("connect");
      socket.off("disconnect");
    };
  }, []);

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
        {messages.map((msg) => {
          const isMe = msg.sender?._id === (user?.id || user?._id);
          const isTemp = msg._id?.startsWith?.("temp-");

          return (
            <MessageBubble
              key={msg._id}
              message={msg.message}
              sender={isMe ? "You" : msg.sender?.name || "Unknown"}
              username={msg.sender?.username}
              timestamp={new Date(msg.timestamp).toLocaleTimeString()}
              isMe={isMe}
              isSending={isTemp}
            />
          );
        })}
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
