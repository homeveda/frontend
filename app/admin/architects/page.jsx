"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import LoadingSpinner from "../../../component/loadingSpinner";
import Popup from "../../../component/popup";

export default function ArchitectsPage() {
  const router = useRouter();
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  const adminToken = typeof window !== "undefined" ? localStorage.getItem("adminToken") : null;

  const [architects, setArchitects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  // Inline edit state: { [id]: { architectName, architectContact, architectAddress } }
  const [editing, setEditing] = useState({});
  const [saving, setSaving] = useState({});

  // Delete confirmation
  const [confirmDelete, setConfirmDelete] = useState({});
  const [deleting, setDeleting] = useState({});

  const [popup, setPopup] = useState({ show: false, message: "", color: "green" });

  // Add architect state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const CATEGORY_OPTIONS = ["A", "B", "C"];
  const [newArchitect, setNewArchitect] = useState({ architectName: "", architectContact: "", architectAddress: "", architectCategory: "" });
  const [adding, setAdding] = useState(false);

  const showPopup = (message, color = "green") =>
    setPopup({ show: true, message, color });

  const fetchArchitects = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${backendUrl}/architect`, {
        headers: { Authorization: adminToken ? `Bearer ${adminToken}` : undefined },
      });
      setArchitects(res.data || []);
    } catch (err) {
      showPopup(err?.response?.data?.message || "Failed to load architects", "red");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArchitects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAddArchitect = async () => {
    if(!newArchitect.architectName || !newArchitect.architectContact){
      return showPopup("Name and Contact are required", "red");
    }
    setAdding(true);
    try {
      const res = await axios.post(`${backendUrl}/architect`, newArchitect, {
        headers: { Authorization: adminToken ? `Bearer ${adminToken}` : undefined },
      });
      setArchitects((prev) => [res.data.architect, ...prev]);
      showPopup("Architect created successfully", "green");
      setIsAddModalOpen(false);
      setNewArchitect({ architectName: "", architectContact: "", architectAddress: "", architectCategory: "" });
    } catch (err) {
      showPopup(err?.response?.data?.message || "Failed to add architect", "red");
    } finally {
      setAdding(false);
    }
  };

  const startEdit = (architect) => {
    setEditing((prev) => ({
      ...prev,
      [architect._id]: {
        architectName: architect.architectName || "",
        architectContact: architect.architectContact || "",
        architectAddress: architect.architectAddress || "",
        architectCategory: architect.architectCategory || "",
      },
    }));
  };

  const cancelEdit = (id) => {
    setEditing((prev) => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
  };

  const handleEditChange = (id, field, value) => {
    setEditing((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: value },
    }));
  };

  const handleSave = async (id) => {
    const data = editing[id];
    if (!data) return;
    setSaving((prev) => ({ ...prev, [id]: true }));
    try {
      const res = await axios.patch(`${backendUrl}/architect/${id}`, data, {
        headers: { Authorization: adminToken ? `Bearer ${adminToken}` : undefined },
      });
      setArchitects((prev) =>
        prev.map((a) => (a._id === id ? res.data.architect || { ...a, ...data } : a))
      );
      cancelEdit(id);
      showPopup("Architect updated successfully.");
    } catch (err) {
      showPopup(err?.response?.data?.message || "Failed to update architect.", "red");
    } finally {
      setSaving((prev) => ({ ...prev, [id]: false }));
    }
  };

  const handleDelete = async (id) => {
    setDeleting((prev) => ({ ...prev, [id]: true }));
    try {
      await axios.delete(`${backendUrl}/architect/${id}`, {
        headers: { Authorization: adminToken ? `Bearer ${adminToken}` : undefined },
      });
      setArchitects((prev) => prev.filter((a) => a._id !== id));
      showPopup("Architect deleted successfully.");
    } catch (err) {
      showPopup(err?.response?.data?.message || "Failed to delete architect.", "red");
    } finally {
      setDeleting((prev) => ({ ...prev, [id]: false }));
      setConfirmDelete((prev) => ({ ...prev, [id]: false }));
    }
  };

  const filtered = architects.filter((a) =>
    (a.architectName || "").toLowerCase().includes(query.toLowerCase()) ||
    (a.architectContact || "").toLowerCase().includes(query.toLowerCase()) ||
    (a.architectAddress || "").toLowerCase().includes(query.toLowerCase())
  );

  const getInitials = (name = "") =>
    name.trim().split(" ").slice(0, 2).map((w) => w[0]?.toUpperCase()).join("") || "?";

  if (loading) return (
    <div className="p-6 min-h-screen" style={{ backgroundColor: "#f7f4f1", fontFamily: "'Space Grotesk', sans-serif" }}>
      <LoadingSpinner />
    </div>
  );

  return (
    <div className="p-6 min-h-screen" style={{ backgroundColor: "#f7f4f1", fontFamily: "'Space Grotesk', sans-serif" }}>
      <style>{`
        .arch-header{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:24px;gap:16px;flex-wrap:wrap}
        .arch-header>div:first-child{flex:1;min-width:200px}
        .arch-header h2{font-size:24px;font-weight:600;color:#111;letter-spacing:-0.02em;margin:0}
        .arch-header p{font-size:14px;color:#8f8f8f;margin:6px 0 0 0}
        .arch-header-actions{display:flex;gap:10px;flex-wrap:wrap;align-items:center}
        .arch-btn{color:white;padding:8px 16px;border-radius:10px;font-weight:600;font-size:14px;border:none;cursor:pointer;background:#e07b63;transition:background .2s}
        .arch-btn:hover{background:#d56a52}
        .arch-back-btn{background:none;border:none;color:#e07b63;font-size:14px;font-weight:600;cursor:pointer;padding:0}
        .arch-search{padding:16px;border-radius:14px;background:#fff;box-shadow:0 10px 30px rgba(16,16,16,0.08);margin-bottom:24px}
        .arch-search label{font-size:13px;font-weight:600;color:#8f8f8f;display:block;margin-bottom:8px}
        .arch-search input{padding:10px 12px;border-radius:10px;border:1px solid #e9e6e3;background:#fafafa;font-size:13px;outline:none;font-family:inherit;width:100%}
        .arch-search input:focus{border-color:#a855f7}
        .arch-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:16px}
        .arch-card{background:#fff;border-radius:14px;padding:20px;box-shadow:0 8px 24px rgba(16,16,16,0.07);border:1px solid #efe7e2;display:flex;flex-direction:column;gap:14px}
        .arch-card-top{display:flex;align-items:center;gap:14px}
        .arch-avatar{width:44px;height:44px;border-radius:50%;background:#fdf4ff;display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:700;color:#a855f7;flex-shrink:0}
        .arch-name{font-size:15px;font-weight:600;color:#111;margin:0}
        .arch-contact{font-size:12px;color:#8f8f8f;margin:2px 0 0 0}
        .arch-address{font-size:12px;color:#8f8f8f;margin:2px 0 0 0}
        .arch-field{display:flex;flex-direction:column;gap:4px}
        .arch-field label{font-size:11px;font-weight:600;color:#8f8f8f;text-transform:uppercase;letter-spacing:0.04em}
        .arch-input{padding:9px 12px;border-radius:10px;border:1px solid #e9e6e3;background:#fafafa;font-size:13px;outline:none;font-family:inherit;width:100%}
        .arch-input:focus{border-color:#a855f7}
        .arch-card-actions{display:flex;gap:8px;align-items:center;flex-wrap:wrap}
        .arch-save-btn{padding:8px 18px;border-radius:10px;font-size:13px;font-weight:600;border:none;cursor:pointer;background:#a855f7;color:white;transition:all .2s}
        .arch-save-btn:hover{background:#9333ea}
        .arch-save-btn:disabled{opacity:0.55;cursor:default}
        .arch-cancel-btn{padding:8px 18px;border-radius:10px;font-size:13px;font-weight:600;border:1px solid #e5e7eb;cursor:pointer;background:#fff;color:#555;transition:all .2s}
        .arch-cancel-btn:hover{background:#f5f5f5}
        .arch-edit-btn{padding:8px 18px;border-radius:10px;font-size:13px;font-weight:600;border:1px solid #e5e7eb;cursor:pointer;background:#fff;color:#111}
        .arch-edit-btn:hover{background:#f5f5f5}
        .arch-delete-btn{padding:8px 18px;border-radius:10px;font-size:13px;font-weight:600;border:1px solid #e5e7eb;cursor:pointer;background:#fff;color:#dc2626;transition:all .2s}
        .arch-delete-btn:hover{background:#fef2f2;border-color:#fca5a5}
        .arch-delete-btn:disabled{opacity:0.55;cursor:default}
        .arch-confirm-row{display:flex;align-items:center;gap:8px;padding:10px 12px;border-radius:10px;background:#fef2f2;border:1px solid #fca5a5}
        .arch-confirm-row span{font-size:12px;font-weight:600;color:#dc2626;flex:1}
        .arch-confirm-yes{padding:6px 14px;border-radius:8px;font-size:12px;font-weight:600;border:none;cursor:pointer;background:#dc2626;color:white}
        .arch-confirm-yes:disabled{opacity:0.55;cursor:default}
        .arch-confirm-no{padding:6px 14px;border-radius:8px;font-size:12px;font-weight:600;border:1px solid #e5e7eb;cursor:pointer;background:#fff;color:#555}
        .arch-empty{text-align:center;padding:48px 24px;color:#8f8f8f;font-size:14px}
        @media(max-width:768px){
          .p-6{padding:12px !important}
          .arch-header{margin-bottom:16px}
          .arch-header h2{font-size:20px}
          .arch-grid{grid-template-columns:1fr;gap:10px}
          .arch-card{padding:14px;gap:10px}
        }
        @media(max-width:480px){
          .p-6{padding:8px !important}
          .arch-header h2{font-size:18px}
          .arch-btn{font-size:12px;padding:6px 12px}
          .arch-search{padding:10px}
          .arch-card{padding:12px}
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

      <div className="arch-header">
        <div>
          <h2>Architects</h2>
          <p>View and update registered architects</p>
        </div>
        <div className="arch-header-actions">
          <button onClick={() => setIsAddModalOpen(true)} className="arch-btn" style={{backgroundColor: "#111", color: "#fff"}}>
            + Add Architect
          </button>
          <button onClick={fetchArchitects} className="arch-btn">
            Refresh
          </button>
        </div>
      </div>

      <div className="arch-search">
        <label>Search Architects</label>
        <input
          type="text"
          placeholder="Search by name, contact or address..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="arch-empty">No architects found.</div>
      ) : (
        <motion.div className="arch-grid">
          <AnimatePresence>
            {filtered.map((architect) => {
              const isEditing = !!editing[architect._id];
              const editData = editing[architect._id] || {};
              const isSaving = saving[architect._id];
              const isDeleting = deleting[architect._id];
              const isConfirming = confirmDelete[architect._id];

              return (
                <motion.div
                  key={architect._id}
                  className="arch-card"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="arch-card-top">
                    <div className="arch-avatar">{getInitials(architect.architectName)}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p className="arch-name">{architect.architectName || "—"}</p>
                      <p className="arch-contact">{architect.architectContact || "—"}</p>
                      <p className="arch-address">{architect.architectAddress || "—"}</p>
                      {architect.architectCategory && <p className="arch-contact" style={{marginTop:4}}><span style={{fontWeight:600,color:"#a855f7"}}>Category:</span> {architect.architectCategory}</p>}
                    </div>
                  </div>

                  {isEditing && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      <div className="arch-field">
                        <label>Name</label>
                        <input
                          className="arch-input"
                          value={editData.architectName}
                          onChange={(e) => handleEditChange(architect._id, "architectName", e.target.value)}
                        />
                      </div>
                      <div className="arch-field">
                        <label>Contact Number</label>
                        <input
                          className="arch-input"
                          value={editData.architectContact}
                          onChange={(e) => handleEditChange(architect._id, "architectContact", e.target.value)}
                        />
                      </div>
                      <div className="arch-field">
                        <label>Address</label>
                        <input
                          className="arch-input"
                          value={editData.architectAddress}
                          onChange={(e) => handleEditChange(architect._id, "architectAddress", e.target.value)}
                        />
                      </div>
                      <div className="arch-field">
                        <label>Category</label>
                        <select
                          className="arch-input"
                          value={editData.architectCategory || ""}
                          onChange={(e) => handleEditChange(architect._id, "architectCategory", e.target.value)}
                        >
                          <option value="">Select Category</option>
                          {CATEGORY_OPTIONS.map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}

                  {isConfirming ? (
                    <div className="arch-confirm-row">
                      <span>Delete this architect?</span>
                      <button
                        className="arch-confirm-yes"
                        disabled={isDeleting}
                        onClick={() => handleDelete(architect._id)}
                      >
                        {isDeleting ? "Deleting..." : "Yes"}
                      </button>
                      <button
                        className="arch-confirm-no"
                        onClick={() => setConfirmDelete((prev) => ({ ...prev, [architect._id]: false }))}
                      >
                        No
                      </button>
                    </div>
                  ) : (
                    <div className="arch-card-actions">
                      {isEditing ? (
                        <>
                          <button
                            className="arch-save-btn"
                            disabled={isSaving}
                            onClick={() => handleSave(architect._id)}
                          >
                            {isSaving ? "Saving..." : "Save"}
                          </button>
                          <button className="arch-cancel-btn" onClick={() => cancelEdit(architect._id)}>
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button className="arch-edit-btn" onClick={() => startEdit(architect)}>
                            Edit
                          </button>
                          <button
                            className="arch-delete-btn"
                            disabled={isDeleting}
                            onClick={() => setConfirmDelete((prev) => ({ ...prev, [architect._id]: true }))}
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Add Architect Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed",
              top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: "rgba(0,0,0,0.5)",
              zIndex: 9999,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "20px"
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              style={{
                background: "#fff",
                borderRadius: "16px",
                padding: "24px",
                width: "100%",
                maxWidth: "400px",
                boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
                display: "flex",
                flexDirection: "column",
                gap: "16px"
              }}
            >
              <h3 style={{ margin: 0, fontSize: "20px", fontWeight: "600", color: "#111" }}>Add New Architect</h3>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "13px", fontWeight: "600", color: "#8f8f8f" }}>Name <span style={{color:"red"}}>*</span></label>
                <input
                  type="text"
                  placeholder="Architect Name"
                  value={newArchitect.architectName}
                  onChange={(e) => setNewArchitect({ ...newArchitect, architectName: e.target.value })}
                  style={{ padding: "10px 12px", border: "1px solid #e9e6e3", borderRadius: "10px", outline: "none", fontFamily: "inherit", fontSize: "14px" }}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "13px", fontWeight: "600", color: "#8f8f8f" }}>Contact <span style={{color:"red"}}>*</span></label>
                <input
                  type="text"
                  placeholder="Contact Number"
                  value={newArchitect.architectContact}
                  onChange={(e) => setNewArchitect({ ...newArchitect, architectContact: e.target.value })}
                  style={{ padding: "10px 12px", border: "1px solid #e9e6e3", borderRadius: "10px", outline: "none", fontFamily: "inherit", fontSize: "14px" }}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "13px", fontWeight: "600", color: "#8f8f8f" }}>Address</label>
                <textarea
                  placeholder="Architect Address (Optional)"
                  value={newArchitect.architectAddress}
                  onChange={(e) => setNewArchitect({ ...newArchitect, architectAddress: e.target.value })}
                  rows={3}
                  style={{ padding: "10px 12px", border: "1px solid #e9e6e3", borderRadius: "10px", outline: "none", fontFamily: "inherit", fontSize: "14px", resize: "none" }}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "13px", fontWeight: "600", color: "#8f8f8f" }}>Category</label>
                <select
                  value={newArchitect.architectCategory}
                  onChange={(e) => setNewArchitect({ ...newArchitect, architectCategory: e.target.value })}
                  style={{ padding: "10px 12px", border: "1px solid #e9e6e3", borderRadius: "10px", outline: "none", fontFamily: "inherit", fontSize: "14px", backgroundColor: "#fff" }}
                >
                  <option value="">Select Category</option>
                  {CATEGORY_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "8px" }}>
                <button
                  onClick={() => { setIsAddModalOpen(false); setNewArchitect({ architectName: "", architectContact: "", architectAddress: "", architectCategory: "" }); }}
                  style={{ padding: "10px 16px", borderRadius: "10px", border: "1px solid #e9e6e3", background: "#fff", cursor: "pointer", fontWeight: "600", fontSize: "14px" }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddArchitect}
                  disabled={adding}
                  style={{ padding: "10px 16px", borderRadius: "10px", border: "none", background: "#e07b63", color: "#fff", cursor: "pointer", fontWeight: "600", fontSize: "14px", opacity: adding ? 0.7 : 1 }}
                >
                  {adding ? "Adding..." : "Add Architect"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
