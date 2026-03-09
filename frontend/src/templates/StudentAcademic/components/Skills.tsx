import React from 'react';
import { motion } from 'framer-motion';
import { Code, Wrench, Users } from 'lucide-react';
import { ComponentProps } from '../types';

const Skills: React.FC<ComponentProps> = ({ data, theme }) => {
  const skills = data.skills ?? [];
  const coursework = data.coursework ?? [];
  if (!theme.sections?.skills || (skills.length === 0 && coursework.length === 0)) return null;

  const thirdLength = Math.ceil(skills.length / 3);
  const programmingLanguages = skills.slice(0, thirdLength);
  const tools = skills.slice(thirdLength, thirdLength * 2);
  const softSkills = skills.slice(thirdLength * 2);

  const skillCategories = [
    { title: 'Programming Languages', icon: Code, skills: programmingLanguages },
    { title: 'Tools & Technologies', icon: Wrench, skills: tools },
    { title: 'Soft Skills', icon: Users, skills: softSkills },
  ];

  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <section id="skills" className="py-20 px-6 bg-white">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-center gap-2 mb-12">
            <Code className="w-6 h-6" style={{ color: theme.primaryColor }} />
            <h2 className="text-3xl font-bold" style={{ color: theme.primaryColor }}>
              Technical Skill
            </h2>
          </div>

          {coursework.length > 0 && (
            <div className="mb-12">
              <h3 className="text-xl font-semibold mb-4 text-center" style={{ color: theme.primaryColor }}>
                Relevant Coursework
              </h3>
              <div className="flex flex-wrap justify-center gap-2">
                {coursework.map((itemText, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-2 rounded-lg border font-medium text-sm"
                    style={{ borderColor: `${theme.primaryColor}30`, color: theme.primaryColor }}
                  >
                    {itemText}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="grid md:grid-cols-3 gap-8">
            {skillCategories.map((category, catIndex) => (
              <motion.div
                key={catIndex}
                variants={container}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="space-y-4"
              >
                <div className="flex items-center gap-2 mb-4">
                  <category.icon className="w-5 h-5" style={{ color: theme.primaryColor }} />
                  <h3 className="font-semibold text-gray-800">{category.title}</h3>
                </div>

                <div className="space-y-2">
                  {category.skills.map((skill: string, index: number) => (
                    <motion.div
                      key={index}
                      variants={item}
                      className="px-4 py-2 rounded-lg border bg-white hover:shadow-md transition-shadow"
                      style={{ borderColor: `${theme.primaryColor}30` }}
                      whileHover={{ 
                        scale: 1.02, 
                        backgroundColor: `${theme.primaryColor}05` 
                      }}
                    >
                      <p className="text-sm text-gray-700 font-medium">{skill}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Skills;
