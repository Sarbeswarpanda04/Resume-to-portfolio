import React from 'react';
import { motion } from 'framer-motion';
import { Code, FolderGit2, Wrench } from 'lucide-react';
import { ComponentProps } from '../types';

const Skills: React.FC<ComponentProps> = ({ data, theme }) => {
  const skills = data.skills ?? [];
  const coursework = data.coursework ?? [];

  if (!theme.sections?.skills || (skills.length === 0 && coursework.length === 0)) return null;

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.6 } },
  };

  const thirdLength = Math.ceil(skills.length / 3);
  const languages = skills.slice(0, thirdLength);
  const frameworks = skills.slice(thirdLength, thirdLength * 2);
  const tools = skills.slice(thirdLength * 2);

  return (
    <section id="skills" className="py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-12 justify-center">
          <Code className="w-8 h-8" style={{ color: theme.primaryColor }} />
          <h2 className="text-4xl font-bold" style={{ color: theme.primaryColor }}>
            Technical Skill
          </h2>
        </div>

        {coursework.length > 0 && (
          <div className="mb-12">
            <h3 className="text-2xl font-semibold mb-4" style={{ color: theme.primaryColor }}>
              Relevant Coursework
            </h3>
            <div className="flex flex-wrap gap-2">
              {coursework.map((item: string, index: number) => (
                <span
                  key={index}
                  className="px-3 py-2 rounded-lg border font-medium"
                  style={{ borderColor: `${theme.primaryColor}40`, color: theme.primaryColor }}
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        )}

        {skills.length > 0 && (
          <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-3 gap-8"
          >
          {/* Languages */}
          <motion.div variants={fadeIn} className="space-y-4">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Code className="w-5 h-5" style={{ color: theme.primaryColor }} />
              Languages
            </h3>
            <div className="flex flex-wrap gap-2">
              {languages.map((skill: string, index: number) => (
                <motion.span
                  key={index}
                  className="px-4 py-2 rounded-lg border-2 font-medium hover:shadow-md transition-all cursor-default"
                  style={{ borderColor: theme.primaryColor, color: theme.primaryColor }}
                  whileHover={{ scale: 1.05, backgroundColor: `${theme.primaryColor}10` }}
                >
                  {skill}
                </motion.span>
              ))}
            </div>
          </motion.div>

          {/* Frameworks */}
          <motion.div variants={fadeIn} className="space-y-4">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <FolderGit2 className="w-5 h-5" style={{ color: theme.primaryColor }} />
              Frameworks
            </h3>
            <div className="flex flex-wrap gap-2">
              {frameworks.map((skill: string, index: number) => (
                <motion.span
                  key={index}
                  className="px-4 py-2 rounded-lg border-2 font-medium hover:shadow-md transition-all cursor-default"
                  style={{ borderColor: theme.primaryColor, color: theme.primaryColor }}
                  whileHover={{ scale: 1.05, backgroundColor: `${theme.primaryColor}10` }}
                >
                  {skill}
                </motion.span>
              ))}
            </div>
          </motion.div>

          {/* Tools */}
          <motion.div variants={fadeIn} className="space-y-4">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Wrench className="w-5 h-5" style={{ color: theme.primaryColor }} />
              Tools
            </h3>
            <div className="flex flex-wrap gap-2">
              {tools.map((skill: string, index: number) => (
                <motion.span
                  key={index}
                  className="px-4 py-2 rounded-lg border-2 font-medium hover:shadow-md transition-all cursor-default"
                  style={{ borderColor: theme.primaryColor, color: theme.primaryColor }}
                  whileHover={{ scale: 1.05, backgroundColor: `${theme.primaryColor}10` }}
                >
                  {skill}
                </motion.span>
              ))}
            </div>
          </motion.div>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default Skills;
