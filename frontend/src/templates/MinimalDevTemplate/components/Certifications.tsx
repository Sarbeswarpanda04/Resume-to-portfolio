import React from 'react';
import { motion } from 'framer-motion';
import { Award } from 'lucide-react';
import { ComponentProps } from '../types';

const Certifications: React.FC<ComponentProps> = ({ data, theme }) => {
  if (!theme.sections?.certifications || !data.certifications?.length) return null;

  return (
    <section id="certifications" className="py-24 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-12 justify-center">
          <Award className="w-8 h-8" style={{ color: theme.primaryColor }} />
          <h2 className="text-4xl font-bold" style={{ color: theme.primaryColor }}>
            Certifications
          </h2>
        </div>

        <div className="space-y-4">
          {data.certifications.map((cert: any, index: number) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.06 }}
              className="rounded-xl border p-5 bg-white"
              style={{ borderColor: `${theme.primaryColor}30` }}
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-gray-900 font-semibold">{cert.name}</p>
                  {cert.issuer && <p className="text-gray-600 text-sm">{cert.issuer}</p>}
                </div>
                {cert.year && <p className="text-gray-600 text-sm font-medium">{cert.year}</p>}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Certifications;
