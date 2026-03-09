import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Github, Linkedin, Twitter, Send } from 'lucide-react';
import { PortfolioData } from '../types';

interface ContactProps {
  data: PortfolioData;
}

const Contact: React.FC<ContactProps> = ({ data }) => {
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);

  const createRipple = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now();

    setRipples(prev => [...prev, { id, x, y }]);
    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== id));
    }, 600);
  };

  return (
    <section id="contact" className="relative py-24 bg-slate-950 overflow-hidden">
      {/* Background effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-cyan-500/10 via-violet-500/10 to-fuchsia-500/10 rounded-full blur-[120px]"></div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {/* Section Header */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <Mail className="w-8 h-8 text-cyan-400" />
            <h2 className="text-4xl md:text-5xl font-bold text-white">
              Get In <span className="text-transparent bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text">Touch</span>
            </h2>
          </div>

          <p className="text-lg text-gray-400 mb-12">
            Let's build something amazing together
          </p>

          {/* Email CTA */}
          <motion.a
            href={`mailto:${data.email}`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-cyan-500 to-violet-500 text-white text-lg font-semibold rounded-xl mb-16 hover:shadow-2xl hover:shadow-cyan-500/50 transition-all"
          >
            <Send className="w-5 h-5" />
            {data.email}
          </motion.a>

          {/* Social Icons */}
          <div className="flex justify-center gap-6">
            {data.socialLinks?.github && (
              <motion.a
                href={data.socialLinks.github}
                target="_blank"
                rel="noopener noreferrer"
                onClick={createRipple}
                whileHover={{ scale: 1.2, rotate: 5 }}
                whileTap={{ scale: 0.9 }}
                className="relative group p-5 bg-slate-900/50 backdrop-blur-xl border-2 border-gray-700 rounded-xl hover:border-cyan-400 transition-all overflow-hidden"
              >
                {/* Ripple effects */}
                {ripples.map(ripple => (
                  <motion.div
                    key={ripple.id}
                    initial={{ scale: 0, opacity: 1 }}
                    animate={{ scale: 4, opacity: 0 }}
                    transition={{ duration: 0.6 }}
                    className="absolute w-10 h-10 bg-cyan-400/30 rounded-full"
                    style={{ left: ripple.x - 20, top: ripple.y - 20 }}
                  />
                ))}
                
                <Github className="w-7 h-7 text-gray-400 group-hover:text-cyan-400 relative z-10 transition-colors" />
                
                {/* Neon glow */}
                <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" style={{ boxShadow: '0 0 30px rgba(6, 182, 212, 0.6)' }}></div>
              </motion.a>
            )}

            {data.socialLinks?.linkedin && (
              <motion.a
                href={data.socialLinks.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                onClick={createRipple}
                whileHover={{ scale: 1.2, rotate: 5 }}
                whileTap={{ scale: 0.9 }}
                className="relative group p-5 bg-slate-900/50 backdrop-blur-xl border-2 border-gray-700 rounded-xl hover:border-violet-400 transition-all overflow-hidden"
              >
                {ripples.map(ripple => (
                  <motion.div
                    key={ripple.id}
                    initial={{ scale: 0, opacity: 1 }}
                    animate={{ scale: 4, opacity: 0 }}
                    transition={{ duration: 0.6 }}
                    className="absolute w-10 h-10 bg-violet-400/30 rounded-full"
                    style={{ left: ripple.x - 20, top: ripple.y - 20 }}
                  />
                ))}
                
                <Linkedin className="w-7 h-7 text-gray-400 group-hover:text-violet-400 relative z-10 transition-colors" />
                
                <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" style={{ boxShadow: '0 0 30px rgba(139, 92, 246, 0.6)' }}></div>
              </motion.a>
            )}

            {data.socialLinks?.twitter && (
              <motion.a
                href={data.socialLinks.twitter}
                target="_blank"
                rel="noopener noreferrer"
                onClick={createRipple}
                whileHover={{ scale: 1.2, rotate: 5 }}
                whileTap={{ scale: 0.9 }}
                className="relative group p-5 bg-slate-900/50 backdrop-blur-xl border-2 border-gray-700 rounded-xl hover:border-fuchsia-400 transition-all overflow-hidden"
              >
                {ripples.map(ripple => (
                  <motion.div
                    key={ripple.id}
                    initial={{ scale: 0, opacity: 1 }}
                    animate={{ scale: 4, opacity: 0 }}
                    transition={{ duration: 0.6 }}
                    className="absolute w-10 h-10 bg-fuchsia-400/30 rounded-full"
                    style={{ left: ripple.x - 20, top: ripple.y - 20 }}
                  />
                ))}
                
                <Twitter className="w-7 h-7 text-gray-400 group-hover:text-fuchsia-400 relative z-10 transition-colors" />
                
                <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" style={{ boxShadow: '0 0 30px rgba(232, 121, 249, 0.6)' }}></div>
              </motion.a>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Contact;
