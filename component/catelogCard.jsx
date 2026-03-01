"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function CatelogCard({ item, onDelete }) {
  const router = useRouter();

  const handleClick = () => {
    const id = encodeURIComponent(item._id);
    router.push(`/admin/catelog/updateitem?id=${id}`);
  };

  return (
    <>
    <style>{`
      .catelog-card{background:#ffffff;border-radius:10px;box-shadow:0 10px 30px rgba(16,16,16,0.08);border:1px solid #e9e6e3;overflow:hidden;display:flex;flex-direction:column;font-family:"Space Grotesk",sans-serif}
      .catelog-card-image{width:100%;height:192px;display:flex;align-items:center;justify-content:center;background:#f5f5f5}
      .catelog-card-image img{max-width:100%;max-height:100%;object-fit:contain}
      .catelog-card-content{cursor:pointer;padding:12px;display:flex;flex-direction:column;gap:12px;flex:1}
      .catelog-card-content:hover{background:rgba(224,123,99,0.02)}
      .catelog-card-title{font-size:13px;font-weight:600;line-height:1.3;color:#111111;margin:0}
      .catelog-card-desc{font-size:11px;color:#8f8f8f;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;margin:0}
      .catelog-card-info{display:flex;items-align:center;justify-content:space-between;gap:8px;flex-wrap:wrap}
      .catelog-card-price{font-weight:600;color:#e07b63;font-size:13px}
      .catelog-card-type{font-size:11px;padding:3px 6px;border-radius:6px;color:#8f8f8f;background:rgba(224,123,99,0.1)}
      .catelog-card-worktype{font-size:11px;color:#8f8f8f}
      .catelog-card-department{font-size:11px;padding:3px 6px;border-radius:6px;color:#63b8e0;background:rgba(99,184,224,0.1)}
      .catelog-card-footer{display:flex;gap:8px;justify-content:flex-end;padding:10px 12px;border-top:1px solid #e9e6e3}
      .catelog-card-delete-btn{color:white;font-size:11px;padding:6px 12px;border-radius:8px;border:none;cursor:pointer;font-weight:600;background:#e07b63;transition:all 0.2s;flex:1}
      .catelog-card-delete-btn:hover{background:#d56a52}

      @media (max-width:768px){
        .catelog-card-image{height:160px}
        .catelog-card-content{padding:10px}
        .catelog-card-title{font-size:12px}
        .catelog-card-desc{font-size:10px}
        .catelog-card-footer{padding:8px 10px;gap:6px}
        .catelog-card-delete-btn{padding:5px 10px;font-size:10px}
      }

      @media (max-width:480px){
        .catelog-card-image{height:140px}
        .catelog-card-content{padding:8px;gap:8px}
        .catelog-card-title{font-size:11px}
        .catelog-card-desc{font-size:9px;-webkit-line-clamp:1}
        .catelog-card-price{font-size:12px}
        .catelog-card-type{font-size:9px;padding:2px 4px}
        .catelog-card-worktype{font-size:9px}
        .catelog-card-footer{padding:6px 8px;gap:4px}
        .catelog-card-delete-btn{padding:4px 8px;font-size:9px}
      }
    `}</style>
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      whileHover={{ scale: 1.02 }}
      className="catelog-card"
    >
      <div
        onClick={handleClick}
        className="catelog-card-image"
      >
        <img
          src={item.imageLink}
          alt={item.name}
        />
      </div>

      <div className="catelog-card-content">
        <h3 className="catelog-card-title">{item.name}</h3>
        <p className="catelog-card-desc">{item.description || ""}</p>
        <div className="catelog-card-info">
          <div className="catelog-card-price">₹{item.price}</div>
          <div className="catelog-card-type">{item.type}</div>
        </div>
        <div className="catelog-card-worktype">{item.workType}</div>
        {item.department && <div className="catelog-card-department">{item.department}</div>}
      </div>

      <div className="catelog-card-footer">
        <button
          onClick={(e) => { e.stopPropagation(); onDelete && onDelete(item); }}
          className="catelog-card-delete-btn"
        >
          Delete
        </button>
      </div>
    </motion.div>
    </>
  );
}
