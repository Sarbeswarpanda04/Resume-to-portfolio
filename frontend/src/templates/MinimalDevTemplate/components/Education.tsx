import React from 'react';
import { motion } from 'framer-motion';
import { GraduationCap } from 'lucide-react';
import { ComponentProps } from '../types';

const Education: React.FC<ComponentProps> = ({ data, theme }) => {
  if (!theme.sections?.education || !data.education?.length) return null;

  return (
    <section id="education" className="py-16 px-6 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8 justify-center">
          <GraduationCap className="w-8 h-8" style={{ color: theme.primaryColor }} />
          <h2 className="text-4xl font-bold" style={{ color: theme.primaryColor }}>
            Education
          </h2>
        </div>

        <div className="space-y-5">
          {data.education.map((edu: any, index: number) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl border p-5"
              style={{ borderColor: `${theme.primaryColor}30` }}
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 leading-snug">{edu.degree}</h3>
                  <p className="text-gray-700 text-sm font-medium">{edu.institution}</p>
                </div>
                {edu.year && (
                  <p className="text-sm text-gray-600 font-semibold whitespace-nowrap">{edu.year}</p>
                )}
              </div>
              {edu.description && (
                <p className="mt-2 text-gray-700 text-sm leading-relaxed">{edu.description}</p>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Education;
