import React from 'react';
import { motion } from 'framer-motion';
import { Code, Cpu, Terminal, Zap } from 'lucide-react';
import { SkillCategory } from '../types';

interface SkillsProps {
  skills: SkillCategory[];
  coursework?: string[];
}

const iconMap: { [key: string]: any } = {
  code: Code,
  cpu: Cpu,
  terminal: Terminal,
  zap: Zap,
};

const Skills: React.FC<SkillsProps> = ({ skills, coursework }) => {
  const courseworkItems = coursework ?? [];
  if ((!skills || skills.length === 0) && courseworkItems.length === 0) return null;

  return (
    <section id="skills" className="relative py-24 bg-slate-900 overflow-hidden">
      {/* Background effects */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-violet-500/10 rounded-full blur-[120px]"></div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {/* Section Header */}
          <div className="flex items-center gap-3 mb-12">
            <Zap className="w-8 h-8 text-cyan-400" />
            <h2 className="text-4xl md:text-5xl font-bold text-white">
              Technical <span className="text-transparent bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text">Skill</span>
            </h2>
          </div>

          {courseworkItems.length > 0 && (
            <div className="mb-12">
              <h3 className="text-2xl font-bold text-gray-200 mb-6">Relevant Coursework</h3>
              <div className="flex flex-wrap gap-3">
                {courseworkItems.map((itemText, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.25, delay: idx * 0.03 }}
                    className="px-4 py-2 bg-slate-950/50 backdrop-blur-sm border border-cyan-500/30 text-cyan-400 rounded-full text-sm font-medium"
                  >
                    {itemText}
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Skill Categories */}
          <div className="space-y-12">
            {skills.map((category, catIndex) => {
              const Icon = category.icon ? iconMap[category.icon] || Code : Code;
              
              return (
                <motion.div
                  key={catIndex}
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: catIndex * 0.1 }}
                >
                  {/* Category Header */}
                  <div className="flex items-center gap-3 mb-6">
                    <Icon className="w-6 h-6 text-violet-400" />
                    <h3 className="text-2xl font-bold text-gray-200">
                      {category.category}
                    </h3>
                  </div>

                  {/* Neon Tags */}
                  <div className="flex flex-wrap gap-3">
                    {category.skills.map((skill, skillIndex) => (
                      <motion.div
                        key={skillIndex}
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ 
                          duration: 0.3, 
                          delay: catIndex * 0.1 + skillIndex * 0.05 
                        }}
                        whileHover={{ 
                          scale: 1.05,
                          boxShadow: '0 0 20px rgba(6, 182, 212, 0.6)',
                        }}
                        className="group relative px-5 py-2.5 bg-slate-950/50 backdrop-blur-sm border-2 border-cyan-500/40 text-cyan-400 rounded-lg font-medium transition-all cursor-default"
                      >
                        {/* Hover glow */}
                        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 to-violet-500/0 group-hover:from-cyan-500/20 group-hover:to-violet-500/20 rounded-lg transition-all"></div>
                        
                        <span className="relative z-10">{skill}</span>
                        
                        {/* Neon glow effect */}
                        <motion.div
                          className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                          style={{
                            boxShadow: '0 0 15px rgba(6, 182, 212, 0.5), inset 0 0 15px rgba(6, 182, 212, 0.1)',
                          }}
                        />
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Skills;
