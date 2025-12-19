"use client";
import { useState, useRef } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { Upload, Camera } from "lucide-react";

export default function AddItemPage() {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000";

    const [form, setForm] = useState({
        name: "",
        description: "",
        category: "Builder",
        workType: "Wood Work",
        price: "",
        type: "Normal",
    });

    const imageInputRef = useRef(null);
    const videoInputRef = useRef(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [videoPreview, setVideoPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);

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
    const workTypes = ["Wood Work", "Main Hardware", "Other Hardware", "Miscellaneous"];

    const validate = () => {
        if (!form.name || !form.category || !form.price || !form.type) {
            setMessage({ type: "error", text: "Please fill name, category, price and type." });
            return false;
        }
        const imageFile = imageInputRef.current?.files?.[0];
        const videoFile = videoInputRef.current?.files?.[0];
        if (form.type === "Normal" && !imageFile) {
            setMessage({ type: "error", text: "Normal items require an image." });
            return false;
        }
        if (form.type === "Premium") {
            if (!imageFile || !videoFile) {
                setMessage({ type: "error", text: "Premium items require both image and video." });
                return false;
            }
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage(null);
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
            fd.append("workType", form.workType || "");
            fd.append("price", form.price);
            fd.append("type", form.type);
            if (imageFile) fd.append("image", imageFile);
            if (form.type === "Premium" && videoFile) fd.append("video", videoFile);

            const resp = await axios.post(`${backendUrl}/catelog`, fd, {
                headers: { 
                    "Content-Type": "multipart/form-data",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (resp.status === 201) {
                setMessage({ type: "success", text: "Catalog item created." });
                // reset
                setForm({ name: "", description: "", category: "Builder", workType: "Wood Work", price: "", type: "Normal" });
                setImagePreview(null);
                setVideoPreview(null);
                if (imageInputRef.current) imageInputRef.current.value = "";
                if (videoInputRef.current) videoInputRef.current.value = "";
            } else {
                setMessage({ type: "error", text: resp.data?.message || "Failed to create item." });
            }
        } catch (err) {
            console.error(err);
            setMessage({ type: "error", text: err.response?.data?.message || "Server error." });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-auth-root">
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

                    <div style={{ marginTop: 18 }} className="muted">Choose item type and upload media. Premium items require a video.</div>

                    <div className="theme-swatch">
                        <div className="swatch" style={{ background: 'var(--primary)' }} />
                        <div className="swatch" style={{ background: 'var(--secondary)' }} />
                        <div className="swatch" style={{ background: 'var(--tertiary)' }} />
                        <div className="swatch" style={{ background: '#ffffff', border: '1px solid #e6e6e6' }} />
                    </div>
                </div>

                <motion.div style={{ padding: 6 }} initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: 0.05 } }}>
                    <motion.div initial={{ x: 10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.35 }}>
                        {message && (
                            <div style={{ marginBottom: 12, padding: 10, borderRadius: 8, background: message.type === 'error' ? '#fff2f2' : '#f0fff4', border: message.type === 'error' ? '1px solid #ffd6d6' : '1px solid #d8f6de', color: message.type === 'error' ? '#9b1c1c' : '#0a6b2b' }}>{message.text}</div>
                        )}

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
                                <div style={{ width: 200 }} className="col">
                                    <label htmlFor="workType">Work Type</label>
                                    <select id="workType" value={form.workType} onChange={(e) => setForm({ ...form, workType: e.target.value })}>
                                        {workTypes.map((w) => <option key={w} value={w}>{w}</option>)}
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
                                <div className="muted">{form.type === 'Premium' ? 'Premium requires image + video' : 'Normal requires image'}</div>
                                <motion.button whileTap={{ scale: 0.98 }} whileHover={{ y: -2 }} type="submit" className="submit" disabled={loading}>{loading ? 'Uploading...' : 'Add Item'}</motion.button>
                            </div>
                        </form>
                    </motion.div>
                </motion.div>
            </motion.div>
        </div>
    );
}