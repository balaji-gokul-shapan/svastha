"use client";

import { motion } from "framer-motion";

/**
 * Route-change transition for the content container.
 *
 * Templates are given a unique key per navigation and REMOUNT every time the
 * route segment changes (see next/dist/docs template.md), so this enter
 * animation reliably plays on every page switch. AnimatePresence in the
 * layout never fires here because layouts persist across routes.
 */
export default function Template({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: [0.22, 0.61, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}