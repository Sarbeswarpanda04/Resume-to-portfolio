import React from 'react';
import { Linkedin } from 'lucide-react';
import { PortfolioData } from '../types';

interface FooterProps {
  data: PortfolioData;
}

const Footer: React.FC<FooterProps> = ({ data }) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="py-8 bg-gray-50 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex flex-col items-center gap-4 text-center">
          {/* Name & Title */}
          <div>
            <p className="text-gray-900 font-semibold">
              {data.name}
            </p>
            <p className="text-sm text-gray-600">
              {data.title}
            </p>
          </div>

          {/* Social Link */}
          {data.socialLinks?.linkedin && (
            <a
              href={data.socialLinks.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-900 hover:text-blue-700 transition-colors"
            >
              <Linkedin className="w-5 h-5" />
            </a>
          )}

          {/* Copyright */}
          <p className="text-sm text-gray-500">
            © {currentYear} {data.name}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
