import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Menu, X, Home, User, Code, Briefcase, FolderOpen, GraduationCap, Award, Mail } from 'lucide-react';

interface NavbarProps {
  name: string;
  primaryColor: string;
  activeSection: string;
  scrollToSection: (section: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ name, primaryColor, activeSection, scrollToSection }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const navItems = [
    { name: 'Home', id: 'home', icon: Home },
    { name: 'Profile Summary', id: 'about', icon: User },
    { name: 'Technical Skill', id: 'skills', icon: Code },
    { name: 'Experience', id: 'experience', icon: Briefcase },
    { name: 'Projects', id: 'projects', icon: FolderOpen },
    { name: 'Education', id: 'education', icon: GraduationCap },
    { name: 'Certifications', id: 'certifications', icon: Award },
    { name: 'Contact', id: 'contact', icon: Mail },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white shadow-md' : 'bg-white/90 backdrop-blur-sm'
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <motion.button
            onClick={() => scrollToSection('home')}
            className="text-lg font-bold"
            style={{ color: primaryColor }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {name?.split(' ')[0] || 'Portfolio'}
          </motion.button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className="relative text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-1"
              >
                <item.icon className="w-4 h-4" />
                {item.name}
                <motion.span
                  className="absolute -bottom-1 left-0 h-0.5"
                  style={{
                    backgroundColor: primaryColor,
                    width: activeSection === item.id ? '100%' : 0,
                  }}
                  initial={{ width: 0 }}
                  animate={{ width: activeSection === item.id ? '100%' : 0 }}
                  transition={{ duration: 0.3 }}
                />
              </button>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-gray-600"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden pt-4 pb-2 space-y-2"
          >
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  scrollToSection(item.id);
                  setMobileMenuOpen(false);
                }}
                className="flex items-center gap-2 w-full text-left py-2 text-sm text-gray-600 hover:text-gray-900"
                style={{
                  color: activeSection === item.id ? primaryColor : undefined,
                  fontWeight: activeSection === item.id ? 600 : 400,
                }}
              >
                <item.icon className="w-4 h-4" />
                {item.name}
              </button>
            ))}
          </motion.div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
