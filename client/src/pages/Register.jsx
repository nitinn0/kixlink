import React, { useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import kixlinkLogo from "../assets/logo.png";
import "../styles/space-and-form.css";
import OnboardCard from "../pages/OnboardCard"; // ✅ import your OnboardCard

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [showOnboard, setShowOnboard] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    
    setLoading(true);
    setShowOnboard(true); // ✅ Show animation while registering

    try {
      const res = await axios.post("http://localhost:4000/auth/register", {
        name: formData.name,
        username: formData.username,
        email: formData.email,
        password: formData.password,
      });

      if (res.data.success) {
        setTimeout(() => {
          alert(res.data.message);
          navigate("/auth/login");
        }, 3500); // give animation time to play
      } else {
        alert(res.data.message);
        setShowOnboard(false);
      }
    } catch (error) {
      console.error("Registration Error:", error);
      alert(error.response?.data?.message || "Server error! Please try again later.");
      setShowOnboard(false);
    } finally {
      setLoading(false);
      // Let the animation run for a bit before hiding it
      setTimeout(() => setShowOnboard(false), 3500);
    }
  };

  return (
    <div
      className="relative min-h-screen w-full flex items-center justify-center bg-[var(--bg-primary)] overflow-hidden"
    >
      {/* Stars Background */}
      <div id="stars"></div>
      <div id="stars2"></div>
      <div id="stars3"></div>

      {/* Logo */}
      <motion.img
        src={kixlinkLogo}
        alt="KixLink Logo"
        className="absolute top-10 left-1/2 transform -translate-x-1/2 w-40"
        animate={{
          scale: [1, 1.05, 1],
        }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* ✅ Show OnboardCard while loading */}
     {showOnboard ? (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.5 }}
    className="flex flex-col items-center justify-center mt-16 scale-110 p-10"
  >
    <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-2xl p-8 shadow-lg">
      <OnboardCard
        step1="Welcome Aboard"
        step2="Verifying Details"
        step3="Creating Account"
        duration={3000}
      />
    </div>
    <p className="text-[var(--text-primary)] mt-6 text-base animate-pulse">
      Please wait while we set things up...
    </p>
  </motion.div>
) : (
        // Register Form
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="relative bg-[var(--bg-secondary)] border border-[var(--border)] shadow-lg rounded-2xl px-10 py-4 w-[400px] flex mt-28 flex-col items-center"
        >
          <h1 className="text-[var(--text-primary)] text-3xl font-bold mb-4 tracking-wide">
            Register
          </h1>

          {/* Name */}
          <input
            type="text"
            name="name"
            placeholder="Enter Full Name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full p-3 mb-4 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border)] text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--text-accent)] transition duration-300"
          />

          {/* Email */}
          <input
            type="email"
            name="email"
            placeholder="Enter Email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full p-3 mb-4 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border)] text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--text-accent)] transition duration-300"
          />

          {/* Username */}
          <input
            type="text"
            name="username"
            placeholder="Enter Username"
            value={formData.username}
            onChange={handleChange}
            required
            className="w-full p-3 mb-4 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border)] text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--text-accent)] transition duration-300"
          />

          {/* Password */}
          <input
            type="password"
            name="password"
            placeholder="Enter Password"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full p-3 mb-4 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border)] text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--text-accent)] transition duration-300"
          />

          {/* Confirm Password */}
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            className="w-full p-3 mb-6 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border)] text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--text-accent)] transition duration-300"
          />

          {/* Register Button */}
          <motion.button
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={loading}
            className="relative w-full bg-[var(--text-accent)] py-3 rounded-lg text-[var(--bg-secondary)] font-bold uppercase tracking-wide shadow-lg hover:shadow-xl transition duration-300"
          >
            {loading ? "Registering..." : "Register"}
          </motion.button>

          <p
            className="mt-6 text-[var(--text-secondary)] hover:text-[var(--text-accent)] cursor-pointer transition duration-300"
            onClick={() => navigate("/auth/login")}
          >
            Already have an account? Login
          </p>
        </motion.form>
      )}
    </div>
  );
};

export default Register;
