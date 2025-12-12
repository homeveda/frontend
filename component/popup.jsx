"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IoClose } from "react-icons/io5";

const colorVariants = {
  red: "bg-red-50 text-red-600 border-red-100",
  green: "bg-green-50 text-green-600 border-green-100",
  yellow: "bg-yellow-50 text-yellow-600 border-yellow-100"
};

const progressColorVariants = {
  red: "bg-red-600/20",
  green: "bg-green-600/20",
  yellow: "bg-yellow-600/20"
};

const iconColorVariants = {
  red: "bg-red-100 hover:bg-red-200",
  green: "bg-green-100 hover:bg-green-200",
  yellow: "bg-yellow-100 hover:bg-yellow-200"
};

export default function Popup({ 
  message, 
  color = "green", 
  onClose,
  autoClose = true,
  duration = 5000 
}) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (autoClose && isVisible) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        if (onClose) onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [autoClose, duration, isVisible, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    if (onClose) onClose();
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
          className={`fixed top-4 right-4 z-50 flex flex-col gap-1 rounded-lg border ${colorVariants[color]} shadow-sm max-w-[calc(100vw-2rem)] w-auto min-w-[300px] overflow-hidden`}
        >
          <div className="flex items-center justify-between gap-3 px-4 py-3">
            <p className="text-sm font-medium pr-4">{message}</p>
            <button
              onClick={handleClose}
              className={`rounded-full p-1.5 transition-colors ${iconColorVariants[color]}`}
              aria-label="Close notification"
            >
              <IoClose size={16} />
            </button>
          </div>
          
          {autoClose && (
            <div className="w-full h-1 bg-gray-100 rounded-b-lg overflow-hidden">
              <motion.div
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ duration: duration / 1000, ease: "linear" }}
                className={`h-full ${progressColorVariants[color]}`}
                aria-label="Notification will close automatically"
              />
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Usage example:
/*
import Popup from '@/components/popup';

export default function YourComponent() {
  const [showPopup, setShowPopup] = useState(false);
  
  return (
    <div>
      {showPopup && (
        <Popup
          message="Operation completed successfully!"
          color="green" // 'red' | 'green' | 'yellow'
          onClose={() => setShowPopup(false)}
          autoClose={true} // optional, defaults to true
          duration={5000} // optional, defaults to 5000ms
        />
      )}
      <button onClick={() => setShowPopup(true)}>
        Show Popup
      </button>
    </div>
  );
}
*/