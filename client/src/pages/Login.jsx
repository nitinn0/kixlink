 import React, { useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import kixlinkLogo from "../assets/logo.png";
import "../styles/space-and-form.css";

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState("");
  const [formData, setFormData] = useState({
    identifier: "", // ✅ One field for email OR username
    password: ""
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };


const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    const res = await axios.post("http://localhost:4000/auth/login", formData);

    if (res.data.success) {
  const { user, token } = res.data;

  // Save token and user info
  localStorage.setItem("token", token);
  localStorage.setItem("username", user.username);
  localStorage.setItem("name", user.name);
  localStorage.setItem("is_admin", user.isAdmin); // ✅ use correct field

  console.log("logged in user:", user);

  // Navigate based on isAdmin
  if (user.isAdmin) {
    navigate("/admin", { replace: true });
  } else {
    navigate("/", { replace: true });
  }
}
else {
      alert(res.data.message);
    }
  } catch (error) {
    console.error(error);
    alert("Login failed! Check console for details.");
  } finally {
    setLoading(false);
  }
};


  return (
    <div
      className="relative min-h-screen w-full flex items-center justify-center bg-[var(--bg-primary)] overflow-hidden"
    >
      {/* Animated Starry Background */}
      <div id="stars"></div>
      <div id="stars2"></div>
      <div id="stars3"></div>

      {/* KixLink Logo */}
      <motion.img
        src={kixlinkLogo}
        alt="KixLink Logo"
        className="absolute top-10 left-1/2 transform -translate-x-1/2 w-40"
        animate={{
          scale: [1, 1.05, 1],
        }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Login Form */}
      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="relative bg-[var(--bg-secondary)] border border-[var(--border)] shadow-lg rounded-2xl px-10 py-8 w-[400px] flex mt-20 flex-col items-center"
      >
        <h1 className="text-[var(--text-primary)] text-3xl font-extrabold mb-6 tracking-wide">
          Login
        </h1>
{/* Email or Username Input */}
<input
  type="text"
  name="identifier"
  placeholder="Enter Email or Username"
  value={formData.identifier}
  onChange={handleChange}
  required
  className="w-full p-2 mb-4 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border)] text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--text-accent)] transition duration-300"
/>

{/* Password Input */}
<div className="relative">
  <input
    type={showPassword ? "text" : "password"}
    name="password"
    placeholder="Enter Password"
    value={formData.password}
    onChange={handleChange}
    required
    className="w-full p-2 pr-32 mb-6 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border)] text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--text-accent)] transition duration-300"
  />

  <button
    type="button"
    onClick={() => setShowPassword(!showPassword)}
    className="absolute right-3 top-1/2 transform -translate-y-1/2"
  >
    <img
      src={showPassword ? "/eyes.png" : "/eyes.png"}
      alt="Toggle visibility"
      className="w-5 h-5 mb-5"
    />
  </button>
</div>


        {/* Login Button */}
        <motion.button
          type="submit"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="relative w-full bg-[var(--text-accent)] py-3 rounded-lg text-[var(--bg-secondary)] font-bold uppercase tracking-wide shadow-lg hover:shadow-xl transition duration-300"
        >
          {loading ? "Logging in..." : "Login"}
        </motion.button>

        {/* Register Link */}
        <p
          className="mt-6 text-[var(--text-secondary)] hover:text-[var(--text-accent)] cursor-pointer transition duration-300"
          onClick={() => navigate("/auth/register")}
        >
          Don’t have an account? Register
        </p>
      </motion.form>
    </div>
  );
};

export default Login;
