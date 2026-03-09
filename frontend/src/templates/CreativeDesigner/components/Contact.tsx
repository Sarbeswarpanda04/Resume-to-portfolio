import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Instagram, Linkedin, ExternalLink } from 'lucide-react';
import { ComponentProps } from '../types';

const Contact: React.FC<ComponentProps> = ({ data, theme }) => {
  return (
    <section id="contact" className="py-32 px-6 bg-gradient-to-b from-gray-800 to-gray-900">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="max-w-4xl mx-auto text-center"
      >
        <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
          Let's Create Something
          <br />
          <span
            className="bg-clip-text text-transparent bg-gradient-to-r"
            style={{
              backgroundImage: `linear-gradient(to right, ${theme.primaryColor}, ${theme.accentColor || '#06b6d4'})`,
            }}
          >
            Amazing Together
          </span>
        </h2>

        <p className="text-xl text-gray-400 mb-12">
          Have a project in mind? Let's bring your vision to life.
        </p>

        {/* Email CTA */}
        {data.email && (
          <motion.a
            href={`mailto:${data.email}`}
            className="inline-flex items-center gap-3 px-10 py-5 rounded-full text-xl font-bold text-white mb-16 relative overflow-hidden group"
            style={{ backgroundColor: theme.primaryColor }}
            whileHover={{ scale: 1.05, boxShadow: `0 0 40px ${theme.primaryColor}80` }}
            whileTap={{ scale: 0.95 }}
          >
            <Mail className="w-6 h-6" />
            {data.email}
            <motion.div
              className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20"
              transition={{ duration: 0.3 }}
            />
          </motion.a>
        )}

        {/* Social Icons */}
        {data.links && (
          <div className="flex justify-center gap-6">
            {data.links.instagram && (
              <motion.a
                href={data.links.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="w-16 h-16 rounded-full flex items-center justify-center border-2"
                style={{ borderColor: theme.primaryColor }}
                whileHover={{
                  scale: 1.2,
                  backgroundColor: theme.primaryColor,
                  rotate: 10,
                  boxShadow: `0 0 30px ${theme.primaryColor}80`,
                }}
                whileTap={{ scale: 0.9 }}
              >
                <Instagram className="w-7 h-7 text-white" />
              </motion.a>
            )}
            {data.links.behance && (
              <motion.a
                href={data.links.behance}
                target="_blank"
                rel="noopener noreferrer"
                className="w-16 h-16 rounded-full flex items-center justify-center border-2"
                style={{ borderColor: theme.primaryColor }}
                whileHover={{
                  scale: 1.2,
                  backgroundColor: theme.primaryColor,
                  rotate: 10,
                  boxShadow: `0 0 30px ${theme.primaryColor}80`,
                }}
                whileTap={{ scale: 0.9 }}
              >
                <ExternalLink className="w-7 h-7 text-white" />
              </motion.a>
            )}
            {data.links.linkedin && (
              <motion.a
                href={data.links.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="w-16 h-16 rounded-full flex items-center justify-center border-2"
                style={{ borderColor: theme.primaryColor }}
                whileHover={{
                  scale: 1.2,
                  backgroundColor: theme.primaryColor,
                  rotate: 10,
                  boxShadow: `0 0 30px ${theme.primaryColor}80`,
                }}
                whileTap={{ scale: 0.9 }}
              >
                <Linkedin className="w-7 h-7 text-white" />
              </motion.a>
            )}
          </div>
        )}
      </motion.div>
    </section>
  );
};

export default Contact;
