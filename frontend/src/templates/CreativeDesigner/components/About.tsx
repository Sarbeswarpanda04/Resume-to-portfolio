import React from 'react';
import { motion } from 'framer-motion';
import { Palette } from 'lucide-react';
import { ComponentProps } from '../types';

const About: React.FC<ComponentProps> = ({ data, theme }) => {
  if (!theme.sections?.about || (!data.summary && !data.bio)) return null;

  return (
    <section id="about" className="py-32 px-6 bg-gray-900">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8 }}
          className="grid md:grid-cols-2 gap-12 items-center"
        >
          {/* Text Content */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <Palette className="w-8 h-8" style={{ color: theme.primaryColor }} />
              <h2 className="text-4xl md:text-5xl font-bold text-white">
                Profile Summary
              </h2>
            </div>

            <p className="text-lg text-gray-300 leading-relaxed mb-6">
              {data.bio || data.summary}
            </p>

            <motion.div
              className="inline-block px-6 py-3 rounded-lg border-2"
              style={{ borderColor: theme.primaryColor, color: theme.primaryColor }}
              whileHover={{ scale: 1.05, boxShadow: `0 0 20px ${theme.primaryColor}50` }}
            >
              <span className="font-bold text-xl">5+</span>
              <span className="ml-2 text-gray-400">Years Experience</span>
            </motion.div>
          </div>

          {/* Image */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div
              className="aspect-square rounded-3xl overflow-hidden relative"
              style={{
                background: `linear-gradient(135deg, ${theme.primaryColor}40, transparent)`,
              }}
            >
              {/* Placeholder for image */}
              <div className="absolute inset-0 flex items-center justify-center">
                <Palette className="w-32 h-32 text-white/20" />
              </div>

              {/* Animated Border */}
              <motion.div
                className="absolute inset-0 rounded-3xl"
                style={{
                  border: `3px solid ${theme.primaryColor}`,
                  opacity: 0.5,
                }}
                animate={{
                  scale: [1, 1.05, 1],
                  opacity: [0.5, 0.8, 0.5],
                }}
                transition={{ duration: 3, repeat: Infinity }}
              />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default About;
