"use client";
import { useState, useRef } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { Upload, Camera } from "lucide-react";
import Popup from "../../../../component/popup";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import LoadingSpinner from "../../../../component/loadingSpinner";

function AddCatalogItemPage() {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000";
    const router = useRouter();
    const searchParams = useSearchParams();
    
    // Get filter parameters
    const filterParams = new URLSearchParams();
    const category = searchParams.get('category');
    const type = searchParams.get('type');
    const department = searchParams.get('department');
    const workType = searchParams.get('workType');
    
    if (category) filterParams.set('category', category);
    if (type) filterParams.set('type', type);
    if (department) filterParams.set('department', department);
    if (workType) filterParams.set('workType', workType);
    
    const filterQueryString = filterParams.toString() ? '?' + filterParams.toString() : '';

    const [showPopup, setShowPopup] = useState(false);
    const [popupMessage, setPopupMessage] = useState("");
    const [popupColor, setPopupColor] = useState("green");

    const DEPARTMENT_WORKTYPE_MAP = {
        Kitchen: ["Carcass", "Shutters", "Visibles", "Base And Back", "Basic Hardware", "Additional Hardware", "Other Hardware", "Countertop", "Appliances"],
        Wardrobe: ["Carcass", "Shutters", "Base And Back", "Visibles", "Basic Hardware", "Additional Hardware", "Other Hardware"],
        Glass: ["Sliding Partitions", "Shower Cubicles", "Mirrors", "Railing"],
        Facade: ["Elevation", "Double Height Lobby", "Highlighter Wall", "Washrooms", "Countertop"],
    };
    const departments = Object.keys(DEPARTMENT_WORKTYPE_MAP);

    const [form, setForm] = useState({
        name: "",
        description: "",
        category: "Builder",
        department: "Kitchen",
        workType: "Carcass",
        price: "",
        type: "Normal",
        displayedToClients: true,
    });

    const currentWorkTypes = DEPARTMENT_WORKTYPE_MAP[form.department] || [];

    const imageInputRef = useRef(null);
    const videoInputRef = useRef(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [videoPreview, setVideoPreview] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleImageChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setImagePreview(url);
        } else {
            setImagePreview(null);
        }
    };

    const handleVideoChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setVideoPreview(url);
        } else {
            setVideoPreview(null);
        }
    };

    const removeImage = () => {
        setImagePreview(null);
        if (imageInputRef.current) imageInputRef.current.value = "";
    };

    const removeVideo = () => {
        setVideoPreview(null);
        if (videoInputRef.current) videoInputRef.current.value = "";
    };

    const categories = ["Builder", "Economy", "Standard", "VedaX"];

    const validate = () => {
        if (!form.name || !form.category || !form.price || !form.type || !form.department || !form.workType) {
            setPopupMessage("Please fill name, department, workType, category, price and type.");
            setPopupColor("red");
            setShowPopup(true);
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setShowPopup(false);
        if (!validate()) return;
        setLoading(true);
        try {
            const token = localStorage.getItem("adminToken");  
            const imageFile = imageInputRef.current?.files?.[0];
            const videoFile = videoInputRef.current?.files?.[0];
            const fd = new FormData();
            fd.append("name", form.name);
            fd.append("description", form.description || "");
            fd.append("category", form.category);
            fd.append("department", form.department);
            fd.append("workType", form.workType);
            fd.append("price", form.price);
            fd.append("type", form.type);
            fd.append("displayedToClients", form.displayedToClients);
            if (imageFile) fd.append("image", imageFile);
            if (form.type === "Premium" && videoFile) fd.append("video", videoFile);

            const resp = await axios.post(`${backendUrl}/catelog`, fd, {
                headers: { 
                    "Content-Type": "multipart/form-data",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (resp.status === 201) {
                setPopupMessage("Catalog item created successfully!");
                setPopupColor("green");
                setShowPopup(true);
                // reset
                setForm({ name: "", description: "", category: "Builder", department: "Kitchen", workType: "Carcass", price: "", type: "Normal", displayedToClients: true });
                setImagePreview(null);
                setVideoPreview(null);
                if (imageInputRef.current) imageInputRef.current.value = "";
                if (videoInputRef.current) videoInputRef.current.value = "";
                // redirect to display page after 2 seconds
                setTimeout(() => router.push(`/admin/catelog/display${filterQueryString}`), 2000);
            } else {
                setPopupMessage(resp.data?.message || "Failed to create item.");
                setPopupColor("red");
                setShowPopup(true);
            }
        } catch (err) {
            console.error(err);
            setPopupMessage(err.response?.data?.message || "Server error.");
            setPopupColor("red");
            setShowPopup(true);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-auth-root">
            {showPopup && (
                <Popup
                    message={popupMessage}
                    color={popupColor}
                    onClose={() => setShowPopup(false)}
                    autoClose={true}
                    duration={4000}
                />
            )}
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300..700&display=swap');
                :root{
                    --bg: #f7f4f1;
                    --card: #ffffff;
                    --primary: #e07b63; /* peach */
                    --secondary: #63b8e0; /* sky */
                    --tertiary: #f2c94c; /* warm yellow */
                    --accent: #111111;
                    --muted: #8f8f8f;
                }
                *{box-sizing:border-box}
                body,html,#__next{height:100%}
                .admin-auth-root{font-family: 'Space Grotesk', system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial;min-height:100vh;display:flex;align-items:center;justify-content:center;background: radial-gradient(circle at 10% 10%, rgba(224,123,99,0.06), transparent 10%), var(--bg);padding:28px}
                .card{width:100%;max-width:1100px;display:grid;grid-template-columns:1fr 540px;gap:24px;background: linear-gradient(180deg, var(--card), #fbfbfb);border-radius:14px;box-shadow:0 10px 30px rgba(16,16,16,0.08);padding:28px;align-items:start}
                .brand{padding:22px}
                .brand h1{margin:0 0 8px 0;color:var(--accent);letter-spacing:-0.02em;font-size:32px;font-weight:700}
                .brand p{color:var(--muted);margin:0 0 18px 0}
                .art{height:120px;border-radius:10px;background: linear-gradient(135deg, rgba(224,123,99,0.12), rgba(17,17,17,0.03));display:flex;align-items:center;justify-content:center;color:var(--primary);font-weight:700;font-size:28px;overflow:hidden;position:relative}
                .art img, .art video{width:100%;height:100%;object-fit:cover;border-radius:10px}
                .remove-btn{position:absolute;top:8px;right:8px;background:rgba(0,0,0,0.6);color:white;border:none;width:32px;height:32px;border-radius:50%;cursor:pointer;font-size:18px;display:flex;align-items:center;justify-content:center;z-index:10;transition:background 0.2s}
                .remove-btn:hover{background:rgba(0,0,0,0.8)}
                form{display:flex;flex-direction:column;gap:12px}
                label{font-size:13px;color:var(--muted)}
                input, textarea, select{padding:12px 14px;border-radius:10px;border:1px solid #e9e6e3;background:transparent;outline:none;font-family:inherit;font-size:14px}
                input:focus, textarea:focus, select:focus{border-color:var(--primary)}
                .row{display:flex;gap:12px}
                .col{display:flex;flex-direction:column;gap:8px}
                .submit{background:var(--primary);color:white;padding:12px;border-radius:10px;border:none;cursor:pointer;font-weight:600}
                .submit[disabled]{opacity:0.6;cursor:default}
                .muted{font-size:13px;color:var(--muted)}
                .file-picker{display:flex;gap:10px;align-items:center}
                .file-box{position:relative;width:120px;height:90px;border-radius:10px;border:1px dashed #e6e2df;display:flex;align-items:center;justify-content:center;cursor:pointer;background:transparent}
                .preview-img{width:120px;height:90px;object-fit:cover;border-radius:10px}
                .video-preview{width:240px;max-width:100%;border-radius:10px}
                .theme-swatch{display:flex;gap:8px;margin-top:12px}
                .swatch{width:28px;height:28px;border-radius:6px;border:1px solid rgba(0,0,0,0.06)}
                @media (max-width:1000px){.card{grid-template-columns:1fr 1fr;padding:18px}}
                @media (max-width:880px){.card{grid-template-columns:1fr;padding:18px}.art{height:140px}.file-box{width:100px;height:80px}}
            `}</style>

            <motion.div className="card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
                <div className="brand">
                    <h1>home<span style={{ color: "var(--primary)" }}>veda</span></h1>
                    <p>Add catalog item</p>

                    <motion.div className="art" whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 120 }}>CATALOG</motion.div>

                    <div style={{ marginTop: 18 }} className="muted">Choose item type and upload media (optional).</div>

                    <div className="theme-swatch">
                        <div className="swatch" style={{ background: 'var(--primary)' }} />
                        <div className="swatch" style={{ background: 'var(--secondary)' }} />
                        <div className="swatch" style={{ background: 'var(--tertiary)' }} />
                        <div className="swatch" style={{ background: '#ffffff', border: '1px solid #e6e6e6' }} />
                    </div>
                </div>

                <motion.div style={{ padding: 6 }} initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: 0.05 } }}>
                    <motion.div initial={{ x: 10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.35 }}>
                        <form onSubmit={handleSubmit}>
                            <div className="row">
                                <div style={{ flex: 1 }} className="col">
                                    <label htmlFor="name">Name</label>
                                    <input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Item name" />
                                </div>
                                <div style={{ width: 140 }} className="col">
                                    <label htmlFor="type">Type</label>
                                    <select id="type" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                                        <option value="Normal">Normal</option>
                                        <option value="Premium">Premium</option>
                                    </select>
                                </div>
                            </div>

                            <div className="row">
                                <div style={{ flex: 1 }} className="col">
                                    <label htmlFor="category">Category</label>
                                    <select id="category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                                        {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div style={{ flex: 1 }} className="col">
                                    <label htmlFor="department">Department</label>
                                    <select id="department" value={form.department} onChange={(e) => {
                                        const dept = e.target.value;
                                        const firstWork = DEPARTMENT_WORKTYPE_MAP[dept]?.[0] || "";
                                        setForm({ ...form, department: dept, workType: firstWork });
                                    }}>
                                        {departments.map((d) => <option key={d} value={d}>{d}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="row">
                                <div style={{ flex: 1 }} className="col">
                                    <label htmlFor="workType">Work Type</label>
                                    <select id="workType" value={form.workType} onChange={(e) => setForm({ ...form, workType: e.target.value })}>
                                        {currentWorkTypes.map((w) => <option key={w} value={w}>{w}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="row">
                                <div style={{ flex: 1 }} className="col">
                                    <label htmlFor="price">Price</label>
                                    <input id="price" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="0" type="number" />
                                </div>
                                <div style={{ width: 200 }} className="col">
                                    <label>&nbsp;</label>
                                    <div style={{ display: 'flex', gap: 8 }}>
                                        <button type="button" onClick={() => { setForm({ ...form, type: 'Normal' }); }} className="submit" style={{ background: form.type === 'Normal' ? 'var(--primary)' : '#e9e6e3' }}>Normal</button>
                                        <button type="button" onClick={() => { setForm({ ...form, type: 'Premium' }); }} className="submit" style={{ background: form.type === 'Premium' ? 'var(--secondary)' : '#e9e6e3' }}>Premium</button>
                                    </div>
                                </div>
                            </div>

                            <div className="col">
                                <label htmlFor="description">Description</label>
                                <textarea id="description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4} placeholder="Short description" />
                            </div>

                            <div style={{ marginTop: 12, padding: 12, backgroundColor: '#f9f7f5', borderRadius: 10, border: '1px solid #e9e6e3' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <input 
                                        type="checkbox" 
                                        id="displayToggle"
                                        checked={form.displayedToClients}
                                        onChange={(e) => setForm({ ...form, displayedToClients: e.target.checked })}
                                        style={{ width: 20, height: 20, cursor: 'pointer' ,accentColor: 'var(--primary)'}}
                                    />
                                    <label htmlFor="displayToggle" style={{ cursor: 'pointer', margin: 0, fontSize: 14, fontWeight: 600 }}>
                                        Display to Clients
                                    </label>
                                </div>
                                <p style={{ fontSize: 12, color: 'var(--muted)', margin: '6px 0 0 32px' }}>
                                    {form.displayedToClients ? 'This item is visible to clients' : 'This item is hidden from clients'}
                                </p>
                            </div>

                            <div style={{ marginTop: 8 }} className="col">
                                <label>Media</label>
                                <div className="file-picker">
                                    <label className="file-box" title="Upload image">
                                        <input ref={imageInputRef} style={{ display: 'none' }} type="file" accept="image/*" onChange={handleImageChange} />
                                        {imagePreview ? (
                                            <>
                                                <img src={imagePreview} alt="preview" className="preview-img" />
                                                <button type="button" className="remove-btn" onClick={(e) => { e.stopPropagation(); removeImage(); }}>×</button>
                                            </>
                                        ) : (
                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}><Upload size={20} /><div style={{ fontSize: 12, color: 'var(--muted)' }}>Image</div></div>
                                        )}
                                    </label>

                                    {form.type === 'Premium' && (
                                        <label className="file-box" title="Upload video">
                                            <input ref={videoInputRef} style={{ display: 'none' }} type="file" accept="video/*" onChange={handleVideoChange} />
                                            {videoPreview ? (
                                                <>
                                                    <video className="video-preview" src={videoPreview} controls />
                                                    <button type="button" className="remove-btn" onClick={(e) => { e.stopPropagation(); removeVideo(); }}>×</button>
                                                </>
                                            ) : (
                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}><Camera size={20} /><div style={{ fontSize: 12, color: 'var(--muted)' }}>Video</div></div>
                                            )}
                                        </label>
                                    )}
                                </div>
                                <div>
                                    
                                </div>
                            </div>

                            <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                                <div className="muted">Media is optional</div>
                                <motion.button whileTap={{ scale: 0.98 }} whileHover={{ y: -2 }} type="submit" className="submit" disabled={loading}>{loading ? 'Uploading...' : 'Add Item'}</motion.button>
                            </div>
                        </form>
                    </motion.div>
                </motion.div>
            </motion.div>
        </div>
    );
}

export default function AddItemPage(){
    return (
        <Suspense fallback={<LoadingSpinner />}>
            <AddCatalogItemPage />
        </Suspense>
    )
}