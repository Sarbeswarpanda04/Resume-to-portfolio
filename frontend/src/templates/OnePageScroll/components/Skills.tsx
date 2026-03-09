import React from 'react';
import { motion } from 'framer-motion';
import { Code } from 'lucide-react';
import { ComponentProps } from '../types';

const Skills: React.FC<ComponentProps> = ({ data, theme }) => {
  const skills = data.skills ?? [];
  const coursework = data.coursework ?? [];

  if (!theme.sections?.skills || (skills.length === 0 && coursework.length === 0)) return null;

  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <section id="skills" className="min-h-screen flex items-center justify-center px-6 py-20">
      <div className="max-w-4xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-center gap-2 mb-10">
            <Code className="w-6 h-6" style={{ color: theme.primaryColor }} />
            <h2 className="text-3xl font-bold" style={{ color: theme.primaryColor }}>
              Technical Skill
            </h2>
          </div>

          {coursework.length > 0 && (
            <div className="mb-10">
              <h3 className="text-xl font-semibold mb-4 text-center" style={{ color: theme.primaryColor }}>
                Relevant Coursework
              </h3>
              <div className="flex flex-wrap justify-center gap-3">
                {coursework.map((itemText: string, idx: number) => (
                  <span
                    key={idx}
                    className="px-4 py-2 rounded-full border font-medium text-sm"
                    style={{ borderColor: `${theme.primaryColor}40`, color: theme.primaryColor }}
                  >
                    {itemText}
                  </span>
                ))}
              </div>
            </div>
          )}

          {skills.length > 0 && (
            <motion.div
            variants={container}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            className="flex flex-wrap justify-center gap-3"
            >
            {skills.map((skill: string, index: number) => (
              <motion.span
                key={index}
                variants={item}
                className="px-5 py-2 rounded-full border-2 font-medium text-sm hover:shadow-md transition-shadow cursor-default"
                style={{ borderColor: theme.primaryColor, color: theme.primaryColor }}
                whileHover={{ scale: 1.05, backgroundColor: `${theme.primaryColor}10` }}
              >
                {skill}
              </motion.span>
            ))}
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default Skills;
