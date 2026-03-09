import React, { useEffect, useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Summary from './components/Summary';
import Metrics from './components/Metrics';
import Experience from './components/Experience';
import Skills from './components/Skills';
import Projects from './components/Projects';
import Education from './components/Education';
import Certifications from './components/Certifications';
import Contact from './components/Contact';
import Footer from './components/Footer';
import BackToTop from './components/BackToTop';
import { PortfolioData, ThemeConfig } from './types';

interface CorporateProfessionalProps {
  data: PortfolioData;
  theme?: ThemeConfig;
}

const CorporateProfessional: React.FC<CorporateProfessionalProps> = ({ data, theme }) => {
  const [activeSection, setActiveSection] = useState('home');
  const [showBackToTop, setShowBackToTop] = useState(false);

  // Intersection Observer for active section tracking
  useEffect(() => {
    const sections = document.querySelectorAll('section[id]');
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: 0.3, rootMargin: '-100px 0px -50% 0px' }
    );

    sections.forEach((section) => observer.observe(section));

    return () => {
      sections.forEach((section) => observer.unobserve(section));
    };
  }, []);

  // Scroll listener for back-to-top button
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div
      className="min-h-screen font-sans"
      style={{
        fontFamily: theme?.fontFamily || 'Inter, system-ui, sans-serif',
        fontSize: theme?.fontSize ? `${theme.fontSize}px` : undefined,
        scrollBehavior: 'smooth',
        color: theme?.textColor || undefined,
        backgroundColor: theme?.backgroundColor || undefined,
        backgroundImage: theme?.backgroundImage
          ? `url(${theme.backgroundImage})`
          : theme?.backgroundColor
          ? undefined
          : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        backgroundSize: theme?.backgroundImage ? 'cover' : undefined,
        backgroundPosition: theme?.backgroundImage ? 'center' : undefined,
        backgroundRepeat: theme?.backgroundImage ? 'no-repeat' : undefined,
      }}
    >
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
          
          body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
          }
          
          html {
            scroll-behavior: smooth;
          }
        `}
      </style>

      <Navbar activeSection={activeSection} />
      
      <main>
        <Hero data={data} />
        <Summary data={data} />
        <Skills skills={data.skills} coursework={data.coursework} />
        <Experience experience={data.experience} />
        <Metrics metrics={data.metrics} />
        <Projects projects={data.projects} />
        <Education education={data.education} />
        <Certifications certifications={data.certifications} />
        <Contact data={data} />
      </main>

      <Footer data={data} />
      <BackToTop isVisible={showBackToTop} />
    </div>
  );
};

export default CorporateProfessional;
