import React from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, Calendar } from 'lucide-react';
import { Education as EducationType } from '../types';

interface EducationProps {
  education: EducationType[];
}

const Education: React.FC<EducationProps> = ({ education }) => {
  return (
    <section id="education" className="py-12 bg-gray-50">
      <div className="max-w-5xl mx-auto px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          {/* Section Header */}
          <div className="flex items-center gap-3 mb-8">
            <GraduationCap className="w-8 h-8 text-blue-900" />
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Education
            </h2>
          </div>

          {/* Education Items */}
          <div className="grid md:grid-cols-2 gap-6">
            {education.map((edu, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white border border-gray-200 rounded-lg p-5 hover:border-blue-900 hover:shadow-md transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <GraduationCap className="w-6 h-6 text-blue-900" />
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-base font-bold text-gray-900 mb-1 leading-snug">
                      {edu.degree}
                    </h3>
                    
                    <p className="text-gray-700 font-medium mb-2">
                      {edu.institution}
                    </p>
                    
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                      <Calendar className="w-4 h-4" />
                      <span className="whitespace-nowrap">{edu.year}</span>
                    </div>
                    
                    {edu.specialization && (
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Specialization:</span> {edu.specialization}
                      </p>
                    )}
                    
                    {edu.gpa && (
                      <div className="mt-2 inline-block px-3 py-1 bg-blue-50 text-blue-900 text-xs font-semibold rounded">
                        GPA: {edu.gpa}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Education;
