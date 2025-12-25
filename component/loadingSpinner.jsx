import { motion } from "framer-motion";

export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-8">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="w-10 h-10 border-4 rounded-full"
        style={{
          borderColor: "#e9e6e3",
          borderTopColor: "#e07b63",
        }}
      />
      <motion.span
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        className="ml-4 text-sm font-medium"
        style={{ color: "#8f8f8f" }}
      >
        Loading...
      </motion.span>
    </div>
  );
}
