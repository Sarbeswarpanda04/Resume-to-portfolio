import React from 'react';
import { motion } from 'framer-motion';
import { Download, Github, Linkedin, Mail, MapPin, Phone } from 'lucide-react';
import { ComponentProps } from '../types';

const Hero: React.FC<ComponentProps> = ({ data, theme }) => {
  return (
    <section
      id="home"
      className="min-h-screen flex items-center justify-center px-6 pt-16 bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage:
          'url(https://files.123freevectors.com/wp-content/original/119241-blue-and-white-abstract-background-vector.jpg)',
      }}
    >
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-5xl md:text-7xl font-bold mb-4" style={{ color: theme.primaryColor }}>
            {data.name}
          </h1>
          <p className="text-2xl md:text-3xl text-gray-600 mb-4">
            {data.title || 'Full Stack Developer'}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-gray-600 mb-6">
            {data.location && (
              <span className="inline-flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {data.location}
              </span>
            )}
            {data.phone && (
              <a className="inline-flex items-center gap-1 hover:underline" href={`tel:${data.phone}`}>
                <Phone className="w-4 h-4" />
                {data.phone}
              </a>
            )}
            {data.email && (
              <a className="inline-flex items-center gap-1 hover:underline" href={`mailto:${data.email}`}>
                <Mail className="w-4 h-4" />
                {data.email}
              </a>
            )}
            {data.links?.linkedin && (
              <a className="inline-flex items-center gap-1 hover:underline" href={data.links.linkedin} target="_blank" rel="noopener noreferrer">
                <Linkedin className="w-4 h-4" />
                LinkedIn
              </a>
            )}
            {data.links?.github && (
              <a className="inline-flex items-center gap-1 hover:underline" href={data.links.github} target="_blank" rel="noopener noreferrer">
                <Github className="w-4 h-4" />
                GitHub
              </a>
            )}
            {data.links?.website && (
              <a className="inline-flex items-center gap-1 hover:underline" href={data.links.website} target="_blank" rel="noopener noreferrer">
                Portfolio
              </a>
            )}
          </div>
          <p className="text-lg text-gray-500 mb-8 max-w-2xl mx-auto">
            {data.summary?.split('.')[0] || 'Building elegant solutions to complex problems'}
          </p>

          {/* CTA Buttons */}
          <motion.div
            className="flex flex-wrap items-center justify-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <motion.a
              href="#"
              className="flex items-center gap-2 px-6 py-3 rounded-lg text-white font-medium"
              style={{ backgroundColor: theme.primaryColor }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Download className="w-5 h-5" />
              Download Resume
            </motion.a>
            {data.links?.github && (
              <motion.a
                href={data.links.github}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-6 py-3 rounded-lg border-2 font-medium"
                style={{ borderColor: theme.primaryColor, color: theme.primaryColor }}
                whileHover={{ scale: 1.05, backgroundColor: `${theme.primaryColor}10` }}
                whileTap={{ scale: 0.95 }}
              >
                <Github className="w-5 h-5" />
                View GitHub
              </motion.a>
            )}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
