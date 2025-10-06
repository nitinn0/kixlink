import React, { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import axios from "axios";
import { motion } from "framer-motion";
import { Send, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { MessageBubble } from "../pages/MessageBubble";

type Message = {
  isError: any;
  error: string | undefined;
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

  // 1️⃣ Initialize Socket.IO connection
  useEffect(() => {
    if (!user) return;
    
    console.log("🔌 Initializing socket connection...");
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No token found");
      return;
    }
    
    // Create a new socket connection with explicit configuration
    const socketOptions = {
      auth: { 
        token,
        userId: user._id || user.id
      },
      transports: ['websocket'],
      upgrade: false,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 10000,
      autoConnect: true,
      forceNew: true,
      withCredentials: true
    };
    
    console.log('Creating new socket with options:', socketOptions);
    const newSocket = io("http://localhost:4000", socketOptions);
    
    // Connection established
    newSocket.on("connect", () => {
      console.log("✅ Socket connected:", newSocket.id);
      // Fetch latest messages when connected
      fetchMessages();
    });
    
    // Connection error
    newSocket.on("connect_error", (err) => {
      console.error("❌ Socket connection error:", err.message);
      console.log('Connection error details:', {
        message: err.message,
        description: err.description,
        context: err.context
      });
      
      // Try to reconnect after a delay
      setTimeout(() => {
        if (!newSocket.connected) {
          console.log('Attempting to reconnect...');
          newSocket.connect();
        }
      }, 2000);
    });
    
    // Handle disconnection
    newSocket.on("disconnect", (reason) => {
      console.warn("⚠️ Socket disconnected. Reason:", reason);
      if (reason === 'io server disconnect') {
        // The server has forcefully disconnected the socket
        console.log('Server disconnected the socket. Attempting to reconnect...');
        newSocket.connect();
      }
    });
    
    // Handle reconnection attempts
    newSocket.io.on("reconnect_attempt", (attempt) => {
      console.log(`🔄 Reconnection attempt ${attempt}`);
    });
    
    newSocket.io.on("reconnect", (attempt) => {
      console.log(`✅ Reconnected after ${attempt} attempts`);
    });
    
    newSocket.io.on("reconnect_error", (error) => {
      console.error("❌ Reconnection error:", error);
    });
    
    newSocket.io.on("reconnect_failed", () => {
      console.error("❌ Reconnection failed after all attempts");
    });

    newSocket.on("connect", () => {
      console.log("✅ Socket connected:", newSocket.id);
      // Fetch latest messages when connected
      fetchMessages();
    });

    newSocket.on("disconnect", (reason) => {
      console.warn("❌ Socket disconnected:", reason);
    });

    // 5️⃣ Handle retrying a failed message
    const handleRetryMessage = async (failedMessage: Message) => {
      if (!user) return;
      
      // Remove the failed message
      setMessages(prev => prev.filter(m => m._id !== failedMessage._id));
      
      // Create a new message with the same content
      const retryMessage = {
        ...failedMessage,
        _id: `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        isError: false,
        error: undefined,
        timestamp: new Date().toISOString()
      };
      
      // Add the new message with a new ID
      setMessages(prev => [...prev, retryMessage]);
      
      try {
        // Try to send via WebSocket first
        if (socket?.connected) {
          socket.emit('sendMessage', {
            message: failedMessage.message,
            tempId: retryMessage._id
          });
        }
        
        // Then send via HTTP
        const token = localStorage.getItem("token");
        await axios.post(
          'http://localhost:4000/messages',
          { message: failedMessage.message },
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            timeout: 5000
          }
        );
        
        // Update the message to remove the sending state
        setMessages(prev => 
          prev.map(msg => 
            msg._id === retryMessage._id 
              ? { ...msg, isSending: false } 
              : msg
          )
        );
        
      } catch (error) {
        console.error('Error retrying message:', error);
        
        // Mark as failed again
        setMessages(prev => 
          prev.map(msg => 
            msg._id === retryMessage._id 
              ? { 
                  ...msg, 
                  isError: true,
                  error: 'Failed to send. Tap to retry.' 
                } 
              : msg
          )
        );
      }
    };

    // Handle new incoming messages
    const handleNewMessage = (incomingMessage: Message & { tempId?: string }) => {
      console.log('📨 Received new message:', incomingMessage);
      
      setMessages(prev => {
        // Normalize the message data
        const normalizedMessage = {
          ...incomingMessage,
          _id: incomingMessage._id || incomingMessage.tempId || `temp-${Date.now()}`,
          timestamp: incomingMessage.timestamp || new Date().toISOString()
        };
        
        // Check if we already have this message (by ID or tempId or content)
        const messageExists = prev.some(msg => 
          msg._id === normalizedMessage._id || 
          (normalizedMessage.tempId && msg._id === normalizedMessage.tempId) ||
          (msg._id?.startsWith('temp-') && 
           msg.message === normalizedMessage.message && 
           msg.sender?._id === normalizedMessage.sender?._id)
        );
        
        if (messageExists) {
          // Update existing message
          return prev.map(msg => 
            (normalizedMessage.tempId && msg._id === normalizedMessage.tempId) || 
            (msg._id === normalizedMessage._id) ? 
            { ...normalizedMessage, isSending: false } : 
            msg
          );
        }
        
        // Add new message
        console.log('Adding new message to state:', normalizedMessage);
        return [...prev, normalizedMessage];
      });
    };

    // Set up event listeners
    const onMessage = (msg: any) => {
      console.log('📨 Received message event:', msg);
      handleNewMessage(msg);
    };

    newSocket.on("receiveMessage", onMessage);
    
    // Log connection status
    newSocket.on("connect_error", (err) => {
      console.error("❌ Socket connection error:", err.message);
    });

    newSocket.on("connect_timeout", () => {
      console.warn("⌛ Socket connection timeout");
    });

    newSocket.on("reconnect_attempt", (attempt) => {
      console.log(`🔄 Reconnection attempt ${attempt}`);
    });

    // Debug all events
    const onAny = (event: string, ...args: any[]) => {
      if (['receiveMessage', 'pong', 'ping'].includes(event)) return;
      console.log(`🔍 Socket event: ${event}`, args);
    };
    newSocket.onAny(onAny);

    setSocket(newSocket);
    console.log('✅ Socket instance created and configured');

    // Clean up function
    return () => {
      console.log('🧹 Cleaning up socket listeners...');
      newSocket.off("receiveMessage", onMessage);
      newSocket.offAny(onAny);
      newSocket.off("connect_error");
      newSocket.off("connect_timeout");
      newSocket.off("reconnect_attempt");
      clearTimeout(connectionTimeout);
      
      if (newSocket.connected) {
        console.log('Disconnecting socket...');
        newSocket.disconnect();
      }
    };
  }, [user?.id]); // Reconnect if user changes

  // Reference to the messages container for auto-scrolling
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 3️⃣ Fetch messages function
  const fetchMessages = React.useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      console.log("📡 Fetching messages...");
      const res = await axios.get("http://localhost:4000/messages", {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
      });
      
      if (res.data && Array.isArray(res.data)) {
        console.log("✅ Messages fetched:", res.data.length);
        // Sort messages by timestamp to ensure correct order
        const sortedMessages = [...res.data].sort(
          (a, b) => new Date(a.timestamp || 0).getTime() - new Date(b.timestamp || 0).getTime()
        );
        setMessages(sortedMessages);
      }
    } catch (error) {
      console.error("❌ Error fetching messages:", error);
    }
  }, []);

  // Initial fetch on mount
  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // 4️⃣ Send message - optimized for speed and real-time updates
  const sendMessage = async () => {
    const token = localStorage.getItem("token");
    if (!token || !user) {
      console.error("No token or user found");
      return;
    }
    
    const messageText = newMessage.trim();
    if (!messageText) return;
    
    // 1. Create a unique temporary ID for optimistic update
    const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const userId = user._id || user.id;
    
    // 2. Create optimistic message
    const optimisticMessage: Message = {
      _id: tempId,
      message: messageText,
      sender: {
        _id: userId,
        name: user.name || "You",
        username: user.username || "you",
        image_url: user.image_url
      },
      timestamp: new Date().toISOString(),
      isSending: true,
      isError: false,
      error: undefined
    };
    
    // 3. Update UI immediately with optimistic message
    setNewMessage('');
    setMessages(prev => [...prev, optimisticMessage]);
    
    try {
      // 4. First try WebSocket for real-time delivery
      if (socket?.connected) {
        console.log("📤 Sending message via WebSocket");
        socket.emit('sendMessage', 
          { 
            message: messageText,
            tempId: tempId
          },
          (response: any) => {
            console.log('📩 WebSocket ACK:', response);
            if (response?.success && response.message) {
              // Update the message with server data
              setMessages(prev => 
                prev.map(msg => 
                  msg._id === tempId 
                    ? { 
                        ...response.message,
                        _id: response.message._id || tempId,
                        isSending: false,
                        isError: false
                      }
                    : msg
                )
              );
            }
          }
        );
      } else {
        console.warn("⚠️ WebSocket not connected, falling back to HTTP");
        // Fallback to HTTP if WebSocket is not available
        const res = await axios.post(
          'http://localhost:4000/messages',
          { message: messageText },
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            timeout: 5000
          }
        );
        
        if (res.data) {
          setMessages(prev => 
            prev.map(msg => 
              msg._id === tempId 
                ? { 
                    ...res.data, 
                    _id: res.data._id || tempId,
                    isSending: false,
                    isError: false
                  } 
                : msg
            )
          );
        }
      }
      
    } catch (error) {
      console.error('❌ Error sending message:', error);
      
      // Mark the message as failed
      setMessages(prev => 
        prev.map(msg => 
          msg._id === tempId 
            ? { 
                ...msg, 
                isError: true,
                isSending: false,
                error: 'Failed to send. Tap to retry.' 
              } 
            : msg
        )
      );
      
      // Re-fetch messages to ensure consistency
      try {
        await fetchMessages();
      } catch (err) {
        console.error("❌ Error fetching messages after send failure:", err);
      }
    }
  };

  return (
    <div className="flex flex-col flex-1 h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white p-6">
      <motion.div initial={{ opacity: 0, y: -25 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 mb-6">
        <Users size={28} className="text-cyan-400" />
        <h1 className="text-3xl font-extrabold">Public Chat</h1>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        className="glass flex-1 rounded-xl p-6 overflow-hidden flex flex-col"
      >
        <div className="flex-1 flex flex-col-reverse overflow-y-auto p-4">
          <div className="space-y-4">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-center text-gray-400">No messages yet. Start chatting!</p>
              </div>
            ) : (
              [...messages]
                .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
                .map((msg) => {
                  const isCurrentUser = msg.sender?._id === (user?._id || user?.id);
                  const isTempMessage = msg._id?.startsWith('temp-');
                  const isError = msg.isError;
                  
                  return (
                    <MessageBubble
                      key={msg._id}
                      message={msg.message}
                      sender={msg.sender?.name || 'Unknown'}
                      username={msg.sender?.username}
                      timestamp={msg.timestamp || new Date().toISOString()}
                      isMe={isCurrentUser}
                      isSending={isTempMessage && !isError}
                      isError={isError}
                      error={msg.error}
                      onRetry={isError && isCurrentUser ? () => handleRetryMessage(msg) : undefined}
                    />
                  );
                })
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
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
