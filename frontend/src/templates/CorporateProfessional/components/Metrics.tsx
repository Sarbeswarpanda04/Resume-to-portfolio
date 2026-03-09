import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { TrendingUp, Target, Users, Award, DollarSign, Briefcase } from 'lucide-react';
import { Metric } from '../types';

interface MetricsProps {
  metrics?: Metric[];
}

const iconMap: { [key: string]: any } = {
  trending: TrendingUp,
  target: Target,
  users: Users,
  award: Award,
  dollar: DollarSign,
  briefcase: Briefcase,
};

const CountUpAnimation: React.FC<{ end: number; duration?: number }> = ({ 
  end, 
  duration = 2 
}) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;

    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = (timestamp - startTime) / (duration * 1000);

      if (progress < 1) {
        setCount(Math.floor(end * progress));
        animationFrame = requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrame);
  }, [isInView, end, duration]);

  return <span ref={ref}>{count}</span>;
};

const Metrics: React.FC<MetricsProps> = ({ metrics }) => {
  if (!metrics || metrics.length === 0) return null;

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Key Metrics & Achievements
          </h2>
          <p className="text-lg text-gray-600">
            Measurable impact and results delivered
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {metrics.map((metric, index) => {
            const Icon = metric.icon ? iconMap[metric.icon] || TrendingUp : TrendingUp;
            
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center hover:border-blue-900 hover:shadow-md transition-all"
              >
                <Icon className="w-8 h-8 text-blue-900 mx-auto mb-3" />
                
                <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                  {metric.prefix}
                  <CountUpAnimation end={metric.value} />
                  {metric.suffix}
                </div>
                
                <p className="text-sm text-gray-600 font-medium">
                  {metric.label}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Metrics;
