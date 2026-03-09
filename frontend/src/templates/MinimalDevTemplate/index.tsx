import React, { useState, useEffect } from 'react';
import { motion, useScroll } from 'framer-motion';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Skills from './components/Skills';
import Projects from './components/Projects';
import Experience from './components/Experience';
import Education from './components/Education';
import Certifications from './components/Certifications';
import Contact from './components/Contact';
import Footer from './components/Footer';
import BackToTop from './components/BackToTop';
import { PortfolioData, ThemeConfig } from './types';

interface MinimalDevTemplateProps {
  data: PortfolioData;
  theme: ThemeConfig;
}

const MinimalDevTemplate: React.FC<MinimalDevTemplateProps> = ({ data, theme }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const { scrollYProgress } = useScroll();

  // Handle scroll for back-to-top button and active section
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300);

      // Update active section based on scroll position
      const sections = ['home', 'about', 'skills', 'experience', 'projects', 'education', 'certifications', 'contact'];
      const current = sections.find((section) => {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          return rect.top <= 100 && rect.bottom >= 100;
        }
        return false;
      });
      if (current) setActiveSection(current);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setMobileMenuOpen(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div
      className="min-h-screen"
      style={{ 
        fontFamily: theme.fontFamily || 'Inter, system-ui, sans-serif',
        color: theme.textColor || undefined,
        backgroundColor: theme.backgroundColor || undefined,
        backgroundImage: theme.backgroundImage
          ? `url(${theme.backgroundImage})`
          : theme.backgroundColor
          ? undefined
          : 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        backgroundSize: theme.backgroundImage ? 'cover' : undefined,
        backgroundPosition: theme.backgroundImage ? 'center' : undefined,
        backgroundRepeat: theme.backgroundImage ? 'no-repeat' : undefined,
      }}
    >
      {/* Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 z-50 origin-left"
        style={{
          backgroundColor: theme.primaryColor,
          scaleX: scrollYProgress,
        }}
      />

      {/* Navbar */}
      <Navbar
        name={data.name}
        primaryColor={theme.primaryColor}
        activeSection={activeSection}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        scrollToSection={scrollToSection}
      />

      {/* Sections */}
      <Hero data={data} theme={theme} />
      <About data={data} theme={theme} />
      <Skills data={data} theme={theme} />
      <Experience data={data} theme={theme} />
      <Projects data={data} theme={theme} />
      <Education data={data} theme={theme} />
      <Certifications data={data} theme={theme} />
      <Contact data={data} theme={theme} />
      <Footer data={data} theme={theme} />

      {/* Back to Top Button */}
      <BackToTop show={showBackToTop} primaryColor={theme.primaryColor} onClick={scrollToTop} />
    </div>
  );
};

export default MinimalDevTemplate;
