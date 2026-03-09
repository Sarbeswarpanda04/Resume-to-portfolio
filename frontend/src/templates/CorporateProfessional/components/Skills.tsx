import React from 'react';
import { motion } from 'framer-motion';
import { BarChart2 } from 'lucide-react';
import { SkillCategory } from '../types';

interface SkillsProps {
  skills: SkillCategory[];
  coursework?: string[];
}

const Skills: React.FC<SkillsProps> = ({ skills, coursework }) => {
  const courseworkItems = coursework ?? [];

  return (
    <section id="skills" className="py-16 bg-white">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          {/* Section Header */}
          <div className="flex items-center gap-3 mb-12">
            <BarChart2 className="w-8 h-8 text-blue-900" />
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Technical Skill
            </h2>
          </div>

          {courseworkItems.length > 0 && (
            <div className="mb-12">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Relevant Coursework</h3>
              <div className="flex flex-wrap gap-2">
                {courseworkItems.map((itemText, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-2 rounded-full text-sm font-medium bg-blue-50 text-blue-900"
                  >
                    {itemText}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Skill Categories */}
          <div className="space-y-12">
            {skills.map((category, catIndex) => (
              <motion.div
                key={catIndex}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: catIndex * 0.1 }}
              >
                <h3 className="text-xl font-bold text-gray-900 mb-6">
                  {category.category}
                </h3>

                <div className="space-y-4">
                  {category.skills.map((skill, skillIndex) => {
                    const level = skill.level || 75;
                    
                    return (
                      <div key={skillIndex}>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-gray-700 font-medium">
                            {skill.name}
                          </span>
                          {skill.proficiency && (
                            <span className="text-sm text-gray-500">
                              {skill.proficiency}
                            </span>
                          )}
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: `${level}%` }}
                            viewport={{ once: true }}
                            transition={{ 
                              duration: 1, 
                              delay: catIndex * 0.1 + skillIndex * 0.05,
                              ease: 'easeOut'
                            }}
                            className="absolute top-0 left-0 h-full bg-blue-900 rounded-full"
                          ></motion.div>
                        </div>
                      </div>
                    );
                  })}
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
