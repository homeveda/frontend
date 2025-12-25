"use client";
import { useState } from "react";
import UserCard from "../../../component/userCard";
import LoadingSpinner from "../../../component/loadingSpinner";
import { AnimatePresence, motion } from "framer-motion";
import axios from "axios";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DisplayAllUsers(){
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  const fetchUsers = async () => {
    if (!backendUrl) return setError("Backend URL not configured");
    try {
      setLoading(true);
      setError(null);
      const adminToken = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
      const res = await axios.get(`${backendUrl}/user/all`, { headers: { Authorization: adminToken ? `Bearer ${adminToken}` : undefined } });
      const data = res.data?.users || res.data || [];
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to load users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = users.filter(u => (u.name || '').toLowerCase().includes(query.trim().toLowerCase()));

  return (
    <div className="p-6" style={{ backgroundColor: "#f7f4f1", minHeight: "100vh", fontFamily: "'Space Grotesk', sans-serif" }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold" style={{ color: "#111111", letterSpacing: "-0.02em" }}>
            Users
          </h2>
          <p className="text-xl mt-1" style={{ color: "#8f8f8f" }}>
            Click on user card to see and user projects
          </p>
        </div>
        <button
          onClick={fetchUsers}
          className="text-white px-4 py-2 rounded-[10px] font-semibold transition"
          style={{ backgroundColor: "#e07b63" }}
          onMouseEnter={(e) => (e.target.style.backgroundColor = "#d56a52")}
          onMouseLeave={(e) => (e.target.style.backgroundColor = "#e07b63")}
        >
          Refresh
        </button>
      </div>

      <div className="p-4 rounded-[14px] mb-6" style={{ backgroundColor: "#ffffff", boxShadow: "0 10px 30px rgba(16,16,16,0.08)" }}>
        <div>
          <label className="text-sm font-medium" style={{ color: "#8f8f8f" }}>
            Search User
          </label>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name..."
            className="mt-2 block w-full rounded-[10px] px-3 py-2 text-sm focus:outline-none"
            style={{ border: "1px solid #e9e6e3", backgroundColor: "#fafafa" }}
            aria-label="Search users by name"
          />
        </div>
      </div>

      {loading && <LoadingSpinner />}
      {error && <div className="text-sm" style={{ color: "#e07b63" }}>{error}</div>}

      <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {filtered.map(user => (
            <motion.div key={user._id || user.id} layout>
              <UserCard
                user={user}
                onClick={() => router.push(`/admin/projects?userEmail=${encodeURIComponent(user.email)}`)}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {!loading && filtered.length === 0 && (
        <div className="mt-6" style={{ color: "#8f8f8f" }}>
          No users found.
        </div>
      )}
    </div>
  );
}