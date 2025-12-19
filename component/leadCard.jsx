"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function LeadCard({ lead, onDelete }) {
  const router = useRouter();

  const openDetails = () => {
    // navigate to a lead details page if you have one
    const id = encodeURIComponent(lead.id || lead._id || lead.id);
    router.push(`/admin/initiallead/updatelead?id=${id}`);
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      whileHover={{ scale: 1.02 }}
      className="overflow-hidden flex flex-col"
      style={{ backgroundColor: '#ffffff', borderRadius: '10px', boxShadow: '0 10px 30px rgba(16,16,16,0.08)', border: '1px solid #e9e6e3' }}
    >
      <div onClick={openDetails} className="cursor-pointer p-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold" style={{ color: '#111111' }}>{lead.name}</h3>
            <p className="text-xs mt-1" style={{ color: '#8f8f8f' }}>{lead.address}</p>
            <div className="text-xs mt-2" style={{ color: '#8f8f8f' }}>Contact: <span style={{ color: '#111111', fontWeight:600 }}>{lead.contactNumber}</span></div>
          </div>

          <div className="flex flex-col items-end gap-2">
            <span style={{
              fontSize: 12,
              padding: '4px 8px',
              borderRadius: 8,
              backgroundColor: lead.architectStatus === 'Account Created' ? 'rgba(32, 197, 94,0.08)' : 'rgba(224,123,99,0.06)',
              color: lead.architectStatus === 'Account Created' ? '#20c55e' : '#e07b63',
              fontWeight: 600
            }}>
              {lead.architectStatus}
            </span>
            <span style={{
              fontSize: 12,
              padding: '4px 8px',
              borderRadius: 8,
              backgroundColor: lead.leadStatus === 'Hot' ? 'rgba(224,123,99,0.12)' : lead.leadStatus === 'Closed' ? 'rgba(100,100,100,0.08)' : lead.leadStatus === 'Follow Up' ? 'rgba(255,165,0,0.08)' : 'rgba(100,150,200,0.08)',
              color: lead.leadStatus === 'Hot' ? '#e07b63' : lead.leadStatus === 'Closed' ? '#666666' : lead.leadStatus === 'Follow Up' ? '#ff8c00' : '#1696d1',
              fontWeight: 600
            }}>
              {lead.leadStatus}
            </span>
          </div>
        </div>
      </div>

      <div className="flex gap-3 justify-end p-3" style={{ borderTop: '1px solid #e9e6e3' }}>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete && onDelete(lead); }}
          className="text-white text-sm px-3 py-1 rounded-[10px] transition font-semibold"
          style={{ backgroundColor: '#e07b63' }}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#d56a52'}
          onMouseLeave={(e) => e.target.style.backgroundColor = '#e07b63'}
          aria-label={`Delete lead ${lead.name}`}
        >
          Delete
        </button>
      </div>
    </motion.article>
  );
}
