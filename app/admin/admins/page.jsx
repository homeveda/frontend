"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import LoadingSpinner from "../../../component/loadingSpinner";
import Popup from "../../../component/popup";
import { motion, AnimatePresence } from "framer-motion";

const ADMIN_ROLES = [
  "super admin",
  "designer",
  "site supervisor",
  "kitchen sales executive",
  "glass sales executive",
  "wardrobes sales executive",
  "facade sales executive",
];

export default function ManageAdminsPage() {
  const router = useRouter();
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  const adminToken = typeof window !== "undefined" ? localStorage.getItem("adminToken") : null;

  // Guard: only super admins can access this page
  useEffect(() => {
    const role = localStorage.getItem("adminRole") || "";
    if (role !== "super admin") {
      router.replace("/admin/dashboard");
    }
  }, [router]);

  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState("");

  // Inline edit state: { [adminId]: selectedRole }
  const [pendingRoles, setPendingRoles] = useState({});
  const [saving, setSaving] = useState({});

  // Delete confirmation state: { [adminId]: true } when pending confirm
  const [confirmDelete, setConfirmDelete] = useState({});
  const [deleting, setDeleting] = useState({});

  const [popup, setPopup] = useState({ show: false, message: "", color: "green" });

  const showPopup = (message, color = "green") => {
    setPopup({ show: true, message, color });
  };

  const fetchAdmins = async () => {
    if (!backendUrl) return setError("Backend URL not configured");
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get(`${backendUrl}/user/admins`, {
        headers: { Authorization: adminToken ? `Bearer ${adminToken}` : undefined },
      });
      const data = res.data?.admins || [];
      setAdmins(data);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Failed to load admins");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRoleChange = (adminId, role) => {
    setPendingRoles((prev) => ({ ...prev, [adminId]: role }));
  };

  const handleSave = async (adminId) => {
    const role = pendingRoles[adminId];
    if (!role) return;
    setSaving((prev) => ({ ...prev, [adminId]: true }));
    try {
      await axios.patch(
        `${backendUrl}/user/admins/${adminId}/role`,
        { role },
        { headers: { Authorization: adminToken ? `Bearer ${adminToken}` : undefined } }
      );
      setAdmins((prev) =>
        prev.map((a) => (a._id === adminId ? { ...a, role } : a))
      );
      setPendingRoles((prev) => {
        const copy = { ...prev };
        delete copy[adminId];
        return copy;
      });
      showPopup("Role updated successfully.");
    } catch (err) {
      showPopup(err?.response?.data?.message || "Failed to update role.", "red");
    } finally {
      setSaving((prev) => ({ ...prev, [adminId]: false }));
    }
  };

  const handleDelete = async (adminId) => {
    setDeleting((prev) => ({ ...prev, [adminId]: true }));
    try {
      await axios.delete(`${backendUrl}/user/admins/${adminId}`, {
        headers: { Authorization: adminToken ? `Bearer ${adminToken}` : undefined },
      });
      setAdmins((prev) => prev.filter((a) => a._id !== adminId));
      showPopup("Admin deleted successfully.");
    } catch (err) {
      showPopup(err?.response?.data?.message || "Failed to delete admin.", "red");
    } finally {
      setDeleting((prev) => ({ ...prev, [adminId]: false }));
      setConfirmDelete((prev) => ({ ...prev, [adminId]: false }));
    }
  };

  const filtered = admins.filter(
    (a) =>
      (a.name || "").toLowerCase().includes(query.toLowerCase()) ||
      (a.email || "").toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="p-6" style={{ backgroundColor: "#f7f4f1", minHeight: "100vh", fontFamily: "'Space Grotesk', sans-serif" }}>
      <style>{`
        .ma-header{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:24px;gap:16px;flex-wrap:wrap}
        .ma-header > div:first-child{flex:1;min-width:200px}
        .ma-header h2{font-size:24px;font-weight:600;color:#111;letter-spacing:-0.02em;margin:0}
        .ma-header p{font-size:14px;color:#8f8f8f;margin:6px 0 0 0}
        .ma-header-actions{display:flex;gap:10px;flex-wrap:wrap;align-items:center}
        .ma-btn{color:white;padding:8px 16px;border-radius:10px;font-weight:600;font-size:14px;border:none;cursor:pointer;background:#e07b63;transition:background .2s}
        .ma-btn:hover{background:#d56a52}
        .ma-back-btn{background:none;border:none;color:#e07b63;font-size:14px;font-weight:600;cursor:pointer;padding:0}
        .ma-search{padding:16px;border-radius:14px;background:#fff;box-shadow:0 10px 30px rgba(16,16,16,0.08);margin-bottom:24px}
        .ma-search label{font-size:13px;font-weight:600;color:#8f8f8f;display:block;margin-bottom:8px}
        .ma-search input{padding:10px 12px;border-radius:10px;border:1px solid #e9e6e3;background:#fafafa;font-size:13px;outline:none;font-family:inherit;width:100%}
        .ma-search input:focus{border-color:#e07b63}
        .ma-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:16px}
        .ma-card{background:#fff;border-radius:14px;padding:20px;box-shadow:0 8px 24px rgba(16,16,16,0.07);border:1px solid #efe7e2;display:flex;flex-direction:column;gap:14px}
        .ma-card-top{display:flex;align-items:center;gap:14px}
        .ma-avatar{width:44px;height:44px;border-radius:50%;background:#fef2f0;display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:700;color:#e07b63;flex-shrink:0}
        .ma-name{font-size:15px;font-weight:600;color:#111;margin:0}
        .ma-email{font-size:12px;color:#8f8f8f;margin:2px 0 0 0}
        .ma-role-row{display:flex;flex-direction:column;gap:6px}
        .ma-role-label{font-size:12px;font-weight:600;color:#8f8f8f}
        .ma-badge{display:inline-block;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:600;background:#fef2f0;color:#e07b63;border:1px solid rgba(224,123,99,0.2);text-transform:capitalize}
        .ma-select{padding:9px 12px;border-radius:10px;border:1px solid #e9e6e3;background:#fafafa;font-size:13px;outline:none;font-family:inherit;width:100%;cursor:pointer}
        .ma-select:focus{border-color:#e07b63}
        .ma-save-btn{padding:8px 18px;border-radius:10px;font-size:13px;font-weight:600;border:none;cursor:pointer;background:#e07b63;color:white;transition:all .2s;align-self:flex-start}
        .ma-save-btn:hover{background:#d56a52}
        .ma-save-btn:disabled{opacity:0.55;cursor:default}
        .ma-card-actions{display:flex;gap:8px;align-items:center;flex-wrap:wrap}
        .ma-delete-btn{padding:8px 18px;border-radius:10px;font-size:13px;font-weight:600;border:1px solid #e5e7eb;cursor:pointer;background:#fff;color:#dc2626;transition:all .2s}
        .ma-delete-btn:hover{background:#fef2f2;border-color:#fca5a5}
        .ma-delete-btn:disabled{opacity:0.55;cursor:default}
        .ma-confirm-row{display:flex;align-items:center;gap:8px;padding:10px 12px;border-radius:10px;background:#fef2f2;border:1px solid #fca5a5}
        .ma-confirm-row span{font-size:12px;font-weight:600;color:#dc2626;flex:1}
        .ma-confirm-yes{padding:6px 14px;border-radius:8px;font-size:12px;font-weight:600;border:none;cursor:pointer;background:#dc2626;color:white}
        .ma-confirm-yes:disabled{opacity:0.55;cursor:default}
        .ma-confirm-no{padding:6px 14px;border-radius:8px;font-size:12px;font-weight:600;border:1px solid #e5e7eb;cursor:pointer;background:#fff;color:#555}

        @media(max-width:768px){
          .p-6{padding:12px !important}
          .ma-header{margin-bottom:16px}
          .ma-header h2{font-size:20px}
          .ma-grid{grid-template-columns:1fr;gap:10px}
          .ma-card{padding:14px;gap:10px}
        }
        @media(max-width:480px){
          .p-6{padding:8px !important}
          .ma-header h2{font-size:18px}
          .ma-btn{font-size:12px;padding:6px 12px}
          .ma-search{padding:10px}
          .ma-card{padding:12px}
        }
      `}</style>

      {popup.show && (
        <Popup
          message={popup.message}
          color={popup.color}
          onClose={() => setPopup({ ...popup, show: false })}
          autoClose
          duration={3500}
        />
      )}

      <div className="ma-header">
        <div>
          <h2>Manage Admins</h2>
          <p>View all admins and update their roles</p>
        </div>
        <div className="ma-header-actions">
          <button onClick={() => router.push("/admin/dashboard")} className="ma-back-btn">
            ← Dashboard
          </button>
          <button onClick={fetchAdmins} className="ma-btn">
            Refresh
          </button>
        </div>
      </div>

      <div className="ma-search">
        <label>Search Admins</label>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name or email..."
        />
      </div>

      {loading && <LoadingSpinner />}
      {error && <div style={{ color: "#e07b63", fontSize: 14 }}>{error}</div>}

      <motion.div layout className="ma-grid">
        <AnimatePresence>
          {filtered.map((admin) => {
            const initials = (admin.name || "A")
              .split(" ")
              .map((w) => w[0])
              .join("")
              .toUpperCase()
              .slice(0, 2);
            const currentRole = pendingRoles[admin._id] ?? admin.role ?? "";
            const isDirty = pendingRoles[admin._id] !== undefined && pendingRoles[admin._id] !== admin.role;

            return (
              <motion.div
                key={admin._id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                className="ma-card"
              >
                <div className="ma-card-top">
                  <div className="ma-avatar">{initials}</div>
                  <div>
                    <p className="ma-name">{admin.name}</p>
                    <p className="ma-email">{admin.email}</p>
                  </div>
                </div>

                <div className="ma-role-row">
                  <span className="ma-role-label">Current Role</span>
                  <span className="ma-badge">{admin.role || "—"}</span>
                </div>

                <div className="ma-role-row">
                  <span className="ma-role-label">Update Role</span>
                  <select
                    className="ma-select"
                    value={currentRole}
                    onChange={(e) => handleRoleChange(admin._id, e.target.value)}
                  >
                    <option value="">Select a role...</option>
                    {ADMIN_ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r.charAt(0).toUpperCase() + r.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                {isDirty && (
                  <button
                    className="ma-save-btn"
                    onClick={() => handleSave(admin._id)}
                    disabled={saving[admin._id]}
                  >
                    {saving[admin._id] ? "Saving..." : "Save Role"}
                  </button>
                )}

                {confirmDelete[admin._id] ? (
                  <div className="ma-confirm-row">
                    <span>Delete this admin?</span>
                    <button
                      className="ma-confirm-yes"
                      onClick={() => handleDelete(admin._id)}
                      disabled={deleting[admin._id]}
                    >
                      {deleting[admin._id] ? "Deleting..." : "Yes"}
                    </button>
                    <button
                      className="ma-confirm-no"
                      onClick={() => setConfirmDelete((prev) => ({ ...prev, [admin._id]: false }))}
                    >
                      No
                    </button>
                  </div>
                ) : (
                  <div className="ma-card-actions">
                    <button
                      className="ma-delete-btn"
                      onClick={() => setConfirmDelete((prev) => ({ ...prev, [admin._id]: true }))}
                    >
                      Delete Admin
                    </button>
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>

      {!loading && filtered.length === 0 && (
        <div style={{ color: "#8f8f8f", marginTop: 24 }}>No admins found.</div>
      )}
    </div>
  );
}
