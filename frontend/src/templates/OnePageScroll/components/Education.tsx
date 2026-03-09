import React from 'react';
import { motion } from 'framer-motion';
import { GraduationCap } from 'lucide-react';
import { ComponentProps } from '../types';

const Education: React.FC<ComponentProps> = ({ data, theme }) => {
  if (!theme.sections?.education || !data.education?.length) return null;

  return (
    <section id="education" className="min-h-screen flex items-center justify-center px-6 py-16">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.6 }}
        className="max-w-3xl w-full mx-auto"
      >
        <div className="flex items-center justify-center gap-2 mb-8">
          <GraduationCap className="w-6 h-6" style={{ color: theme.primaryColor }} />
          <h2 className="text-3xl font-bold" style={{ color: theme.primaryColor }}>
            Education
          </h2>
        </div>

        <div className="space-y-5">
          {data.education.map((edu: any, index: number) => (
            <div
              key={index}
              className="bg-white/70 backdrop-blur-md rounded-xl border p-5"
              style={{ borderColor: `${theme.primaryColor}30` }}
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h3 className="text-base font-semibold text-gray-900 leading-snug">{edu.degree}</h3>
                  <p className="text-sm text-gray-700">{edu.institution}</p>
                </div>
                {edu.year && <p className="text-sm font-medium text-gray-600 whitespace-nowrap">{edu.year}</p>}
              </div>
              {edu.description && <p className="mt-2 text-gray-700 text-sm leading-relaxed">{edu.description}</p>}
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
};

export default Education;
