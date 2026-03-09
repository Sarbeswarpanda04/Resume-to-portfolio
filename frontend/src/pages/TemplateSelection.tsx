import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Eye, Check, Sparkles, Code, Briefcase, GraduationCap, 
  Palette, Zap, Moon, ArrowLeft, Filter, Search, Moon as MoonIcon, Sun, X
} from 'lucide-react';
import { createPortfolio } from '../services/portfolioService';
import toast from 'react-hot-toast';
import TemplateRenderer from '../components/TemplateRenderer';
import { transformPortfolioData } from '../utils/dataTransformer';
import {
  parseResumeText,
  extractResumeText,
} from '../services/resumeService';

interface Template {
  id: string;
  name: string;
  description: string;
  preview: string;
  category: string;
  icon: any;
  color: string;
  features: string[];
}

const templates: Template[] = [
  {
    id: 'minimal-dev',
    name: 'Minimal Developer',
    description: 'Clean and minimal design perfect for developers who want simplicity',
    preview: '/templates/minimal-dev.png',
    category: 'Developer',
    icon: Code,
    color: 'from-blue-500 to-cyan-500',
    features: ['Clean Layout', 'Code Snippets', 'Dark Mode'],
  },
  {
    id: 'student-academic',
    name: 'Student Academic',
    description: 'Perfect for students and recent graduates showcasing academic achievements',
    preview: '/templates/student-academic.png',
    category: 'Student',
    icon: GraduationCap,
    color: 'from-green-500 to-emerald-500',
    features: ['Timeline View', 'GPA Display', 'Projects'],
  },
  {
    id: 'creative-designer',
    name: 'Creative Designer',
    description: 'Bold and creative design for designers and creative professionals',
    preview: '/templates/creative-designer.png',
    category: 'Designer',
    icon: Palette,
    color: 'from-purple-500 to-pink-500',
    features: ['Portfolio Grid', 'Animations', 'Visual Focus'],
  },
  {
    id: 'corporate-professional',
    name: 'Corporate Professional',
    description: 'Professional template ideal for corporate and business roles',
    preview: '/templates/corporate.png',
    category: 'Professional',
    icon: Briefcase,
    color: 'from-indigo-500 to-blue-500',
    features: ['Formal Design', 'Metrics', 'Experience'],
  },
  {
    id: 'dark-modern',
    name: 'Dark Modern',
    description: 'Modern dark theme portfolio with futuristic design elements',
    preview: '/templates/dark-modern.png',
    category: 'Modern',
    icon: Moon,
    color: 'from-slate-500 to-purple-500',
    features: ['Dark Theme', 'Glassmorphism', 'Neon Accents'],
  },
  {
    id: 'one-page-scroll',
    name: 'One Page Scroll',
    description: 'Single page scrolling portfolio with smooth navigation',
    preview: '/templates/one-page.png',
    category: 'Modern',
    icon: Zap,
    color: 'from-orange-500 to-red-500',
    features: ['Smooth Scroll', 'One Page', 'Minimal'],
  },
];

