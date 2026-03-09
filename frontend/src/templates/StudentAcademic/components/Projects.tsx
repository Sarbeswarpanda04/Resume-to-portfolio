import React from 'react';
import { motion } from 'framer-motion';
import { FolderOpen, Github, ExternalLink, FileText } from 'lucide-react';
import { ComponentProps } from '../types';

const Projects: React.FC<ComponentProps> = ({ data, theme }) => {
  if (!theme.sections?.projects || !data.projects?.length) return null;

  return (
    <section id="projects" className="py-14 px-6 bg-gradient-to-b from-white to-blue-50">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-center gap-2 mb-8">
            <FolderOpen className="w-6 h-6" style={{ color: theme.primaryColor }} />
            <h2 className="text-3xl font-bold" style={{ color: theme.primaryColor }}>
              Projects
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {data.projects.map((project: any, index: number) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl p-5 shadow-md border-2 border-transparent hover:border-current transition-all"
                whileHover={{ y: -5, borderColor: theme.primaryColor }}
              >
                <h3 className="text-lg font-bold text-gray-800 mb-2 leading-snug">
                  {project.name}
                </h3>
                <p className="text-gray-700 text-sm mb-3 leading-relaxed">
                  {project.description}
                </p>

                {/* Technologies */}
                {project.technologies?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {project.technologies.map((tech: string, i: number) => (
                      <span
                        key={i}
                        className="px-2.5 py-0.5 text-xs font-medium rounded-full"
                        style={{ 
                          backgroundColor: `${theme.primaryColor}15`, 
                          color: theme.primaryColor 
                        }}
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                )}

                {/* Links */}
                <div className="flex flex-wrap gap-3">
                  {project.github && (
                    <motion.a
                      href={project.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-sm font-medium"
                      style={{ color: theme.primaryColor }}
                      whileHover={{ scale: 1.05 }}
                    >
                      <Github className="w-4 h-4" />
                      GitHub
                    </motion.a>
                  )}
                  {project.link && (
                    <motion.a
                      href={project.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-sm font-medium"
                      style={{ color: theme.primaryColor }}
                      whileHover={{ scale: 1.05 }}
                    >
                      <ExternalLink className="w-4 h-4" />
                      Live Demo
                    </motion.a>
                  )}
                  {project.report && (
                    <motion.a
                      href={project.report}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-sm font-medium"
                      style={{ color: theme.primaryColor }}
                      whileHover={{ scale: 1.05 }}
                    >
                      <FileText className="w-4 h-4" />
                      Report
                    </motion.a>
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

export default Projects;
