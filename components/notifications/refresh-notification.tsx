"use client";

import { useState, useEffect } from "react";
import { CheckCircle, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface RefreshNotificationProps {
  message: string;
  onClose: () => void;
  isVisible: boolean;
  successful?: number;
  failed?: number;
}

export function RefreshNotification({
  message,
  onClose,
  isVisible,
  successful = 0,
  failed = 0
}: RefreshNotificationProps) {
  const [visible, setVisible] = useState(isVisible);

  useEffect(() => {
    setVisible(isVisible);
    
    if (isVisible) {
      // Auto-hide after 5 seconds
      const timer = setTimeout(() => {
        setVisible(false);
        onClose();
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="fixed top-4 right-4 z-50 max-w-md w-full shadow-lg rounded-lg overflow-hidden"
        >
          <div className="relative bg-white dark:bg-gray-800 border-l-4 border-green-500 p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <CheckCircle className="h-6 w-6 text-green-500" />
              </div>
              <div className="ml-3 w-full pr-6">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {message}
                </p>
                {(successful > 0 || failed > 0) && (
                  <div className="mt-2 space-y-1">
                    {successful > 0 && (
                      <p className="text-xs text-gray-600 dark:text-gray-300">
                        ✓ Successfully updated {successful} platform{successful !== 1 ? 's' : ''}
                      </p>
                    )}
                    {failed > 0 && (
                      <p className="text-xs text-red-500">
                        ✗ Failed to update {failed} platform{failed !== 1 ? 's' : ''}
                      </p>
                    )}
                  </div>
                )}
              </div>
              <button
                onClick={() => {
                  setVisible(false);
                  onClose();
                }}
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 dark:text-gray-300 dark:hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-1 w-full bg-gray-100 dark:bg-gray-700 h-1">
              <motion.div
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ duration: 5, ease: "linear" }}
                className="h-full bg-green-500"
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 