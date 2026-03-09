import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import PortfolioGrid from './components/PortfolioGrid';
import Skills from './components/Skills';
import Experience from './components/Experience';
import Education from './components/Education';
import Certifications from './components/Certifications';
import Contact from './components/Contact';
import Footer from './components/Footer';
import BackToTop from './components/BackToTop';
import { PortfolioData, ThemeConfig } from './types';

interface CreativeDesignerProps {
  data: PortfolioData;
  theme: ThemeConfig;
}

const CreativeDesigner: React.FC<CreativeDesignerProps> = ({ data, theme }) => {
  const [activeSection, setActiveSection] = useState('home');
  const [showBackToTop, setShowBackToTop] = useState(false);

  // Intersection Observer for active section tracking
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '-50% 0px -50% 0px',
      threshold: 0,
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    const sections = ['home', 'about', 'skills', 'experience', 'projects', 'education', 'certifications', 'contact'];
    sections.forEach((id) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  // Back to top button visibility
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 500);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div
      className="min-h-screen"
      style={{
        fontFamily: theme.fontFamily || "'Montserrat', 'Space Grotesk', system-ui, sans-serif",
        scrollBehavior: 'smooth',
        color: theme.textColor || undefined,
        backgroundColor: theme.backgroundColor || undefined,
        backgroundImage: theme.backgroundImage
          ? `url(${theme.backgroundImage})`
          : theme.backgroundColor
          ? undefined
          : 'linear-gradient(135deg, #1e3a8a 0%, #9333ea 50%, #ec4899 100%)',
        backgroundSize: theme.backgroundImage ? 'cover' : undefined,
        backgroundPosition: theme.backgroundImage ? 'center' : undefined,
        backgroundRepeat: theme.backgroundImage ? 'no-repeat' : undefined,
      }}
    >
      {/* Navbar */}
      <Navbar
        name={data.name}
        primaryColor={theme.primaryColor}
        activeSection={activeSection}
        scrollToSection={scrollToSection}
      />

      {/* All Sections */}
      <Hero data={data} theme={theme} />
      <About data={data} theme={theme} />
      <Skills data={data} theme={theme} />
      <Experience data={data} theme={theme} />
      <PortfolioGrid data={data} theme={theme} />
      <Education data={data} theme={theme} />
      <Certifications data={data} theme={theme} />
      <Contact data={data} theme={theme} />
      <Footer data={data} theme={theme} />

      {/* Back to Top Button */}
      <BackToTop show={showBackToTop} primaryColor={theme.primaryColor} onClick={scrollToTop} />
    </div>
  );
};

export default CreativeDesigner;
