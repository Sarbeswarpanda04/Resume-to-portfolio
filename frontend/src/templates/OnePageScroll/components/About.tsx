import React from 'react';
import { motion } from 'framer-motion';
import { User } from 'lucide-react';
import { ComponentProps } from '../types';

const About: React.FC<ComponentProps> = ({ data, theme }) => {
  if (!theme.sections?.about || !data.summary) return null;

  return (
    <section id="about" className="min-h-screen flex items-center justify-center px-6 py-20">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.6 }}
        className="max-w-2xl mx-auto text-center"
      >
        <div className="flex items-center justify-center gap-2 mb-6">
          <User className="w-6 h-6" style={{ color: theme.primaryColor }} />
          <h2 className="text-3xl font-bold" style={{ color: theme.primaryColor }}>
            Profile Summary
          </h2>
        </div>
        <p className="text-lg text-gray-700 leading-relaxed">{data.summary}</p>
      </motion.div>
    </section>
  );
};

export default About;
