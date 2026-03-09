import React from 'react';
import { motion } from 'framer-motion';
import { Github, Linkedin, Twitter, Code2 } from 'lucide-react';
import { PortfolioData } from '../types';

interface FooterProps {
  data: PortfolioData;
}

const Footer: React.FC<FooterProps> = ({ data }) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative py-12 bg-slate-950 border-t border-cyan-500/20 overflow-hidden">
      {/* Subtle glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-violet-500/10 blur-[80px]"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex flex-col items-center gap-6 text-center">
          {/* Futuristic Quote */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center gap-2 text-gray-400 italic"
          >
            <Code2 className="w-5 h-5 text-cyan-400" />
            <p className="text-sm">
              "Code is poetry written in logic"
            </p>
          </motion.div>

          {/* Name */}
          <div>
            <p className="text-lg font-semibold bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">
              {data.name}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {data.role}
            </p>
          </div>

          {/* Social Icons */}
          {data.socialLinks && (
            <div className="flex gap-4">
              {data.socialLinks.github && (
                <motion.a
                  href={data.socialLinks.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ y: -3, scale: 1.1 }}
                  className="p-2 text-gray-400 hover:text-cyan-400 transition-colors"
                >
                  <Github className="w-5 h-5" />
                </motion.a>
              )}
              
              {data.socialLinks.linkedin && (
                <motion.a
                  href={data.socialLinks.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ y: -3, scale: 1.1 }}
                  className="p-2 text-gray-400 hover:text-violet-400 transition-colors"
                >
                  <Linkedin className="w-5 h-5" />
                </motion.a>
              )}
              
              {data.socialLinks.twitter && (
                <motion.a
                  href={data.socialLinks.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ y: -3, scale: 1.1 }}
                  className="p-2 text-gray-400 hover:text-fuchsia-400 transition-colors"
                >
                  <Twitter className="w-5 h-5" />
                </motion.a>
              )}
            </div>
          )}

          {/* Copyright */}
          <div className="pt-6 border-t border-gray-800 w-full">
            <p className="text-sm text-gray-500">
              © {currentYear} {data.name}. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
