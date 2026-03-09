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
          initial={{ opacity: 0, scale: 0, rotate: -180 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          exit={{ opacity: 0, scale: 0, rotate: 180 }}
          onClick={onClick}
          className="fixed bottom-8 right-8 w-14 h-14 rounded-full shadow-2xl z-40 flex items-center justify-center"
          style={{ backgroundColor: primaryColor }}
          whileHover={{
            scale: 1.15,
            boxShadow: `0 0 40px ${primaryColor}`,
          }}
          whileTap={{ scale: 0.9 }}
        >
          <ChevronUp className="w-7 h-7 text-white" />
        </motion.button>
      )}
    </AnimatePresence>
  );
};

export default BackToTop;
