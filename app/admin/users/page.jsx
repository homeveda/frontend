"use client";
import { useState } from "react";
import UserCard from "../../../component/userCard";
import LoadingSpinner from "../../../component/loadingSpinner";
import ConfirmationDialogueBox from "../../../component/confirmationDialogueBox";
import { AnimatePresence, motion } from "framer-motion";
import axios from "axios";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DisplayAllUsers(){
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const router = useRouter();

  // Edit modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", address: "", phone: "" });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState(null);

  // Delete confirmation state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  const getAuthHeaders = () => {
    const adminToken = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
    return { Authorization: adminToken ? `Bearer ${adminToken}` : undefined };
  };

  const fetchUsers = async () => {
    if (!backendUrl) return setError("Backend URL not configured");
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get(`${backendUrl}/user/inactive-projects`, { headers: getAuthHeaders() });
      const data = res.data?.users || res.data || [];
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      if (err?.response?.status === 404) {
        // setError("No users with inactive projects found");
      } else {
        setError(err?.response?.data?.message || err.message || 'Failed to load users');
      }
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-hide success message
  useEffect(() => {
    if (successMsg) {
      const timer = setTimeout(() => setSuccessMsg(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMsg]);

  // --- Edit handlers ---
  const handleEditOpen = (user) => {
    setEditUser(user);
    setEditForm({ name: user.name || "", address: user.address || "", phone: user.phone || "" });
    setEditError(null);
    setEditModalOpen(true);
  };

  const handleEditSave = async () => {
    if (!editUser) return;
    try {
      setEditLoading(true);
      setEditError(null);
      await axios.patch(`${backendUrl}/user`, {
        email: editUser.email,
        name: editForm.name,
        address: editForm.address,
        phone: editForm.phone,
      }, { headers: getAuthHeaders() });
      setEditModalOpen(false);
      setEditUser(null);
      setSuccessMsg("User updated successfully");
      fetchUsers();
    } catch (err) {
      setEditError(err?.response?.data?.message || err.message || "Failed to update user");
    } finally {
      setEditLoading(false);
    }
  };

  // --- Delete handlers ---
  const handleDeleteOpen = (user) => {
    setDeleteTarget(user);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      setDeleteLoading(true);
      await axios.delete(`${backendUrl}/user`, {
        headers: getAuthHeaders(),
        data: { email: deleteTarget.email },
      });
      setDeleteDialogOpen(false);
      setDeleteTarget(null);
      setSuccessMsg("User deleted successfully");
      fetchUsers();
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Failed to delete user");
      setDeleteDialogOpen(false);
      setDeleteTarget(null);
    } finally {
      setDeleteLoading(false);
    }
  };

  // --- Projects handler ---
  const handleProjects = (user) => {
    router.push(`/admin/projects?userEmail=${encodeURIComponent(user.email)}`);
  };

  const filtered = users
    .filter(u => (u.name || '').toLowerCase().includes(query.trim().toLowerCase()));

  return (
    <div className="p-6" style={{ backgroundColor: "#f7f4f1", minHeight: "100vh", fontFamily: "'Space Grotesk', sans-serif" }}>
      <style>{`
        .users-header{display:flex;items-align:center;justify-content:space-between;margin-bottom:24px;gap:16px;flex-wrap:wrap}
        .users-header > div:first-child{flex:1;min-width:200px,margin-left:60px}
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

        .users-success-toast{position:fixed;top:20px;right:20px;z-index:100;padding:12px 20px;background:#20c55e;color:white;border-radius:10px;font-size:13px;font-weight:600;box-shadow:0 4px 16px rgba(32,197,94,0.25);font-family:'Space Grotesk',sans-serif}

        /* Edit Modal */
        .edit-modal-overlay{position:fixed;inset:0;z-index:50;display:flex;align-items:center;justify-content:center}
        .edit-modal-backdrop{position:fixed;inset:0;background:rgba(0,0,0,0.45);z-index:-1}
        .edit-modal-card{background:#fff;border-radius:14px;box-shadow:0 10px 30px rgba(16,16,16,0.12);border:1px solid #e9e6e3;max-width:480px;width:100%;margin:0 16px;z-index:51;overflow:hidden}
        .edit-modal-header{padding:20px 20px 0 20px}
        .edit-modal-header h3{font-size:18px;font-weight:600;color:#111;margin:0}
        .edit-modal-header p{font-size:13px;color:#8f8f8f;margin:6px 0 0 0}
        .edit-modal-body{padding:16px 20px}
        .edit-modal-field{display:flex;flex-direction:column;margin-bottom:14px}
        .edit-modal-field label{font-size:12px;font-weight:600;color:#8f8f8f;margin-bottom:6px}
        .edit-modal-field input{padding:10px 12px;border-radius:10px;border:1px solid #e9e6e3;background:#fafafa;font-size:13px;outline:none;font-family:'Space Grotesk',sans-serif}
        .edit-modal-field input:focus{border-color:#e07b63;background:rgba(224,123,99,0.02)}
        .edit-modal-footer{padding:0 20px 20px 20px;display:flex;justify-content:flex-end;gap:10px}
        .edit-modal-btn{padding:8px 18px;border-radius:10px;font-size:13px;font-weight:600;border:none;cursor:pointer;transition:all 0.2s;font-family:'Space Grotesk',sans-serif}
        .edit-modal-btn-cancel{background:#f0f0f0;color:#111}
        .edit-modal-btn-cancel:hover{background:#e8e8e8}
        .edit-modal-btn-save{background:#e07b63;color:white}
        .edit-modal-btn-save:hover{background:#d56a52}
        .edit-modal-btn-save:disabled{opacity:0.6;cursor:not-allowed}
        .edit-modal-error{font-size:12px;color:#d94444;margin:0 20px 12px 20px}

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
          .users-refresh-btn{padding:8px 12px;font-size:12px}
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
          .users-refresh-btn{padding:6px 10px;font-size:11px;border-radius:8px}
          .users-search-panel{padding:8px;margin-bottom:12px;border-radius:10px}
          .users-search-group label{font-size:11px;margin-bottom:4px}
          .users-search-group input{padding:6px 8px;font-size:11px;border-radius:6px}
          .users-grid{grid-template-columns:1fr;gap:6px}
          .edit-modal-card{margin:0 8px}
          .edit-modal-header{padding:16px 16px 0 16px}
          .edit-modal-body{padding:12px 16px}
          .edit-modal-footer{padding:0 16px 16px 16px}
        }
      `}</style>

      {/* Success toast */}
      <AnimatePresence>
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="users-success-toast"
          >
            {successMsg}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="users-header">
        <div>
          <h2>Users</h2>
          <p>Users with inactive projects — edit details, delete accounts, or view their projects</p>
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
                onProjects={handleProjects}
                onEdit={handleEditOpen}
                onDelete={handleDeleteOpen}
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

      {/* ---- Edit User Modal ---- */}
      <AnimatePresence>
        {editModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="edit-modal-overlay"
          >
            <motion.div
              initial={{ scale: 0.95, y: 12, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 12, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
              className="edit-modal-card"
            >
              <div className="edit-modal-header">
                <h3>Edit User</h3>
                <p>Editing: {editUser?.email}</p>
              </div>
              <div className="edit-modal-body">
                <div className="edit-modal-field">
                  <label>Name</label>
                  <input
                    value={editForm.name}
                    onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Full name"
                  />
                </div>
                <div className="edit-modal-field">
                  <label>Address</label>
                  <input
                    value={editForm.address}
                    onChange={(e) => setEditForm(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="Address"
                  />
                </div>
                <div className="edit-modal-field" style={{ marginBottom: 0 }}>
                  <label>Phone</label>
                  <input
                    value={editForm.phone}
                    onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="Phone number"
                  />
                </div>
              </div>
              {editError && <div className="edit-modal-error">{editError}</div>}
              <div className="edit-modal-footer">
                <button
                  className="edit-modal-btn edit-modal-btn-cancel"
                  onClick={() => { setEditModalOpen(false); setEditUser(null); }}
                >
                  Cancel
                </button>
                <button
                  className="edit-modal-btn edit-modal-btn-save"
                  onClick={handleEditSave}
                  disabled={editLoading}
                >
                  {editLoading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </motion.div>
            <motion.div
              onClick={() => { setEditModalOpen(false); setEditUser(null); }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="edit-modal-backdrop"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ---- Delete Confirmation Dialog ---- */}
      <ConfirmationDialogueBox
        open={deleteDialogOpen}
        title="Delete User"
        description={`Are you sure you want to delete "${deleteTarget?.name || 'this user'}" (${deleteTarget?.email || ''})? This action cannot be undone.`}
        confirmText={deleteLoading ? "Deleting..." : "Delete"}
        cancelText="Cancel"
        onConfirm={handleDeleteConfirm}
        onCancel={() => { setDeleteDialogOpen(false); setDeleteTarget(null); }}
      />
    </div>
  );
}