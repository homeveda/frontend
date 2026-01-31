"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import ConfirmationDialogueBox from "./confirmationDialogueBox";
import Popup from "./popup";
import ProjectTimeline from "./projectTimeline";
import { useRouter } from "next/navigation";
import axios from "axios";
export default function ProjectCard({ project }) {
  const p = project || {};
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [popupColor, setPopupColor] = useState("green");

  const triggerPopup = (message, color = "green") => {
    setPopupMessage(message);
    setPopupColor(color);
    setShowPopup(true);
  };

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  const handleDelete = async () => {
    if (!backendUrl) {
      triggerPopup("Backend URL not configured", "red");
      return;
    }
    setIsDeleting(true);
    try {
      const adminToken = typeof window !== "undefined" ? localStorage.getItem("adminToken") : null;
      await axios.delete(`${backendUrl}/project/${p.id || p._id}`, {
        headers: { Authorization: adminToken ? `Bearer ${adminToken}` : undefined },
      });
      setConfirmOpen(false);
      triggerPopup("Project deleted successfully", "green");
      setTimeout(() => window.location.reload(), 900);
    } catch (err) {
      console.error("Delete project failed:", err);
      triggerPopup(err?.response?.data?.message || err.message || "Failed to delete project", "red");
    } finally {
      setIsDeleting(false);
    }
  };
  
  return (
    <>
    <style>{`
      .project-card{background:#ffffff;border-radius:10px;box-shadow:0 10px 30px rgba(16,16,16,0.08);border:1px solid #e9e6e3;overflow:hidden;display:flex;flex-direction:column}
      .project-card-content{padding:16px;font-family:"Space Grotesk",sans-serif}
      .project-card-title{font-size:18px;font-weight:600;color:#111111;margin:0}
      .project-card-subtitle{font-size:14px;margin-top:8px;color:#111111}
      .project-card-subtitle span{color:#8f8f8f}
      .project-card-info{font-size:13px;margin-top:8px;color:#111111}
      .project-card-info span{color:#e07b63}
      .project-card-section{margin-top:12px;color:#8f8f8f}
      .project-card-section strong{color:#111111}
      .project-card-section div{font-size:12px;margin-top:4px}
      .project-card-images{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:8px}
      .project-card-image{width:100%;height:80px;border-radius:6px;background:#f5f5f5;overflow:hidden;display:flex;align-items:center;justify-content:center}
      .project-card-image img{object-contain;max-height:100%;max-width:100%}
      .project-card-footer{display:flex;gap:8px;justify-content:flex-end;padding:12px 16px;border-top:1px solid #e9e6e3}
      .project-card-btn{padding:6px 12px;border-radius:8px;border:none;cursor:pointer;font-weight:600;font-size:12px;transition:all 0.2s;flex:1}
      .project-card-btn-edit{background:#e07b63;color:white}
      .project-card-btn-edit:hover{background:#d56a52}
      .project-card-btn-delete{background:#dc2626;color:white}
      .project-card-btn-delete:hover{background:#b91c1c}

      @media (max-width:768px){
        .project-card-content{padding:12px}
        .project-card-title{font-size:16px}
        .project-card-subtitle{font-size:13px;margin-top:6px}
        .project-card-info{font-size:12px;margin-top:6px}
        .project-card-section{margin-top:10px}
        .project-card-section div{font-size:11px;margin-top:3px}
        .project-card-images{grid-template-columns:repeat(3,1fr);gap:6px;margin-top:6px}
        .project-card-image{height:70px}
        .project-card-footer{padding:10px 12px;gap:6px}
        .project-card-btn{padding:5px 10px;font-size:11px}
      }

      @media (max-width:480px){
        .project-card-content{padding:10px}
        .project-card-title{font-size:14px}
        .project-card-subtitle{font-size:12px;margin-top:4px}
        .project-card-info{font-size:11px;margin-top:4px}
        .project-card-section{margin-top:8px}
        .project-card-section div{font-size:10px;margin-top:2px}
        .project-card-images{grid-template-columns:repeat(2,1fr);gap:4px;margin-top:4px}
        .project-card-image{height:60px}
        .project-card-footer{padding:8px 10px;gap:4px}
        .project-card-btn{padding:4px 8px;font-size:10px}
      }
    `}</style>
    <motion.article
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      className="project-card"
    >
      <div className="project-card-content">
        <div>
          <div>
            <div>
              <h3 className="project-card-title">
                Projects Head - {p.projectHead}{" "}
              </h3>
              {p.architectName && (
                <p className="project-card-subtitle">
                  Architect Name -{" "}
                  <span> {p.architectName}</span>
                </p>
              )}
              {p.category && (
                <p className="project-card-info">
                  Category -{" "}
                  <span> {p.category}</span>
                </p>
              )}

              {/* Project Timeline */}
              {p.kitchen && (
                <div className="project-card-section">
                  <div>
                    <strong>Kitchen:</strong>
                  </div>
                  <div>
                    Type:{" "}
                    <span>
                      {p.kitchen.kitchenType}
                    </span>
                  </div>
                  <div>
                    Theme:{" "}
                    <span>{p.kitchen.theme}</span>
                  </div>

                  
                {p.status && <ProjectTimeline status={p.status} />}

                  {Array.isArray(p.kitchen.layoutPlan) &&
                    p.kitchen.layoutPlan.length > 0 && (
                      <div className="project-card-images">
                        {p.kitchen.layoutPlan.map((src) => (
                          <div
                            key={src||Math.random()}
                            className="project-card-image"
                          >
                            <img
                              src={src||null}
                              alt="layout"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                </div>
              )}

              {p.wardrobe && (
                <div className="project-card-section">
                  <div>
                    <strong>Wardrobe:</strong>
                  </div>
                  <div>
                    Types:{" "}
                    <span>
                      {" "}
                      {(p.wardrobe.type || []).join(", ")}
                    </span>
                  </div>
                   {p.status && <ProjectTimeline status={p.status} />}
                  {Array.isArray(p.wardrobe.measureents) &&
                    p.wardrobe.measureents.length > 0 && (
                      <div className="project-card-images">
                        {p.wardrobe.measureents.map((src) => (
                          <div
                            key={src}
                            className="project-card-image"
                            onClick={() => window.open(src, "_blank")}
                          >
                            <img
                              src={src}
                              alt="measurement"
                              className="object-contain max-h-full max-w-full"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="project-card-footer" style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:'8px',padding:'12px 16px',borderTop:'1px solid #e9e6e3'}}>
          <button
            className="project-card-btn project-card-btn-edit"
            onClick={() =>
              router.push(`/admin/projects/${p.id || p._id}/quotation`)
            }
          >
            Quotation
          </button>
          <button
            className="project-card-btn project-card-btn-edit"
            onClick={() =>
              router.push(`/admin/projects/${p.id || p._id}/inspection`)
            }
          >
            Inspection
          </button>
          <button
            className="project-card-btn project-card-btn-edit"
            onClick={() =>
              router.push(`/admin/projects/${p.id || p._id}/designs`)
            }
          >
            Designs
          </button>
          <button
            className="project-card-btn project-card-btn-edit"
            onClick={() =>
              router.push(`/admin/projects/${p.id || p._id}/materials`)
            }
          >
            Materials
          </button>
          <button
            className="project-card-btn project-card-btn-edit"
            onClick={() => {
              router.push(`/admin/projects/${p.id || p._id}/update`)  
            }}
          >
            Update Project
          </button>
          <button
            className="project-card-btn project-card-btn-delete"
            onClick={() => setConfirmOpen(true)}
          >
            Delete Project
          </button>
        </div>
        <ConfirmationDialogueBox open={confirmOpen} title="Delete project?" description="This will permanently delete the project and its data. Continue?" onConfirm={handleDelete} onCancel={() => setConfirmOpen(false)} confirmText={isDeleting ? "Deleting..." : "Delete"} />
        {showPopup && (
          <Popup message={popupMessage} color={popupColor} onClose={() => setShowPopup(false)} />
        )}
    </motion.article>
    </>
  );
}
