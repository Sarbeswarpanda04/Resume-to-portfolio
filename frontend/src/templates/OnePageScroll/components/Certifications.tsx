import React from 'react';
import { motion } from 'framer-motion';
import { Award } from 'lucide-react';
import { ComponentProps } from '../types';

const Certifications: React.FC<ComponentProps> = ({ data, theme }) => {
  if (!theme.sections?.certifications || !data.certifications?.length) return null;

  return (
    <section id="certifications" className="min-h-screen flex items-center justify-center px-6 py-20">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.6 }}
        className="max-w-3xl w-full mx-auto"
      >
        <div className="flex items-center justify-center gap-2 mb-10">
          <Award className="w-6 h-6" style={{ color: theme.primaryColor }} />
          <h2 className="text-3xl font-bold" style={{ color: theme.primaryColor }}>
            Certifications
          </h2>
        </div>

        <div className="space-y-4">
          {data.certifications.map((cert: any, index: number) => (
            <div
              key={index}
              className="bg-white/70 backdrop-blur-md rounded-xl border p-5"
              style={{ borderColor: `${theme.primaryColor}30` }}
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-gray-900 font-semibold">{cert.name}</p>
                  {cert.issuer && <p className="text-gray-600 text-sm">{cert.issuer}</p>}
                </div>
                {cert.year && <p className="text-gray-600 text-sm font-medium">{cert.year}</p>}
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
};

export default Certifications;
