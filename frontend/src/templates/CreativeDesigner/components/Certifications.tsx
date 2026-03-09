import React from 'react';
import { motion } from 'framer-motion';
import { Award, ExternalLink } from 'lucide-react';
import { ComponentProps } from '../types';

const Certifications: React.FC<ComponentProps> = ({ data, theme }) => {
  if (!theme.sections?.certifications || !data.certifications?.length) return null;

  return (
    <section id="certifications" className="py-32 px-6 bg-gray-900">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8 }}
        >
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Award className="w-8 h-8" style={{ color: theme.primaryColor }} />
              <h2 className="text-5xl font-bold text-white">Certifications</h2>
            </div>
            <p className="text-xl text-gray-400">Credentials and training</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {data.certifications.map((cert, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.08 }}
                className="bg-gray-800 rounded-2xl p-8 border border-white/10"
                whileHover={{ y: -4, boxShadow: `0 10px 40px ${theme.primaryColor}30` }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">{cert.name}</h3>
                    {(cert.issuer || cert.year) && (
                      <p className="text-gray-400">
                        {[cert.issuer, cert.year].filter(Boolean).join(' • ')}
                      </p>
                    )}
                  </div>

                  {cert.link && (
                    <a
                      href={cert.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2"
                      style={{ color: theme.primaryColor }}
                    >
                      <ExternalLink className="w-5 h-5" />
                    </a>
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

export default Certifications;
