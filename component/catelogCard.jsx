"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function CatelogCard({ item, onDelete }) {
  const router = useRouter();

  const handleClick = () => {
    const name = encodeURIComponent(item.name);
    router.push(`/admin/catelog/updateitem?name=${name}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      whileHover={{ scale: 1.02 }}
      className="overflow-hidden flex flex-col"
      style={{ backgroundColor: '#ffffff', borderRadius: '10px', boxShadow: '0 10px 30px rgba(16,16,16,0.08)', border: '1px solid #e9e6e3' }}
    >
      <div
        onClick={handleClick}
        className="cursor-pointer p-3 flex flex-col gap-3"
      >
        <div className="w-full h-48 flex items-center justify-center bg-gray-50">
          
            <img
              src={item.imageLink}
              alt={item.name}
              className="max-w-full max-h-full object-contain"
            />
        </div>

        <div className="px-1 pb-2">
          <h3 className="text-sm font-semibold leading-tight" style={{ color: '#111111', fontFamily: "'Space Grotesk', sans-serif" }}>{item.name}</h3>
          <p className="text-xs mt-1 line-clamp-2" style={{ color: '#8f8f8f' }}>{item.description || ""}</p>
          <div className="flex items-center justify-between mt-3">
            <div className="font-semibold" style={{ color: '#e07b63' }}>₹{item.price}</div>
            <div className="text-xs px-2 py-1 rounded" style={{ color: '#8f8f8f', backgroundColor: 'rgba(224,123,99,0.1)' }}>{item.type}</div>
          </div>
          <div>{item.workType}</div>
        </div>
      </div>

      <div className="flex gap-3 justify-end p-3" style={{ borderTop: '1px solid #e9e6e3' }}>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete && onDelete(item); }}
          className="text-white text-sm px-3 py-1 rounded-[10px] transition font-semibold"
          style={{ backgroundColor: '#e07b63' }}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#d56a52'}
          onMouseLeave={(e) => e.target.style.backgroundColor = '#e07b63'}
        >
          Delete
        </button>
      </div>
    </motion.div>
  );
}
