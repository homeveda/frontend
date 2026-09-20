"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import axios from "axios";

export default function LeadCard({ lead, onDelete }) {
  const router = useRouter();
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  const adminToken = typeof window !== "undefined" ? localStorage.getItem("adminToken") : null;

  const [notes, setNotes] = useState(lead.notes || "");
  const [lastSavedNotes, setLastSavedNotes] = useState(lead.notes || "");
  const [notesStatus, setNotesStatus] = useState("");
  const [priority, setPriority] = useState(lead.priority || "none");
  const [isUpdating, setIsUpdating] = useState(false);

  const openDetails = () => {
    const id = encodeURIComponent(lead.id || lead._id || lead.id);
    router.push(`/admin/initiallead/updatelead?id=${id}`);
  };

  const handleUpdateField = async (field, value) => {
    try {
      if (field === "notes") setNotesStatus("Saving...");
      setIsUpdating(true);
      await axios.patch(`${backendUrl}/initiallead/${lead.id || lead._id}`, {
        id: lead.id || lead._id,
        [field]: value
      }, {
        headers: { Authorization: adminToken ? `Bearer ${adminToken}` : undefined },
      });
      if (field === "notes") {
        setNotesStatus("Saved ✓");
        setTimeout(() => setNotesStatus(""), 2000);
      }
    } catch (error) {
      console.error(`Failed to update ${field}`, error);
      if (field === "notes") setNotesStatus("Error!");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <>
    <style>{`
      .lead-card{background:#ffffff;border-radius:10px;box-shadow:0 10px 30px rgba(16,16,16,0.08);border:1px solid #e9e6e3;overflow:hidden;display:flex;flex-direction:column;font-family:"Space Grotesk",sans-serif}
      .lead-card-content{cursor:pointer;padding:16px}
      .lead-card-content:hover{background:rgba(224,123,99,0.02)}
      .lead-card-title{font-size:14px;font-weight:600;color:#111111;margin:0}
      .lead-card-address{font-size:12px;color:#8f8f8f;margin:8px 0 0 0}
      .lead-card-contact{font-size:12px;color:#8f8f8f;margin:8px 0 0 0}
      .lead-card-contact span{color:#111111;font-weight:600}
      .lead-card-architect{border-top:1px solid #e9e6e3;margin-top:12px;padding-top:12px}
      .lead-card-architect-label{font-size:11px;font-weight:600;color:#111111;margin:0}
      .lead-card-info{font-size:11px;color:#8f8f8f;margin:4px 0 0 0}
      .lead-card-info span{color:#111111;font-weight:600}
      .lead-card-tags{display:flex;flex-wrap:wrap;gap:4px;margin-top:6px}
      .lead-card-tag{font-size:10px;padding:3px 6px;border-radius:6px;font-weight:500;white-space:nowrap}
      .lead-card-tag.req{background:rgba(224,123,99,0.1);color:#e07b63}
      .lead-card-tag.cat{background:rgba(22,150,209,0.1);color:#1696d1}
      .lead-card-tag.role{background:rgba(99,102,241,0.08);color:#6366f1;border:1px solid rgba(99,102,241,0.15)}
      .lead-card-notes{margin-top:10px;padding-top:10px;border-top:1px dashed #e9e6e3}
      .lead-card-notes-label{font-size:10px;font-weight:600;color:#111111;text-transform:uppercase;letter-spacing:0.05em;margin:0 0 5px 0}
      .lead-card-notes-input{font-size:12px;color:#e07b63;width:100%;margin:0;line-height:1.45;background:rgba(224,123,99,0.08);border:1px solid transparent;border-radius:8px;padding:8px 10px;resize:vertical;font-family:inherit;outline:none;transition:border-color 0.2s}
      .lead-card-notes-input:focus{border-color:#e07b63;background:#fff}
      .lead-card-priority-btn{font-size:10px;font-weight:600;padding:4px 8px;border-radius:6px;border:1px solid transparent;cursor:pointer;font-family:inherit;text-transform:uppercase;transition:all 0.2s}
      .lead-card-priority-btn.inactive{opacity:0.6;background:transparent;border:1px solid #e9e6e3}
      .lead-card-priority-btn.inactive.priority-none{color:#8f8f8f}
      .lead-card-priority-btn.inactive.priority-low{color:#217346}
      .lead-card-priority-btn.inactive.priority-med{color:#d97706}
      .lead-card-priority-btn.inactive.priority-high{color:#dc2626}
      .lead-card-priority-btn.active.priority-none{background:#f0f0f0;color:#8f8f8f;border-color:#e9e6e3}
      .lead-card-priority-btn.active.priority-low{background:rgba(33,115,70,0.1);color:#217346;border-color:rgba(33,115,70,0.2)}
      .lead-card-priority-btn.active.priority-med{background:rgba(245,158,11,0.1);color:#d97706;border-color:rgba(245,158,11,0.2)}
      .lead-card-priority-btn.active.priority-high{background:rgba(220,38,38,0.1);color:#dc2626;border-color:rgba(220,38,38,0.2)}
      .border-left-none{border-left:4px solid transparent}
      .border-left-low{border-left:4px solid #217346}
      .border-left-med{border-left:4px solid #d97706}
      .border-left-high{border-left:4px solid #dc2626}
      .lead-card-update-btn{color:#111111;font-size:12px;padding:6px 12px;border-radius:10px;border:1px solid #e9e6e3;cursor:pointer;font-weight:600;background:#ffffff;transition:all 0.2s;flex:1}
      .lead-card-update-btn:hover{background:#fafafa}
      .lead-card-save-notes-btn{background:#e07b63;color:white;font-size:10px;font-weight:600;padding:4px 10px;border-radius:6px;border:none;cursor:pointer;transition:background 0.2s}
      .lead-card-save-notes-btn:hover{background:#d56a52}
      .lead-card-action-btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;height:32px;padding:0 14px;border-radius:16px;text-decoration:none;font-size:11px;font-weight:600;transition:transform 0.2s, background 0.2s}
      .lead-card-action-btn:hover{transform:scale(1.05)}
      .call-btn{background:rgba(33,115,70,0.1);color:#217346}
      .call-btn:hover{background:rgba(33,115,70,0.2)}
      .wa-btn{background:rgba(37,211,102,0.1);color:#128c7e}
      .wa-btn:hover{background:rgba(37,211,102,0.2)}
      .lead-card-visible{margin-top:10px;padding-top:10px;border-top:1px dashed #e9e6e3}
      .lead-card-visible-label{font-size:10px;font-weight:600;color:#8f8f8f;text-transform:uppercase;letter-spacing:0.05em;margin:0 0 5px 0}
      .lead-card-footer{display:flex;gap:12px;justify-content:flex-end;padding:12px 16px;border-top:1px solid #e9e6e3}
      .lead-card-delete-btn{color:white;font-size:12px;padding:6px 12px;border-radius:10px;border:none;cursor:pointer;font-weight:600;background:#e07b63;transition:all 0.2s;flex:1}
      .lead-card-delete-btn:hover{background:#d56a52}

      @media (max-width:768px){
        .lead-card-content{padding:12px}
        .lead-card-title{font-size:13px}
        .lead-card-address{font-size:11px}
        .lead-card-notes-text{font-size:11px}
        .lead-card-footer{padding:10px 12px;gap:8px}
        .lead-card-delete-btn{padding:5px 10px;font-size:11px;flex:1}
      }

      @media (max-width:480px){
        .lead-card-content{padding:10px}
        .lead-card-title{font-size:12px}
        .lead-card-address{font-size:10px}
        .lead-card-contact{font-size:10px}
        .lead-card-notes-text{font-size:10px}
        .lead-card-tag{font-size:9px;padding:2px 4px}
        .lead-card-footer{padding:8px 10px;gap:6px}
        .lead-card-delete-btn{padding:5px 8px;font-size:10px}
      }
    `}</style>
    <motion.article
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      whileHover={{ scale: 1.02 }}
      className={`lead-card border-left-${priority}`}
    >
      <div className="lead-card-content">
        <div>
          <h3 className="lead-card-title">{lead.name}</h3>
          <p className="lead-card-address">{lead.address}</p>
          <div className="lead-card-contact" style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
            <div>Contact: <span style={{ color: '#111111', fontWeight: 600 }}>{lead.contactNumber}</span></div>
            {lead.contactNumber && (
              <div style={{ display: 'flex', gap: '10px' }}>
                <a
                  href={`tel:${lead.contactNumber.replace(/[^0-9+]/g, '')}`}
                  onClick={(e) => e.stopPropagation()}
                  className="lead-card-action-btn call-btn"
                  title="Call"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                  Call
                </a>
                <a
                  href={`https://wa.me/${lead.contactNumber.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="lead-card-action-btn wa-btn"
                  title="WhatsApp"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                  WhatsApp
                </a>
              </div>
            )}
          </div>
          
          {(lead.architectName || lead.architectContact || lead.architectAddress) && (
            <div className="lead-card-architect">
              <p className="lead-card-architect-label">Architect Details</p>
              {lead.architectName && (
                <div className="lead-card-info">Name: <span>{lead.architectName}</span></div>
              )}
              {lead.architectContact && (
                <div className="lead-card-info">Contact: <span>{lead.architectContact}</span></div>
              )}
              {lead.architectAddress && (
                <div className="lead-card-info">Address: <span>{lead.architectAddress}</span></div>
              )}
            </div>
          )}
          
          {(lead.expectedTimelineStart || lead.expectedTimelineEnd) && (
            <div className="lead-card-info" style={{ marginTop: "8px", fontWeight: "600" }}>
              Timeline: <span>
                {lead.expectedTimelineStart ? new Date(lead.expectedTimelineStart).toLocaleDateString() : "—"} to {lead.expectedTimelineEnd ? new Date(lead.expectedTimelineEnd).toLocaleDateString() : "—"}
              </span>
            </div>
          )}

          <div className="lead-card-notes">
            <p className="lead-card-notes-label">Priority</p>
            <div style={{ display: "flex", gap: "6px", marginTop: "4px" }}>
              {["none", "low", "med", "high"].map((p) => (
                <button
                  key={p}
                  onClick={(e) => {
                    e.stopPropagation();
                    setPriority(p);
                    handleUpdateField("priority", p);
                  }}
                  className={`lead-card-priority-btn priority-${p} ${priority === p ? 'active' : 'inactive'}`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="lead-card-notes">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
              <p className="lead-card-notes-label" style={{ margin: 0 }}>Notes</p>
              {notesStatus && (
                <span style={{ fontSize: '10px', color: notesStatus === 'Error!' ? '#dc2626' : '#217346', fontWeight: 600 }}>
                  {notesStatus}
                </span>
              )}
            </div>
            <textarea
              className="lead-card-notes-input"
              value={notes}
              onChange={(e) => {
                setNotes(e.target.value);
                if (notesStatus === "Saved ✓") setNotesStatus("");
              }}
              placeholder="Add notes..."
              rows={2}
            />
            {notes !== lastSavedNotes && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleUpdateField("notes", notes);
                    setLastSavedNotes(notes);
                  }}
                  className="lead-card-save-notes-btn"
                >
                  Save Notes
                </button>
              </div>
            )}
          </div>
          
          {(lead.Requirements && lead.Requirements.length > 0) && (
            <div className="lead-card-tags">
              {lead.Requirements.map((req, idx) => (
                <span key={idx} className="lead-card-tag req">{req}</span>
              ))}
            </div>
          )}
          
          {(lead.category && lead.category.length > 0) && (
            <div className="lead-card-tags">
              {lead.category.map((cat, idx) => (
                <span key={idx} className="lead-card-tag cat">{cat}</span>
              ))}
            </div>
          )}

          <div className="lead-card-visible">
            <p className="lead-card-visible-label">Visible to</p>
            <div className="lead-card-tags">
              {lead.assignedRoles && lead.assignedRoles.length > 0 ? (
                lead.assignedRoles.map((role, idx) => (
                  <span key={idx} className="lead-card-tag role">{role}</span>
                ))
              ) : (
                <span className="lead-card-tag role">designer · site supervisor</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="lead-card-footer">
        <button
          onClick={(e) => { e.stopPropagation(); openDetails(); }}
          className="lead-card-update-btn"
          aria-label={`Update lead ${lead.name}`}
        >
          Update
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete && onDelete(lead); }}
          className="lead-card-delete-btn"
          aria-label={`Delete lead ${lead.name}`}
        >
          Delete
        </button>
      </div>
    </motion.article>
    </>
  );
}