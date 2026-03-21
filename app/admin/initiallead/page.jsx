"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import LeadCard from "../../../component/leadCard";
import LoadingSpinner from "../../../component/loadingSpinner";
import ConfirmationDialogueBox from "../../../component/confirmationDialogueBox";
import { motion, AnimatePresence } from "framer-motion";

export default function LeadsDisplayPage() {
  const router = useRouter();
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  const adminToken = typeof window !== "undefined" ? localStorage.getItem("adminToken") : null;

  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [requirementsFilter, setRequirementsFilter] = useState("");
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const CATEGORY_OPTIONS = ["Builder( 50k to 2lac )", "Economy(2.5 lac to 5lac)", "Standard( 5 lac to 10 lac)", "VedaX(10 lac to 20lac)"];
  
  // Extract all unique requirements from leads
  const getUniqueRequirements = () => {
    const requirementsSet = new Set();
    leads.forEach((lead) => {
      if (Array.isArray(lead.Requirements)) {
        lead.Requirements.forEach((req) => {
          requirementsSet.add(req);
        });
      }
    });
    return Array.from(requirementsSet).sort();
  };

  const fetchLeads = async () => {
    if (!backendUrl) return setError("Backend URL not configured");
    try {
      setLoading(true);
      setError(null);

      const res = await axios.get(`${backendUrl}/initiallead`, {
        headers: { Authorization: adminToken ? `Bearer ${adminToken}` : undefined },
      });
      setLeads(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Failed to load leads");
      setLeads([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // state for confirmation dialog
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [leadToDelete, setLeadToDelete] = useState(null);

  // open confirmation dialog
  const requestDelete = (lead) => {
    setLeadToDelete(lead);
    setConfirmOpen(true);
  };

  // perform actual delete when confirmed
  const performDelete = async () => {
    if (!leadToDelete) return;
    try {
      await axios.delete(`${backendUrl}/initiallead/${leadToDelete.id}`, {
        headers: { Authorization: adminToken ? `Bearer ${adminToken}` : undefined },
      });
      setLeads((prev) => prev.filter((l) => l.id !== leadToDelete.id));
    } catch (err) {
      alert(err?.response?.data?.message || err.message || "Delete failed");
    } finally {
      setConfirmOpen(false);
      setLeadToDelete(null);
    }
  };

  const cancelDelete = () => {
    setConfirmOpen(false);
    setLeadToDelete(null);
  };

  // Filter leads by search, category, and requirements
  const filtered = leads.filter((lead) => {
    const matchQuery = query === "" || lead.name.toLowerCase().includes(query.toLowerCase());
    const matchCategory = categoryFilter === "" || (Array.isArray(lead.category) && lead.category.includes(categoryFilter));
    const matchRequirements = requirementsFilter === "" || (Array.isArray(lead.Requirements) && lead.Requirements.includes(requirementsFilter));
    return matchQuery && matchCategory && matchRequirements;
  });

  return (
    <div className="p-6" style={{ backgroundColor: "#f7f4f1", minHeight: "100vh", fontFamily: "'Space Grotesk', sans-serif" }}>
      <style>{`
        .leads-header{display:flex;items-align:center;justify-content:space-between;margin-bottom:24px;gap:16px;flex-wrap:wrap}
        .leads-header > div:first-child{flex:1;min-width:200px}
        .leads-header h2{font-size:24px;font-weight:600;color:#111111;letter-spacing:-0.02em;margin:0}
        .leads-header p{font-size:14px;color:#8f8f8f;margin:8px 0 0 0}
        .leads-header-actions{display:flex;gap:12px;flex-wrap:wrap}
        .leads-button{color:white;padding:8px 16px;border-radius:10px;font-weight:600;transition:all 0.2s;border:none;cursor:pointer;font-size:14px;background:#e07b63}
        .leads-button:hover{background:#d56a52}
        .leads-filters{padding:16px;border-radius:14px;background:#ffffff;box-shadow:0 10px 30px rgba(16,16,16,0.08);margin-bottom:24px}
        .filters-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:16px}
        .filter-group{display:flex;flex-direction:column}
        .filter-group label{font-size:12px;font-weight:600;color:#8f8f8f;margin-bottom:8px}
        .filter-group select,.filter-group input{padding:10px 12px;border-radius:10px;border:1px solid #e9e6e3;background:#fafafa;font-size:13px;outline:none;font-family:inherit}
        .filter-group select:focus,.filter-group input:focus{border-color:#e07b63;background:rgba(224,123,99,0.02)}
        .leads-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:16px}

        @media (max-width:1024px){
          .leads-header{margin-bottom:20px}
          .leads-header h2{font-size:20px}
          .leads-button{padding:6px 12px;font-size:13px}
          .filters-grid{grid-template-columns:1fr 1fr;gap:12px}
          .leads-grid{grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:12px}
        }

        @media (max-width:768px){
          .p-6{padding:12px !important}
          .leads-header{flex-direction:column;margin-bottom:16px}
          .leads-header > div:first-child{width:100%}
          .leads-header-actions{width:100%}
          .leads-button{flex:1;padding:8px 12px;font-size:12px}
          .leads-filters{padding:12px;margin-bottom:16px}
          .filters-grid{grid-template-columns:1fr;gap:8px}
          .filter-group label{font-size:11px}
          .filter-group select,.filter-group input{padding:8px 10px;font-size:12px}
          .leads-grid{grid-template-columns:1fr;gap:8px}
          .leads-header h2{font-size:18px}
          .leads-header p{font-size:12px}
        }

        @media (max-width:480px){
          .p-6{padding:8px !important}
          .leads-header{gap:8px;margin-bottom:12px}
          .leads-header h2{font-size:16px}
          .leads-header p{font-size:11px;margin-top:4px}
          .leads-header-actions{width:100%;gap:6px}
          .leads-button{padding:6px 10px;font-size:11px;border-radius:8px;flex:1}
          .leads-filters{padding:8px;margin-bottom:12px;border-radius:10px}
          .filters-grid{grid-template-columns:1fr;gap:6px}
          .filter-group label{font-size:10px;margin-bottom:4px}
          .filter-group select,.filter-group input{padding:6px 8px;font-size:11px;border-radius:6px}
          .leads-grid{gap:6px}
        }
      `}</style>
      <div className="leads-header">
        <div>
          <h2 className="text-2xl font-semibold" style={{ color: "#111111", letterSpacing: "-0.02em" }}>
            All Leads
          </h2>
          <p className="text-sm mt-1" style={{ color: "#8f8f8f" }}>
            Manage and view all leads
          </p>
        </div>
        <div className="leads-header-actions">
          <button
            onClick={() => router.push("/admin/initiallead/addlead")}
            className="leads-button"
          >
            + Add Lead
          </button>
          <button
            onClick={fetchLeads}
            className="leads-button"
          >
            Refresh
          </button>
        </div>
      </div>

      <div className="leads-filters">
        <div className="filters-grid">
          <div className="filter-group">
            <label>
              Search by Name
            </label>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name..."
            />
          </div>
          <div className="filter-group">
            <label>
              Filter by Category
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="">All Categories</option>
              {CATEGORY_OPTIONS.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <label>
              Filter by Requirements
            </label>
            <select
              value={requirementsFilter}
              onChange={(e) => setRequirementsFilter(e.target.value)}
            >
              <option value="">All Requirements</option>
              {getUniqueRequirements().map((req) => (
                <option key={req} value={req}>
                  {req}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {loading && <LoadingSpinner />}
      {error && <div className="text-sm" style={{ color: "#e07b63" }}>{error}</div>}

      <motion.div layout className="leads-grid">
        <AnimatePresence>
          {filtered.map((lead) => (
            <motion.div key={lead.id} layout>
              <LeadCard lead={lead} onDelete={requestDelete} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {!loading && filtered.length === 0 && (
        <div className="mt-6" style={{ color: "#8f8f8f" }}>
          No leads found.
        </div>
      )}

      <ConfirmationDialogueBox
        open={confirmOpen}
        title={leadToDelete ? `Delete ${leadToDelete.name}?` : undefined}
        description={leadToDelete ? `Are you sure you want to delete "${leadToDelete.name}"? This action cannot be undone.` : undefined}
        confirmText="Yes"
        cancelText="No"
        onConfirm={performDelete}
        onCancel={cancelDelete}
      />
    </div>
  );
}
