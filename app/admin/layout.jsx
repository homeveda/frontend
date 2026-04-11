"use client";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();

  // Show the Dashboard home button only on sub-pages, not root admin (login) or the dashboard itself
  const showBtn = pathname && pathname !== "/admin" && pathname !== "/admin/dashboard";

  return (
    <>
      <AnimatePresence>
        {showBtn && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push("/admin/dashboard")}
            style={{
              position: "fixed",
              bottom: "30px",
              right: "30px",
              zIndex: 9999,
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "12px 20px",
              backgroundColor: "#e07b63",
              color: "white",
              border: "none",
              borderRadius: "50px",
              fontWeight: "600",
              fontSize: "15px",
              boxShadow: "0 6px 16px rgba(224, 123, 99, 0.4)",
              cursor: "pointer",
              fontFamily: "'Space Grotesk', sans-serif",
            }}
          >
            <svg 
              width="20" 
              height="20" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
            Dashboard
          </motion.button>
        )}
      </AnimatePresence>
      {children}
    </>
  );
}
