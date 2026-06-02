"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import LoadingSpinner from "../../../component/loadingSpinner";
import ProjectTimeline from "../../../component/projectTimeline";

const STATUS_COLORS = {
  "LEAD": "#8b5cf6", "DESIGN": "#3b82f6", "QUOTATION": "#f59e0b",
  "10% TOKEN": "#10b981", "FINAL MEASUREMENT": "#06b6d4", "FINAL DRAWINGS": "#6366f1",
  "50% PAYMENT": "#f97316", "FACTORY ORDER": "#ec4899", "SITE READY CHECK": "#14b8a6",
  "FACTORY FULL PAYMENT": "#8b5cf6", "DISPATCH": "#22c55e", "90% CLIENT PAYMENT": "#eab308",
  "INSTALLATION": "#ef4444", "QUALITY CHECK": "#a855f7", "HANDOVER": "#10b981",
  "10% FINAL PAYMENT": "#f97316", "AFTER SALES": "#64748b",
};

function getInitials(name = "") {
  return name.trim().split(" ").slice(0, 2).map((w) => w[0]?.toUpperCase()).join("") || "?";
}

export default function ActiveProjectsPage() {
  const router = useRouter();
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  const [projects, setProjects] = useState([]);
  const [usersMap, setUsersMap] = useState({}); // email → user object
  const [inspectionsMap, setInspectionsMap] = useState({}); // projectId → inspections
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        setError(null);
        const adminToken = typeof window !== "undefined" ? localStorage.getItem("adminToken") : null;
        const adminRole = typeof window !== "undefined" ? localStorage.getItem("adminRole") : '';
        const headers = { Authorization: adminToken ? `Bearer ${adminToken}` : undefined };

        const [projectRes, userRes] = await Promise.all([
          axios.get(`${backendUrl}/project/active`, { headers }),
          axios.get(`${backendUrl}/user/all`, { headers }),
        ]);

        const projectList = projectRes.data?.projects || [];
        const userList = userRes.data?.users || [];
        const SUPER_ADMIN_ROLE = 'super admin';

        // Filter users based on admin role
        let visibleUsers = userList;
        if (adminRole !== SUPER_ADMIN_ROLE) {
          // Only show users assigned to this admin's role or with empty assignedRoles
          visibleUsers = userList.filter(u => {
            const assignedRoles = u.assignedRoles || [];
            return assignedRoles.includes(adminRole) || assignedRoles.length === 0;
          });
        }

        // Build email → user map from visible users only
        const map = {};
        visibleUsers.forEach((u) => { if (u.email) map[u.email] = u; });

        // Filter projects to only show those from visible users
        const visibleEmails = new Set(visibleUsers.map(u => u.email));
        const filteredProjectList = projectList.filter(p => visibleEmails.has(p.userEmail));

        // Fetch inspections for all filtered projects
        const inspMap = {};
        await Promise.all(
          filteredProjectList.map((proj) =>
            axios
              .get(`${backendUrl}/inspections/${proj.id || proj._id}`, { headers })
              .then((res) => {
                inspMap[proj.id || proj._id] = res.data?.inspections || [];
              })
              .catch(() => {
                inspMap[proj.id || proj._id] = [];
              })
          )
        );
        setProjects(filteredProjectList);
        setUsersMap(map);
        setInspectionsMap(inspMap);
      } catch (err) {
        setError(err?.response?.data?.message || err.message || "Failed to load");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [backendUrl]);

  const filtered = projects.filter((p) => {
    const q = search.toLowerCase();
    const user = usersMap[p.userEmail] || {};
    return (
      (p.userEmail || "").toLowerCase().includes(q) ||
      (user.name || "").toLowerCase().includes(q) ||
      (p.projectHead || "").toLowerCase().includes(q) ||
      (p.status || "").toLowerCase().includes(q) ||
      (p.category || "").toLowerCase().includes(q)
    );
  });

  const toggleActiveStatus = async (projectId, currentState) => {
    try {
      const adminToken = typeof window !== "undefined" ? localStorage.getItem("adminToken") : null;
      await axios.patch(
        `${backendUrl}/project/${projectId}/active`,
        { isActive: !currentState },
        { headers: { Authorization: adminToken ? `Bearer ${adminToken}` : undefined } }
      );
      // Remove from map if inactive, or we can just filter it out of setProjects.
      // Since this is "Active Projects", turning it inactive should hide it.
      setProjects((prev) => prev.filter(p => (p.id || p._id) !== projectId));
    } catch (err) {
      console.error(err);
      alert("Failed to update status");
    }
  };

  const handleDelete = async (projectId) => {
    if (window.confirm("This will permanently delete the project and its data. Continue?")) {
      setDeletingId(projectId);
      try {
        const adminToken = typeof window !== "undefined" ? localStorage.getItem("adminToken") : null;
        await axios.delete(`${backendUrl}/project/${projectId}`, {
          headers: { Authorization: adminToken ? `Bearer ${adminToken}` : undefined },
        });
        setProjects((prev) => prev.filter(p => (p.id || p._id) !== projectId));
      } catch (err) {
        console.error("Delete project failed:", err);
        alert(err?.response?.data?.message || err.message || "Failed to delete project");
      } finally {
        setDeletingId(null);
      }
    }
  };

  return (
    <div style={{ backgroundColor: "#f7f4f1", minHeight: "100vh", fontFamily: "'Space Grotesk', sans-serif" }} className="p-4 sm:p-6">
      <style>{`
        .ap-card { background: #fff; border-radius: 16px; box-shadow: 0 8px 28px rgba(16,16,16,0.07); border: 1px solid #efe7e2; overflow: hidden; transition: transform 0.18s, box-shadow 0.18s; }
        .ap-card:hover { transform: translateY(-2px); box-shadow: 0 14px 36px rgba(16,16,16,0.11); }
        .ap-badge { display: inline-flex; align-items: center; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; letter-spacing: 0.03em; }
        .ap-row { display: flex; align-items: flex-start; gap: 8px; padding: 6px 0; border-bottom: 1px solid #f3f0ed; }
        .ap-row:last-child { border-bottom: none; }
        .ap-label { font-size: 10px; font-weight: 700; color: #8f8f8f; text-transform: uppercase; letter-spacing: 0.04em; min-width: 80px; padding-top: 2px; }
        .ap-val { font-size: 13px; color: #111; font-weight: 500; word-break: break-all; }
        .ap-avatar { width: 42px; height: 42px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 16px; font-weight: 700; color: #fff; flex-shrink: 0; }
        .ap-section-label { font-size: 10px; font-weight: 700; color: #8f8f8f; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 6px; }
        .ap-divider { height: 1px; background: #f3f0ed; margin: 12px 0; }
        .ap-btn { padding: 6px 12px; border-radius: 8px; border: none; cursor: pointer; font-weight: 600; font-size: 12px; transition: all 0.2s; text-align: center; }
        .ap-btn-edit { background: #e07b63; color: white; }
        .ap-btn-edit:hover { background: #d56a52; }
        .ap-btn-delete { background: #dc2626; color: white; }
        .ap-btn-delete:hover { background: #b91c1c; }
        @media(max-width:640px) { .ap-label { min-width: 66px; } }
      `}</style>

      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: "#22c55e", display: "inline-block", boxShadow: "0 0 0 3px rgba(34,197,94,0.2)" }} />
              <h2 className="text-xl sm:text-2xl font-semibold" style={{ color: "#111", letterSpacing: "-0.02em" }}>
                Active Projects
              </h2>
            </div>
            <p className="text-sm" style={{ color: "#8f8f8f" }}>
              {loading ? "Loading…" : `${filtered.length} active project${filtered.length !== 1 ? "s" : ""}`}
            </p>
          </div>
          <input
            type="text"
            placeholder="Search by name, email, status…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-72 rounded-[10px] px-3 py-2 text-sm outline-none"
            style={{ border: "1px solid #e9e6e3", backgroundColor: "#fff", fontFamily: "inherit" }}
          />
        </div>

        {loading && <LoadingSpinner />}
        {error && <p className="text-sm" style={{ color: "#e07b63" }}>{error}</p>}

        {/* Cards */}
        <div className="flex flex-col gap-4">
          <AnimatePresence>
            {filtered.map((project, i) => {
              const user = usersMap[project.userEmail] || {};
              const statusColor = STATUS_COLORS[project.status] || "#8f8f8f";
              const type = project.kitchen ? "Kitchen" : project.wardrobe ? "Wardrobe" : "—";
              const projectInspections = inspectionsMap[project.id || project._id] || [];
              const hasInspections = projectInspections.length > 0;
              const lastInspection = hasInspections ? projectInspections[projectInspections.length - 1] : null;
              const inspectionReady = lastInspection?.readyForNextPhase || false;

              return (
                <motion.div
                  key={project.id || project._id}
                  className="ap-card"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.2, delay: i * 0.04 }}
                >
                  {/* Top accent bar with status color */}
                  <div style={{ height: 4, background: statusColor }} />

                  <div className="p-4 sm:p-5">
                    <div className="flex flex-col sm:flex-row gap-5">

                      {/* ── Customer Section ── */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                          <p className="ap-section-label" style={{ margin: 0 }}>👤 Customer</p>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleActiveStatus(project.id || project._id, project.isActive !== false);
                            }}
                            style={{
                              background: '#dcfce7',
                              color: '#16a34a',
                              border: '1px solid #bbf7d0',
                              fontWeight: 700,
                              fontSize: '11px',
                              padding: '4px 10px',
                              borderRadius: '20px',
                              cursor: 'pointer',
                              boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                            }}
                            title="Click to deactivate"
                          >
                            Active
                          </button>
                        </div>
                        <div className="flex items-center gap-3 mb-3">
                          <div
                            className="ap-avatar"
                            style={{ background: `linear-gradient(135deg, #e07b63, #d56a52)` }}
                          >
                            {getInitials(user.name || project.userEmail)}
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <p style={{ fontWeight: 700, fontSize: 15, color: "#111", margin: 0 }}>
                              {user.name || "—"}
                            </p>
                            <p style={{ fontSize: 12, color: "#8f8f8f", margin: 0, wordBreak: "break-all" }}>
                              {project.userEmail}
                            </p>
                          </div>
                        </div>

                        <div>
                          <div className="ap-row">
                            <span className="ap-label">📱 Phone</span>
                            <span className="ap-val">{user.phone || user.contactNumber || "—"}</span>
                          </div>
                          <div className="ap-row">
                            <span className="ap-label">📍 Address</span>
                            <span className="ap-val">{user.address || "—"}</span>
                          </div>

                          {/* Inspection Statuses */}
                          {lastInspection && (
                            <>
                              <div style={{ borderTop: "1px solid #f3f0ed", paddingTop: 8, marginTop: 8 }}>
                                <p style={{ fontSize: 10, fontWeight: 700, color: "#8f8f8f", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 6 }}>🔍 Inspection Status</p>
                                
                                {lastInspection.plumbingStatus && (
                                  <div className="ap-row">
                                    <span className="ap-label">Plumbing</span>
                                    <span className="ap-val" style={{ color: lastInspection.plumbingStatus === "Completed" ? "#16a34a" : lastInspection.plumbingStatus === "In Progress" ? "#2563eb" : "#ea580c" }}>
                                      {lastInspection.plumbingStatus}
                                    </span>
                                  </div>
                                )}

                                {lastInspection.electricityStatus && (
                                  <div className="ap-row">
                                    <span className="ap-label">Electricity</span>
                                    <span className="ap-val" style={{ color: lastInspection.electricityStatus === "Completed" ? "#16a34a" : lastInspection.electricityStatus === "In Progress" ? "#2563eb" : "#ea580c" }}>
                                      {lastInspection.electricityStatus}
                                    </span>
                                  </div>
                                )}

                                {lastInspection.chimneyPointStatus && (
                                  <div className="ap-row">
                                    <span className="ap-label">Chimney</span>
                                    <span className="ap-val" style={{ color: lastInspection.chimneyPointStatus === "Completed" ? "#16a34a" : lastInspection.chimneyPointStatus === "In Progress" ? "#2563eb" : "#ea580c" }}>
                                      {lastInspection.chimneyPointStatus}
                                    </span>
                                  </div>
                                )}

                                {lastInspection.falseCeilingStatus && (
                                  <div className="ap-row">
                                    <span className="ap-label">Ceiling</span>
                                    <span className="ap-val" style={{ color: lastInspection.falseCeilingStatus === "Completed" ? "#16a34a" : lastInspection.falseCeilingStatus === "In Progress" ? "#2563eb" : "#ea580c" }}>
                                      {lastInspection.falseCeilingStatus}
                                    </span>
                                  </div>
                                )}

                                {lastInspection.flooringStatus && (
                                  <div className="ap-row">
                                    <span className="ap-label">Flooring</span>
                                    <span className="ap-val" style={{ color: lastInspection.flooringStatus === "Completed" ? "#16a34a" : lastInspection.flooringStatus === "In Progress" ? "#2563eb" : "#ea580c" }}>
                                      {lastInspection.flooringStatus}
                                    </span>
                                  </div>
                                )}

                                <div className="ap-row" style={{ borderTop: "1px solid #f3f0ed", paddingTop: 8, marginTop: 8 }}>
                                  <span className="ap-label">Ready</span>
                                  <span className="ap-val">
                                    {lastInspection.readyForNextPhase ? (
                                      <span style={{ color: "#16a34a", fontWeight: 700 }}>✓ Yes</span>
                                    ) : (
                                      <span style={{ color: "#ea580c", fontWeight: 700 }}>✗ No</span>
                                    )}
                                  </span>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Vertical divider on desktop */}
                      <div style={{ width: 1, background: "#f3f0ed", flexShrink: 0 }} className="hidden sm:block" />

                      {/* ── Project Section ── */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p className="ap-section-label">🏗️ Project</p>

                        {project.status && <ProjectTimeline status={project.status} />}

                        <div className="flex items-center gap-2 mt-3 flex-wrap">
                          <span
                            className="ap-badge"
                            style={{ backgroundColor: "#f3f0ed", color: "#555" }}
                          >
                            {type}
                          </span>
                          {project.category && (
                            <span
                              className="ap-badge"
                              style={{ backgroundColor: "rgba(168,85,247,0.1)", color: "#7c3aed" }}
                            >
                              {project.category}
                            </span>
                          )}
                          {hasInspections && (
                            <span
                              className="ap-badge"
                              style={{
                                backgroundColor: inspectionReady ? "rgba(34,197,94,0.1)" : "rgba(59,130,246,0.1)",
                                color: inspectionReady ? "#16a34a" : "#2563eb"
                              }}
                            >
                              🔍 {projectInspections.length} {projectInspections.length === 1 ? "Inspection" : "Inspections"} {inspectionReady ? "✓" : ""}
                            </span>
                          )}
                        </div>

                        <div>
                          <div className="ap-row">
                            <span className="ap-label">🧑‍💼 Head</span>
                            <span className="ap-val">{project.projectHead || "—"}</span>
                          </div>
                          <div className="ap-row">
                            <span className="ap-label">🏛️ Architect</span>
                            <span className="ap-val">{project.architectName || "—"}</span>
                          </div>
                          {project.kitchen && (
                            <>
                              <div className="ap-row">
                                <span className="ap-label">🍳 Type</span>
                                <span className="ap-val">{project.kitchen.kitchenType || "—"}</span>
                              </div>
                              <div className="ap-row">
                                <span className="ap-label">🎨 Theme</span>
                                <span className="ap-val">{project.kitchen.theme || "—"}</span>
                              </div>
                            </>
                          )}
                          {project.wardrobe && (
                            <div className="ap-row">
                              <span className="ap-label">🚪 Wardrobe</span>
                              <span className="ap-val">{(project.wardrobe.type || []).join(", ") || "—"}</span>
                            </div>
                          )}
                          {lastInspection && lastInspection.inspectionDate && (
                            <div className="ap-row">
                              <span className="ap-label">📅 Last Inspection</span>
                              <span className="ap-val">{new Date(lastInspection.inspectionDate).toLocaleDateString("en-IN")}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="ap-divider" />
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '8px' }}>
                      <button className="ap-btn ap-btn-edit" onClick={() => router.push(`/admin/projects/${project.id || project._id}/quotation`)}>
                        Quotation
                      </button>
                      <button className="ap-btn ap-btn-edit" onClick={() => router.push(`/admin/projects/${project.id || project._id}/inspection`)}>
                        Inspection
                      </button>
                      <button className="ap-btn ap-btn-edit" onClick={() => router.push(`/admin/projects/${project.id || project._id}/designs`)}>
                        Designs
                      </button>
                      <button className="ap-btn ap-btn-edit" onClick={() => router.push(`/admin/projects/${project.id || project._id}/materials`)}>
                        Materials
                      </button>
                      <button className="ap-btn ap-btn-edit" onClick={() => router.push(`/admin/projects/${project.id || project._id}/update`)}>
                        Update Project
                      </button>
                      <button 
                        className="ap-btn ap-btn-delete" 
                        onClick={() => handleDelete(project.id || project._id)}
                        disabled={deletingId === (project.id || project._id)}
                      >
                        {deletingId === (project.id || project._id) ? "Deleting..." : "Delete Project"}
                      </button>
                    </div>

                    <div className="ap-divider" />
                    <div className="flex items-center justify-between flex-wrap gap-2">
                       <p style={{ fontSize: 11, color: "#b0b0b0", margin: 0 }}>ID: {project.id || project._id}</p>
                       <button onClick={() => router.push(`/admin/projects?userEmail=${encodeURIComponent(project.userEmail)}`)} style={{ padding: "6px 14px", borderRadius: 8, border: "none", backgroundColor: "#f3f0ed", color: "#111", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                         View All Customer's Projects →
                       </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {!loading && filtered.length === 0 && !error && (
          <div className="text-center py-16" style={{ color: "#8f8f8f" }}>
            <p style={{ fontSize: 40, marginBottom: 12 }}>📭</p>
            <p style={{ fontSize: 14 }}>{search ? "No matching projects found." : "No active projects yet."}</p>
          </div>
        )}
      </div>
    </div>
  );
}
