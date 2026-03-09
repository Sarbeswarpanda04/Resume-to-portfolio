import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Github, Linkedin, Twitter } from 'lucide-react';
import { ComponentProps } from '../types';

const Contact: React.FC<ComponentProps> = ({ data, theme }) => {
  return (
    <section id="contact" className="min-h-screen flex items-center justify-center px-6 py-20">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.6 }}
        className="max-w-2xl mx-auto text-center"
      >
        <h2 className="text-3xl font-bold mb-4" style={{ color: theme.primaryColor }}>
          Let's Connect
        </h2>
        <p className="text-gray-600 mb-8">
          Feel free to reach out for collaborations or just a friendly chat.
        </p>

        {/* Email */}
        {data.email && (
          <motion.a
            href={`mailto:${data.email}`}
            className="inline-flex items-center gap-2 text-lg font-medium mb-8 hover:underline"
            style={{ color: theme.primaryColor }}
            whileHover={{ scale: 1.05 }}
          >
            <Mail className="w-5 h-5" />
            {data.email}
          </motion.a>
        )}

        {/* Social Icons */}
        {data.links && (
          <div className="flex justify-center gap-4 mt-6">
            {data.links.github && (
              <motion.a
                href={data.links.github}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-full border-2"
                style={{ borderColor: theme.primaryColor }}
                whileHover={{
                  scale: 1.15,
                  backgroundColor: theme.primaryColor,
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
                  scale: 1.15,
                  backgroundColor: theme.primaryColor,
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
                  scale: 1.15,
                  backgroundColor: theme.primaryColor,
                }}
              >
                <Twitter className="w-6 h-6" style={{ color: theme.primaryColor }} />
              </motion.a>
            )}
          </div>
        )}
      </motion.div>
    </section>
  );
};

export default Contact;
