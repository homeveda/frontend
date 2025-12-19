"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import axios from "axios";
import Popup from "../../../../component/popup";

export default function AddLeadPage() {
  const router = useRouter();
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  const [form, setForm] = useState({
    name: "",
    address: "",
    contactNumber: "",
    architectStatus: "Account Not Created",
    leadStatus: "New",
  });
  const [loading, setLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [popupColor, setPopupColor] = useState("green");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const validate = () => {
    if (!form.name.trim()) return "Name is required";
    if (!form.address.trim()) return "Address is required";
    if (!form.contactNumber.trim()) return "Contact number is required";
    if (!/^\+?[0-9\- ]{6,20}$/.test(form.contactNumber.trim()))
      return "Enter a valid contact number";
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

    try {
      setLoading(true);
      const payload = {
        name: form.name.trim(),
        address: form.address.trim(),
        contactNumber: form.contactNumber.trim(),
        architectStatus: form.architectStatus,
        leadStatus: form.leadStatus,
      };
      const res = await axios.post(`${backendUrl}/initiallead`, payload,{
        headers: {
            Authorization: typeof window !== 'undefined' ? `Bearer ${localStorage.getItem('adminToken')}` : undefined
        }
      });
      setPopupMessage("Lead created successfully");
      setPopupColor("green");
      setShowPopup(true);
      setForm({ name: "", address: "", contactNumber: "", architectStatus: "Account Not Created", leadStatus: "New" });
      setTimeout(() => router.push("/admin/initiallead/display"), 1200);
    } catch (error) {
      setPopupMessage(error?.response?.data?.message || "Failed to create lead");
      setPopupColor("red");
      setShowPopup(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: "#f7f4f1", minHeight: "100vh", fontFamily: "'Space Grotesk', sans-serif" }} className="p-6">
      {showPopup && (
        <Popup message={popupMessage} color={popupColor} onClose={() => setShowPopup(false)} autoClose duration={4000} />
      )}

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto">
        <div className="mb-6">
          <button onClick={() => router.back()} className="text-sm font-semibold mb-4" style={{ color: "#e07b63" }}>← Back</button>
          <h2 style={{ color: "#111111", letterSpacing: "-0.02em" }} className="text-2xl font-semibold">Add New Lead</h2>
          <p className="text-sm mt-1" style={{ color: "#8f8f8f" }}>Add a new initial lead to the system</p>
        </div>

        <form onSubmit={handleSubmit}>
          <motion.div className="rounded-[14px] p-6 mb-6" style={{ backgroundColor: "#ffffff", boxShadow: "0 10px 30px rgba(16,16,16,0.08)" }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-xs font-medium" style={{ color: "#8f8f8f" }}>Name</label>
                <input name="name" value={form.name} onChange={handleChange} className="mt-2 block w-full rounded-[10px] px-3 py-2 text-sm" style={{ border: "1px solid #e9e6e3", backgroundColor: "#fafafa" }} />
              </div>

              <div>
                <label className="text-xs font-medium" style={{ color: "#8f8f8f" }}>Contact Number</label>
                <input name="contactNumber" value={form.contactNumber} onChange={handleChange} className="mt-2 block w-full rounded-[10px] px-3 py-2 text-sm" style={{ border: "1px solid #e9e6e3", backgroundColor: "#fafafa" }} />
              </div>
            </div>

            <div className="mb-4">
              <label className="text-xs font-medium" style={{ color: "#8f8f8f" }}>Address</label>
              <textarea name="address" value={form.address} onChange={handleChange} rows={3} className="mt-2 block w-full rounded-[10px] px-3 py-2 text-sm" style={{ border: "1px solid #e9e6e3", backgroundColor: "#fafafa", resize: "vertical" }} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-xs font-medium" style={{ color: "#8f8f8f" }}>Architect Status</label>
                <select name="architectStatus" value={form.architectStatus} onChange={handleChange} className="mt-2 block w-full rounded-[10px] px-3 py-2 text-sm" style={{ border: "1px solid #e9e6e3", backgroundColor: "#fafafa" }}>
                  <option>Account Created</option>
                  <option>Account Not Created</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium" style={{ color: "#8f8f8f" }}>Lead Status</label>
                <select name="leadStatus" value={form.leadStatus} onChange={handleChange} className="mt-2 block w-full rounded-[10px] px-3 py-2 text-sm" style={{ border: "1px solid #e9e6e3", backgroundColor: "#fafafa" }}>
                  <option>New</option>
                  <option>Hot</option>
                  <option>Closed</option>
                  <option>Follow Up</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <button type="button" onClick={() => router.back()} className="px-4 py-2 rounded-[10px] text-sm font-semibold transition" style={{ backgroundColor: "#f0f0f0", color: "#111111" }}>Cancel</button>
              <button type="submit" disabled={loading} className="px-4 py-2 rounded-[10px] text-sm text-white font-semibold transition" style={{ backgroundColor: "#e07b63" }}>{loading ? "Adding..." : "Add Lead"}</button>
            </div>
          </motion.div>
        </form>
      </motion.div>
    </div>
  );
}
