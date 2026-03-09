import React from 'react';
import { motion } from 'framer-motion';
import { Briefcase } from 'lucide-react';
import { ComponentProps } from '../types';

const Experience: React.FC<ComponentProps> = ({ data, theme }) => {
  if (!theme.sections?.experience || !data.experience?.length) return null;

  return (
    <section id="experience" className="py-14 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-center gap-2 mb-8">
            <Briefcase className="w-6 h-6" style={{ color: theme.primaryColor }} />
            <h2 className="text-3xl font-bold" style={{ color: theme.primaryColor }}>
              Experience
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {data.experience.map((exp: any, idx: number) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.08 }}
                className="bg-white rounded-xl p-5 shadow-md border-2 border-transparent hover:border-current transition-all"
                whileHover={{ y: -4, borderColor: theme.primaryColor }}
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 leading-snug">{exp.title}</h3>
                    <p className="text-gray-600 font-medium">{exp.company}</p>
                  </div>
                  {exp.duration && <p className="text-sm text-gray-500 whitespace-nowrap">{exp.duration}</p>}
                </div>

                {exp.description && (
                  <p className="text-gray-600 text-sm leading-relaxed">{exp.description}</p>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Experience;
