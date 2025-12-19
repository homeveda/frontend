"use client";
import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { motion } from "framer-motion";
import Popup from "../../../../component/popup";

export default function UpdateLeadPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  const adminToken = typeof window !== "undefined" ? localStorage.getItem("adminToken") : null;
  const leadId = searchParams.get("id") || null;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [lead, setLead] = useState(null);
  const [form, setForm] = useState({ name: "", address: "", contactNumber: "", architectStatus: "Account Not Created", leadStatus: "New" });
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [popupColor, setPopupColor] = useState("green");

  useEffect(() => {
    if (!leadId) {
      setLoading(false);
      return;
    }

    const fetchLead = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${backendUrl}/initialLead/${leadId}`, { headers: { Authorization: adminToken ? `Bearer ${adminToken}` : undefined } });
        const data = res.data;
        setLead(data);
        setForm({
          name: data.name || "",
          address: data.address || "",
          contactNumber: data.contactNumber || "",
          architectStatus: data.architectStatus || "Account Not Created",
          leadStatus: data.leadStatus || "New",
        });
      } catch (err) {
        setPopupMessage(err?.response?.data?.message || "Failed to load lead");
        setPopupColor("red");
        setShowPopup(true);
      } finally {
        setLoading(false);
      }
    };

    fetchLead();
  }, [leadId, backendUrl, adminToken]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const validate = () => {
    if (!form.name.trim()) return "Name is required";
    if (!form.address.trim()) return "Address is required";
    if (!form.contactNumber.trim()) return "Contact number is required";
    if (!/^\+?[0-9\- ]{6,20}$/.test(form.contactNumber.trim())) return "Enter a valid contact number";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) {
      setPopupMessage(err);
      setPopupColor("red");
      setShowPopup(true);
      return;
    }
    if (!leadId) {
      setPopupMessage("Lead id missing");
      setPopupColor("red");
      setShowPopup(true);
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        id: leadId,
        name: form.name.trim(),
        address: form.address.trim(),
        contactNumber: form.contactNumber.trim(),
        architectStatus: form.architectStatus,
        leadStatus: form.leadStatus,
      };
      await axios.patch(`${backendUrl}/initialLead/${leadId}`, payload, { headers: { Authorization: adminToken ? `Bearer ${adminToken}` : undefined } });

      setPopupMessage("Lead updated successfully");
      setPopupColor("green");
      setShowPopup(true);
      setTimeout(() => router.push("/admin/initiallead/display"), 1200);
    } catch (error) {
      setPopupMessage(error?.response?.data?.message || "Failed to update lead");
      setPopupColor("red");
      setShowPopup(true);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (<div className="p-6 min-h-screen" style={{ backgroundColor: '#f7f4f1', fontFamily: "'Space Grotesk', sans-serif" }}><div style={{ color: '#8f8f8f' }}>Loading...</div></div>);
  if (!lead) return (<div className="p-6 min-h-screen" style={{ backgroundColor: '#f7f4f1', fontFamily: "'Space Grotesk', sans-serif" }}><div style={{ color: '#e07b63' }}>Lead not found</div></div>);

  const architectOptions = ["Account Created", "Account Not Created"];
  const leadStatusOptions = ["New", "Hot", "Closed", "Follow Up"];

  return (
    <div className="p-6 min-h-screen" style={{ backgroundColor: '#f7f4f1', fontFamily: "'Space Grotesk', sans-serif" }}>
      {showPopup && (<Popup message={popupMessage} color={popupColor} onClose={() => setShowPopup(false)} autoClose duration={4000} />)}

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto">
        <div className="mb-6">
          <button onClick={() => router.back()} className="text-sm font-semibold mb-4" style={{ color: '#e07b63' }}>← Back</button>
          <h2 style={{ color: '#111111', letterSpacing: '-0.02em' }} className="text-2xl font-semibold">Update Lead</h2>
          <p className="text-sm mt-1" style={{ color: '#8f8f8f' }}>Edit lead details for: <span style={{ fontWeight:600 }}>{lead.name}</span></p>
        </div>

        <form onSubmit={handleSubmit}>
          <motion.div className="rounded-[14px] p-6 mb-6" style={{ backgroundColor: '#ffffff', boxShadow: '0 10px 30px rgba(16,16,16,0.08)' }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-xs font-medium" style={{ color: '#8f8f8f' }}>Name</label>
                <input name="name" value={form.name} onChange={handleChange} className="mt-2 block w-full rounded-[10px] px-3 py-2 text-sm" style={{ border: '1px solid #e9e6e3', backgroundColor: '#fafafa' }} />
              </div>

              <div>
                <label className="text-xs font-medium" style={{ color: '#8f8f8f' }}>Contact Number</label>
                <input name="contactNumber" value={form.contactNumber} onChange={handleChange} className="mt-2 block w-full rounded-[10px] px-3 py-2 text-sm" style={{ border: '1px solid #e9e6e3', backgroundColor: '#fafafa' }} />
              </div>
            </div>

            <div className="mb-4">
              <label className="text-xs font-medium" style={{ color: '#8f8f8f' }}>Address</label>
              <textarea name="address" value={form.address} onChange={handleChange} rows={3} className="mt-2 block w-full rounded-[10px] px-3 py-2 text-sm" style={{ border: '1px solid #e9e6e3', backgroundColor: '#fafafa', resize: 'vertical' }} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-xs font-medium" style={{ color: '#8f8f8f' }}>Architect Status</label>
                <select name="architectStatus" value={form.architectStatus} onChange={handleChange} className="mt-2 block w-full rounded-[10px] px-3 py-2 text-sm" style={{ border: '1px solid #e9e6e3', backgroundColor: '#fafafa' }}>
                  {architectOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium" style={{ color: '#8f8f8f' }}>Lead Status</label>
                <select name="leadStatus" value={form.leadStatus} onChange={handleChange} className="mt-2 block w-full rounded-[10px] px-3 py-2 text-sm" style={{ border: '1px solid #e9e6e3', backgroundColor: '#fafafa' }}>
                  {leadStatusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <button type="button" onClick={() => router.back()} className="px-4 py-2 rounded-[10px] text-sm font-semibold transition" style={{ backgroundColor: '#f0f0f0', color: '#111111' }}>Cancel</button>
              <button type="submit" disabled={submitting} className="px-4 py-2 rounded-[10px] text-sm text-white font-semibold transition" style={{ backgroundColor: '#e07b63' }}>{submitting ? 'Updating...' : 'Update Lead'}</button>
            </div>
          </motion.div>
        </form>
      </motion.div>
    </div>
  );
}
