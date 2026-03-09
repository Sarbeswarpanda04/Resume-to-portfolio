import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen } from 'lucide-react';
import { ComponentProps } from '../types';

const AcademicSummary: React.FC<ComponentProps> = ({ data, theme }) => {
  if (!data.summary) return null;

  return (
    <section id="about" className="py-16 px-6 bg-white">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.6 }}
        className="max-w-3xl mx-auto"
      >
        <div className="flex items-center justify-center gap-2 mb-6">
          <BookOpen className="w-6 h-6" style={{ color: theme.primaryColor }} />
          <h2 className="text-3xl font-bold" style={{ color: theme.primaryColor }}>
            Profile Summary
          </h2>
        </div>

        <div
          className="bg-blue-50 border-l-4 rounded-lg p-6"
          style={{ borderColor: theme.primaryColor }}
        >
          <p className="text-gray-700 leading-relaxed text-center">
            {data.summary}
          </p>
        </div>
      </motion.div>
    </section>
  );
};

export default AcademicSummary;
