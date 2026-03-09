import React from 'react';
import { motion } from 'framer-motion';
import { GraduationCap } from 'lucide-react';
import { ComponentProps } from '../types';

const Education: React.FC<ComponentProps> = ({ data, theme }) => {
  if (!theme.sections?.education || !data.education?.length) return null;

  return (
    <section id="education" className="py-20 px-6 bg-gray-800">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8 }}
        >
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <GraduationCap className="w-8 h-8" style={{ color: theme.primaryColor }} />
              <h2 className="text-5xl font-bold text-white">Education</h2>
            </div>
            <p className="text-xl text-gray-400">Academic background</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {data.education.map((edu, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.08 }}
                className="bg-gray-900 rounded-2xl p-6 border border-white/10"
                whileHover={{ y: -4, boxShadow: `0 10px 40px ${theme.primaryColor}30` }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1 leading-snug">{edu.degree}</h3>
                    <p className="text-gray-300 text-sm">{edu.institution}</p>
                  </div>
                  {edu.year && (
                    <p className="text-sm whitespace-nowrap" style={{ color: theme.primaryColor }}>
                      {edu.year}
                    </p>
                  )}
                </div>
                {edu.description && (
                  <p className="text-gray-400 mt-3 text-sm leading-relaxed">{edu.description}</p>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Education;
