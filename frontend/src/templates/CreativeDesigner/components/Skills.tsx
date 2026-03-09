import React from 'react';
import { motion } from 'framer-motion';
import { Figma, Palette, Wand2 } from 'lucide-react';
import { ComponentProps } from '../types';

const Skills: React.FC<ComponentProps> = ({ data, theme }) => {
  const skills = data.skills ?? [];
  const coursework = data.coursework ?? [];
  if (!theme.sections?.skills || (skills.length === 0 && coursework.length === 0)) return null;

  const skillIcons = [Figma, Palette, Wand2];

  return (
    <section id="skills" className="py-32 px-6 bg-gray-800">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl font-bold text-white mb-4">
            Technical Skill
          </h2>
          <p className="text-xl text-gray-400">
            My creative toolkit
          </p>
        </motion.div>

        {coursework.length > 0 && (
          <div className="mb-16">
            <h3 className="text-2xl font-semibold text-white mb-6 text-center">Relevant Coursework</h3>
            <div className="flex flex-wrap justify-center gap-3">
              {coursework.map((itemText, idx) => (
                <span
                  key={idx}
                  className="px-4 py-2 rounded-full text-sm font-medium"
                  style={{ backgroundColor: `${theme.primaryColor}20`, color: theme.primaryColor }}
                >
                  {itemText}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Floating Skills */}
        <div className="relative h-96 flex items-center justify-center">
          {skills.map((skill: string, index: number) => {
            const angle = (index / skills.length) * 2 * Math.PI;
            const radius = 180;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            const Icon = skillIcons[index % skillIcons.length];

            return (
              <motion.div
                key={index}
                className="absolute"
                style={{
                  left: '50%',
                  top: '50%',
                }}
                initial={{ x: 0, y: 0, opacity: 0 }}
                whileInView={{ x, y, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.8 }}
              >
                <motion.div
                  className="relative flex flex-col items-center"
                  animate={{
                    y: [0, -10, 0],
                  }}
                  transition={{
                    duration: 3 + (index % 3),
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  whileHover={{ scale: 1.2, rotate: 10 }}
                >
                  {/* Icon Circle */}
                  <motion.div
                    className="w-20 h-20 rounded-full flex items-center justify-center mb-3 relative overflow-hidden"
                    style={{ backgroundColor: `${theme.primaryColor}20` }}
                    whileHover={{
                      boxShadow: `0 0 30px ${theme.primaryColor}80`,
                    }}
                  >
                    <Icon className="w-10 h-10" style={{ color: theme.primaryColor }} />
                    
                    {/* Glow effect */}
                    <motion.div
                      className="absolute inset-0 rounded-full"
                      style={{ backgroundColor: theme.primaryColor }}
                      initial={{ opacity: 0 }}
                      whileHover={{ opacity: 0.3 }}
                    />
                  </motion.div>

                  {/* Skill Name */}
                  <span className="text-sm font-medium text-white px-3 py-1 rounded-full bg-gray-900/80 backdrop-blur-sm whitespace-nowrap">
                    {skill}
                  </span>
                </motion.div>
              </motion.div>
            );
          })}

          {/* Center Circle */}
          <motion.div
            className="w-32 h-32 rounded-full border-4 border-dashed flex items-center justify-center"
            style={{ borderColor: `${theme.primaryColor}40` }}
            animate={{ rotate: 360 }}
            transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
          >
            <span className="text-2xl font-bold text-white">Skills</span>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Skills;
