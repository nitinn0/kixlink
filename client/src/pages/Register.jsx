import React, { useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import kixlinkLogo from "../assets/logo.png";
import "../styles/space-and-form.css";

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

  // Handle input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submit
const handleSubmit = async (e) => {
  e.preventDefault();

  if (formData.password !== formData.confirmPassword) {
    alert("Passwords do not match!");
    return;
  }

  setLoading(true);

  try {
    const res = await axios.post("http://localhost:4000/auth/register", {
      name: formData.name,
      username: formData.username,
      email: formData.email,
      password: formData.password,
    });

    if (res.data.success) {
      alert(res.data.message);
      navigate("/auth/login");
    } else {
      alert(res.data.message);
    }
  } catch (error) {
    console.error("Registration Error:", error);
    alert(error.response?.data?.message || "Server error! Please try again later.");
  } finally {
    setLoading(false);
  }
};


  return (
    <div
      className="relative min-h-screen w-full flex items-center justify-center bg-cover bg-center overflow-hidden"
      style={{
        backgroundImage: `url('https://images.unsplash.com/photo-1517747614396-d21a78b850e8?q=80&w=1600&auto=format&fit=crop')`,
      }}
    >
      {/* Stars Background */}
      <div id="stars"></div>
      <div id="stars2"></div>
      <div id="stars3"></div>

      {/* Logo */}
      <motion.img
        src={kixlinkLogo}
        alt="KixLink Logo"
        className="absolute top-10 left-1/2 transform -translate-x-1/2 w-40 drop-shadow-[0_0_25px_#ff53bb]"
        animate={{
          scale: [1, 1.08, 1],
          filter: [
            "drop-shadow(0 0 15px #ff53bb)",
            "drop-shadow(0 0 35px #8f51ea)",
            "drop-shadow(0 0 15px #ff53bb)",
          ],
        }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Register Form */}
      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="relative bg-white/10 backdrop-blur-2xl border border-white/30 shadow-2xl rounded-2xl px-10 py-4 w-[400px] flex mt-28 flex-col items-center"
        style={{
          boxShadow:
            "0 0 40px rgba(255, 83, 187, 0.3), 0 0 80px rgba(143, 81, 234, 0.3)",
        }}
      >
        <h1 className="text-white text-3xl font-bold mb-4 tracking-wide drop-shadow-lg">
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
          className="w-full p-3 mb-4 rounded-lg bg-white/15 border border-white/30 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#ff53bb] transition duration-300"
        />

        {/* Email */}
        <input
          type="email"
          name="email"
          placeholder="Enter Email"
          value={formData.email}
          onChange={handleChange}
          required
          className="w-full p-3 mb-4 rounded-lg bg-white/15 border border-white/30 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#ff53bb] transition duration-300"
        />

        {/* Username */}
        <input
          type="text"
          name="username"
          placeholder="Enter Username"
          value={formData.username}
          onChange={handleChange}
          required
          className="w-full p-3 mb-4 rounded-lg bg-white/15 border border-white/30 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#ff53bb] transition duration-300"
        />

        {/* Password */}
        <input
          type="password"
          name="password"
          placeholder="Enter Password"
          value={formData.password}
          onChange={handleChange}
          required
          className="w-full p-3 mb-4 rounded-lg bg-white/15 border border-white/30 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#8f51ea] transition duration-300"
        />

        {/* Confirm Password */}
        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirm Password"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
          className="w-full p-3 mb-6 rounded-lg bg-white/15 border border-white/30 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3f7cff] transition duration-300"
        />

        {/* Register Button */}
        <motion.button
          type="submit"
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          className="relative w-full bg-gradient-to-r from-[#ff53bb] via-[#8f51ea] to-[#3f7cff] py-3 rounded-lg text-white font-bold uppercase tracking-wide shadow-[0_0_25px_rgba(255,83,187,0.6)] hover:shadow-[0_0_40px_rgba(143,81,234,0.8)] transition duration-300"
        >
          {loading ? "Registering..." : "Register"}
        </motion.button>

        {/* Login Link */}
        <p
          className="mt-6 text-gray-300 hover:text-[#ff53bb] cursor-pointer transition duration-300"
          onClick={() => navigate("/auth/login")}
        >
          Already have an account? Login
        </p>
      </motion.form>
    </div>
  );
};

export default Register;
