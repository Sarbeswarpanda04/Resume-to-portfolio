import React, { useEffect, useState } from 'react';
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

interface DarkModernProps {
  data: PortfolioData;
  theme?: ThemeConfig;
}

const DarkModern: React.FC<DarkModernProps> = ({ data, theme }) => {
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
      setShowBackToTop(window.scrollY > 500);
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
          : 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)',
        backgroundSize: theme?.backgroundImage ? 'cover' : undefined,
        backgroundPosition: theme?.backgroundImage ? 'center' : undefined,
        backgroundRepeat: theme?.backgroundImage ? 'no-repeat' : undefined,
      }}
    >
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap');
          
          body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          }
          
          h1, h2, h3 {
            font-family: 'Space Grotesk', sans-serif;
          }
          
          html {
            scroll-behavior: smooth;
          }

          /* Glassmorphism support */
          @supports (backdrop-filter: blur(10px)) {
            .backdrop-blur-xl {
              backdrop-filter: blur(24px);
            }
          }

          /* Custom scrollbar */
          ::-webkit-scrollbar {
            width: 8px;
          }

          ::-webkit-scrollbar-track {
            background: #0f172a;
          }

          ::-webkit-scrollbar-thumb {
            background: linear-gradient(180deg, #06b6d4, #8b5cf6);
            border-radius: 4px;
          }

          ::-webkit-scrollbar-thumb:hover {
            background: linear-gradient(180deg, #0891b2, #7c3aed);
          }
        `}
      </style>

      <Navbar activeSection={activeSection} />
      
      <main>
        <Hero data={data} />
        <About data={data} />
        <Skills skills={data.skills} coursework={data.coursework} />
        <Experience experience={data.experience} />
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

export default DarkModern;
