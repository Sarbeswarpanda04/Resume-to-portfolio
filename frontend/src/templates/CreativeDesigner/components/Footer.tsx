import React from 'react';
import { motion } from 'framer-motion';
import { Instagram, Linkedin, Github } from 'lucide-react';
import { ComponentProps } from '../types';

const Footer: React.FC<ComponentProps> = ({ data, theme }) => {
  return (
    <footer className="py-12 px-6 bg-gray-900 border-t border-white/10">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col items-center gap-6">
          {/* Name */}
          <motion.h3
            className="text-2xl font-bold"
            style={{ color: theme.primaryColor }}
            whileHover={{ scale: 1.05, letterSpacing: '0.1em' }}
          >
            {data.name}
          </motion.h3>

          {/* Creative Quote */}
          <p className="text-gray-400 italic text-center max-w-md">
            "Design is not just what it looks like. Design is how it works."
          </p>

          {/* Social Icons */}
          <div className="flex items-center gap-4">
            {data.links?.instagram && (
              <motion.a
                href={data.links.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
                whileHover={{ scale: 1.2, y: -5 }}
              >
                <Instagram className="w-5 h-5" />
              </motion.a>
            )}
            {data.links?.linkedin && (
              <motion.a
                href={data.links.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
                whileHover={{ scale: 1.2, y: -5 }}
              >
                <Linkedin className="w-5 h-5" />
              </motion.a>
            )}
            {data.links?.github && (
              <motion.a
                href={data.links.github}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
                whileHover={{ scale: 1.2, y: -5 }}
              >
                <Github className="w-5 h-5" />
              </motion.a>
            )}
          </div>

          {/* Copyright */}
          <p className="text-sm text-gray-500 text-center">
            © {new Date().getFullYear()} {data.name}. Crafted with creativity.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
