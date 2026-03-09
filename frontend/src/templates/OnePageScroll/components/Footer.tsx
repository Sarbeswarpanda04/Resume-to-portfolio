import React from 'react';
import { Github, Linkedin } from 'lucide-react';
import { ComponentProps } from '../types';

const Footer: React.FC<ComponentProps> = ({ data }) => {
  return (
    <footer className="py-6 px-6 border-t border-gray-200">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-600">
            © {new Date().getFullYear()} {data.name}. All rights reserved.
          </p>

          <div className="flex items-center gap-3">
            {data.links?.github && (
              <a
                href={data.links.github}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                <Github className="w-5 h-5" />
              </a>
            )}
            {data.links?.linkedin && (
              <a
                href={data.links.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                <Linkedin className="w-5 h-5" />
              </a>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
