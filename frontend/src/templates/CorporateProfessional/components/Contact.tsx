import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, Linkedin, Github, Twitter } from 'lucide-react';
import { PortfolioData } from '../types';

interface ContactProps {
  data: PortfolioData;
}

const Contact: React.FC<ContactProps> = ({ data }) => {
  return (
    <section id="contact" className="py-16 bg-white">
      <div className="max-w-4xl mx-auto px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          {/* Section Header */}
          <div className="mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Get In Touch
            </h2>
            <p className="text-lg text-gray-600">
              Let's discuss how we can work together
            </p>
          </div>

          {/* Contact Information */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {/* Email */}
            <motion.a
              href={`mailto:${data.email}`}
              whileHover={{ y: -2 }}
              className="flex items-center justify-center gap-3 p-6 bg-gray-50 border border-gray-200 rounded-lg hover:border-blue-900 hover:bg-blue-50 transition-all group"
            >
              <Mail className="w-6 h-6 text-blue-900" />
              <div className="text-left">
                <p className="text-sm text-gray-600 font-medium">Email</p>
                <p className="text-gray-900 font-semibold group-hover:text-blue-900">
                  {data.email}
                </p>
              </div>
            </motion.a>

            {/* Phone */}
            {data.phone && (
              <motion.a
                href={`tel:${data.phone}`}
                whileHover={{ y: -2 }}
                className="flex items-center justify-center gap-3 p-6 bg-gray-50 border border-gray-200 rounded-lg hover:border-blue-900 hover:bg-blue-50 transition-all group"
              >
                <Phone className="w-6 h-6 text-blue-900" />
                <div className="text-left">
                  <p className="text-sm text-gray-600 font-medium">Phone</p>
                  <p className="text-gray-900 font-semibold group-hover:text-blue-900">
                    {data.phone}
                  </p>
                </div>
              </motion.a>
            )}
          </div>

          {/* Social Links */}
          {data.socialLinks && (
            <div className="flex justify-center gap-4">
              {data.socialLinks.linkedin && (
                <motion.a
                  href={data.socialLinks.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.1, y: -2 }}
                  className="p-4 bg-gray-50 border border-gray-200 rounded-lg hover:border-blue-900 hover:bg-blue-900 hover:text-white transition-all"
                >
                  <Linkedin className="w-6 h-6" />
                </motion.a>
              )}

              {data.socialLinks.github && (
                <motion.a
                  href={data.socialLinks.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.1, y: -2 }}
                  className="p-4 bg-gray-50 border border-gray-200 rounded-lg hover:border-blue-900 hover:bg-blue-900 hover:text-white transition-all"
                >
                  <Github className="w-6 h-6" />
                </motion.a>
              )}

              {data.socialLinks.twitter && (
                <motion.a
                  href={data.socialLinks.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.1, y: -2 }}
                  className="p-4 bg-gray-50 border border-gray-200 rounded-lg hover:border-blue-900 hover:bg-blue-900 hover:text-white transition-all"
                >
                  <Twitter className="w-6 h-6" />
                </motion.a>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default Contact;
