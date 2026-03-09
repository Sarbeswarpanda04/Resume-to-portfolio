import React from 'react';
import { motion } from 'framer-motion';
import { Briefcase, Calendar, CheckCircle } from 'lucide-react';
import { Experience as ExperienceType } from '../types';

interface ExperienceProps {
  experience: ExperienceType[];
}

const Experience: React.FC<ExperienceProps> = ({ experience }) => {
  return (
    <section id="experience" className="relative py-16 bg-slate-900 overflow-hidden">
      {/* Background effects */}
      <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px]"></div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {/* Section Header */}
          <div className="flex items-center gap-3 mb-10">
            <Briefcase className="w-8 h-8 text-cyan-400" />
            <h2 className="text-4xl md:text-5xl font-bold text-white">
              Work <span className="text-transparent bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text">Experience</span>
            </h2>
          </div>

          {/* Neon Timeline */}
          <div className="relative">
            {/* Animated vertical line */}
            <motion.div
              initial={{ height: 0 }}
              whileInView={{ height: '100%' }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, ease: 'easeOut' }}
              className="absolute left-0 md:left-8 top-0 w-0.5 bg-gradient-to-b from-cyan-400 via-violet-400 to-fuchsia-400 shadow-lg shadow-cyan-400/50"
            />

            {/* Experience Items */}
            <div className="space-y-8">
              {experience.map((exp, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  className="relative pl-8 md:pl-20"
                >
                  {/* Neon node */}
                  <motion.div
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.2 }}
                    className="absolute left-[-6px] md:left-[26px] w-4 h-4 bg-gradient-to-r from-cyan-400 to-violet-400 rounded-full shadow-lg shadow-cyan-400/50"
                  >
                    <div className="absolute inset-0 rounded-full bg-cyan-400 animate-ping opacity-75"></div>
                  </motion.div>

                  {/* Glass Card */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="group bg-slate-950/50 backdrop-blur-xl border border-violet-500/30 rounded-xl p-5 hover:border-violet-400 hover:shadow-2xl hover:shadow-violet-500/20 transition-all"
                  >
                    {/* Header */}
                    <div className="mb-3">
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2">
                        <div>
                          <div className="flex items-start gap-2">
                            <h3 className="text-xl md:text-2xl font-bold text-white group-hover:text-cyan-400 transition-colors leading-snug">
                              {exp.role}
                            </h3>
                            {exp.current && (
                              <span className="mt-1 px-3 py-1 bg-green-500/20 border border-green-500/50 text-green-400 text-xs font-semibold rounded-full whitespace-nowrap">
                                Current
                              </span>
                            )}
                          </div>
                          <p className="text-base text-violet-400 font-semibold">
                            {exp.company}
                          </p>
                        </div>

                        {exp.duration && (
                          <div className="flex items-center gap-2 text-gray-400 text-sm whitespace-nowrap md:justify-end">
                            <Calendar className="w-4 h-4" />
                            <span>{exp.duration}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Achievements */}
                    {exp.achievements && exp.achievements.length > 0 && (
                      <ul className="space-y-1">
                        {exp.achievements.map((achievement, idx) => (
                          <motion.li
                            key={idx}
                            initial={{ opacity: 0, x: -10 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.3, delay: idx * 0.1 }}
                            className="flex items-start gap-2 text-gray-300 text-sm"
                          >
                            <CheckCircle className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                            <span>{achievement}</span>
                          </motion.li>
                        ))}
                      </ul>
                    )}
                  </motion.div>
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
