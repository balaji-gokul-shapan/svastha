import { motion } from "framer-motion";

import { Card } from "@/components/ui/card";

export const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55 },
  },
};

// Animated version of the shadcn <Card>. Rendered lazily so importing
// this module never pays the cost unless a card is actually mounted.
const MotionCard = motion.create(Card);

export function FramerCard({
  children,
  className = "",
  // When true, renders the real shadcn <Card> (keeps its rounded border,
  // bg-card surface and shadow) wrapped in motion. Default keeps the old
  // bare motion.div behaviour used by the health-check screening pages.
  asCard = false,
}) {
  const Component = asCard ? MotionCard : motion.div;

  return (
    <Component
      className={className}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{
        y: -3,
        transition: {
          duration: 0.2,
          ease: "easeOut",
        },
      }}
      transition={{
        duration: 0.35,
        ease: "easeOut",
      }}
    >
      {children}
    </Component>
  );
}