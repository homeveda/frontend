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
          <motion.div
            initial={{ opacity: 0, x: -24, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -24, scale: 0.95 }}
            transition={{ duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
            style={{
              position: "fixed",
              top: "16px",
              left: "16px",
              zIndex: 9999,
              fontFamily: "'Space Grotesk', sans-serif",
            }}
          >
            <motion.button
              whileHover={{ scale: 1.08, boxShadow: "0 8px 28px rgba(224,123,99,0.35)" }}
              whileTap={{ scale: 0.93 }}
              onClick={() => router.push("/admin/dashboard")}
              title="Back to Dashboard"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "44px",
                height: "44px",
                padding: 0,
                background: "linear-gradient(135deg, #e07b63 0%, #d05c44 100%)",
                border: "none",
                borderRadius: "50%",
                boxShadow: "0 4px 16px rgba(224,123,99,0.4), 0 1px 4px rgba(16,16,16,0.10)",
                cursor: "pointer",
                outline: "none",
              }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
      {children}
    </>
  );
}
