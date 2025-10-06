import React, { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
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

const ChatPage: React.FC = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [user, setUser] = useState<any>(null);
  const [socket, setSocket] = useState<Socket | null>(null);

  // 1️⃣ Check auth + user
  useEffect(() => {
    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    if (!token) {
      console.log('No token found, redirecting to login');
      navigate("/auth/login", { replace: true });
      return;
    }
    
    // Set user immediately if available in localStorage
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        console.log('Setting user from localStorage:', parsedUser);
        setUser(parsedUser);
      } catch (e) {
        console.error('Error parsing user from localStorage:', e);
        localStorage.removeItem('user');
      }
    }

    // Always try to fetch fresh user data when component mounts
    const fetchUser = async () => {
      try {
        console.log('Fetching user data from /auth/me');
        const res = await axios.get('http://localhost:4000/auth/me', {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log('User data response:', res.data);
        
        if (res.data && res.data.success && res.data.user) {
          console.log('Setting user from API:', res.data.user);
          setUser(res.data.user);
          localStorage.setItem('user', JSON.stringify(res.data.user));
        } else {
          console.error('Invalid user data format from API:', res.data);
          throw new Error('Invalid user data format');
        }
      } catch (error) {
        console.error('Error fetching user:', error);
        // Only redirect if this was the first load (no saved user)
        if (!savedUser) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate("/auth/login", { replace: true });
        }
      }
    };
    
    fetchUser();
  }, [navigate]);

  // 2️⃣ Initialize Socket once with token auth
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const newSocket = io("http://localhost:4000", {
      auth: { token }, // ✅ send token for backend verification
      transports: ["websocket"],
      reconnection: true,
    });

    newSocket.on("connect", () => {
      console.log("✅ Socket connected:", newSocket.id);
    });

    newSocket.on("disconnect", (reason) => {
      console.warn("❌ Socket disconnected:", reason);
    });

    newSocket.on("receiveMessage", (msg: Message) => {
      console.log("📩 Received message via socket:", msg);
      setMessages((prev) => {
        if (prev.find((m) => m._id === msg._id)) return prev;
        return [...prev, msg];
      });
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  // 3️⃣ Load previous messages
  useEffect(() => {
    const fetchMessages = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const res = await axios.get("http://localhost:4000/messages", {
          headers: { Authorization: `Bearer ${token}` }, // ✅ match verifyToken format
        });
        setMessages(res.data.reverse());
        console.log("✅ Messages fetched:", res.data.length);
      } catch (err: any) {
        console.error("❌ Failed to fetch chat history:", err.response?.data || err.message);
      }
    };

    fetchMessages();
  }, []);

  // 4️⃣ Send message
  const sendMessage = async () => {
    console.log('sendMessage called');
    const token = localStorage.getItem("token");
    
    if (!token) {
      console.error('No authentication token found');
      alert('Please log in to send messages');
      navigate('/auth/login');
      return;
    }
    
    if (!user) {
      console.error('User data not loaded');
      alert('Error: User data not loaded. Please refresh the page.');
      return;
    }
    
    const messageText = newMessage.trim();
    if (!messageText) {
      console.log('Empty message, not sending');
      return;
    }
    
    const userId = user._id || user.id;
    console.log('Sending message:', { userId, message: messageText });
    
    console.log('Creating optimistic message with userId:', userId);
    // Create optimistic message
    const optimisticMessage: Message = {
      _id: `temp-${Date.now()}`,
      message: messageText,
      sender: {
        _id: userId,
        name: user.name || "You",
        username: user.username || "you",
        image_url: user.avatar_url || "/default-avatar.png",
      },
      timestamp: new Date().toISOString(),
    };

    // Add to local state immediately for instant feedback
    console.log('Adding optimistic message to UI');
    setMessages((prev) => [...prev, optimisticMessage]);
    setNewMessage("");

    try {
      console.log('Sending message to server...');
      // 1. First try to save to database
      console.log('Sending POST request to /messages endpoint');
      const res = await axios.post(
        "http://localhost:4000/messages",
        { message: messageText },
        { 
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
          } 
        }
      );

      console.log('Server response:', res);
      const savedMessage = res.data;
      console.log('Saved message from server:', savedMessage);
      
      // 2. Update the message with server data
      setMessages((prev) =>
        prev.map((msg) => 
          msg._id === optimisticMessage._id ? savedMessage : msg
        )
      );

      // 3. Emit to socket for real-time
      if (socket) {
        if (socket.connected) {
          socket.emit("sendMessage", { 
            message: messageText, 
            userId: userId 
          });
          console.log("📤 Sent message via socket");
        } else {
          console.warn("⚠️ Socket not connected, reconnecting...");
          socket.connect(); // Try to reconnect
          // If still needed, you could implement a retry mechanism here
        }
      } else {
        console.warn("⚠️ Socket not initialized");
      }
    } catch (err: any) {
      console.error("❌ Error sending message:", err.response?.data || err.message);
      // Remove the optimistic message on error
      setMessages((prev) => 
        prev.filter((msg) => msg._id !== optimisticMessage._id)
      );
      alert("Failed to send message. Please try again.");
    }
  };

  return (
    <div className="flex flex-col flex-1 h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white p-6">
      <motion.div initial={{ opacity: 0, y: -25 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 mb-6">
        <Users size={28} className="text-cyan-400" />
        <h1 className="text-3xl font-extrabold">Public Chat</h1>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass flex-1 rounded-xl p-6 overflow-y-auto space-y-4">
        {messages.length === 0 ? (
          <p className="text-center text-gray-400">No messages yet. Start chatting!</p>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender?._id === (user?._id || user?.id);
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
          })
        )}
      </motion.div>

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
          onClick={() => {
            console.log("Send clicked ✅");
            sendMessage();
          }}
          className="p-2 bg-cyan-500/20 rounded-lg hover:scale-105 transition"
        >
          <Send size={20} className="text-cyan-400" />
        </button>
      </div>
    </div>
  );
};

export default ChatPage;