const TemplateSelection = () => {
  const navigate = useNavigate();
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);

  // Sample data for preview
  const sampleData = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1 234 567 8900',
    title: 'Senior Software Engineer',
    role: 'Senior Software Engineer',
    tagline: 'Building scalable web applications with modern technologies',
    summary: 'Passionate software developer with 5+ years of experience building scalable web applications.',
    about: 'Passionate software developer with 5+ years of experience building scalable web applications.',
    location: 'San Francisco, CA',
    experience: [
      {
        title: 'Senior Software Engineer',
        company: 'Tech Corp',
        duration: '2021 - Present',
        description: 'Led development of cloud-based solutions and mentored junior developers.',
        responsibilities: ['Led development of cloud-based solutions', 'Mentored junior developers', 'Architected scalable systems'],
        achievements: ['Improved system performance by 40%', 'Reduced deployment time by 60%'],
        current: true,
      },
      {
        title: 'Software Developer',
        company: 'Startup Inc',
        duration: '2019 - 2021',
        description: 'Built responsive web applications using React and Node.js.',
        responsibilities: ['Built responsive web applications', 'Implemented RESTful APIs', 'Collaborated with design team'],
      }
    ],
    skills: [
      {
        category: 'Languages',
        skills: ['JavaScript', 'TypeScript', 'Python'],
      },
      {
        category: 'Frameworks',
        skills: ['React', 'Node.js', 'Express'],
      },
      {
        category: 'Tools',
        skills: ['Git', 'Docker', 'AWS'],
      }
    ],
    projects: [
      {
        name: 'E-Commerce Platform',
        description: 'Full-stack e-commerce solution with payment integration',
        techStack: ['React', 'Node.js', 'MongoDB'],
        technologies: ['React', 'Node.js', 'MongoDB'],
        github: 'https://github.com',
        live: 'https://demo.com',
      },
      {
        name: 'Task Management App',
        description: 'Real-time collaborative task management application',
        techStack: ['React', 'Firebase', 'Material-UI'],
        technologies: ['React', 'Firebase', 'Material-UI'],
        github: 'https://github.com',
      }
    ],
    education: [
      {
        degree: 'Bachelor of Computer Science',
        institution: 'University of Technology',
        year: '2019',
        gpa: '3.8',
      }
    ],
    socialLinks: {
      github: 'https://github.com/johndoe',
      linkedin: 'https://linkedin.com/in/johndoe',
      twitter: 'https://twitter.com/johndoe',
    },
    techFocus: ['Web Development', 'Cloud Architecture', 'UI/UX Design'],
    coreStrengths: ['Problem Solving', 'Team Leadership', 'Agile Methodologies'],
  };

  useEffect(() => {
    const savedMode = localStorage.getItem('darkMode');
    const isDark = savedMode === 'true';
    setDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
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

  const categories = ['All', ...Array.from(new Set(templates.map(t => t.category)))];

  const filteredTemplates = templates.filter(template => {
    const matchesCategory = filterCategory === 'All' || template.category === filterCategory;
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  useEffect(() => {
    if (!selectedTemplate) {
      setSelectedTemplate(templates[0]?.id || null);
    }
  }, [selectedTemplate]);

  const handleSelectTemplate = async () => {
    if (!selectedTemplate) {
      toast.error('Please select a template');
      return;
    }

    let resumeRawText = sessionStorage.getItem('resumeRawText');
    const sessionId = sessionStorage.getItem('resumeSessionId');

    // If user jumped directly to /templates after a file upload, convert sessionId -> raw text.
    if (!resumeRawText && sessionId) {
      try {
        const extracted = await extractResumeText(sessionId);
        resumeRawText = extracted.text || '';
        sessionStorage.setItem('resumeRawText', resumeRawText);
        sessionStorage.removeItem('resumeSessionId');
      } catch (e: any) {
        toast.error(e?.message || 'Failed to extract resume text');
      }
    }

    if (!resumeRawText) {
      toast.error('Resume data not found. Please upload again.');
      navigate('/upload');
      return;
    }

    setLoading(true);

    try {
      toast.loading('Optimizing your data for this template...', { id: 'ai-parse' });

      const parsedData = await parseResumeText(resumeRawText, selectedTemplate);

      toast.success('Data optimized with AI!', { id: 'ai-parse' });
      
      const portfolio = await createPortfolio(
        parsedData,
        selectedTemplate,
        `${parsedData.name}'s Portfolio`
      );

      // Show rating popup once after first creation
      sessionStorage.setItem('showRatingForPortfolio', portfolio.id);
      
      toast.success('Portfolio created successfully!');
      navigate(`/editor/${portfolio.id}`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to create portfolio');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen transition-colors ${
      darkMode ? 'bg-black' : 'bg-gray-50'
    }`}>
      {/* Header */}
      <header className={`shadow-sm border-b transition-colors ${
        darkMode 
          ? 'bg-gray-950 border-gray-900' 
          : 'bg-white border-gray-200'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <motion.button
              onClick={() => navigate('/dashboard')}
              whileHover={{ scale: 1.05, x: -5 }}
              whileTap={{ scale: 0.95 }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors ${
                darkMode
                  ? 'text-gray-300 hover:text-white hover:bg-gray-900'
                  : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </motion.button>
            
            <motion.button
              onClick={toggleDarkMode}
              whileHover={{ scale: 1.1, rotate: 180 }}
              whileTap={{ scale: 0.9 }}
              className={`p-2.5 rounded-xl transition-all shadow-sm hover:shadow-lg ${
                darkMode ? 'bg-gray-900' : 'bg-gray-100'
              }`}
            >
              {darkMode ? (
                <Sun className="w-5 h-5 text-yellow-500" />
              ) : (
                <MoonIcon className="w-5 h-5 text-indigo-600" />
              )}
            </motion.button>
          </div>

          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 mb-4"
            >
              <div className="relative">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                  className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full blur-xl opacity-50"
                />
                <div className="relative bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-2 sm:p-3">
                  <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
              </div>
              <h1 className={`text-2xl sm:text-4xl font-bold ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>Choose Your Template</h1>
            </motion.div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className={`text-sm sm:text-lg ${
                darkMode ? 'text-gray-400' : 'text-gray-600'
              }`}
            >
              Select a template that best represents your style and personality
            </motion.p>
          </div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8 flex flex-col sm:flex-row gap-4"
          >
            {/* Search */}
            <div className="flex-1 relative">
              <Search className={`absolute left-3 top-3 w-5 h-5 ${
                darkMode ? 'text-gray-500' : 'text-gray-400'
              }`} />
              <input
                type="text"
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-10 pr-4 py-3 rounded-xl border-2 transition-all ${
                  darkMode
                    ? 'bg-gray-900 border-gray-800 text-white placeholder-gray-500 focus:border-purple-500'
                    : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-500'
                } focus:ring-4 focus:ring-blue-100 dark:focus:ring-purple-900/30 outline-none`}
              />
            </div>

            {/* Category Filter */}
            <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
              {categories.map((category) => (
                <motion.button
                  key={category}
                  onClick={() => setFilterCategory(category)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-4 py-3 rounded-xl font-medium transition-all whitespace-nowrap ${
                    filterCategory === category
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                      : darkMode
                      ? 'bg-gray-900 text-gray-300 hover:bg-gray-800'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {category}
                </motion.button>
              ))}
            </div>
          </motion.div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={filterCategory + searchQuery}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-12"
          >
            {filteredTemplates.map((template, index) => (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -12, scale: 1.02 }}
                onClick={() => setSelectedTemplate(template.id)}
                className={`relative overflow-hidden rounded-2xl cursor-pointer transition-all group ${
                  darkMode
                    ? 'bg-gray-950 border-2'
                    : 'bg-white border-2'
                } ${
                  selectedTemplate === template.id
                    ? 'border-purple-500 shadow-2xl shadow-purple-500/20'
                    : darkMode
                    ? 'border-gray-800 hover:border-gray-700'
                    : 'border-gray-100 hover:border-gray-200'
                }`}
              >
                {/* Gradient Overlay */}
                <div className={`absolute inset-0 bg-gradient-to-br ${template.color} opacity-0 group-hover:opacity-5 transition-opacity`} />
                
                {/* Template Preview */}
                <div className="relative aspect-video bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center overflow-hidden">
                  <div className={`absolute inset-0 bg-gradient-to-br ${template.color} opacity-20`} />
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.3 }}
                    className="relative"
                  >
                    <template.icon className="w-20 h-20 text-white drop-shadow-lg" />
                  </motion.div>
                  
                  {/* Selected Badge */}
                  <AnimatePresence>
                    {selectedTemplate === template.id && (
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        exit={{ scale: 0, rotate: 180 }}
                        className="absolute top-4 right-4 w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-xl"
                      >
                        <Check className="w-6 h-6 text-white" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Template Info */}
                <div className="p-4 sm:p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className={`text-lg sm:text-xl font-bold mb-1 break-words ${
                        darkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        {template.name}
                      </h3>
                      <span className={`inline-block text-xs px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full font-medium ${
                        darkMode
                          ? 'bg-gray-900 text-gray-400'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {template.category}
                      </span>
                    </div>
                  </div>
                  
                  <p className={`text-xs sm:text-sm mb-4 line-clamp-2 ${
                    darkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {template.description}
                  </p>

                  {/* Features */}
                  <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-4">
                    {template.features.map((feature, idx) => (
                      <span
                        key={idx}
                        className={`text-xs px-2 py-0.5 sm:py-1 rounded-lg whitespace-nowrap ${
                          darkMode
                            ? 'bg-gray-900 text-gray-300'
                            : 'bg-gray-50 text-gray-700'
                        }`}
                      >
                        {feature}
                      </span>
                    ))}
                  </div>

                  {/* Preview Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      console.log('Preview clicked for:', template);
                      setPreviewTemplate(template);
                      console.log('Preview state set');
                    }}
                    className={`relative z-10 w-full flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl transition-all font-medium text-sm sm:text-base hover:scale-105 active:scale-95 ${
                      darkMode
                        ? 'bg-gray-900 text-gray-300 hover:bg-gray-800'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Eye className="w-4 h-4" />
                    <span className="hidden sm:inline">Quick Preview</span>
                    <span className="inline sm:hidden">Preview</span>
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* No Results */}
        {filteredTemplates.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`text-center py-20 rounded-2xl ${
              darkMode ? 'bg-gray-950' : 'bg-white'
            }`}
          >
            <Filter className={`w-16 h-16 mx-auto mb-4 ${
              darkMode ? 'text-gray-700' : 'text-gray-300'
            }`} />
            <h3 className={`text-xl font-semibold mb-2 ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              No templates found
            </h3>
            <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
              Try adjusting your filters or search query
            </p>
          </motion.div>
        )}

        {/* Action Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex justify-center"
        >
          <motion.button
            onClick={handleSelectTemplate}
            disabled={!selectedTemplate || loading}
            whileHover={selectedTemplate && !loading ? { scale: 1.05, y: -2 } : {}}
            whileTap={selectedTemplate && !loading ? { scale: 0.95 } : {}}
            className={`relative px-12 py-4 text-lg font-semibold rounded-xl overflow-hidden shadow-2xl transition-all ${
              !selectedTemplate || loading
                ? darkMode
                  ? 'bg-gray-900 text-gray-600 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : ''
            }`}
          >
            {selectedTemplate && !loading && (
              <>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600" />
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 hover:opacity-100 transition-opacity" />
              </>
            )}
            <span className={`relative flex items-center gap-2 ${
              selectedTemplate && !loading ? 'text-white' : ''
            }`}>
              {loading ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-6 h-6 border-2 border-white border-t-transparent rounded-full"
                  />
                  Creating Portfolio...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Use This Template
                </>
              )}
            </span>
          </motion.button>
        </motion.div>
      </main>

      {/* Preview Modal */}
      <AnimatePresence>
        {previewTemplate && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.8)' }}>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPreviewTemplate(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative max-w-6xl w-full max-h-[90vh] overflow-hidden rounded-2xl shadow-2xl bg-white"
            >
            {/* Header */}
            <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{previewTemplate.name}</h3>
                <p className="text-sm text-gray-600">{previewTemplate.description}</p>
              </div>
              <button
                onClick={() => setPreviewTemplate(null)}
                className="p-2 rounded-lg text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Preview Content - Scrollable */}
            <div className="overflow-y-auto max-h-[calc(90vh-120px)] bg-gray-50">
              {/* Render actual template */}
              <div className="w-full">
                <TemplateRenderer 
                  templateId={previewTemplate.id} 
                  data={transformPortfolioData(sampleData, previewTemplate.id)} 
                />
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setPreviewTemplate(null)}
                className="px-6 py-2 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
              >
                Close
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setSelectedTemplate(previewTemplate.id);
                  setPreviewTemplate(null);
                  toast.success(`${previewTemplate.name} selected!`);
                }}
                className={`px-6 py-2 bg-gradient-to-r ${previewTemplate.color} text-white rounded-xl font-medium hover:shadow-lg transition-all`}
              >
                Use This Template
              </motion.button>
            </div>
          </motion.div>
        </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TemplateSelection;
