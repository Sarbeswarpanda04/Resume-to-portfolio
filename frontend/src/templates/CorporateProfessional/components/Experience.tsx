import React from 'react';
import { motion } from 'framer-motion';
import { Briefcase, Calendar, CheckCircle, TrendingUp } from 'lucide-react';
import { Experience as ExperienceType } from '../types';

interface ExperienceProps {
  experience: ExperienceType[];
}

const Experience: React.FC<ExperienceProps> = ({ experience }) => {
  return (
    <section id="experience" className="py-12 bg-gray-50">
      <div className="max-w-5xl mx-auto px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          {/* Section Header */}
          <div className="flex items-center gap-3 mb-12">
            <Briefcase className="w-8 h-8 text-blue-900" />
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Professional Experience
            </h2>
          </div>

          {/* Timeline */}
          <div className="relative">
            {/* Vertical Line */}
            <div className="absolute left-0 md:left-8 top-0 bottom-0 w-0.5 bg-gray-300"></div>

            {/* Experience Items */}
            <div className="space-y-8">
              {experience.map((exp, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="relative pl-8 md:pl-20"
                >
                  {/* Timeline Node */}
                  <div className="absolute left-0 md:left-6 w-5 h-5 bg-blue-900 rounded-full border-4 border-white shadow-md"></div>

                  {/* Content Card */}
                  <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow">
                    {/* Header */}
                    <div className="mb-3">
                      <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2 leading-snug">
                        {exp.title}
                      </h3>

                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 text-gray-600">
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                          <span className="font-semibold text-blue-900">{exp.company}</span>
                          {exp.current && (
                            <span className="px-3 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full whitespace-nowrap">
                              Current
                            </span>
                          )}
                        </div>

                        {exp.duration && (
                          <span className="flex items-center gap-1 text-sm whitespace-nowrap sm:justify-end">
                            <Calendar className="w-4 h-4" />
                            {exp.duration}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Responsibilities */}
                    {exp.responsibilities && exp.responsibilities.length > 0 && (
                      <div className="mb-3">
                        <h4 className="text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wide">
                          Key Responsibilities
                        </h4>
                        <ul className="space-y-1">
                          {exp.responsibilities.map((resp, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-gray-700">
                              <CheckCircle className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                              <span className="text-sm leading-snug">{resp}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Achievements */}
                    {exp.achievements && exp.achievements.length > 0 && (
                      <div>
                        <h4 className="text-xs font-semibold text-blue-900 mb-1 uppercase tracking-wide flex items-center gap-2">
                          <TrendingUp className="w-4 h-4" />
                          Key Achievements
                        </h4>
                        <ul className="space-y-1">
                          {exp.achievements.map((achievement, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-gray-700">
                              <CheckCircle className="w-4 h-4 text-blue-900 flex-shrink-0 mt-0.5" />
                              <span className="text-sm font-medium leading-snug">{achievement}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Experience;
