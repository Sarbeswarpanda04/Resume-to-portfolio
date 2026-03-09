import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, X, ExternalLink } from 'lucide-react';
import { ComponentProps } from '../types';

const PortfolioGrid: React.FC<ComponentProps> = ({ data, theme }) => {
  const [selectedProject, setSelectedProject] = useState<any>(null);

  const portfolioItems = data.portfolioItems || data.projects || [];

  if (!theme.sections?.projects || !portfolioItems.length) return null;

  return (
    <section id="projects" className="py-32 px-6 bg-gradient-to-b from-gray-900 to-gray-800">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-4">
            Projects
          </h2>
          <p className="text-xl text-gray-400">
            Selected projects that showcase my creative vision
          </p>
        </motion.div>

        {/* Masonry Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {portfolioItems.map((item: any, index: number) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              className="group relative rounded-2xl overflow-hidden cursor-pointer aspect-square"
              onClick={() => setSelectedProject(item)}
              whileHover={{ scale: 1.02 }}
            >
              {/* Image Placeholder */}
              <div
                className="absolute inset-0 bg-gradient-to-br"
                style={{
                  backgroundImage: `linear-gradient(135deg, ${theme.primaryColor}60, ${theme.accentColor || '#06b6d4'}60)`,
                }}
              >
                <div className="flex items-center justify-center h-full">
                  <span className="text-6xl font-bold text-white/10">
                    {(item.title || item.name || '').charAt(0)}
                  </span>
                </div>
              </div>

              {/* Hover Overlay */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
              >
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    whileHover={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                  >
                    <h3 className="text-2xl font-bold text-white mb-2">
                      {item.title || item.name}
                    </h3>
                    <p className="text-sm text-gray-300 mb-4">
                      {item.category || 'Design Project'}
                    </p>
                    <motion.button
                      className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-white"
                      style={{ backgroundColor: theme.primaryColor }}
                      whileHover={{ scale: 1.05 }}
                    >
                      <Eye className="w-4 h-4" />
                      View Project
                    </motion.button>
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Project Detail Modal */}
      <AnimatePresence>
        {selectedProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-6"
            onClick={() => setSelectedProject(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-800 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <div className="sticky top-0 right-0 p-6 flex justify-end bg-gradient-to-b from-gray-800 to-transparent z-10">
                <motion.button
                  onClick={() => setSelectedProject(null)}
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20"
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="w-6 h-6 text-white" />
                </motion.button>
              </div>

              <div className="px-10 pb-10 -mt-16">
                {/* Project Image */}
                <div
                  className="w-full aspect-video rounded-2xl mb-8"
                  style={{
                    background: `linear-gradient(135deg, ${theme.primaryColor}60, ${theme.accentColor || '#06b6d4'}60)`,
                  }}
                />

                {/* Project Info */}
                <h2 className="text-4xl font-bold text-white mb-3">
                  {selectedProject.title || selectedProject.name}
                </h2>
                <p className="text-lg mb-6" style={{ color: theme.primaryColor }}>
                  {selectedProject.category || 'Design Project'}
                </p>
                <p className="text-gray-300 leading-relaxed mb-8">
                  {selectedProject.description}
                </p>

                {/* Tools Used */}
                {(selectedProject.tools || selectedProject.technologies)?.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-xl font-semibold text-white mb-4">Tools Used</h3>
                    <div className="flex flex-wrap gap-3">
                      {(selectedProject.tools || selectedProject.technologies).map(
                        (tool: string, i: number) => (
                          <span
                            key={i}
                            className="px-4 py-2 rounded-full text-sm font-medium"
                            style={{
                              backgroundColor: `${theme.primaryColor}20`,
                              color: theme.primaryColor,
                            }}
                          >
                            {tool}
                          </span>
                        )
                      )}
                    </div>
                  </div>
                )}

                {/* Links */}
                <div className="flex flex-wrap gap-4">
                  {selectedProject.link && (
                    <motion.a
                      href={selectedProject.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-6 py-3 rounded-full font-medium text-white"
                      style={{ backgroundColor: theme.primaryColor }}
                      whileHover={{ scale: 1.05 }}
                    >
                      <ExternalLink className="w-5 h-5" />
                      View Live
                    </motion.a>
                  )}
                  {selectedProject.behance && (
                    <motion.a
                      href={selectedProject.behance}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-6 py-3 rounded-full border-2 border-white/30 font-medium text-white"
                      whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.1)' }}
                    >
                      Behance
                    </motion.a>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default PortfolioGrid;
