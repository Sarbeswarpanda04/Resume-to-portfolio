import React from 'react';
import { Github, Linkedin } from 'lucide-react';
import { ComponentProps } from '../types';

const Footer: React.FC<ComponentProps> = ({ data }) => {
  return (
    <footer className="py-8 px-6 bg-gray-50 border-t border-gray-200">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col items-center gap-3">
          {/* Name & Degree */}
          <div className="text-center">
            <p className="font-semibold text-gray-800">{data.name}</p>
            <p className="text-sm text-gray-600">
              {data.degree || data.title} • {data.institution}
            </p>
          </div>

          {/* Social Links */}
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

          {/* Copyright */}
          <p className="text-xs text-gray-500 text-center">
            © {new Date().getFullYear()} {data.name}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
