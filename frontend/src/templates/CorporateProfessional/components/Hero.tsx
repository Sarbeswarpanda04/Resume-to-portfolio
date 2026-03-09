import React from 'react';
import { motion } from 'framer-motion';
import { Download, Mail, MapPin } from 'lucide-react';
import { PortfolioData } from '../types';

interface HeroProps {
  data: PortfolioData;
}

const Hero: React.FC<HeroProps> = ({ data }) => {
  const handleDownloadResume = () => {
    if (data.resume) {
      window.open(data.resume, '_blank');
    }
  };

  const handleContact = () => {
    const contactSection = document.getElementById('contact');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="home" className="pt-24 pb-16 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-12 items-center">
          {/* Left - Text Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="md:col-span-2"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4">
              {data.name}
            </h1>
            
            <p className="text-2xl md:text-3xl text-gray-700 font-medium mb-3">
              {data.title}
            </p>
            
            <div className="flex flex-wrap gap-4 text-gray-600 mb-6">
              {data.industry && (
                <span className="flex items-center gap-2">
                  <span className="font-medium">{data.industry}</span>
                </span>
              )}
              {data.department && (
                <span className="flex items-center gap-2">
                  <span>•</span>
                  <span>{data.department}</span>
                </span>
              )}
              {data.location && (
                <span className="flex items-center gap-2">
                  <span>•</span>
                  <MapPin className="w-4 h-4" />
                  <span>{data.location}</span>
                </span>
              )}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleDownloadResume}
                className="px-6 py-3 bg-blue-900 text-white font-medium rounded-md hover:bg-blue-800 transition-colors flex items-center gap-2"
              >
                <Download className="w-5 h-5" />
                Download Resume
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleContact}
                className="px-6 py-3 border-2 border-blue-900 text-blue-900 font-medium rounded-md hover:bg-blue-50 transition-colors flex items-center gap-2"
              >
                <Mail className="w-5 h-5" />
                Contact
              </motion.button>
            </div>
          </motion.div>

          {/* Right - Professional Photo */}
          {data.photo && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex justify-center md:justify-end"
            >
              <div className="relative">
                <img
                  src={data.photo}
                  alt={data.name}
                  className="w-64 h-80 object-cover rounded-lg shadow-lg"
                />
                <div className="absolute inset-0 border-2 border-blue-900 rounded-lg transform translate-x-2 translate-y-2 -z-10"></div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Hero;
