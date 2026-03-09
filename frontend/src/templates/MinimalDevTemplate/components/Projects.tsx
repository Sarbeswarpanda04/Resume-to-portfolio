import React from 'react';
import { motion } from 'framer-motion';
import { FolderGit2, Github, ExternalLink } from 'lucide-react';
import { ComponentProps } from '../types';

const Projects: React.FC<ComponentProps> = ({ data, theme }) => {
  if (!theme.sections?.projects || !data.projects?.length) return null;

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

  return (
    <section id="projects" className="py-16 px-6 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-8 justify-center">
          <FolderGit2 className="w-8 h-8" style={{ color: theme.primaryColor }} />
          <h2 className="text-4xl font-bold" style={{ color: theme.primaryColor }}>
            Projects
          </h2>
        </div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {data.projects.map((project: any, index: number) => (
            <motion.div
              key={index}
              variants={fadeIn}
              className="bg-white border-2 border-transparent rounded-xl p-5 hover:border-current hover:shadow-xl transition-all"
              style={{ borderColor: 'transparent' }}
              whileHover={{
                y: -8,
                borderColor: theme.primaryColor,
              }}
            >
              <h3 className="text-lg font-semibold mb-2 leading-snug">{project.name}</h3>
              <p className="text-gray-700 text-sm mb-3 line-clamp-2 leading-relaxed">{project.description}</p>

              {project.technologies?.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {project.technologies.slice(0, 3).map((tech: string, i: number) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 text-xs rounded-md"
                      style={{ backgroundColor: `${theme.primaryColor}15`, color: theme.primaryColor }}
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex gap-3 mt-3">
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
                    Live Demo
                  </motion.a>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Projects;
