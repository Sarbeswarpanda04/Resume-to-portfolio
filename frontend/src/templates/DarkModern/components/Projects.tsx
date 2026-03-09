import React from 'react';
import { motion } from 'framer-motion';
import { Code, ExternalLink, Github } from 'lucide-react';
import { Project } from '../types';

interface ProjectsProps {
  projects: Project[];
}

const Projects: React.FC<ProjectsProps> = ({ projects }) => {
  return (
    <section id="projects" className="relative py-16 bg-slate-950 overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-fuchsia-500/10 rounded-full blur-[120px]"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {/* Section Header */}
          <div className="flex items-center gap-3 mb-10">
            <Code className="w-8 h-8 text-cyan-400" />
            <h2 className="text-4xl md:text-5xl font-bold text-white">
              Featured <span className="text-transparent bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text">Projects</span>
            </h2>
          </div>

          {/* Projects Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {projects.map((project, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ 
                  scale: 1.02,
                  rotateY: 2,
                  rotateX: -2,
                }}
                className="group relative bg-slate-900/50 backdrop-blur-xl border border-violet-500/30 rounded-xl p-5 shadow-2xl hover:border-violet-400 transition-all duration-300"
                style={{ transformStyle: 'preserve-3d' }}
              >
                {/* Glow effect on hover */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-cyan-500/0 via-violet-500/0 to-fuchsia-500/0 group-hover:from-cyan-500/10 group-hover:via-violet-500/10 group-hover:to-fuchsia-500/10 transition-all duration-300 -z-10 blur-xl"></div>

                {/* Project Image Placeholder */}
                {project.image ? (
                  <div className="mb-4 rounded-lg overflow-hidden">
                    <img 
                      src={project.image} 
                      alt={project.name}
                      className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ) : (
                  <div className="mb-4 h-40 bg-gradient-to-br from-cyan-500/20 to-violet-500/20 rounded-lg flex items-center justify-center">
                    <Code className="w-16 h-16 text-cyan-400/50" />
                  </div>
                )}

                {/* Project Name */}
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors leading-snug">
                  {project.name}
                </h3>

                {/* Description */}
                <p className="text-gray-400 mb-3 text-sm leading-relaxed">
                  {project.description}
                </p>

                {/* Tech Stack */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.techStack.slice(0, 3).map((tech, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 text-xs bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 rounded"
                    >
                      {tech}
                    </span>
                  ))}
                  {project.techStack.length > 3 && (
                    <span className="px-2 py-1 text-xs text-gray-500">
                      +{project.techStack.length - 3}
                    </span>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  {project.github && (
                    <motion.a
                      href={project.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-1.5 bg-slate-800/50 border border-gray-700 text-gray-300 rounded-lg hover:border-cyan-400 hover:text-cyan-400 transition-all text-sm"
                    >
                      <Github className="w-4 h-4" />
                      Code
                    </motion.a>
                  )}
                  
                  {project.live && (
                    <motion.a
                      href={project.live}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-1.5 bg-gradient-to-r from-cyan-500/20 to-violet-500/20 border border-cyan-500/50 text-cyan-400 rounded-lg hover:border-cyan-400 hover:shadow-lg hover:shadow-cyan-400/30 transition-all text-sm"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Live
                    </motion.a>
                  )}
                </div>

                {/* Corner accent */}
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-violet-500/20 to-transparent rounded-br-xl rounded-tl-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Projects;
