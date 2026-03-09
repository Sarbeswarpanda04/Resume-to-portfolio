import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FileText, Zap, Layout, Download, Globe, Shield, Moon, Sun, Sparkles, Users, TrendingUp, Code, Palette, CheckCircle, Star, Clock, Edit3, Rocket, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getStatistics, Statistics } from '../services/statisticsService';

// Animated Carousel Component
const AnimatedCarousel = ({ darkMode }: { darkMode: boolean }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const [direction, setDirection] = useState<'left' | 'right'>('left');

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Software Engineer',
      image: '👩‍💻',
      text: 'This tool saved me hours of work! My portfolio looks amazing and I got 3 interview calls within a week.',
      rating: 5
    },
    {
      name: 'Michael Chen',
      role: 'Product Designer',
      image: '👨‍🎨',
      text: 'The templates are stunning and the customization options are endless. Highly recommend!',
      rating: 5
    },
    {
      name: 'Emily Rodriguez',
      role: 'Marketing Manager',
      image: '👩‍💼',
      text: 'Super easy to use! I had my portfolio ready in less than 10 minutes. The AI parsing is incredibly accurate.',
      rating: 5
    },
  ];

  useEffect(() => {
    if (!isAutoPlay) return;

    const interval = setInterval(() => {
      setDirection('left');
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [isAutoPlay, testimonials.length]);

  const handlePrev = () => {
    setIsAutoPlay(false);
    setDirection('right');
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const handleNext = () => {
    setIsAutoPlay(false);
    setDirection('left');
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const handleIndicatorClick = (index: number) => {
    setIsAutoPlay(false);
    setDirection(index > currentIndex ? 'left' : 'right');
    setCurrentIndex(index);
  };

  return (
    <div className="w-full">
      <div className="relative h-72 sm:h-80 flex items-center">
        {/* Carousel Container */}
        <div className="absolute inset-0 overflow-hidden rounded-2xl">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ 
                opacity: 0,
                x: direction === 'left' ? 300 : -300
              }}
              animate={{
                opacity: index === currentIndex ? 1 : 0,
                x: index === currentIndex ? 0 : (direction === 'left' ? 300 : -300)
              }}
              exit={{
                opacity: 0,
                x: direction === 'left' ? -300 : 300
              }}
              transition={{ duration: 0.5 }}
              className={`absolute inset-0 p-6 sm:p-8 rounded-2xl shadow-lg border ${
                darkMode
                  ? 'bg-gradient-to-br from-gray-900 to-gray-950 border-gray-800'
                  : 'bg-white border-gray-200'
              }`}
            >
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0 text-4xl sm:text-5xl mr-3 sm:mr-4">{testimonial.image}</div>
                <div>
                  <h4 className={`font-semibold text-base sm:text-lg ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  }`}>{testimonial.name}</h4>
                  <p className={`text-sm ${
                    darkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>{testimonial.role}</p>
                </div>
              </div>
              <div className="flex mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className={`text-sm sm:text-base leading-relaxed ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                "{testimonial.text}"
              </p>
            </motion.div>
          ))}
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={handlePrev}
          className={`absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full shadow-lg transition-all hover:scale-110 ${
            darkMode
              ? 'bg-gray-800 hover:bg-gray-700 text-white'
              : 'bg-white hover:bg-gray-100 text-gray-900'
          }`}
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
        <button
          onClick={handleNext}
          className={`absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full shadow-lg transition-all hover:scale-110 ${
            darkMode
              ? 'bg-gray-800 hover:bg-gray-700 text-white'
              : 'bg-white hover:bg-gray-100 text-gray-900'
          }`}
        >
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
      </div>

      {/* Carousel Indicators */}
      <div className="flex justify-center gap-3 mt-8">
        {testimonials.map((_, index) => (
          <motion.button
            key={index}
            onClick={() => handleIndicatorClick(index)}
            animate={{
              scale: index === currentIndex ? 1.2 : 1,
              backgroundColor: index === currentIndex 
                ? 'rgb(59, 130, 246)' 
                : darkMode ? 'rgb(75, 85, 99)' : 'rgb(209, 213, 219)'
            }}
            transition={{ duration: 0.3 }}
            className="w-3 h-3 rounded-full cursor-pointer"
          />
        ))}
      </div>
    </div>
  );
};

const HomePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [darkMode, setDarkMode] = useState(false);
  const [statistics, setStatistics] = useState<Statistics>({
    activeUsers: 0,
    portfoliosCreated: 0,
    successRate: 0,
    userRating: 0
  });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    const savedMode = localStorage.getItem('darkMode');
    // Default to light mode (false) if not set
    const isDark = savedMode === 'true';
    setDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const stats = await getStatistics();
        setStatistics(stats);
      } catch (error) {
        console.error('Failed to fetch statistics:', error);
        // Keep default values on error
      } finally {
        setLoadingStats(false);
      }
    };

    fetchStatistics();
    // Refresh statistics every 30 seconds
    const interval = setInterval(fetchStatistics, 30000);
    return () => clearInterval(interval);
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('darkMode', String(newMode));
    if (newMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const features = [
    {
      icon: <FileText className="w-5 h-5 sm:w-6 sm:h-6" />,
      title: 'Smart Resume Parsing',
      description: 'AI-powered extraction of your resume data in seconds',
    },
    {
      icon: <Layout className="w-5 h-5 sm:w-6 sm:h-6" />,
      title: '6+ Professional Templates',
      description: 'Choose from beautifully designed portfolio templates',
    },
    {
      icon: <Zap className="w-5 h-5 sm:w-6 sm:h-6" />,
      title: 'Live Editor',
      description: 'Real-time preview and customization of your portfolio',
    },
    {
      icon: <Download className="w-5 h-5 sm:w-6 sm:h-6" />,
      title: 'Download Code',
      description: 'Export React or static HTML version of your portfolio',
    },
    {
      icon: <Globe className="w-5 h-5 sm:w-6 sm:h-6" />,
      title: 'Custom Publishing',
      description: 'Publish under your own custom domain',
    },
    {
      icon: <Shield className="w-5 h-5 sm:w-6 sm:h-6" />,
      title: 'Secure & Private',
      description: 'Your data is protected with Firebase Authentication',
    },
  ];

  return (
    <div className="min-h-screen transition-colors duration-300">
      {/* Navigation */}
      <nav className={`shadow-sm border-b transition-colors sticky top-0 z-50 ${
        darkMode 
          ? 'bg-black border-gray-900' 
          : 'bg-white border-gray-200'
      }`}>
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-16">
            <motion.div 
              className="flex items-center group cursor-pointer min-w-0 flex-1"
              whileHover={{ scale: 1.05 }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <motion.div
                className="relative flex-shrink-0"
                animate={{
                  rotate: [0, 360],
                }}
                transition={{
                  duration: 20,
                  repeat: Infinity,
                  ease: "linear"
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-lg sm:rounded-xl blur-md opacity-50 group-hover:opacity-75 transition-opacity" />
                <div className="relative bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg sm:rounded-xl p-1.5 sm:p-2">
                  <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
              </motion.div>
              <span className={`ml-2 sm:ml-3 text-sm sm:text-lg lg:text-xl font-bold bg-gradient-to-r bg-clip-text text-transparent truncate ${
                darkMode 
                  ? 'from-blue-400 to-purple-400' 
                  : 'from-blue-600 to-purple-600'
              }`}>
                Resume to Portfolio
              </span>
            </motion.div>
            <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 shrink-0">
              <motion.button
                onClick={toggleDarkMode}
                whileHover={{ scale: 1.1, rotate: 180 }}
                whileTap={{ scale: 0.9 }}
                className={`p-2 rounded-lg sm:rounded-xl transition-all group shadow-sm hover:shadow-lg hover:bg-gradient-to-br hover:from-blue-500 hover:to-purple-500 ${
                  darkMode ? 'bg-gray-900' : 'bg-gray-100'
                }`}
              >
                {darkMode ? (
                  <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500 group-hover:text-white transition-colors" />
                ) : (
                  <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 group-hover:text-white transition-colors" />
                )}
              </motion.button>
              <motion.button
                onClick={() => navigate(user ? '/dashboard' : '/auth')}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="relative px-3 sm:px-5 lg:px-6 py-2 sm:py-2 lg:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm lg:text-base font-semibold overflow-hidden group whitespace-nowrap"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 transition-transform group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="relative text-white flex items-center gap-1.5 sm:gap-2">
                  {user ? 'Dashboard' : 'Get Started'}
                  <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
                </span>
              </motion.button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className={`relative py-16 sm:py-20 overflow-hidden transition-colors ${
        darkMode
          ? 'bg-gradient-to-br from-black via-gray-950 to-black'
          : 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50'
      }`}>
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 90, 0],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1.2, 1, 1.2],
              rotate: [90, 0, 90],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full blur-3xl"
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="mb-6 inline-block"
            >
              <div className="relative">
                <motion.div
                  animate={{
                    rotate: 360,
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                  className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full blur-2xl opacity-50"
                />
                <div className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-3xl p-4 sm:p-6 shadow-2xl">
                  <FileText className="w-14 h-14 sm:w-20 sm:h-20 text-white" />
                </div>
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className={`text-3xl sm:text-5xl lg:text-6xl leading-tight font-bold mb-6 ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}
            >
              Transform Your Resume Into a
              <br />
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Stunning Portfolio
              </span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className={`text-base sm:text-xl mb-8 max-w-3xl mx-auto px-2 sm:px-0 ${
                darkMode ? 'text-gray-300' : 'text-gray-600'
              }`}
            >
              Upload your resume and let AI create a professional portfolio website in minutes.
              Choose from beautiful templates, customize with live preview, and publish instantly.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-stretch sm:items-center max-w-md sm:max-w-none mx-auto"
            >
              <motion.button
                onClick={() => navigate(user ? '/upload' : '/auth')}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="relative w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold rounded-xl overflow-hidden group shadow-xl"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600" />
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="relative text-white flex items-center gap-2">
                  Create Your Portfolio
                  <Sparkles className="w-5 h-5" />
                </span>
              </motion.button>
              <motion.button
                onClick={() => navigate('/upload')}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className={`w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold rounded-xl border-2 hover:border-purple-500 transition-colors shadow-lg ${
                  darkMode
                    ? 'bg-gray-800 text-white border-gray-700'
                    : 'bg-white text-gray-900 border-gray-300'
                }`}
              >
                View Templates
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className={`py-20 transition-colors ${
        darkMode ? 'bg-black' : 'bg-white'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className={`text-3xl sm:text-4xl font-bold mb-4 ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}
            >
              Everything You Need
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className={`text-base sm:text-xl ${
                darkMode ? 'text-gray-300' : 'text-gray-600'
              }`}
            >
              Powerful features to create your perfect portfolio
            </motion.p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 auto-rows-fr">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className={`group relative rounded-2xl p-4 sm:p-6 shadow-md hover:shadow-2xl transition-all border h-full ${
                  darkMode
                    ? 'bg-gray-950 border-gray-800'
                    : 'bg-white border-gray-100'
                }`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity ${
                  darkMode
                    ? 'from-blue-500/10 to-purple-500/10'
                    : 'from-blue-500/5 to-purple-500/5'
                }`} />
                <div className="relative flex flex-col h-full">
                  <div className="rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg h-16 sm:h-20 px-2 sm:px-4 py-2 sm:py-3 flex items-start">
                    <div className="flex items-start gap-2 sm:gap-3 w-full">
                      <motion.div
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.5 }}
                        className="shrink-0 w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-white/15 grid place-items-center mt-0.5"
                      >
                        <div className="text-white">{feature.icon}</div>
                      </motion.div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-[11px] sm:text-sm font-bold leading-tight text-white break-words">
                          {feature.title}
                        </h3>
                      </div>
                    </div>
                  </div>
                  <p className={`mt-3 sm:mt-4 text-xs sm:text-base leading-snug sm:leading-normal ${
                    darkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className={`py-20 transition-colors ${
        darkMode ? 'bg-gray-950' : 'bg-gray-50'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className={`text-3xl sm:text-4xl font-bold mb-4 ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}
            >
              How It Works
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className={`text-base sm:text-xl ${
                darkMode ? 'text-gray-300' : 'text-gray-600'
              }`}
            >
              Create your portfolio in 4 simple steps
            </motion.p>
          </div>

          <div className="grid grid-cols-2 gap-8">
            {[
              { step: '1', title: 'Upload Resume', desc: 'Upload PDF/DOCX or paste text' },
              { step: '2', title: 'AI Processing', desc: 'Automatic data extraction' },
              { step: '3', title: 'Choose Template', desc: 'Select from 6+ designs' },
              { step: '4', title: 'Publish & Share', desc: 'Download or publish online' },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                  className="relative w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full blur-lg opacity-50" />
                  <div className="relative w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-600 to-purple-600 text-white rounded-full flex items-center justify-center text-2xl sm:text-3xl font-bold shadow-lg">
                    {item.step}
                  </div>
                </motion.div>
                <h3 className={`text-lg sm:text-xl font-semibold mb-2 ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>{item.title}</h3>
                <p className={`text-sm sm:text-base ${
                  darkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className={`py-20 transition-colors ${
        darkMode ? 'bg-black' : 'bg-white'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className={`text-3xl sm:text-4xl font-bold mb-4 ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Trusted by Professionals Worldwide
            </h2>
            <p className={`text-base sm:text-xl ${
              darkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Join the growing community of successful professionals
            </p>
          </motion.div>

          <div className="grid grid-cols-2 gap-6 sm:gap-8">
            {[
              { icon: <Users className="w-10 h-10" />, key: 'activeUsers', label: 'Active Users', suffix: '+' },
              { icon: <FileText className="w-10 h-10" />, key: 'portfoliosCreated', label: 'Portfolios Created', suffix: '+' },
              { icon: <TrendingUp className="w-10 h-10" />, key: 'successRate', label: 'Success Rate', suffix: '%' },
              { icon: <Star className="w-10 h-10" />, key: 'userRating', label: 'User Rating', suffix: '/5' },
            ].map((stat, index) => {
              const value = stat.key === 'activeUsers' ? statistics.activeUsers :
                           stat.key === 'portfoliosCreated' ? statistics.portfoliosCreated :
                           stat.key === 'successRate' ? statistics.successRate :
                           statistics.userRating;
              
              const displayValue = loadingStats ? '...' : 
                                  stat.key === 'userRating' ? value.toFixed(1) :
                                  value.toLocaleString();

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -5, scale: 1.05 }}
                  className={`text-center p-6 sm:p-8 rounded-2xl shadow-lg border ${
                    darkMode
                      ? 'bg-gradient-to-br from-gray-900 to-gray-950 border-gray-800'
                      : 'bg-gradient-to-br from-white to-gray-50 border-gray-200'
                  }`}
                >
                  <motion.div
                    animate={{ 
                      rotate: [0, 5, -5, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="inline-block p-3 sm:p-4 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl mb-4 text-white"
                  >
                    {stat.icon}
                  </motion.div>
                  <motion.h3
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 + 0.3 }}
                    className={`text-3xl sm:text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent`}
                  >
                    {displayValue}{!loadingStats && stat.suffix}
                  </motion.h3>
                  <p className={`text-base sm:text-lg ${
                    darkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}>{stat.label}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className={`py-20 transition-colors ${
        darkMode ? 'bg-gray-950' : 'bg-gray-50'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className={`text-3xl sm:text-4xl font-bold mb-4 ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              What Our Users Say
            </h2>
            <p className={`text-base sm:text-xl ${
              darkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Real stories from real professionals
            </p>
          </motion.div>

          <div className="relative max-w-3xl mx-auto">
            {/* Testimonials Carousel */}
            <div className="relative h-72 sm:h-80 flex items-center">
              <AnimatedCarousel darkMode={darkMode} />
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className={`py-20 transition-colors ${
        darkMode ? 'bg-black' : 'bg-white'
      }`}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className={`text-3xl sm:text-4xl font-bold mb-4 ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Why Choose Us?
            </h2>
            <p className={`text-base sm:text-xl ${
              darkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              See how we compare to traditional methods
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Traditional Way */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className={`p-6 sm:p-8 rounded-2xl border-2 ${
                darkMode
                  ? 'bg-gray-900 border-red-500/30'
                  : 'bg-gray-50 border-red-300'
              }`}
            >
              <h3 className={`text-2xl font-bold mb-6 text-red-500`}>
                Traditional Way
              </h3>
              <ul className="space-y-4">
                {[
                  'Hours of coding required',
                  'Expensive developers needed',
                  'Complex hosting setup',
                  'Manual content updates',
                  'Limited design options',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="mt-1">
                      <div className="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center">
                        <span className="text-red-500 text-xs">✗</span>
                      </div>
                    </div>
                    <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Our Way */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className={`p-6 sm:p-8 rounded-2xl border-2 ${
                darkMode
                  ? 'bg-gradient-to-br from-blue-900/20 to-purple-900/20 border-blue-500'
                  : 'bg-gradient-to-br from-blue-50 to-purple-50 border-blue-400'
              }`}
            >
              <h3 className={`text-2xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent`}>
                With Resume to Portfolio
              </h3>
              <ul className="space-y-4">
                {[
                  'Ready in minutes, not hours',
                  'Completely free to start',
                  'One-click publishing',
                  'AI-powered automation',
                  '6+ professional templates',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="mt-1">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    </div>
                    <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Advanced Features Section */}
      <section className={`py-20 transition-colors ${
        darkMode ? 'bg-gray-950' : 'bg-gray-50'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className={`text-3xl sm:text-4xl font-bold mb-4 ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Advanced Features
            </h2>
            <p className={`text-base sm:text-xl ${
              darkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Everything you need to stand out
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[
              {
                icon: <Edit3 className="w-6 h-6" />,
                title: 'Live Editor',
                desc: 'Edit and preview changes in real-time with our intuitive editor',
                color: 'from-blue-500 to-cyan-500'
              },
              {
                icon: <Palette className="w-6 h-6" />,
                title: 'Theme Customization',
                desc: 'Customize colors, fonts, and layouts to match your brand',
                color: 'from-purple-500 to-pink-500'
              },
              {
                icon: <Code className="w-6 h-6" />,
                title: 'Export Code',
                desc: 'Download clean React or HTML code for self-hosting',
                color: 'from-green-500 to-emerald-500'
              },
              {
                icon: <Rocket className="w-6 h-6" />,
                title: 'Fast Loading',
                desc: 'Optimized for performance with lazy loading and caching',
                color: 'from-orange-500 to-red-500'
              },
              {
                icon: <Shield className="w-6 h-6" />,
                title: 'SEO Optimized',
                desc: 'Built-in SEO best practices to improve discoverability',
                color: 'from-indigo-500 to-purple-500'
              },
              {
                icon: <Clock className="w-6 h-6" />,
                title: 'Auto-Save',
                desc: 'Never lose your work with automatic saving',
                color: 'from-pink-500 to-rose-500'
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -5, scale: 1.02 }}
                className={`p-6 rounded-2xl shadow-lg border ${
                  darkMode
                    ? 'bg-gradient-to-br from-gray-900 to-gray-950 border-gray-800'
                    : 'bg-white border-gray-200'
                }`}
              >
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                  className={`inline-block p-3 bg-gradient-to-br ${feature.color} rounded-xl mb-4 text-white shadow-lg`}
                >
                  {feature.icon}
                </motion.div>
                <h3 className={`text-xl font-semibold mb-2 ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>{feature.title}</h3>
                <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600" />
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'linear',
          }}
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.2) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(255,255,255,0.2) 0%, transparent 50%)',
          }}
        />
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl font-bold mb-4 text-white"
          >
            Ready to Build Your Portfolio?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-base sm:text-xl mb-8 text-white/90"
          >
            Join thousands of professionals who have created their portfolio with us
          </motion.p>
          <motion.button
            onClick={() => navigate(user ? '/upload' : '/auth')}
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="relative w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 rounded-xl text-base sm:text-lg font-semibold overflow-hidden group shadow-2xl"
          >
            <div className="absolute inset-0 bg-white" />
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            <span className="relative bg-gradient-to-r from-blue-600 to-purple-600 group-hover:text-white bg-clip-text text-transparent group-hover:bg-clip-border transition-all flex items-center gap-2 justify-center">
              Get Started Free
              <Sparkles className="w-5 h-5" />
            </span>
          </motion.button>
        </div>
      </section>

      {/* Footer */}
      <footer className={`py-20 transition-colors ${
        darkMode
          ? 'bg-gradient-to-b from-black to-gray-950'
          : 'bg-gradient-to-b from-gray-900 to-gray-950'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            {/* Brand Section */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <div className="flex items-center mb-6">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl blur-md opacity-60" />
                    <div className="relative bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl p-3">
                      <FileText className="w-7 h-7 text-white" />
                    </div>
                  </div>
                  <span className="ml-3 text-xl sm:text-2xl font-bold text-white">
                    Resume to Portfolio
                  </span>
                </div>
                <p className={`mb-8 max-w-md leading-relaxed ${
                  darkMode ? 'text-gray-400' : 'text-gray-300'
                }`}>
                  Transform your resume into a stunning portfolio website in minutes. Choose from professional templates, customize with ease, and publish instantly.
                </p>
                <div className="flex gap-3 flex-wrap">
                  {[
                    { icon: Globe, label: 'Website' },
                    { icon: Code, label: 'GitHub' },
                    { icon: Sparkles, label: 'Social' }
                  ].map((social, idx) => (
                    <motion.a
                      key={idx}
                      href="#"
                      whileHover={{ scale: 1.15, y: -3 }}
                      transition={{ duration: 0.3 }}
                      className={`p-3 rounded-xl transition-all ${
                        darkMode
                          ? 'bg-gray-900 hover:bg-gradient-to-br hover:from-blue-500 hover:to-purple-500 text-gray-400 hover:text-white'
                          : 'bg-gray-800 hover:bg-gradient-to-br hover:from-blue-500 hover:to-purple-500 text-gray-300 hover:text-white'
                      }`}
                      title={social.label}
                    >
                      <social.icon className="w-5 h-5" />
                    </motion.a>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Product Links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <h3 className="font-bold text-lg mb-6 text-white flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"></div>
                Product
              </h3>
              <ul className="space-y-4">
                {['Templates', 'Pricing', 'Features', 'Integrations'].map((item) => (
                  <li key={item}>
                    <a
                      href="#"
                      className={`hover:text-transparent hover:bg-gradient-to-r hover:from-blue-400 hover:to-purple-400 hover:bg-clip-text transition-all group ${
                        darkMode ? 'text-gray-400' : 'text-gray-300'
                      }`}
                    >
                      <span className="group-hover:font-semibold">{item}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Company Links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <h3 className="font-bold text-lg mb-6 text-white flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"></div>
                Company
              </h3>
              <ul className="space-y-4">
                {['About Us', 'Blog', 'Careers', 'Contact'].map((item) => (
                  <li key={item}>
                    <a
                      href="#"
                      className={`hover:text-transparent hover:bg-gradient-to-r hover:from-blue-400 hover:to-purple-400 hover:bg-clip-text transition-all group ${
                        darkMode ? 'text-gray-400' : 'text-gray-300'
                      }`}
                    >
                      <span className="group-hover:font-semibold">{item}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Resources Links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              <h3 className="font-bold text-lg mb-6 text-white flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"></div>
                Resources
              </h3>
              <ul className="space-y-4">
                {['Documentation', 'API Docs', 'Help Center', 'Changelog'].map((item) => (
                  <li key={item}>
                    <a
                      href="#"
                      className={`hover:text-transparent hover:bg-gradient-to-r hover:from-blue-400 hover:to-purple-400 hover:bg-clip-text transition-all group ${
                        darkMode ? 'text-gray-400' : 'text-gray-300'
                      }`}
                    >
                      <span className="group-hover:font-semibold">{item}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>

          {/* Divider */}
          <div className={`my-12 h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent`}></div>

          {/* Bottom Section */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="flex flex-col md:flex-row justify-between items-center gap-6"
          >
            <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              &copy; 2025 Resume to Portfolio. All rights reserved.
            </p>
            <div className="flex gap-6 flex-wrap justify-center">
              {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map((item) => (
                <a
                  key={item}
                  href="#"
                  className={`text-sm hover:text-transparent hover:bg-gradient-to-r hover:from-blue-400 hover:to-purple-400 hover:bg-clip-text transition-all ${
                    darkMode ? 'text-gray-500' : 'text-gray-400'
                  }`}
                >
                  {item}
                </a>
              ))}
            </div>
          </motion.div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
