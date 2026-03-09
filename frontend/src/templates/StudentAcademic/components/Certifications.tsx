import React from 'react';
import { motion } from 'framer-motion';
import { Award, ExternalLink } from 'lucide-react';
import { ComponentProps } from '../types';

const Certifications: React.FC<ComponentProps> = ({ data, theme }) => {
  if (!theme.sections?.certifications || !data.certifications?.length) return null;

  return (
    <section id="certifications" className="py-20 px-6 bg-white">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-center gap-2 mb-12">
            <Award className="w-6 h-6" style={{ color: theme.primaryColor }} />
            <h2 className="text-3xl font-bold" style={{ color: theme.primaryColor }}>
              Certifications & Achievements
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {data.certifications.map((cert: any, index: number) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-6 border-2 hover:shadow-lg transition-all"
                style={{ borderColor: `${theme.primaryColor}30` }}
                whileHover={{ scale: 1.02, borderColor: theme.primaryColor }}
              >
                <div className="flex items-start gap-4">
                  <div 
                    className="p-3 rounded-lg"
                    style={{ backgroundColor: `${theme.primaryColor}15` }}
                  >
                    <Award className="w-6 h-6" style={{ color: theme.primaryColor }} />
                  </div>

                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-800 mb-1">
                      {cert.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-1">
                      {cert.organization}
                    </p>
                    <p className="text-xs text-gray-500 mb-3">
                      {cert.year}
                    </p>

                    {cert.link && (
                      <motion.a
                        href={cert.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm font-medium"
                        style={{ color: theme.primaryColor }}
                        whileHover={{ scale: 1.05 }}
                      >
                        <ExternalLink className="w-4 h-4" />
                        View Certificate
                      </motion.a>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Certifications;
