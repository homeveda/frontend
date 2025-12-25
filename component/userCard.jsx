import { motion } from "framer-motion";

export default function UserCard({ user, onClick }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      whileHover={{ scale: 1.02 }}
      className="overflow-hidden flex flex-col relative cursor-pointer"
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => { if (onClick && (e.key === 'Enter' || e.key === ' ')) onClick(); }}
      style={{ backgroundColor: '#ffffff', borderRadius: '10px', boxShadow: '0 10px 30px rgba(16,16,16,0.08)', border: '1px solid #e9e6e3' }}
    >
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
    </motion.article>
  );
}
