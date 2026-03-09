import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, Github, Linkedin, Twitter, Send } from 'lucide-react';
import { ComponentProps } from '../types';

const Contact: React.FC<ComponentProps> = ({ data, theme }) => {
  return (
    <section id="contact" className="py-24 px-6">
      <div className="max-w-3xl mx-auto text-center">
        <div className="flex items-center gap-3 mb-8 justify-center">
          <Send className="w-8 h-8" style={{ color: theme.primaryColor }} />
          <h2 className="text-4xl font-bold" style={{ color: theme.primaryColor }}>
            Get In Touch
          </h2>
        </div>

        <p className="text-gray-600 text-lg mb-8">
          I'm always open to discussing new projects, creative ideas, or opportunities to be part of
          your visions.
        </p>

        {/* Contact Info */}
        <div className="flex flex-wrap justify-center gap-6 mb-8">
          {data.email && (
            <motion.a
              href={`mailto:${data.email}`}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
              whileHover={{ scale: 1.1 }}
            >
              <Mail className="w-6 h-6" style={{ color: theme.primaryColor }} />
              {data.email}
            </motion.a>
          )}
          {data.phone && (
            <motion.a
              href={`tel:${data.phone}`}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
              whileHover={{ scale: 1.1 }}
            >
              <Phone className="w-6 h-6" style={{ color: theme.primaryColor }} />
              {data.phone}
            </motion.a>
          )}
        </div>

        {/* Social Links */}
        {data.links && (
          <div className="flex justify-center gap-4">
            {data.links.github && (
              <motion.a
                href={data.links.github}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-full border-2"
                style={{ borderColor: theme.primaryColor }}
                whileHover={{
                  scale: 1.2,
                  backgroundColor: theme.primaryColor,
                  rotate: 5,
                }}
              >
                <Github className="w-6 h-6" style={{ color: theme.primaryColor }} />
              </motion.a>
            )}
            {data.links.linkedin && (
              <motion.a
                href={data.links.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-full border-2"
                style={{ borderColor: theme.primaryColor }}
                whileHover={{
                  scale: 1.2,
                  backgroundColor: theme.primaryColor,
                  rotate: 5,
                }}
              >
                <Linkedin className="w-6 h-6" style={{ color: theme.primaryColor }} />
              </motion.a>
            )}
            {data.links.twitter && (
              <motion.a
                href={data.links.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-full border-2"
                style={{ borderColor: theme.primaryColor }}
                whileHover={{
                  scale: 1.2,
                  backgroundColor: theme.primaryColor,
                  rotate: 5,
                }}
              >
                <Twitter className="w-6 h-6" style={{ color: theme.primaryColor }} />
              </motion.a>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default Contact;
