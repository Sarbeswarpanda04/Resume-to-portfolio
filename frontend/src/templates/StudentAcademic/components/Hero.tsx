import React from 'react';
import { motion } from 'framer-motion';
import { Download, Mail } from 'lucide-react';
import { ComponentProps } from '../types';

const Hero: React.FC<ComponentProps> = ({ data, theme }) => {
  return (
    <section id="home" className="min-h-screen flex items-center justify-center px-6 pt-20 bg-gradient-to-b from-blue-50 to-white">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-3xl mx-auto text-center"
      >
        {/* Name */}
        <h1 className="text-5xl md:text-6xl font-bold mb-3" style={{ color: theme.primaryColor }}>
          {data.name}
        </h1>

        {/* Degree & Specialization */}
        <p className="text-xl md:text-2xl text-gray-700 mb-2">
          {data.degree || data.title || 'Bachelor of Technology'}
        </p>

        {/* Institution */}
        <p className="text-lg text-gray-600 mb-2">
          {data.institution || 'University Name'}
        </p>

        {/* Academic Year */}
        {data.academicYear && (
          <p className="text-base text-gray-500 mb-6">
            Class of {data.academicYear}
          </p>
        )}

        {/* Short Bio */}
        {data.summary && (
          <p className="text-gray-600 max-w-2xl mx-auto mb-8 leading-relaxed">
            {data.summary.split('.')[0]}.
          </p>
        )}

        {/* CTA Buttons */}
        <motion.div
          className="flex flex-wrap items-center justify-center gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <motion.button
            className="flex items-center gap-2 px-6 py-3 rounded-lg text-white font-medium shadow-md"
            style={{ backgroundColor: theme.primaryColor }}
            whileHover={{ scale: 1.05, boxShadow: '0 10px 25px rgba(0,0,0,0.15)' }}
            whileTap={{ scale: 0.95 }}
          >
            <Download className="w-5 h-5" />
            Download Resume
          </motion.button>
          <motion.button
            className="flex items-center gap-2 px-6 py-3 rounded-lg border-2 font-medium"
            style={{ borderColor: theme.primaryColor, color: theme.primaryColor }}
            whileHover={{ scale: 1.05, backgroundColor: `${theme.primaryColor}10` }}
            whileTap={{ scale: 0.95 }}
          >
            <Mail className="w-5 h-5" />
            Contact
          </motion.button>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default Hero;
