import React from 'react';
import { motion } from 'framer-motion';
import { User, Sparkles } from 'lucide-react';
import { PortfolioData } from '../types';

interface AboutProps {
  data: PortfolioData;
}

const About: React.FC<AboutProps> = ({ data }) => {
  return (
    <section id="about" className="relative py-24 bg-slate-950 overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-violet-500/20 rounded-full blur-[120px]"></div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {/* Section Header */}
          <div className="flex items-center gap-3 mb-12">
            <User className="w-8 h-8 text-cyan-400" />
            <h2 className="text-4xl md:text-5xl font-bold text-white">
              Profile <span className="text-transparent bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text">Summary</span>
            </h2>
          </div>

          {/* Glass Card */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="group relative bg-slate-900/50 backdrop-blur-xl border border-cyan-500/30 rounded-2xl p-8 md:p-12 shadow-2xl shadow-cyan-500/10 transition-all"
          >
            {/* Neon border glow on hover */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-500/0 via-violet-500/0 to-fuchsia-500/0 group-hover:from-cyan-500/20 group-hover:via-violet-500/20 group-hover:to-fuchsia-500/20 transition-all duration-300 -z-10 blur-xl"></div>

            {/* Content */}
            <p className="text-lg text-gray-300 leading-relaxed mb-8">
              {data.about}
            </p>

            {/* Tech Focus */}
            {data.techFocus && data.techFocus.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-5 h-5 text-violet-400" />
                  <h3 className="text-xl font-semibold text-white">
                    Tech Focus
                  </h3>
                </div>
                <div className="flex flex-wrap gap-3">
                  {data.techFocus.map((tech, index) => (
                    <motion.span
                      key={index}
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="px-4 py-2 bg-gradient-to-r from-cyan-500/10 to-violet-500/10 border border-cyan-500/30 text-cyan-400 rounded-full text-sm font-medium hover:border-cyan-400 hover:shadow-lg hover:shadow-cyan-400/20 transition-all"
                    >
                      {tech}
                    </motion.span>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default About;
