import React from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, TrendingUp } from 'lucide-react';
import { ComponentProps } from '../types';

const EducationTimeline: React.FC<ComponentProps> = ({ data, theme }) => {
  if (!theme.sections?.education || !data.education?.length) return null;

  return (
    <section id="education" className="py-20 px-6 bg-gradient-to-b from-white to-blue-50">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-center gap-2 mb-12">
            <GraduationCap className="w-7 h-7" style={{ color: theme.primaryColor }} />
            <h2 className="text-3xl font-bold" style={{ color: theme.primaryColor }}>
              Education
            </h2>
          </div>

          <div className="space-y-10">
            {data.education.map((edu: any, index: number) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="relative pl-10 md:pl-16"
              >
                {/* Timeline Line */}
                {index < data.education!.length - 1 && (
                  <div
                    className="absolute left-[19px] md:left-[31px] top-12 bottom-0 w-0.5"
                    style={{ backgroundColor: `${theme.primaryColor}40` }}
                  />
                )}

                {/* Timeline Node */}
                <motion.div
                  className="absolute left-3 md:left-5 top-3 w-5 h-5 rounded-full border-4 border-white shadow-md"
                  style={{ backgroundColor: theme.primaryColor }}
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2 + 0.3 }}
                />

                {/* Content Card */}
                <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-800 mb-1">
                        {edu.degree}
                      </h3>
                      <p className="text-gray-600 font-medium mb-1">
                        {edu.institution}
                      </p>
                      <p className="text-sm text-gray-500">{edu.year}</p>
                    </div>

                    {/* GPA Badge */}
                    {(edu.gpa || edu.cgpa) && (
                      <motion.div
                        className="mt-3 md:mt-0 inline-flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-lg"
                        style={{ 
                          backgroundColor: `${theme.primaryColor}15`, 
                          color: theme.primaryColor 
                        }}
                        whileHover={{ scale: 1.05 }}
                      >
                        <TrendingUp className="w-5 h-5" />
                        {edu.gpa ? `GPA: ${edu.gpa}` : `CGPA: ${edu.cgpa}`}
                      </motion.div>
                    )}
                  </div>

                  {/* Description */}
                  {edu.description && (
                    <p className="text-gray-700 mb-3 text-sm">
                      {edu.description}
                    </p>
                  )}

                  {/* Highlights */}
                  {edu.highlights && edu.highlights.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-semibold text-gray-700 mb-2">
                        Academic Highlights:
                      </p>
                      <ul className="space-y-1">
                        {edu.highlights.map((highlight: string, i: number) => (
                          <li
                            key={i}
                            className="text-sm text-gray-600 flex items-start gap-2"
                          >
                            <span style={{ color: theme.primaryColor }}>•</span>
                            {highlight}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default EducationTimeline;
