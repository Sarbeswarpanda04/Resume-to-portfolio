import React from 'react';
import { motion } from 'framer-motion';
import { Briefcase } from 'lucide-react';
import { ComponentProps } from '../types';

const Experience: React.FC<ComponentProps> = ({ data, theme }) => {
  if (!theme.sections?.experience || !data.experience?.length) return null;

  return (
    <section id="experience" className="min-h-screen flex items-center justify-center px-6 py-16">
      <div className="max-w-3xl mx-auto w-full">
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

          <div className="space-y-6">
            {data.experience.map((exp: any, index: number) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative pl-6 border-l-2"
                style={{ borderColor: theme.primaryColor }}
              >
                <div
                  className="absolute w-3 h-3 rounded-full -left-[7px] top-1"
                  style={{ backgroundColor: theme.primaryColor }}
                />
                <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-1">
                  <div>
                    <h3 className="text-lg font-semibold leading-snug">{exp.title}</h3>
                    <p className="text-sm text-gray-700 font-medium">{exp.company}</p>
                  </div>
                  {exp.duration && (
                    <p className="text-sm text-gray-600 font-medium whitespace-nowrap">{exp.duration}</p>
                  )}
                </div>
                {exp.description && (
                  <p className="mt-2 text-gray-700 text-sm leading-relaxed">{exp.description}</p>
                )}
                {exp.responsibilities && (
                  <ul className="mt-2 space-y-1">
                    {exp.responsibilities.slice(0, 3).map((item: string, i: number) => (
                      <li key={i} className="text-sm text-gray-700 leading-snug flex items-start gap-2">
                        <span className="mt-0.5" style={{ color: theme.primaryColor }}>•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
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
