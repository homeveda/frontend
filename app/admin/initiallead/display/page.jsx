"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import LeadCard from "../../../../component/leadCard";
import ConfirmationDialogueBox from "../../../../component/confirmationDialogueBox";
import { motion, AnimatePresence } from "framer-motion";

export default function LeadsDisplayPage() {
  const router = useRouter();
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  const adminToken = typeof window !== "undefined" ? localStorage.getItem("adminToken") : null;

  const leadStatusOptions = ["All", "New", "Hot", "Closed", "Follow Up"];
  const architectStatusOptions = ["All", "Account Created", "Account Not Created"];

  const [leadStatus, setLeadStatus] = useState("All");
  const [architectStatus, setArchitectStatus] = useState("All");
  const [query, setQuery] = useState("");
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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

  // Filter leads by status and search
  const filtered = leads.filter((lead) => {
    const matchLeadStatus = leadStatus === "All" || lead.leadStatus === leadStatus;
    const matchArchStatus = architectStatus === "All" || lead.architectStatus === architectStatus;
    const matchQuery = query === "" || lead.name.toLowerCase().includes(query.toLowerCase());
    return matchLeadStatus && matchArchStatus && matchQuery;
  });

  return (
    <div className="p-6" style={{ backgroundColor: "#f7f4f1", minHeight: "100vh", fontFamily: "'Space Grotesk', sans-serif" }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold" style={{ color: "#111111", letterSpacing: "-0.02em" }}>
            All Leads
          </h2>
          <p className="text-sm mt-1" style={{ color: "#8f8f8f" }}>
            Manage and view all leads
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => router.push("/admin/initiallead/addlead")}
            className="text-white px-4 py-2 rounded-[10px] font-semibold transition"
            style={{ backgroundColor: "#e07b63" }}
            onMouseEnter={(e) => (e.target.style.backgroundColor = "#d56a52")}
            onMouseLeave={(e) => (e.target.style.backgroundColor = "#e07b63")}
          >
            + Add Lead
          </button>
          <button
            onClick={fetchLeads}
            className="text-white px-4 py-2 rounded-[10px] font-semibold transition"
            style={{ backgroundColor: "#e07b63" }}
            onMouseEnter={(e) => (e.target.style.backgroundColor = "#d56a52")}
            onMouseLeave={(e) => (e.target.style.backgroundColor = "#e07b63")}
          >
            Refresh
          </button>
        </div>
      </div>

      <div className="p-4 rounded-[14px] mb-6" style={{ backgroundColor: "#ffffff", boxShadow: "0 10px 30px rgba(16,16,16,0.08)" }}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="text-xs font-medium" style={{ color: "#8f8f8f" }}>
              Lead Status
            </label>
            <select
              value={leadStatus}
              onChange={(e) => setLeadStatus(e.target.value)}
              className="mt-2 block w-full rounded-[10px] px-3 py-2 text-sm focus:outline-none"
              style={{ border: "1px solid #e9e6e3", backgroundColor: "#fafafa" }}
            >
              {leadStatusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-medium" style={{ color: "#8f8f8f" }}>
              Architect Status
            </label>
            <select
              value={architectStatus}
              onChange={(e) => setArchitectStatus(e.target.value)}
              className="mt-2 block w-full rounded-[10px] px-3 py-2 text-sm focus:outline-none"
              style={{ border: "1px solid #e9e6e3", backgroundColor: "#fafafa" }}
            >
              {architectStatusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="text-xs font-medium" style={{ color: "#8f8f8f" }}>
              Search by Name
            </label>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name..."
              className="mt-2 block w-full rounded-[10px] px-3 py-2 text-sm focus:outline-none"
              style={{ border: "1px solid #e9e6e3", backgroundColor: "#fafafa" }}
            />
          </div>
        </div>
      </div>

      {loading && <div className="text-sm" style={{ color: "#8f8f8f" }}>Loading...</div>}
      {error && <div className="text-sm" style={{ color: "#e07b63" }}>{error}</div>}

      <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
