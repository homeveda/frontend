"use client";
import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import axios from "axios";
import Popup from "../../../../component/popup";

export default function AddLeadPage() {
  const router = useRouter();
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  const REQUIREMENTS_OPTIONS = ["Glass Work", "Kitchen", "Wardrobe", "Facade","Aristo"];
  const CATEGORY_OPTIONS = ["Builder", "Economy", "Standard", "VedaX"];

  const [form, setForm] = useState({
    name: "",
    address: "",
    contactNumber: "",
    architectName: "",
    architectContact: "",
    architectAddress: "",
    Requirements: [],
    category: [],
  });

  const [requirementsOpen, setRequirementsOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const requirementsRef = useRef(null);
  const categoryRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [popupColor, setPopupColor] = useState("green");

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (requirementsRef.current && !requirementsRef.current.contains(e.target)) {
        setRequirementsOpen(false);
      }
      if (categoryRef.current && !categoryRef.current.contains(e.target)) {
        setCategoryOpen(false);
      }
    };

    if (requirementsOpen || categoryOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [requirementsOpen, categoryOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleRequirementToggle = (req) => {
    setForm((prev) => {
      const current = Array.isArray(prev.Requirements) ? prev.Requirements : [];
      const isSelected = current.includes(req);
      return {
        ...prev,
        Requirements: isSelected ? current.filter((x) => x !== req) : [...current, req],
      };
    });
  };

  const handleCategoryToggle = (cat) => {
    setForm((prev) => {
      const current = Array.isArray(prev.category) ? prev.category : [];
      const isSelected = current.includes(cat);
      return {
        ...prev,
        category: isSelected ? current.filter((x) => x !== cat) : [...current, cat],
      };
    });
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
        architectName: form.architectName.trim(),
        architectContact: form.architectContact.trim(),
        architectAddress: form.architectAddress.trim(),
        Requirements: form.Requirements || [],
        category: form.category || [],
      };
      const res = await axios.post(`${backendUrl}/initiallead`, payload, {
        headers: {
          Authorization: typeof window !== "undefined" ? `Bearer ${localStorage.getItem("adminToken")}` : undefined,
        },
      });
      setPopupMessage("Lead created successfully");
      setPopupColor("green");
      setShowPopup(true);
      setForm({
        name: "",
        address: "",
        contactNumber: "",
        architectName: "",
        architectContact: "",
        architectAddress: "",
        Requirements: [],
        category: [],
      });
      setTimeout(() => router.push("/admin/initiallead"), 1200);
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
          <button onClick={() => router.back()} className="text-sm font-semibold mb-4" style={{ color: "#e07b63" }}>
            ← Back
          </button>
          <h2 style={{ color: "#111111", letterSpacing: "-0.02em" }} className="text-2xl font-semibold">
            Add New Lead
          </h2>
          <p className="text-sm mt-1" style={{ color: "#8f8f8f" }}>
            Add a new initial lead to the system
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <motion.div
            className="rounded-[14px] p-6 mb-6"
            style={{ backgroundColor: "#ffffff", boxShadow: "0 10px 30px rgba(16,16,16,0.08)" }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-xs font-medium" style={{ color: "#8f8f8f" }}>
                  Name
                </label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="mt-2 block w-full rounded-[10px] px-3 py-2 text-sm"
                  style={{ border: "1px solid #e9e6e3", backgroundColor: "#fafafa" }}
                />
              </div>

              <div>
                <label className="text-xs font-medium" style={{ color: "#8f8f8f" }}>
                  Contact Number
                </label>
                <input
                  name="contactNumber"
                  value={form.contactNumber}
                  onChange={handleChange}
                  className="mt-2 block w-full rounded-[10px] px-3 py-2 text-sm"
                  style={{ border: "1px solid #e9e6e3", backgroundColor: "#fafafa" }}
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="text-xs font-medium" style={{ color: "#8f8f8f" }}>
                Address
              </label>
              <textarea
                name="address"
                value={form.address}
                onChange={handleChange}
                rows={3}
                className="mt-2 block w-full rounded-[10px] px-3 py-2 text-sm"
                style={{ border: "1px solid #e9e6e3", backgroundColor: "#fafafa", resize: "vertical" }}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="text-xs font-medium" style={{ color: "#8f8f8f" }}>
                  Architect Name
                </label>
                <input
                  name="architectName"
                  value={form.architectName}
                  onChange={handleChange}
                  className="mt-2 block w-full rounded-[10px] px-3 py-2 text-sm"
                  style={{ border: "1px solid #e9e6e3", backgroundColor: "#fafafa" }}
                />
              </div>

              <div>
                <label className="text-xs font-medium" style={{ color: "#8f8f8f" }}>
                  Architect Contact
                </label>
                <input
                  name="architectContact"
                  value={form.architectContact}
                  onChange={handleChange}
                  className="mt-2 block w-full rounded-[10px] px-3 py-2 text-sm"
                  style={{ border: "1px solid #e9e6e3", backgroundColor: "#fafafa" }}
                />
              </div>

              <div>
                <label className="text-xs font-medium" style={{ color: "#8f8f8f" }}>Architect Address</label>
                <textarea
                  name="architectAddress"
                  value={form.architectAddress}
                  onChange={handleChange}
                  rows={3}
                  className="mt-2 block w-full rounded-[10px] px-3 py-2 text-sm"
                  style={{ border: "1px solid #e9e6e3", backgroundColor: "#fafafa", resize: "vertical" }}
                />
              </div>
            </div>

            {/* Requirements Multi-select */}
            <div className="mb-4">
              <label className="text-xs font-medium" style={{ color: "#8f8f8f" }}>
                Requirements
              </label>
              <div className="w-full relative mt-2" ref={requirementsRef}>
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    setRequirementsOpen(!requirementsOpen);
                  }}
                  className="w-full min-h-[44px] flex flex-wrap items-center gap-2 p-2 rounded-[10px]"
                  style={{
                    border: "1px solid #e9e6e3",
                    backgroundColor: "#fafafa",
                    cursor: "pointer",
                  }}
                >
                  {form.Requirements && form.Requirements.length > 0 ? (
                    form.Requirements.map((req, idx) => (
                      <div
                        key={req + idx}
                        className="flex items-center gap-2 bg-white px-3 py-1 rounded-full text-sm"
                        style={{ boxShadow: "0 1px 0 rgba(16,16,16,0.04)" }}
                      >
                        <span>{req}</span>
                      </div>
                    ))
                  ) : (
                    <span className="text-sm text-gray-500">Select requirements</span>
                  )}
                  <div className="ml-auto text-gray-400">▾</div>
                </div>
                {requirementsOpen && (
                  <div
                    className="absolute mt-1 bg-white rounded shadow-md z-50"
                    style={{
                      maxHeight: 220,
                      overflowY: "auto",
                      width: "100%",
                    }}
                  >
                    {REQUIREMENTS_OPTIONS.map((opt) => {
                      const selected = (form.Requirements || []).includes(opt);
                      return (
                        <div
                          key={opt}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleRequirementToggle(opt);
                          }}
                          className="p-2 flex items-center justify-between cursor-pointer transition-colors hover:opacity-90"
                          style={{
                            backgroundColor: selected ? "#e07b63" : "white",
                            color: selected ? "white" : "black",
                          }}
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={selected}
                              readOnly
                              tabIndex={-1}
                              className="accent-white pointer-events-none"
                            />
                            <span className="text-sm">{opt}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Category Multi-select */}
            <div className="mb-4">
              <label className="text-xs font-medium" style={{ color: "#8f8f8f" }}>
                Category
              </label>
              <div className="w-full relative mt-2" ref={categoryRef}>
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    setCategoryOpen(!categoryOpen);
                  }}
                  className="w-full min-h-[44px] flex flex-wrap items-center gap-2 p-2 rounded-[10px]"
                  style={{
                    border: "1px solid #e9e6e3",
                    backgroundColor: "#fafafa",
                    cursor: "pointer",
                  }}
                >
                  {form.category && form.category.length > 0 ? (
                    form.category.map((cat, idx) => (
                      <div
                        key={cat + idx}
                        className="flex items-center gap-2 bg-white px-3 py-1 rounded-full text-sm"
                        style={{ boxShadow: "0 1px 0 rgba(16,16,16,0.04)" }}
                      >
                        <span>{cat}</span>
                      </div>
                    ))
                  ) : (
                    <span className="text-sm text-gray-500">Select categories</span>
                  )}
                  <div className="ml-auto text-gray-400">▾</div>
                </div>
                {categoryOpen && (
                  <div
                    className="absolute mt-1 bg-white rounded shadow-md z-50"
                    style={{
                      maxHeight: 220,
                      overflowY: "auto",
                      width: "100%",
                    }}
                  >
                    {CATEGORY_OPTIONS.map((opt) => {
                      const selected = (form.category || []).includes(opt);
                      return (
                        <div
                          key={opt}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleCategoryToggle(opt);
                          }}
                          className="p-2 flex items-center justify-between cursor-pointer transition-colors hover:opacity-90"
                          style={{
                            backgroundColor: selected ? "#e07b63" : "white",
                            color: selected ? "white" : "black",
                          }}
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={selected}
                              readOnly
                              tabIndex={-1}
                              className="accent-white pointer-events-none"
                            />
                            <span className="text-sm">{opt}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-4 py-2 rounded-[10px] text-sm font-semibold transition"
                style={{ backgroundColor: "#f0f0f0", color: "#111111" }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 rounded-[10px] text-sm text-white font-semibold transition"
                style={{ backgroundColor: "#e07b63" }}
              >
                {loading ? "Adding..." : "Add Lead"}
              </button>
            </div>
          </motion.div>
        </form>
      </motion.div>
    </div>
  );
}
