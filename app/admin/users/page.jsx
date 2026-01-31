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

  const filtered = users
    .filter(u => !u.isAdmin)
    .filter(u => (u.name || '').toLowerCase().includes(query.trim().toLowerCase()));

  return (
    <div className="p-6" style={{ backgroundColor: "#f7f4f1", minHeight: "100vh", fontFamily: "'Space Grotesk', sans-serif" }}>
      <style>{`
        .users-header{display:flex;items-align:center;justify-content:space-between;margin-bottom:24px;gap:16px;flex-wrap:wrap}
        .users-header > div:first-child{flex:1;min-width:200px}
        .users-header h2{font-size:24px;font-weight:600;color:#111111;letter-spacing:-0.02em;margin:0}
        .users-header p{font-size:14px;color:#8f8f8f;margin:8px 0 0 0}
        .users-refresh-btn{color:white;padding:8px 16px;border-radius:10px;font-weight:600;transition:all 0.2s;border:none;cursor:pointer;font-size:14px;background:#e07b63}
        .users-refresh-btn:hover{background:#d56a52}
        .users-search-panel{padding:16px;border-radius:14px;background:#ffffff;box-shadow:0 10px 30px rgba(16,16,16,0.08);margin-bottom:24px}
        .users-search-group{display:flex;flex-direction:column}
        .users-search-group label{font-size:13px;font-weight:600;color:#8f8f8f;margin-bottom:8px}
        .users-search-group input{padding:10px 12px;border-radius:10px;border:1px solid #e9e6e3;background:#fafafa;font-size:13px;outline:none;font-family:inherit}
        .users-search-group input:focus{border-color:#e07b63;background:rgba(224,123,99,0.02)}
        .users-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px}

        @media (max-width:1024px){
          .users-header{margin-bottom:20px}
          .users-header h2{font-size:20px}
          .users-refresh-btn{padding:6px 12px;font-size:13px}
          .users-grid{grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:12px}
        }

        @media (max-width:768px){
          .p-6{padding:12px !important}
          .users-header{flex-direction:column;margin-bottom:16px;gap:8px}
          .users-header > div:first-child{width:100%}
          .users-refresh-btn{width:100%;padding:8px 12px;font-size:12px}
          .users-search-panel{padding:12px;margin-bottom:16px}
          .users-search-group label{font-size:12px;margin-bottom:6px}
          .users-search-group input{padding:8px 10px;font-size:12px}
          .users-grid{grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:8px}
          .users-header h2{font-size:18px}
          .users-header p{font-size:12px;margin-top:4px}
        }

        @media (max-width:480px){
          .p-6{padding:8px !important}
          .users-header{gap:8px;margin-bottom:12px}
          .users-header h2{font-size:16px}
          .users-header p{font-size:11px}
          .users-refresh-btn{width:100%;padding:6px 10px;font-size:11px;border-radius:8px}
          .users-search-panel{padding:8px;margin-bottom:12px;border-radius:10px}
          .users-search-group label{font-size:11px;margin-bottom:4px}
          .users-search-group input{padding:6px 8px;font-size:11px;border-radius:6px}
          .users-grid{grid-template-columns:1fr;gap:6px}
        }
      `}</style>
      <div className="users-header">
        <div>
          <h2>Users</h2>
          <p>Click on user card to see and user projects</p>
        </div>
        <button
          onClick={fetchUsers}
          className="users-refresh-btn"
        >
          Refresh
        </button>
      </div>

      <div className="users-search-panel">
        <div className="users-search-group">
          <label>
            Search User
          </label>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name..."
            aria-label="Search users by name"
          />
        </div>
      </div>

      {loading && <LoadingSpinner />}
      {error && <div className="text-sm" style={{ color: "#e07b63" }}>{error}</div>}

      <motion.div layout className="users-grid">
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