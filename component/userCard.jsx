import { motion } from "framer-motion";

export default function UserCard({ user, onEdit, onDelete, onProjects }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      whileHover={{ scale: 1.02 }}
      className="overflow-hidden flex flex-col relative"
      style={{ backgroundColor: '#ffffff', borderRadius: '10px', boxShadow: '0 10px 30px rgba(16,16,16,0.08)', border: '1px solid #e9e6e3' }}
    >
      <style>{`
        .user-card-actions{display:flex;gap:8px;padding:0 16px 16px 16px;flex-wrap:wrap}
        .user-card-btn{padding:6px 14px;border-radius:8px;font-size:12px;font-weight:600;border:none;cursor:pointer;transition:all 0.2s ease;font-family:'Space Grotesk',sans-serif;display:inline-flex;align-items:center;gap:5px}
        .user-card-btn:active{transform:scale(0.97)}
        .user-card-btn-projects{background:rgba(22,150,209,0.1);color:#1696d1}
        .user-card-btn-projects:hover{background:rgba(22,150,209,0.2)}
        .user-card-btn-edit{background:rgba(245,166,35,0.1);color:#d4940a}
        .user-card-btn-edit:hover{background:rgba(245,166,35,0.2)}
        .user-card-btn-delete{background:rgba(224,99,99,0.1);color:#d94444}
        .user-card-btn-delete:hover{background:rgba(224,99,99,0.2)}
        @media(max-width:480px){
          .user-card-actions{padding:0 12px 12px 12px;gap:6px}
          .user-card-btn{padding:5px 10px;font-size:11px}
        }
      `}</style>

      <div style={{ position: 'absolute', top: 10, right: 10 }}>
        <span style={{
          fontSize: 12,
          padding: '4px 8px',
          borderRadius: 8,
          backgroundColor: user?.isAdmin ? 'rgba(32,197,94,0.08)' : 'rgba(100,150,200,0.08)',
          color: user?.isAdmin ? '#20c55e' : '#1696d1',
          fontWeight: 600
        }}>{user?.isAdmin ? 'Admin' : 'User'}</span>
      </div>

      <div className="p-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-xl font-semibold" style={{ color: '#111111' }}>{user?.name}</h3>
            <p className="text-base mt-1" style={{ color: '#8f8f8f' }}>{user?.email}</p>
            {user?.address && (
              <p className="text-sm mt-1" style={{ color: '#8f8f8f' }}>{user.address}</p>
            )}
            {user?.phone && (
              <div className="text-base mt-2" style={{ color: '#8f8f8f' }}>
                Phone: <span style={{ color: '#111111', fontWeight: 600 }}>{user.phone}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="user-card-actions">
        {onProjects && (
          <button
            className="user-card-btn user-card-btn-projects"
            onClick={(e) => { e.stopPropagation(); onProjects(user); }}
            title="View Projects"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
            Projects
          </button>
        )}
        {onEdit && (
          <button
            className="user-card-btn user-card-btn-edit"
            onClick={(e) => { e.stopPropagation(); onEdit(user); }}
            title="Edit User"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            Edit
          </button>
        )}
        {onDelete && (
          <button
            className="user-card-btn user-card-btn-delete"
            onClick={(e) => { e.stopPropagation(); onDelete(user); }}
            title="Delete User"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
            Delete
          </button>
        )}
      </div>
    </motion.article>
  );
}
