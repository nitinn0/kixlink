import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Settings,
  Lock,
  Shield,
  Eye,
  EyeOff,
  Clock,
  Monitor,
  Smartphone,
  AlertCircle,
  CheckCircle,
  User,
  Mail,
  Calendar
} from "lucide-react";
import { toast } from "react-toastify";
import axios from "../api/axiosConfig";

interface LoginAudit {
  _id: string;
  loginTime: string;
  ipAddress: string;
  device: string;
  browser: string;
  location?: string;
  status: "success" | "failed";
  userAgent?: string;
}

interface User {
  _id: string;
  name: string;
  email: string;
  username: string;
  createdAt: string;
}

const SettingsPage: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"password" | "audit">("password");
  
  // Password update states
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  
  // Login audit states
  const [loginAudits, setLoginAudits] = useState<LoginAudit[]>([]);
  const [auditLoading, setAuditLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const savedUser = localStorage.getItem("user");
        if (savedUser) {
          const parsed = JSON.parse(savedUser);
          setUser(parsed);
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
    fetchLoginAudits();
  }, []);

  const fetchLoginAudits = async () => {
    try {
      setAuditLoading(true);
      const response = await axios.get("/auth/login-audits");
      setLoginAudits(response.data.audits || []);
    } catch (err) {
      console.error("Error fetching login audits:", err);
      toast.error("Failed to fetch login audits");
    } finally {
      setAuditLoading(false);
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    });
  };

  const validatePassword = (password: string): boolean => {
    return password.length >= 8 && /[A-Z]/.test(password) && /[a-z]/.test(password) && /[0-9]/.test(password);
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (!validatePassword(passwordData.newPassword)) {
      toast.error("Password must be at least 8 characters with uppercase, lowercase, and number");
      return;
    }

    setPasswordLoading(true);
    
    try {
      const response = await axios.put("/auth/update-password", {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });

      if (response.data.success) {
        toast.success("Password updated successfully!");
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: ""
        });
      } else {
        toast.error(response.data.message || "Failed to update password");
      }
    } catch (err: any) {
      console.error("Error updating password:", err);
      toast.error(err.response?.data?.message || "Failed to update password");
    } finally {
      setPasswordLoading(false);
    }
  };

  const getDeviceIcon = (userAgent?: string) => {
    if (!userAgent) return <Monitor size={16} />;
    
    if (/Mobile|Android|iPhone|iPad/.test(userAgent)) {
      return <Smartphone size={16} />;
    }
    return <Monitor size={16} />;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
        Loading settings...
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
          <Settings size={28} /> Settings
        </h1>
      </motion.div>

      {/* User Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl p-6 mb-6 shadow-lg"
      >
        <h2 className="text-xl font-semibold mb-4 text-[var(--text-accent)] flex items-center gap-2">
          <User size={20} /> Account Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3">
            <User size={18} className="text-[var(--text-secondary)]" />
            <div>
              <p className="text-sm text-[var(--text-secondary)]">Name</p>
              <p className="font-medium">{user?.name || "N/A"}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Mail size={18} className="text-[var(--text-secondary)]" />
            <div>
              <p className="text-sm text-[var(--text-secondary)]">Email</p>
              <p className="font-medium">{user?.email || "N/A"}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Calendar size={18} className="text-[var(--text-secondary)]" />
            <div>
              <p className="text-sm text-[var(--text-secondary)]">Member Since</p>
              <p className="font-medium">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tab Navigation */}
      <div className="flex gap-4 mb-6 border-b border-[var(--border)]">
        <button
          onClick={() => setActiveTab("password")}
          className={`pb-3 px-4 font-medium transition ${
            activeTab === "password"
              ? "text-[var(--text-accent)] border-b-2 border-[var(--text-accent)]"
              : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          }`}
        >
          <Lock size={18} className="inline mr-2" />
          Password Security
        </button>
        <button
          onClick={() => setActiveTab("audit")}
          className={`pb-3 px-4 font-medium transition ${
            activeTab === "audit"
              ? "text-[var(--text-accent)] border-b-2 border-[var(--text-accent)]"
              : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          }`}
        >
          <Shield size={18} className="inline mr-2" />
          Login Activity
        </button>
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-1 overflow-y-auto"
      >
        {activeTab === "password" && (
          <div className="max-w-2xl">
            <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl p-6 shadow-lg">
              <h2 className="text-xl font-semibold mb-6 text-[var(--text-accent)] flex items-center gap-2">
                <Lock size={20} /> Update Password
              </h2>
              
              <form onSubmit={handlePasswordUpdate} className="space-y-4">
                {/* Current Password */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-[var(--text-primary)]">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.current ? "text" : "password"}
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      required
                      className="w-full bg-[var(--bg-tertiary)] border border-[var(--border)] px-4 py-3 rounded-lg pr-12 text-[var(--text-primary)] outline-none focus:ring-2 focus:ring-[var(--text-accent)]"
                      placeholder="Enter current password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords({...showPasswords, current: !showPasswords.current})}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    >
                      {showPasswords.current ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-[var(--text-primary)]">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.new ? "text" : "password"}
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      required
                      className="w-full bg-[var(--bg-tertiary)] border border-[var(--border)] px-4 py-3 rounded-lg pr-12 text-[var(--text-primary)] outline-none focus:ring-2 focus:ring-[var(--text-accent)]"
                      placeholder="Enter new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords({...showPasswords, new: !showPasswords.new})}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    >
                      {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <div className="mt-2 text-xs text-[var(--text-secondary)]">
                    Password must be at least 8 characters with uppercase, lowercase, and number
                  </div>
                </div>

                {/* Confirm New Password */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-[var(--text-primary)]">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.confirm ? "text" : "password"}
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      required
                      className="w-full bg-[var(--bg-tertiary)] border border-[var(--border)] px-4 py-3 rounded-lg pr-12 text-[var(--text-primary)] outline-none focus:ring-2 focus:ring-[var(--text-accent)]"
                      placeholder="Confirm new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords({...showPasswords, confirm: !showPasswords.confirm})}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    >
                      {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword && (
                    <div className="mt-2 text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle size={12} />
                      Passwords do not match
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={passwordLoading}
                    className="w-full bg-[var(--text-accent)] hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {passwordLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Updating Password...
                      </>
                    ) : (
                      <>
                        <Lock size={18} />
                        Update Password
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {activeTab === "audit" && (
          <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl p-6 shadow-lg">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-[var(--text-accent)] flex items-center gap-2">
                <Shield size={20} /> Login Activity
              </h2>
              <button
                onClick={fetchLoginAudits}
                className="text-sm bg-[var(--bg-tertiary)] hover:bg-[var(--bg-primary)] px-3 py-1 rounded-lg transition text-[var(--text-primary)]"
              >
                Refresh
              </button>
            </div>

            {auditLoading ? (
              <div className="flex justify-center items-center py-8">
                <div className="w-6 h-6 border-2 border-[var(--text-accent)] border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : loginAudits.length > 0 ? (
              <div className="space-y-3">
                {loginAudits.map((audit) => (
                  <motion.div
                    key={audit._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-[var(--bg-tertiary)] border border-[var(--border)] rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-full ${
                          audit.status === 'success' 
                            ? 'bg-green-100 dark:bg-green-900' 
                            : 'bg-red-100 dark:bg-red-900'
                        }`}>
                          {audit.status === 'success' ? (
                            <CheckCircle size={16} className="text-green-600 dark:text-green-400" />
                          ) : (
                            <AlertCircle size={16} className="text-red-600 dark:text-red-400" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-[var(--text-primary)]">
                              {audit.status === 'success' ? 'Successful Login' : 'Failed Login Attempt'}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              audit.status === 'success'
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            }`}>
                              {audit.status}
                            </span>
                          </div>
                          <div className="text-sm text-[var(--text-secondary)] space-y-1">
                            <div className="flex items-center gap-2">
                              <Clock size={14} />
                              {formatDate(audit.loginTime)}
                            </div>
                            <div className="flex items-center gap-2">
                              <Monitor size={14} />
                              IP: {audit.ipAddress}
                            </div>
                            <div className="flex items-center gap-2">
                              {getDeviceIcon(audit.userAgent)}
                              {audit.device || 'Unknown Device'} • {audit.browser || 'Unknown Browser'}
                            </div>
                            {audit.location && (
                              <div className="flex items-center gap-2">
                                <Monitor size={14} />
                                {audit.location}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-[var(--text-secondary)]">
                <Shield size={48} className="mx-auto mb-4 opacity-50" />
                <p>No login activity found</p>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default SettingsPage;