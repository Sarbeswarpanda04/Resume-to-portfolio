import React from 'react';
import { motion } from 'framer-motion';
import { FolderGit2, Github, ExternalLink } from 'lucide-react';
import { ComponentProps } from '../types';

const Projects: React.FC<ComponentProps> = ({ data, theme }) => {
  if (!theme.sections?.projects || !data.projects?.length) return null;

  return (
    <section id="projects" className="min-h-screen flex items-center justify-center px-6 py-16">
      <div className="max-w-5xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-center gap-2 mb-8">
            <FolderGit2 className="w-6 h-6" style={{ color: theme.primaryColor }} />
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
                className="bg-white border-2 border-gray-200 rounded-lg p-5 hover:border-current transition-all"
                whileHover={{ y: -5, borderColor: theme.primaryColor }}
              >
                <h3 className="text-lg font-semibold mb-2 leading-snug">{project.name}</h3>
                <p className="text-gray-700 mb-3 text-sm leading-relaxed">{project.description}</p>

                {project.technologies?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {project.technologies.slice(0, 3).map((tech: string, i: number) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 text-xs rounded"
                        style={{ backgroundColor: `${theme.primaryColor}15`, color: theme.primaryColor }}
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex gap-4">
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
                      Code
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
                      Demo
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
