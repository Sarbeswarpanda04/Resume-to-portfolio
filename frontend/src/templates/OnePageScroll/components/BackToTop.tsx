import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp } from 'lucide-react';

interface BackToTopProps {
  show: boolean;
  primaryColor: string;
  onClick: () => void;
}

const BackToTop: React.FC<BackToTopProps> = ({ show, primaryColor, onClick }) => {
  return (
    <AnimatePresence>
      {show && (
        <motion.button
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0 }}
          onClick={onClick}
          className="fixed bottom-8 right-8 p-3 rounded-full shadow-lg z-40"
          style={{ backgroundColor: primaryColor }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <ChevronUp className="w-6 h-6 text-white" />
        </motion.button>
      )}
    </AnimatePresence>
  );
};

export default BackToTop;
