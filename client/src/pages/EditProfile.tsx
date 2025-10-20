import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const EditProfile: React.FC = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", username: "" });
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user")!)
    : null;

  // Fetch current user
  useEffect(() => {
    if (!token || !user) {
      navigate("/auth/login", { replace: true });
      return;
    }

    const fetchUser = async () => {
      try {
        const res = await axios.get(`http://localhost:4000/users/${user.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data.success) {
          setForm(res.data.user);
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [navigate, token, user]);

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle save
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.put(
        `http://localhost:4000/auth/${user.id}`,
        form,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.data.success) {
        toast.success("Profile updated successfully!");
        localStorage.setItem("user", JSON.stringify(res.data.user)); // update local storage
        navigate("/");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to update profile");
    }
  };

  if (loading) return <p className="text-center text-[var(--text-primary)] bg-[var(--bg-primary)] h-screen flex items-center justify-center">Loading...</p>;

  return (
    <div className="flex items-center justify-center h-screen bg-[var(--bg-primary)]">
      <div className="bg-[var(--bg-secondary)] border border-[var(--border)] p-8 rounded-2xl w-[400px] text-[var(--text-primary)] shadow-lg">
        <h2 className="text-2xl font-bold mb-6 text-center text-[var(--text-accent)]">Edit Profile</h2>
        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <input
            type="text"
            name="name"
            placeholder="Name"
            value={form.name}
            onChange={handleChange}
            className="p-3 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border)] outline-none text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:ring-2 focus:ring-[var(--text-accent)]"
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            className="p-3 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border)] outline-none text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:ring-2 focus:ring-[var(--text-accent)]"
          />
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={form.username}
            onChange={handleChange}
            className="p-3 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border)] outline-none text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:ring-2 focus:ring-[var(--text-accent)]"
          />
          <button
            type="submit"
            className="mt-4 bg-[var(--text-accent)] hover:opacity-80 p-3 rounded-xl font-bold text-[var(--bg-secondary)]"
          >
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;
