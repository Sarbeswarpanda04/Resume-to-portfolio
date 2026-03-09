import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, Github, Linkedin } from 'lucide-react';
import { ComponentProps } from '../types';

const Contact: React.FC<ComponentProps> = ({ data, theme }) => {
  return (
    <section id="contact" className="py-20 px-6 bg-gradient-to-b from-blue-50 to-white">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.6 }}
        className="max-w-3xl mx-auto text-center"
      >
        <h2 className="text-3xl font-bold mb-4" style={{ color: theme.primaryColor }}>
          Get In Touch
        </h2>
        <p className="text-gray-600 mb-10">
          Feel free to reach out for academic collaborations, project discussions, or opportunities.
        </p>

        {/* Contact Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Email */}
          {data.email && (
            <motion.a
              href={`mailto:${data.email}`}
              className="flex items-center justify-center gap-3 p-4 bg-white rounded-lg border-2 hover:shadow-md transition-all"
              style={{ borderColor: `${theme.primaryColor}30` }}
              whileHover={{ scale: 1.02, borderColor: theme.primaryColor }}
            >
              <Mail className="w-5 h-5" style={{ color: theme.primaryColor }} />
              <div className="text-left">
                <p className="text-xs text-gray-500 font-medium">Email</p>
                <p className="text-sm font-semibold text-gray-800">{data.email}</p>
              </div>
            </motion.a>
          )}

          {/* Phone */}
          {data.phone && (
            <motion.a
              href={`tel:${data.phone}`}
              className="flex items-center justify-center gap-3 p-4 bg-white rounded-lg border-2 hover:shadow-md transition-all"
              style={{ borderColor: `${theme.primaryColor}30` }}
              whileHover={{ scale: 1.02, borderColor: theme.primaryColor }}
            >
              <Phone className="w-5 h-5" style={{ color: theme.primaryColor }} />
              <div className="text-left">
                <p className="text-xs text-gray-500 font-medium">Phone</p>
                <p className="text-sm font-semibold text-gray-800">{data.phone}</p>
              </div>
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
                className="p-4 rounded-full border-2 bg-white"
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
                className="p-4 rounded-full border-2 bg-white"
                style={{ borderColor: theme.primaryColor }}
                whileHover={{
                  scale: 1.15,
                  backgroundColor: theme.primaryColor,
                }}
              >
                <Linkedin className="w-6 h-6" style={{ color: theme.primaryColor }} />
              </motion.a>
            )}
          </div>
        )}
      </motion.div>
    </section>
  );
};

export default Contact;
