"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import CatelogCard from "../../../../component/catelogCard";
import ConfirmationDialogueBox from "../../../../component/confirmationDialogueBox";
import LoadingSpinner from "../../../../component/loadingSpinner";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Suspense } from "react";

function CatelogSearchPage() {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  const adminToken = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
  const router = useRouter();
  const searchParams = useSearchParams();
  const categories = ["Builder","Economy","Standard","VedaX"];
  const types = ["All","Normal","Premium"];
  const DEPARTMENT_WORKTYPE_MAP = {
    Kitchen: ["Carcass", "Shutters", "Visibles", "Base And Back", "Basic Hardware", "Additional Hardware", "Other Hardware", "Countertop", "Appliances"],
    Wardrobe: ["Carcass", "Shutters", "Base And Back", "Visibles", "Basic Hardware", "Additional Hardware", "Other Hardware"],
    Glass: ["Sliding Partitions", "Shower Cubicles", "Mirrors", "Railing"],
    Facade: ["Elevation", "Double Height Lobby", "Highlighter Wall", "Washrooms", "Countertop"],
  };
  const departments = ["All", ...Object.keys(DEPARTMENT_WORKTYPE_MAP)];

  // Initialize filters from URL or defaults
  const [category, setCategory] = useState(searchParams.get('category') || "Economy");
  const [type, setType] = useState(searchParams.get('type') || "All");
  const [department, setDepartment] = useState(searchParams.get('department') || "All");
  const [workType, setWorkType] = useState(searchParams.get('workType') || "All");
  const [query, setQuery] = useState(searchParams.get('query') || "");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const currentWorkTypes = department !== "All" ? ["All", ...DEPARTMENT_WORKTYPE_MAP[department]] : ["All"];

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
      let data = Array.isArray(res.data) ? res.data : [];

      // Client-side filter by department if selected
      if (department && department !== 'All') {
        data = data.filter((item) => item.department === department);
      }

      setItems(data);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to load');
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (category !== "Economy") params.set('category', category);
    if (type !== "All") params.set('type', type);
    if (department !== "All") params.set('department', department);
    if (workType !== "All") params.set('workType', workType);
    if (query) params.set('query', query);
    
    const queryString = params.toString();
    const newUrl = queryString ? `?${queryString}` : window.location.pathname;
    window.history.replaceState({}, '', newUrl);
  }, [category, type, department, workType, query]);

  // Fetch items when filters change
  useEffect(() => {
    fetchItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, type, workType, department]);

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
      await axios.delete(`${backendUrl}/catelog/${encodeURIComponent(itemToDelete._id)}`, { headers: { Authorization: adminToken ? `Bearer ${adminToken}` : undefined } });
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
    <div className="p-4 sm:p-6" style={{ backgroundColor: '#f7f4f1', minHeight: '100vh', fontFamily: "'Space Grotesk', sans-serif" }}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold" style={{ color: '#111111', letterSpacing: '-0.02em' }}>Catalog Search</h2>
          <p className="text-sm mt-1" style={{ color: '#8f8f8f' }}>Browse and manage catalog items</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
          <button
              onClick={() => {
                const params = new URLSearchParams();
                if (category !== "Economy") params.set('category', category);
                if (type !== "All") params.set('type', type);
                if (department !== "All") params.set('department', department);
                if (workType !== "All") params.set('workType', workType);
                const queryString = params.toString();
                router.push(`/admin/catelog/additem${queryString ? '?' + queryString : ''}`);
              }}
              className="cursor-pointer bg-[#e07b63] text-white px-4 py-2 rounded hover:bg-[#f7f4f1] hover:text-[#e07b63] hover:border-[#e07b63] border rounded-lg border-transparent transition-colors text-sm sm:text-base whitespace-nowrap"
            >
              Add New Catelogue Item
            </button>
            <button
            onClick={() => router.back()}
            className="text-lg sm:text-xl font-semibold cursor-pointer whitespace-nowrap"
            style={{ color: "#e07b63" }}
          >
            ← Back
          </button>
        </div>
      </div>

      <div className="p-4 rounded-[14px] mb-6" style={{ backgroundColor: '#ffffff', boxShadow: '0 10px 30px rgba(16,16,16,0.08)' }}>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="text-xs font-medium" style={{ color: '#8f8f8f' }}>Category</label>
            <select value={category} onChange={(e)=>{setCategory(e.target.value); setType('All'); setDepartment('All'); setWorkType('All');}} className="mt-2 block w-full rounded-[10px] px-3 py-2 text-sm focus:outline-none" style={{ border: '1px solid #e9e6e3', backgroundColor: '#fafafa' }}>
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
            <label className="text-xs font-medium" style={{ color: '#8f8f8f' }}>Department</label>
            <select value={department} onChange={(e)=>{setDepartment(e.target.value); setWorkType('All');}} className="mt-2 block w-full rounded-[10px] px-3 py-2 text-sm focus:outline-none" style={{ border: '1px solid #e9e6e3', backgroundColor: '#fafafa' }}>
              {departments.map(d=> <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          <div>
            <label className="text-xs font-medium" style={{ color: '#8f8f8f' }}>Work Type</label>
            <select value={workType} onChange={(e)=>{setWorkType(e.target.value); setType('All');}} className="mt-2 block w-full rounded-[10px] px-3 py-2 text-sm focus:outline-none" style={{ border: '1px solid #e9e6e3', backgroundColor: '#fafafa' }}>
              {currentWorkTypes.map(w=> <option key={w} value={w}>{w}</option>)}
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
          {filtered.map(it=> {
            const params = new URLSearchParams();
            if (category !== "Economy") params.set('category', category);
            if (type !== "All") params.set('type', type);
            if (department !== "All") params.set('department', department);
            if (workType !== "All") params.set('workType', workType);
            const queryString = params.toString();
            return (
              <motion.div key={it._id} layout>
                <CatelogCard item={it} onDelete={requestDelete} filters={queryString ? '&' + queryString : ''} />
              </motion.div>
            );
          })}
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

export default function CatelogSearchPageWrapper() {
  return(
    <Suspense fallback={<LoadingSpinner />}>
      <CatelogSearchPage />
    </Suspense>
  );
}