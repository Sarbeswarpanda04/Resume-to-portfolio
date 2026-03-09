import React from 'react';
import { User } from 'lucide-react';
import { ComponentProps } from '../types';

const About: React.FC<ComponentProps> = ({ data, theme }) => {
  if (!theme.sections?.about || !data.summary) return null;

  return (
    <section id="about" className="py-24 px-6 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <User className="w-8 h-8" style={{ color: theme.primaryColor }} />
          <h2 className="text-4xl font-bold" style={{ color: theme.primaryColor }}>
            Profile Summary
          </h2>
        </div>
        <p className="text-gray-700 leading-relaxed text-lg">{data.summary}</p>
      </div>
    </section>
  );
};

export default About;
