import React from 'react';
import { motion } from 'framer-motion';
import { ChevronUp } from 'lucide-react';

interface BackToTopProps {
  show: boolean;
  primaryColor: string;
  onClick: () => void;
}

const BackToTop: React.FC<BackToTopProps> = ({ show, primaryColor, onClick }) => {
  if (!show) return null;

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0 }}
      onClick={onClick}
      className="fixed bottom-8 right-8 p-4 rounded-full shadow-lg z-50"
      style={{ backgroundColor: primaryColor }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
    >
      <ChevronUp className="w-6 h-6 text-white" />
    </motion.button>
  );
};

export default BackToTop;
