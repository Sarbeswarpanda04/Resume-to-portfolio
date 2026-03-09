import React from 'react';
import { motion } from 'framer-motion';
import { GraduationCap } from 'lucide-react';
import { Education as EducationItem } from '../types';

interface EducationProps {
  education?: EducationItem[];
}

const Education: React.FC<EducationProps> = ({ education }) => {
  if (!education || education.length === 0) return null;

  return (
    <section id="education" className="relative py-16 bg-slate-950 overflow-hidden">
      <div className="absolute top-0 left-0 w-96 h-96 bg-violet-500/10 rounded-full blur-[120px]"></div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-3 mb-12">
            <GraduationCap className="w-8 h-8 text-cyan-400" />
            <h2 className="text-4xl md:text-5xl font-bold text-white">
              Education
            </h2>
          </div>

          <div className="space-y-6">
            {education.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                className="bg-slate-900/50 backdrop-blur-xl border border-cyan-500/20 rounded-2xl p-6 shadow-2xl shadow-cyan-500/5"
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2">
                  <div>
                    <h3 className="text-xl font-bold text-gray-100 leading-snug">{item.degree}</h3>
                    <p className="text-gray-300 font-medium">{item.institution}</p>
                  </div>
                  <p className="text-gray-400 font-medium whitespace-nowrap">{item.year}</p>
                </div>

                {item.description && (
                  <p className="mt-3 text-gray-300 text-sm leading-relaxed">{item.description}</p>
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
