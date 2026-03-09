import React from 'react';
import { motion } from 'framer-motion';
import { FileText, CheckCircle } from 'lucide-react';
import { PortfolioData } from '../types';

interface SummaryProps {
  data: PortfolioData;
}

const Summary: React.FC<SummaryProps> = ({ data }) => {
  return (
    <section id="summary" className="py-16 bg-gray-50">
      <div className="max-w-5xl mx-auto px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          {/* Section Header */}
          <div className="flex items-center gap-3 mb-8">
            <FileText className="w-8 h-8 text-blue-900" />
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Profile Summary
            </h2>
          </div>

          {/* Summary Box */}
          <div className="bg-white border-l-4 border-blue-900 rounded-lg p-8 shadow-sm">
            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              {data.summary}
            </p>

            {/* Core Strengths */}
            {data.coreStrengths && data.coreStrengths.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Core Strengths
                </h3>
                <ul className="grid md:grid-cols-2 gap-3">
                  {data.coreStrengths.map((strength, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="flex items-start gap-2 text-gray-700"
                    >
                      <CheckCircle className="w-5 h-5 text-blue-900 flex-shrink-0 mt-0.5" />
                      <span>{strength}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Summary;
