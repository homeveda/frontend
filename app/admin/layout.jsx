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
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            style={{
              position: "fixed",
              top: "16px",
              left: "16px",
              zIndex: 9999,
              fontFamily: "'Space Grotesk', sans-serif",
            }}
          >
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => router.push("/admin/dashboard")}
              title="Back to Dashboard"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 18px",
                background: "rgba(255,255,255,0.85)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                color: "#111",
                border: "1px solid rgba(224,123,99,0.25)",
                borderRadius: "50px",
                fontWeight: "600",
                fontSize: "13px",
                boxShadow: "0 4px 20px rgba(16,16,16,0.10), 0 1px 4px rgba(224,123,99,0.15)",
                cursor: "pointer",
                letterSpacing: "-0.01em",
              }}
            >
              {/* Home icon */}
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "28px",
                  height: "28px",
                  borderRadius: "50%",
                  backgroundColor: "#e07b63",
                  flexShrink: 0,
                }}
              >
                <svg
                  width="x"
                  height="14"
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
              </span>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
      {children}
    </>
  );
}
