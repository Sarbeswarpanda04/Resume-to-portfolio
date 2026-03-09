import React from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { ComponentProps } from '../types';

interface HeroProps extends ComponentProps {
  scrollToSection: (section: string) => void;
}

const Hero: React.FC<HeroProps> = ({ data, theme, scrollToSection }) => {
  return (
    <section
      id="home"
      className="min-h-screen flex flex-col items-center justify-center px-6 pt-20"
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center"
      >
        <h1 className="text-6xl md:text-8xl font-bold mb-4" style={{ color: theme.primaryColor }}>
          {data.name}
        </h1>
        <p className="text-xl md:text-2xl text-gray-600 mb-3">
          {data.title || 'Full Stack Developer'}
        </p>
        <p className="text-base text-gray-500 mb-8 max-w-xl mx-auto">
          {data.summary?.split('.')[0] || 'Creating beautiful digital experiences'}
        </p>

        {/* CTA Buttons */}
        <motion.div
          className="flex flex-wrap items-center justify-center gap-4 mb-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <motion.button
            onClick={() => scrollToSection('projects')}
            className="px-6 py-3 rounded-lg text-white font-medium"
            style={{ backgroundColor: theme.primaryColor }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            View Projects
          </motion.button>
          <motion.button
            onClick={() => scrollToSection('contact')}
            className="px-6 py-3 rounded-lg border-2 font-medium"
            style={{ borderColor: theme.primaryColor, color: theme.primaryColor }}
            whileHover={{ scale: 1.05, backgroundColor: `${theme.primaryColor}10` }}
            whileTap={{ scale: 0.95 }}
          >
            Contact Me
          </motion.button>
        </motion.div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.button
        onClick={() => scrollToSection('about')}
        className="absolute bottom-8"
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        <ChevronDown className="w-8 h-8 text-gray-400" />
      </motion.button>
    </section>
  );
};

export default Hero;
