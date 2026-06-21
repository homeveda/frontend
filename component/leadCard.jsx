"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function LeadCard({ lead, onDelete }) {
  const router = useRouter();

  const openDetails = () => {
    const id = encodeURIComponent(lead.id || lead._id || lead.id);
    router.push(`/admin/initiallead/updatelead?id=${id}`);
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
      .lead-card-notes-text{font-size:12px;color:#e07b63;margin:0;line-height:1.45;background:rgba(224,123,99,0.08);border-radius:8px;padding:8px 10px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
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
      className="lead-card"
    >
      <div className="lead-card-content" onClick={openDetails}>
        <div>
          <h3 className="lead-card-title">{lead.name}</h3>
          <p className="lead-card-address">{lead.address}</p>
          <div className="lead-card-contact">Contact: <span>{lead.contactNumber}</span></div>
          
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

          {lead.notes && (
            <div className="lead-card-notes">
              <p className="lead-card-notes-label">Notes</p>
              <p className="lead-card-notes-text">{lead.notes}</p>
            </div>
          )}
          
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