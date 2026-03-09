import React from 'react';
import { motion } from 'framer-motion';
import { Download, Github, Linkedin } from 'lucide-react';
import { ComponentProps } from '../types';

const Footer: React.FC<ComponentProps> = ({ data, theme }) => {
  return (
    <footer className="bg-gray-50 py-8 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-600">
            © {new Date().getFullYear()} {data.name}. All rights reserved.
          </p>

          <div className="flex items-center gap-4">
            {data.links?.github && (
              <a
                href={data.links.github}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-gray-900"
              >
                <Github className="w-5 h-5" />
              </a>
            )}
            {data.links?.linkedin && (
              <a
                href={data.links.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-gray-900"
              >
                <Linkedin className="w-5 h-5" />
              </a>
            )}
            <motion.button
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
              style={{ backgroundColor: theme.primaryColor, color: 'white' }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Download className="w-4 h-4" />
              Resume
            </motion.button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
