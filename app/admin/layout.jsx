"use client";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();

  // Show only on sub-pages, not on login or dashboard itself
  const showBtn = pathname && pathname !== "/admin" && pathname !== "/admin/dashboard";

  return (
    <>
      <AnimatePresence>
        {showBtn && (
          <motion.button
            key="dashboard-btn"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => router.push("/admin/dashboard")}
            title="Dashboard"
            style={{
              position: "fixed",
              bottom: "clamp(16px, 4vw, 32px)",
              right: "clamp(16px, 4vw, 32px)",
              zIndex: 9999,
              width: "clamp(44px, 7vw, 60px)",
              height: "clamp(44px, 7vw, 60px)",
              borderRadius: "50%",
              backgroundColor: "#e07b63",
              border: "none",
              cursor: "pointer",
              padding: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 6px 20px rgba(224,123,99,0.45), 0 2px 6px rgba(0,0,0,0.12)",
            }}
          >
            <svg
              width="55%"
              height="55%"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </motion.button>
        )}
      </AnimatePresence>
      {children}
    </>
  );
}
