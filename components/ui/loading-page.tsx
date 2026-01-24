"use client";

import { motion } from "framer-motion";
import { ModernSpinner } from "./loading-spinner";

export function LoadingPage() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col items-center gap-4"
      >
        <ModernSpinner size="lg" variant="primary" />
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-sm font-medium text-gray-600"
        >
          Loading...
        </motion.p>
      </motion.div>
    </div>
  );
}

