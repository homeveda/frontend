"use client";

import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function ConfirmationDialogueBox({
  open,
  title = "Are you sure?",
  description = "This action cannot be undone.",
  confirmText = "Yes",
  cancelText = "No",
  onConfirm,
  onCancel,
  closeOnEscape = true,
}) {
  const dialogRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const previousActive = document.activeElement;
    // focus first focusable inside
    const timer = setTimeout(() => {
      const btn = dialogRef.current?.querySelector('button');
      btn?.focus();
    }, 50);

    const handleKey = (e) => {
      if (e.key === "Escape" && closeOnEscape) {
        onCancel && onCancel();
      }
    };

    document.addEventListener("keydown", handleKey);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("keydown", handleKey);
      previousActive?.focus?.();
    };
  }, [open, onCancel, closeOnEscape]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
        >
          <motion.div
            initial={{ scale: 0.98, y: 8, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.98, y: 8, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="relative z-50 max-w-lg w-full mx-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
            aria-describedby="confirm-desc"
            ref={dialogRef}
          >
            <div className="overflow-hidden" style={{ backgroundColor: '#ffffff', borderRadius: '14px', boxShadow: '0 10px 30px rgba(16,16,16,0.08)', border: '1px solid #e9e6e3' }}>
              <div className="p-5">
                <h3 id="confirm-title" className="text-lg font-semibold" style={{ color: '#111111', fontFamily: "'Space Grotesk', sans-serif" }}>{title}</h3>
                <p id="confirm-desc" className="text-sm mt-2" style={{ color: '#8f8f8f' }}>{description}</p>
              </div>

              <div className="px-5 pb-4 pt-0 flex justify-end gap-3">
                <button
                  onClick={() => onCancel && onCancel()}
                  className="px-3 py-2 rounded-[10px] text-sm transition font-semibold"
                  style={{ backgroundColor: '#f0f0f0', color: '#111111' }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#e8e8e8'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#f0f0f0'}
                >
                  {cancelText}
                </button>
                <button
                  onClick={() => onConfirm && onConfirm()}
                  className="px-3 py-2 rounded-[10px] text-sm text-white transition font-semibold"
                  style={{ backgroundColor: '#e07b63' }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#d56a52'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#e07b63'}
                >
                  {confirmText}
                </button>
              </div>
            </div>

            {/* backdrop */}
            <motion.div
              onClick={() => onCancel && onCancel()}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 bg-blur-sm bg-black z-[-1]"
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
