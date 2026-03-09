import React from 'react';
import { motion } from 'framer-motion';
import { Briefcase } from 'lucide-react';
import { ComponentProps } from '../types';

const Experience: React.FC<ComponentProps> = ({ data, theme }) => {
  if (!theme.sections?.experience || !data.experience?.length) return null;

  return (
    <section id="experience" className="py-20 px-6 bg-gray-900">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Briefcase className="w-8 h-8" style={{ color: theme.primaryColor }} />
            <h2 className="text-5xl font-bold text-white">
              Experience
            </h2>
          </div>
          <p className="text-xl text-gray-400">
            Brands & clients I've worked with
          </p>
        </motion.div>

        {/* Horizontal Scrolling Cards */}
        <div className="overflow-x-auto pb-8 scrollbar-hide">
          <div className="flex gap-6 min-w-max">
            {data.experience.map((exp: any, index: number) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="w-80 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border-2 border-transparent hover:border-current"
                style={{ borderColor: 'transparent' }}
                whileHover={{
                  borderColor: theme.primaryColor,
                  boxShadow: `0 10px 40px ${theme.primaryColor}40`,
                }}
              >
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center mb-3"
                  style={{ backgroundColor: `${theme.primaryColor}20` }}
                >
                  <Briefcase className="w-6 h-6" style={{ color: theme.primaryColor }} />
                </div>

                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-white leading-snug">
                      {exp.title}
                    </h3>
                    <p className="text-base" style={{ color: theme.primaryColor }}>
                      {exp.company}
                    </p>
                  </div>
                  {exp.duration && (
                    <p className="text-sm text-gray-400 whitespace-nowrap">
                      {exp.duration}
                    </p>
                  )}
                </div>

                {exp.description && (
                  <p className="mt-3 text-gray-300 text-sm leading-relaxed">
                    {exp.description}
                  </p>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Experience;
