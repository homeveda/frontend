"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import CatelogCard from "../../../../component/catelogCard";
import ConfirmationDialogueBox from "../../../../component/confirmationDialogueBox";
import { motion, AnimatePresence } from "framer-motion";

export default function CatelogSearchPage() {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  const adminToken = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;

  const categories = ["Builder","Economy","Standard","VedaX"];
  const types = ["All","Normal","Premium"];
  const workTypes = ["All","Wood Work","Main Hardware","Other Hardware","Miscellaneous","Countertop"];

  const [category, setCategory] = useState("Economy");
  const [type, setType] = useState("All");
  const [workType, setWorkType] = useState("All");
  const [query, setQuery] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchItems = async () => {
    if (!backendUrl) return setError('Backend URL not configured');
    try {
      setLoading(true);
      setError(null);

      let url = `${backendUrl}/catelog/category/${encodeURIComponent(category)}`;
      if (workType && workType !== 'All') {
        url = `${backendUrl}/catelog/category/${encodeURIComponent(category)}/workType/${encodeURIComponent(workType)}`;
      } else if (type && type !== 'All') {
        url = `${backendUrl}/catelog/category/${encodeURIComponent(category)}/type/${encodeURIComponent(type)}`;
      }

      const res = await axios.get(url, { headers: { Authorization: adminToken ? `Bearer ${adminToken}` : undefined } });
      setItems(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to load');
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, type, workType]);

  // state for confirmation dialog
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  // open confirmation dialog (called from card)
  const requestDelete = (item) => {
    setItemToDelete(item);
    setConfirmOpen(true);
  };

  // perform actual delete when confirmed
  const performDelete = async () => {
    if (!itemToDelete) return;
    try {
      await axios.delete(`${backendUrl}/catelog/${encodeURIComponent(itemToDelete.name)}`, { headers: { Authorization: adminToken ? `Bearer ${adminToken}` : undefined } });
      setItems((prev) => prev.filter((i) => i._id !== itemToDelete._id));
    } catch (err) {
      alert(err?.response?.data?.message || err.message || 'Delete failed');
    } finally {
      setConfirmOpen(false);
      setItemToDelete(null);
    }
  };

  const cancelDelete = () => {
    setConfirmOpen(false);
    setItemToDelete(null);
  };

  const filtered = items.filter((it) => (query ? it.name.toLowerCase().includes(query.toLowerCase()) : true));

  return (
    <div className="p-6" style={{ backgroundColor: '#f7f4f1', minHeight: '100vh', fontFamily: "'Space Grotesk', sans-serif" }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-semibold" style={{ color: '#111111', letterSpacing: '-0.02em' }}>Catalog Search</h2>
          <p className="text-sm mt-1" style={{ color: '#8f8f8f' }}>Browse and manage catalog items</p>
        </div>
        <div>
          <button onClick={fetchItems} className="text-white px-4 py-2 rounded-[10px] font-semibold transition" style={{ backgroundColor: '#e07b63' }} onMouseEnter={(e) => e.target.style.backgroundColor = '#d56a52'} onMouseLeave={(e) => e.target.style.backgroundColor = '#e07b63'}>Refresh</button>
        </div>
      </div>

      <div className="p-4 rounded-[14px] mb-6" style={{ backgroundColor: '#ffffff', boxShadow: '0 10px 30px rgba(16,16,16,0.08)' }}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="text-xs font-medium" style={{ color: '#8f8f8f' }}>Category</label>
            <select value={category} onChange={(e)=>{setCategory(e.target.value); setType('All'); setWorkType('All');}} className="mt-2 block w-full rounded-[10px] px-3 py-2 text-sm focus:outline-none" style={{ border: '1px solid #e9e6e3', backgroundColor: '#fafafa' }}>
              {categories.map(c=> <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label className="text-xs font-medium" style={{ color: '#8f8f8f' }}>Type</label>
            <select value={type} onChange={(e)=>{setType(e.target.value); setWorkType('All');}} className="mt-2 block w-full rounded-[10px] px-3 py-2 text-sm focus:outline-none" style={{ border: '1px solid #e9e6e3', backgroundColor: '#fafafa' }}>
              {types.map(t=> <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div>
            <label className="text-xs font-medium" style={{ color: '#8f8f8f' }}>Work Type</label>
            <select value={workType} onChange={(e)=>{setWorkType(e.target.value); setType('All');}} className="mt-2 block w-full rounded-[10px] px-3 py-2 text-sm focus:outline-none" style={{ border: '1px solid #e9e6e3', backgroundColor: '#fafafa' }}>
              {workTypes.map(w=> <option key={w} value={w}>{w}</option>)}
            </select>
          </div>

          <div>
            <label className="text-xs font-medium" style={{ color: '#8f8f8f' }}>Search</label>
            <input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Search by name" className="mt-2 block w-full rounded-[10px] px-3 py-2 text-sm focus:outline-none" style={{ border: '1px solid #e9e6e3', backgroundColor: '#fafafa' }} />
          </div>
        </div>
      </div>

      {loading && <LoadingSpinner />}
      {error && <div className="text-sm" style={{ color: '#e07b63' }}>{error}</div>}

      <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {filtered.map(it=> (
            <motion.div key={it._id} layout>
              <CatelogCard item={it} onDelete={requestDelete} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {(!loading && filtered.length === 0) && <div className="mt-6" style={{ color: '#8f8f8f' }}>No items found.</div>}
      
      <ConfirmationDialogueBox
        open={confirmOpen}
        title={itemToDelete ? `Delete ${itemToDelete.name}?` : undefined}
        description={itemToDelete ? `Are you sure you want to delete "${itemToDelete.name}"? This action cannot be undone.` : undefined}
        confirmText="Yes"
        cancelText="No"
        onConfirm={performDelete}
        onCancel={cancelDelete}
      />
    </div>
  );
}
