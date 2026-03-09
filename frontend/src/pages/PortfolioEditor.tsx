import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Save,
  Download,
  Globe,
  Monitor,
  Smartphone,
  Tablet,
  ArrowLeft,
  Settings,
  Moon,
  Sun,
  Palette,
  Type,
  Layout,
  Sparkles,
  Star,
  Check,
  X,
  ChevronRight,
  ChevronDown,
  Maximize2,
  ZoomIn,
  ZoomOut,
  Undo2,
  Redo2,
  Info,
  RefreshCw,
  Code,
  Briefcase,
  GraduationCap,
  Zap,
} from 'lucide-react';
import {
  getPortfolio,
  updatePortfolio,
  publishPortfolio,
  downloadPortfolio,
  Portfolio,
} from '../services/portfolioService';
import toast from 'react-hot-toast';
import { saveAs } from 'file-saver';
import TemplateRenderer from '../components/TemplateRenderer';
import { submitRating } from '../services/ratingService';

const PortfolioEditor = () => {
  const { portfolioId } = useParams();
  const navigate = useNavigate();
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [viewMode, setViewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [showSettings, setShowSettings] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [fullscreen, setFullscreen] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState<{ [key: string]: boolean }>({
    basicInfo: false,
    theme: false,
    content: false,
    sections: false,
    advanced: true,
  });
  const [history, setHistory] = useState<Portfolio[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [showTemplateSwitcher, setShowTemplateSwitcher] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [customUrl, setCustomUrl] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedRating, setSelectedRating] = useState(0);
  const [submittingRating, setSubmittingRating] = useState(false);

  const templates = [
    { id: 'minimal-dev', name: 'Minimal Developer', icon: Code, color: 'from-blue-500 to-cyan-500' },
    { id: 'student-academic', name: 'Student Academic', icon: GraduationCap, color: 'from-green-500 to-emerald-500' },
    { id: 'creative-designer', name: 'Creative Designer', icon: Palette, color: 'from-purple-500 to-pink-500' },
    { id: 'corporate-professional', name: 'Corporate Professional', icon: Briefcase, color: 'from-indigo-500 to-blue-500' },
    { id: 'dark-modern', name: 'Dark Modern', icon: Moon, color: 'from-slate-500 to-purple-500' },
    { id: 'one-page-scroll', name: 'One Page Scroll', icon: Zap, color: 'from-orange-500 to-red-500' },
  ];

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

  useEffect(() => {
    loadPortfolio();
  }, [portfolioId]);

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

  const loadPortfolio = async () => {
    if (!portfolioId) return;

    try {
      const data = await getPortfolio(portfolioId);
      
      // Ensure theme has default values
      if (!data.theme) {
        data.theme = {
          primaryColor: '#0ea5e9',
          secondaryColor: '#64748b',
          accentColor: '#8b5cf6',
          backgroundColor: undefined,
          backgroundImage: undefined,
          textColor: undefined,
          fontSize: 16,
          fontFamily: 'Inter',
          sections: {
            about: true,
            education: true,
            experience: true,
            skills: true,
            projects: true,
            certifications: true,
            contact: true,
          },
        };
      }
      
      // Ensure sections exist
      if (!data.theme.sections) {
        data.theme.sections = {
          about: true,
          education: true,
          experience: true,
          skills: true,
          projects: true,
          certifications: true,
          contact: true,
        };
      }

      // Normalize optional arrays/objects so nested editing paths work
      if (!data.data.links) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (data.data as any).links = {};
      }
      if (!data.data.certifications) {
        data.data.certifications = [];
      }
      
      setPortfolio(data);
      setHistory([data]);
      setHistoryIndex(0);

      // Show rating popup once after first portfolio creation
      const shouldShowRating =
        sessionStorage.getItem('showRatingForPortfolio') === data.id &&
        !localStorage.getItem(`portfolioRated_${data.id}`);

      if (shouldShowRating) {
        sessionStorage.removeItem('showRatingForPortfolio');
        setSelectedRating(0);
        setShowRatingModal(true);
      }
    } catch (error) {
      toast.error('Failed to load portfolio');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitRating = async () => {
    if (!portfolio) return;
    if (selectedRating < 1 || selectedRating > 5) {
      toast.error('Please select a rating');
      return;
    }

    setSubmittingRating(true);
    try {
      await submitRating(portfolio.id, selectedRating);
      localStorage.setItem(`portfolioRated_${portfolio.id}`, 'true');
      toast.success('Thanks for your feedback!');
      setShowRatingModal(false);
    } catch (error) {
      toast.error('Failed to submit rating');
    } finally {
      setSubmittingRating(false);
    }
  };

  const handleSkipRating = () => {
    if (portfolio) {
      localStorage.setItem(`portfolioRated_${portfolio.id}`, 'true');
    }
    setShowRatingModal(false);
  };

  const handleSave = async () => {
    if (!portfolio) return;

    setSaving(true);
    try {
      await updatePortfolio(portfolio.id, portfolio);
      setLastSaved(new Date());
      toast.success('Portfolio saved!');
    } catch (error) {
      toast.error('Failed to save portfolio');
    } finally {
      setSaving(false);
    }
  };

  const debouncedSave = useCallback(async (portfolioToSave: Portfolio) => {
    try {
      await updatePortfolio(portfolioToSave.id, portfolioToSave);
      setLastSaved(new Date());
    } catch (error) {
      console.error('Auto-save failed:', error);
    }
  }, []);

  const handlePublish = () => {
    if (!portfolio) return;
    // Generate default URL from portfolio name
    const defaultUrl = portfolio.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    setCustomUrl(portfolio.publishedUrl ? portfolio.publishedUrl.split('/').pop() || defaultUrl : defaultUrl);
    setShowPublishModal(true);
  };

  const handleConfirmPublish = async () => {
    if (!portfolio) return;

    setIsPublishing(true);
    try {
      const { url } = await publishPortfolio(portfolio.id, customUrl);
      toast.success('Portfolio published successfully!');
      setPortfolio({ ...portfolio, published: true, publishedUrl: url });
      setShowPublishModal(false);
    } catch (error) {
      toast.error('Failed to publish portfolio');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleDownload = async (format: 'react' | 'static') => {
    if (!portfolio) return;

    try {
      const blob = await downloadPortfolio(portfolio.id, format);
      saveAs(blob, `${portfolio.name}-${format}.zip`);
      toast.success('Download started!');
    } catch (error) {
      toast.error('Failed to download portfolio');
    }
  };

  const updateField = (path: string, value: any) => {
    if (!portfolio) return;

    const pathParts = path.split('.');
    const newPortfolio = { ...portfolio };
    let current: any = newPortfolio;

    for (let i = 0; i < pathParts.length - 1; i++) {
      current = current[pathParts[i]];
    }

    current[pathParts[pathParts.length - 1]] = value;
    setPortfolio(newPortfolio);
    
    // Add to history for undo/redo
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newPortfolio);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);

    // Auto-save with debounce
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(() => {
      debouncedSave(newPortfolio);
    }, 2000);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setPortfolio(history[historyIndex - 1]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setPortfolio(history[historyIndex + 1]);
    }
  };

  const toggleSection = (section: string) => {
    setCollapsedSections({
      ...collapsedSections,
      [section]: !collapsedSections[section],
    });
  };

  const handleZoomIn = () => {
    setZoomLevel(Math.min(zoomLevel + 10, 150));
  };

  const handleZoomOut = () => {
    setZoomLevel(Math.max(zoomLevel - 10, 50));
  };

  const handleTemplateSwitch = (templateId: string) => {
    if (!portfolio) return;
    
    const newPortfolio = { ...portfolio, templateId };
    setPortfolio(newPortfolio);
    
    // Add to history
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newPortfolio);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    
    setShowTemplateSwitcher(false);
    toast.success(`Switched to ${templates.find(t => t.id === templateId)?.name}`);
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center gap-4 ${
        darkMode ? 'bg-black' : 'bg-white'
      }`}>
        <motion.div
          animate={{
            rotate: 360,
            scale: [1, 1.2, 1],
          }}
          transition={{
            rotate: { duration: 2, repeat: Infinity, ease: 'linear' },
            scale: { duration: 1, repeat: Infinity },
          }}
          className="w-16 h-16 rounded-full bg-gradient-to-tr from-blue-500 via-purple-500 to-pink-500"
        />
        <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
          Loading editor...
        </p>
      </div>
    );
  }

  if (!portfolio) return null;

  return (
    <div className={`h-screen flex flex-col overflow-hidden ${
      darkMode ? 'bg-black' : 'bg-gray-50'
    }`}>
      {/* Top Bar */}
      <header className={`${
        darkMode
          ? 'bg-gray-950 border-gray-800'
          : 'bg-white border-gray-200'
      } border-b backdrop-blur-sm bg-opacity-90 z-50`}>
        <div className="px-3 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-2 sm:gap-4 flex-wrap">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <motion.button
              whileHover={{ scale: 1.05, x: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/dashboard')}
              className={`p-2 rounded-lg ${
                darkMode
                  ? 'text-gray-400 hover:text-white hover:bg-gray-900'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              } transition-all`}
            >
              <ArrowLeft className="w-5 h-5" />
            </motion.button>
            <div>
              <div className="flex items-center gap-2">
                <motion.div
                  animate={{
                    boxShadow: [
                      '0 0 20px rgba(59, 130, 246, 0.5)',
                      '0 0 30px rgba(168, 85, 247, 0.5)',
                      '0 0 20px rgba(236, 72, 153, 0.5)',
                      '0 0 20px rgba(59, 130, 246, 0.5)',
                    ],
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center"
                >
                  <Sparkles className="w-4 h-4 text-white" />
                </motion.div>
                <h1 className={`text-lg sm:text-xl font-bold truncate ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {portfolio.name}
                </h1>
              </div>
              <div className="hidden sm:flex items-center gap-2">
                <p className={`text-xs sm:text-sm ${
                  darkMode ? 'text-gray-500' : 'text-gray-600'
                }`}>Editor • Live</p>
                
                {/* Template Switcher Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowTemplateSwitcher(true)}
                  className={`hidden sm:flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-all ${
                    darkMode
                      ? 'bg-gray-900 text-gray-400 hover:text-white hover:bg-gray-800'
                      : 'bg-gray-100 text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                  }`}
                  title="Switch Template"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span className="hidden md:inline">Switch</span>
                </motion.button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-0.5 sm:gap-1.5 sm:gap-2 lg:gap-3 overflow-x-auto pb-1 sm:pb-0">
            {/* View Mode Toggle */}
            <div className={`hidden sm:flex items-center gap-0.5 p-0.5 sm:p-1 rounded-lg ${
              darkMode ? 'bg-gray-900' : 'bg-gray-100'
            }`}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setViewMode('desktop')}
                className={`p-1 sm:p-2 rounded-lg transition-all ${
                  viewMode === 'desktop'
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                    : darkMode
                    ? 'text-gray-400 hover:text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                title="Desktop View"
              >
                <Monitor className="w-3 h-3 sm:w-4 sm:h-4" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setViewMode('tablet')}
                className={`p-1 sm:p-2 rounded-lg transition-all ${
                  viewMode === 'tablet'
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                    : darkMode
                    ? 'text-gray-400 hover:text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                title="Tablet View"
              >
                <Tablet className="w-3 h-3 sm:w-4 sm:h-4" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setViewMode('mobile')}
                className={`p-1 sm:p-2 rounded-lg transition-all ${
                  viewMode === 'mobile'
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                    : darkMode
                    ? 'text-gray-400 hover:text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                title="Mobile View"
              >
                <Smartphone className="w-3 h-3 sm:w-4 sm:h-4" />
              </motion.button>
            </div>

            {/* Zoom Controls */}
            <div className={`hidden sm:flex items-center gap-0.5 p-0.5 sm:p-1 rounded-lg ${
              darkMode ? 'bg-gray-900' : 'bg-gray-100'
            }`}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleZoomOut}
                disabled={zoomLevel <= 50}
                className={`p-1 sm:p-2 rounded-lg transition-all ${
                  darkMode
                    ? 'text-gray-400 hover:text-white disabled:opacity-30'
                    : 'text-gray-600 hover:text-gray-900 disabled:opacity-30'
                }`}
                title="Zoom Out"
              >
                <ZoomOut className="w-3 h-3 sm:w-4 sm:h-4" />
              </motion.button>
              <span className={`px-1.5 sm:px-2 text-xs font-medium ${
                darkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {zoomLevel}%
              </span>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleZoomIn}
                disabled={zoomLevel >= 150}
                className={`p-1 sm:p-2 rounded-lg transition-all ${
                  darkMode
                    ? 'text-gray-400 hover:text-white disabled:opacity-30'
                    : 'text-gray-600 hover:text-gray-900 disabled:opacity-30'
                }`}
                title="Zoom In"
              >
                <ZoomIn className="w-3 h-3 sm:w-4 sm:h-4" />
              </motion.button>
            </div>

            {/* Fullscreen Toggle */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setFullscreen(!fullscreen)}
              className={`hidden sm:block p-2 rounded-lg transition-all ${
                darkMode
                  ? 'bg-gray-900 text-gray-400 hover:text-white'
                  : 'bg-gray-100 text-gray-600 hover:text-gray-900'
              }`}
              title="Fullscreen Preview"
            >
              <Maximize2 className="w-4 h-4" />
            </motion.button>

            {/* Undo/Redo */}
            <div className={`flex items-center gap-0.5 p-0.5 rounded-lg ${
              darkMode ? 'bg-gray-900' : 'bg-gray-100'
            }`}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleUndo}
                disabled={historyIndex <= 0}
                className={`p-1 sm:p-2 rounded-lg transition-all ${
                  darkMode
                    ? 'text-gray-400 hover:text-white disabled:opacity-30'
                    : 'text-gray-600 hover:text-gray-900 disabled:opacity-30'
                }`}
                title="Undo"
              >
                <Undo2 className="w-3 h-3 sm:w-4 sm:h-4" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleRedo}
                disabled={historyIndex >= history.length - 1}
                className={`p-1 sm:p-2 rounded-lg transition-all ${
                  darkMode
                    ? 'text-gray-400 hover:text-white disabled:opacity-30'
                    : 'text-gray-600 hover:text-gray-900 disabled:opacity-30'
                }`}
                title="Redo"
              >
                <Redo2 className="w-3 h-3 sm:w-4 sm:h-4" />
              </motion.button>
            </div>

            {/* Dark Mode Toggle */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleDarkMode}
              className={`p-2 rounded-lg transition-all ${
                darkMode
                  ? 'bg-gray-900 text-yellow-400 hover:bg-gray-800'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <AnimatePresence mode="wait">
                {darkMode ? (
                  <motion.div
                    key="sun"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Sun className="w-4 h-4" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="moon"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Moon className="w-4 h-4" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>

            <div className={`hidden sm:block w-px h-6 ${
              darkMode ? 'bg-gray-800' : 'bg-gray-300'
            }`} />

            {/* Save Status */}
            {lastSaved && (
              <div className={`hidden lg:block text-xs ${
                darkMode ? 'text-gray-500' : 'text-gray-600'
              }`}>
                Saved {new Date().getTime() - lastSaved.getTime() < 60000 
                  ? 'now' 
                  : `${Math.floor((new Date().getTime() - lastSaved.getTime()) / 60000)}m`}
              </div>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-1 sm:gap-2 px-2.5 sm:px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
            >
              {saving ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                >
                  <Sparkles className="w-4 h-4" />
                </motion.div>
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">{saving ? 'Saving...' : 'Save'}</span>
            </motion.button>

            <div className="relative group">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`flex items-center gap-1 sm:gap-2 px-2.5 sm:px-4 py-2 rounded-lg transition-all text-sm sm:text-base ${
                  darkMode
                    ? 'bg-gray-900 text-white hover:bg-gray-800'
                    : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
                }`}
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Download</span>
              </motion.button>
              <div className={`absolute right-0 mt-2 w-48 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 ${
                darkMode ? 'bg-gray-900' : 'bg-white'
              }`}>
                <button
                  onClick={() => handleDownload('react')}
                  className={`w-full px-4 py-2 text-left rounded-t-lg transition-colors ${
                    darkMode
                      ? 'text-white hover:bg-gray-800'
                      : 'text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  React Source
                </button>
                <button
                  onClick={() => handleDownload('static')}
                  className={`w-full px-4 py-2 text-left rounded-b-lg transition-colors ${
                    darkMode
                      ? 'text-white hover:bg-gray-800'
                      : 'text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  Static HTML
                </button>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handlePublish}
              className="flex items-center gap-1 sm:gap-2 px-2.5 sm:px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:shadow-lg transition-all text-sm sm:text-base"
            >
              <Globe className="w-4 h-4" />
              <span className="hidden sm:inline">{portfolio.published ? 'Update' : 'Publish'}</span>
              <span className="inline sm:hidden">{portfolio.published ? 'Upd' : 'Pub'}</span>
            </motion.button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 flex-col md:flex-row overflow-hidden">
        {/* Settings Sidebar */}
        <AnimatePresence>
          {showSettings && (
            <motion.aside
              initial={{ x: -320, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -320, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className={`w-full md:w-80 h-1/2 md:h-full overflow-y-auto rounded-lg md:rounded-none ${
                darkMode
                  ? 'bg-gray-950'
                  : 'bg-white'
              }`}
            >
              <div className="p-3 sm:p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                      <Settings className="w-4 h-4 text-white" />
                    </div>
                    <h2 className={`text-base sm:text-lg font-bold ${
                      darkMode ? 'text-white' : 'text-gray-900'
                    }`}>Settings</h2>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05, rotate: 90 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowSettings(false)}
                    className={`p-2 rounded-lg transition-colors ${
                      darkMode
                        ? 'text-gray-400 hover:text-white hover:bg-gray-900'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <X className="w-4 h-4" />
                  </motion.button>
                </div>

              {/* Basic Info */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mb-4"
              >
                <motion.button
                  whileHover={{ x: 2 }}
                  onClick={() => toggleSection('basicInfo')}
                  className={`flex items-center justify-between w-full p-3 rounded-lg mb-2 transition-all ${
                    darkMode
                      ? 'bg-gray-900/50 hover:bg-gray-900'
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                      <Type className="w-3 h-3 text-white" />
                    </div>
                    <h3 className={`text-sm font-bold uppercase tracking-wide ${
                      darkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Basic Info
                    </h3>
                  </div>
                  <motion.div
                    animate={{ rotate: collapsedSections.basicInfo ? 0 : 180 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className={`w-4 h-4 ${
                      darkMode ? 'text-gray-500' : 'text-gray-600'
                    }`} />
                  </motion.div>
                </motion.button>

                <AnimatePresence>
                  {!collapsedSections.basicInfo && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="space-y-3 px-2">
                        <div>
                          <label className={`block text-sm mb-1 font-medium ${
                            darkMode ? 'text-gray-400' : 'text-gray-700'
                          }`}>Name</label>
                          <input
                            type="text"
                            value={portfolio.data.name}
                            onChange={(e) => updateField('data.name', e.target.value)}
                            className={`w-full px-3 py-2 rounded-lg border outline-none transition-all ${
                              darkMode
                                ? 'bg-gray-900 text-white border-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                                : 'bg-gray-50 text-gray-900 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                            }`}
                          />
                        </div>
                        <div>
                          <label className={`block text-sm mb-1 font-medium ${
                            darkMode ? 'text-gray-400' : 'text-gray-700'
                          }`}>Email</label>
                          <input
                            type="email"
                            value={portfolio.data.email}
                            onChange={(e) => updateField('data.email', e.target.value)}
                            className={`w-full px-3 py-2 rounded-lg border outline-none transition-all ${
                              darkMode
                                ? 'bg-gray-900 text-white border-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                                : 'bg-gray-50 text-gray-900 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                            }`}
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Theme */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mb-4"
              >
                <motion.button
                  whileHover={{ x: 2 }}
                  onClick={() => toggleSection('theme')}
                  className={`flex items-center justify-between w-full p-3 rounded-lg mb-2 transition-all ${
                    darkMode
                      ? 'bg-gray-900/50 hover:bg-gray-900'
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                      <Palette className="w-3 h-3 text-white" />
                    </div>
                    <h3 className={`text-sm font-bold uppercase tracking-wide ${
                      darkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Theme
                    </h3>
                  </div>
                  <motion.div
                    animate={{ rotate: collapsedSections.theme ? 0 : 180 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className={`w-4 h-4 ${
                      darkMode ? 'text-gray-500' : 'text-gray-600'
                    }`} />
                  </motion.div>
                </motion.button>

                <AnimatePresence>
                  {!collapsedSections.theme && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="space-y-3 px-2">
                        <div>
                          <label className={`block text-sm mb-1 font-medium ${
                            darkMode ? 'text-gray-400' : 'text-gray-700'
                          }`}>
                            Primary Color
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="color"
                              value={portfolio.theme.primaryColor}
                              onChange={(e) =>
                                updateField('theme.primaryColor', e.target.value)
                              }
                              className="w-12 h-10 rounded-lg cursor-pointer border-2 border-gray-300"
                            />
                            <input
                              type="text"
                              value={portfolio.theme.primaryColor}
                              onChange={(e) =>
                                updateField('theme.primaryColor', e.target.value)
                              }
                              className={`flex-1 px-3 py-2 rounded-lg border outline-none transition-all ${
                                darkMode
                                  ? 'bg-gray-900 text-white border-gray-800 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20'
                                  : 'bg-gray-50 text-gray-900 border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20'
                              }`}
                            />
                          </div>
                        </div>
                        
                        <div>
                          <label className={`block text-sm mb-1 font-medium ${
                            darkMode ? 'text-gray-400' : 'text-gray-700'
                          }`}>
                            Secondary Color
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="color"
                              value={portfolio.theme.secondaryColor || '#64748b'}
                              onChange={(e) =>
                                updateField('theme.secondaryColor', e.target.value)
                              }
                              className="w-12 h-10 rounded-lg cursor-pointer border-2 border-gray-300"
                            />
                            <input
                              type="text"
                              value={portfolio.theme.secondaryColor || '#64748b'}
                              onChange={(e) =>
                                updateField('theme.secondaryColor', e.target.value)
                              }
                              className={`flex-1 px-3 py-2 rounded-lg border outline-none transition-all ${
                                darkMode
                                  ? 'bg-gray-900 text-white border-gray-800 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20'
                                  : 'bg-gray-50 text-gray-900 border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20'
                              }`}
                            />
                          </div>
                        </div>

                        <div>
                          <label className={`block text-sm mb-1 font-medium ${
                            darkMode ? 'text-gray-400' : 'text-gray-700'
                          }`}>Accent Color</label>
                          <div className="flex gap-2">
                            <input
                              type="color"
                              value={portfolio.theme.accentColor || '#8b5cf6'}
                              onChange={(e) =>
                                updateField('theme.accentColor', e.target.value)
                              }
                              className="w-12 h-10 rounded-lg cursor-pointer border-2 border-gray-300"
                            />
                            <input
                              type="text"
                              value={portfolio.theme.accentColor || '#8b5cf6'}
                              onChange={(e) =>
                                updateField('theme.accentColor', e.target.value)
                              }
                              className={`flex-1 px-3 py-2 rounded-lg border outline-none transition-all ${
                                darkMode
                                  ? 'bg-gray-900 text-white border-gray-800 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20'
                                  : 'bg-gray-50 text-gray-900 border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20'
                              }`}
                            />
                          </div>
                        </div>
                        
                        <div>
                          <label className={`block text-sm mb-1 font-medium ${
                            darkMode ? 'text-gray-400' : 'text-gray-700'
                          }`}>Font Family</label>
                          <select
                            value={portfolio.theme.fontFamily}
                            onChange={(e) =>
                              updateField('theme.fontFamily', e.target.value)
                            }
                            className={`w-full px-3 py-2 rounded-lg border outline-none transition-all ${
                              darkMode
                                ? 'bg-gray-900 text-white border-gray-800 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20'
                                : 'bg-gray-50 text-gray-900 border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20'
                            }`}
                          >
                            <option value="Inter">Inter</option>
                            <option value="Roboto">Roboto</option>
                            <option value="Poppins">Poppins</option>
                            <option value="Montserrat">Montserrat</option>
                            <option value="Playfair Display">Playfair Display</option>
                            <option value="Lato">Lato</option>
                          </select>
                        </div>
                        
                        <div>
                          <label className={`block text-sm mb-1 font-medium ${
                            darkMode ? 'text-gray-400' : 'text-gray-700'
                          }`}>
                            Base Font Size: {portfolio.theme.fontSize || 16}px
                          </label>
                          <input
                            type="range"
                            min="14"
                            max="20"
                            value={portfolio.theme.fontSize || 16}
                            onChange={(e) =>
                              updateField('theme.fontSize', Number(e.target.value))
                            }
                            className="w-full accent-purple-500"
                          />
                        </div>

                        <div>
                          <label className={`block text-sm mb-1 font-medium ${
                            darkMode ? 'text-gray-400' : 'text-gray-700'
                          }`}>
                            Background Color
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="color"
                              value={portfolio.theme.backgroundColor || '#ffffff'}
                              onChange={(e) =>
                                updateField('theme.backgroundColor', e.target.value)
                              }
                              className="w-12 h-10 rounded-lg cursor-pointer border-2 border-gray-300"
                            />
                            <input
                              type="text"
                              value={portfolio.theme.backgroundColor || ''}
                              onChange={(e) =>
                                updateField(
                                  'theme.backgroundColor',
                                  e.target.value.trim() ? e.target.value : undefined
                                )
                              }
                              placeholder="#ffffff"
                              className={`flex-1 px-3 py-2 rounded-lg border outline-none transition-all ${
                                darkMode
                                  ? 'bg-gray-900 text-white border-gray-800 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20'
                                  : 'bg-gray-50 text-gray-900 border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20'
                              }`}
                            />
                          </div>
                        </div>

                        <div>
                          <label className={`block text-sm mb-1 font-medium ${
                            darkMode ? 'text-gray-400' : 'text-gray-700'
                          }`}>
                            Text Color
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="color"
                              value={portfolio.theme.textColor || '#0f172a'}
                              onChange={(e) =>
                                updateField('theme.textColor', e.target.value)
                              }
                              className="w-12 h-10 rounded-lg cursor-pointer border-2 border-gray-300"
                            />
                            <input
                              type="text"
                              value={portfolio.theme.textColor || ''}
                              onChange={(e) =>
                                updateField(
                                  'theme.textColor',
                                  e.target.value.trim() ? e.target.value : undefined
                                )
                              }
                              placeholder="#0f172a"
                              className={`flex-1 px-3 py-2 rounded-lg border outline-none transition-all ${
                                darkMode
                                  ? 'bg-gray-900 text-white border-gray-800 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20'
                                  : 'bg-gray-50 text-gray-900 border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20'
                              }`}
                            />
                          </div>
                        </div>

                        <div>
                          <label className={`block text-sm mb-1 font-medium ${
                            darkMode ? 'text-gray-400' : 'text-gray-700'
                          }`}>
                            Background Image URL
                          </label>
                          <input
                            type="text"
                            value={portfolio.theme.backgroundImage || ''}
                            onChange={(e) =>
                              updateField(
                                'theme.backgroundImage',
                                e.target.value.trim() ? e.target.value : undefined
                              )
                            }
                            placeholder="https://..."
                            className={`w-full px-3 py-2 rounded-lg border outline-none transition-all ${
                              darkMode
                                ? 'bg-gray-900 text-white border-gray-800 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20'
                                : 'bg-gray-50 text-gray-900 border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20'
                            }`}
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Content */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="mb-4"
              >
                <motion.button
                  whileHover={{ x: 2 }}
                  onClick={() => toggleSection('content')}
                  className={`flex items-center justify-between w-full p-3 rounded-lg mb-2 transition-all ${
                    darkMode
                      ? 'bg-gray-900/50 hover:bg-gray-900'
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-gradient-to-br from-amber-500 to-yellow-500 flex items-center justify-center">
                      <Sparkles className="w-3 h-3 text-white" />
                    </div>
                    <h3
                      className={`text-sm font-bold uppercase tracking-wide ${
                        darkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}
                    >
                      Content
                    </h3>
                  </div>
                  <motion.div
                    animate={{ rotate: collapsedSections.content ? 0 : 180 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown
                      className={`w-4 h-4 ${
                        darkMode ? 'text-gray-500' : 'text-gray-600'
                      }`}
                    />
                  </motion.div>
                </motion.button>

                <AnimatePresence>
                  {!collapsedSections.content && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="space-y-4 px-2">
                        <div>
                          <label
                            className={`block text-sm mb-1 font-medium ${
                              darkMode ? 'text-gray-400' : 'text-gray-700'
                            }`}
                          >
                            Title
                          </label>
                          <input
                            type="text"
                            value={portfolio.data.title || ''}
                            onChange={(e) =>
                              updateField(
                                'data.title',
                                e.target.value.trim() ? e.target.value : undefined
                              )
                            }
                            className={`w-full px-3 py-2 rounded-lg border outline-none transition-all ${
                              darkMode
                                ? 'bg-gray-900 text-white border-gray-800 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20'
                                : 'bg-gray-50 text-gray-900 border-gray-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20'
                            }`}
                          />
                        </div>

                        <div>
                          <label
                            className={`block text-sm mb-1 font-medium ${
                              darkMode ? 'text-gray-400' : 'text-gray-700'
                            }`}
                          >
                            Summary
                          </label>
                          <textarea
                            value={portfolio.data.summary || ''}
                            onChange={(e) =>
                              updateField(
                                'data.summary',
                                e.target.value.trim() ? e.target.value : undefined
                              )
                            }
                            rows={4}
                            className={`w-full px-3 py-2 rounded-lg border outline-none transition-all ${
                              darkMode
                                ? 'bg-gray-900 text-white border-gray-800 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20'
                                : 'bg-gray-50 text-gray-900 border-gray-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20'
                            }`}
                          />
                        </div>

                        <div className="grid grid-cols-1 gap-3">
                          <div>
                            <label
                              className={`block text-sm mb-1 font-medium ${
                                darkMode ? 'text-gray-400' : 'text-gray-700'
                              }`}
                            >
                              Phone
                            </label>
                            <input
                              type="text"
                              value={portfolio.data.phone || ''}
                              onChange={(e) => updateField('data.phone', e.target.value)}
                              className={`w-full px-3 py-2 rounded-lg border outline-none transition-all ${
                                darkMode
                                  ? 'bg-gray-900 text-white border-gray-800 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20'
                                  : 'bg-gray-50 text-gray-900 border-gray-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20'
                              }`}
                            />
                          </div>

                          <div>
                            <label
                              className={`block text-sm mb-1 font-medium ${
                                darkMode ? 'text-gray-400' : 'text-gray-700'
                              }`}
                            >
                              Location
                            </label>
                            <input
                              type="text"
                              value={portfolio.data.location || ''}
                              onChange={(e) =>
                                updateField(
                                  'data.location',
                                  e.target.value.trim() ? e.target.value : undefined
                                )
                              }
                              className={`w-full px-3 py-2 rounded-lg border outline-none transition-all ${
                                darkMode
                                  ? 'bg-gray-900 text-white border-gray-800 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20'
                                  : 'bg-gray-50 text-gray-900 border-gray-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20'
                              }`}
                            />
                          </div>
                        </div>

                        <div>
                          <label
                            className={`block text-sm mb-1 font-medium ${
                              darkMode ? 'text-gray-400' : 'text-gray-700'
                            }`}
                          >
                            Skills (one per line)
                          </label>
                          <textarea
                            value={(portfolio.data.skills || []).join('\n')}
                            onChange={(e) =>
                              updateField(
                                'data.skills',
                                e.target.value
                                  .split('\n')
                                  .map((s) => s.trim())
                                  .filter(Boolean)
                              )
                            }
                            rows={4}
                            className={`w-full px-3 py-2 rounded-lg border outline-none transition-all ${
                              darkMode
                                ? 'bg-gray-900 text-white border-gray-800 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20'
                                : 'bg-gray-50 text-gray-900 border-gray-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20'
                            }`}
                          />
                        </div>

                        <div>
                          <div className={`text-xs font-bold uppercase tracking-wide mb-2 ${
                            darkMode ? 'text-gray-400' : 'text-gray-600'
                          }`}>Experience</div>
                          <div className="space-y-3">
                            {portfolio.data.experience.map((exp, idx) => (
                              <div
                                key={idx}
                                className={`p-3 rounded-lg border ${
                                  darkMode ? 'border-gray-800 bg-gray-950/30' : 'border-gray-200 bg-white'
                                }`}
                              >
                                <div className="space-y-2">
                                  <input
                                    type="text"
                                    value={exp.title}
                                    onChange={(e) =>
                                      updateField(`data.experience.${idx}.title`, e.target.value)
                                    }
                                    placeholder="Role"
                                    className={`w-full px-3 py-2 rounded-lg border outline-none transition-all ${
                                      darkMode
                                        ? 'bg-gray-900 text-white border-gray-800 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20'
                                        : 'bg-gray-50 text-gray-900 border-gray-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20'
                                    }`}
                                  />
                                  <input
                                    type="text"
                                    value={exp.company}
                                    onChange={(e) =>
                                      updateField(`data.experience.${idx}.company`, e.target.value)
                                    }
                                    placeholder="Company"
                                    className={`w-full px-3 py-2 rounded-lg border outline-none transition-all ${
                                      darkMode
                                        ? 'bg-gray-900 text-white border-gray-800 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20'
                                        : 'bg-gray-50 text-gray-900 border-gray-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20'
                                    }`}
                                  />
                                  <input
                                    type="text"
                                    value={exp.duration}
                                    onChange={(e) =>
                                      updateField(`data.experience.${idx}.duration`, e.target.value)
                                    }
                                    placeholder="Duration"
                                    className={`w-full px-3 py-2 rounded-lg border outline-none transition-all ${
                                      darkMode
                                        ? 'bg-gray-900 text-white border-gray-800 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20'
                                        : 'bg-gray-50 text-gray-900 border-gray-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20'
                                    }`}
                                  />
                                  <textarea
                                    value={exp.description}
                                    onChange={(e) =>
                                      updateField(`data.experience.${idx}.description`, e.target.value)
                                    }
                                    rows={3}
                                    placeholder="Description"
                                    className={`w-full px-3 py-2 rounded-lg border outline-none transition-all ${
                                      darkMode
                                        ? 'bg-gray-900 text-white border-gray-800 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20'
                                        : 'bg-gray-50 text-gray-900 border-gray-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20'
                                    }`}
                                  />
                                  <button
                                    type="button"
                                    onClick={() =>
                                      updateField(
                                        'data.experience',
                                        portfolio.data.experience.filter((_, i) => i !== idx)
                                      )
                                    }
                                    className={`w-full px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                                      darkMode
                                        ? 'bg-gray-900 text-gray-300 hover:bg-gray-800'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                  >
                                    Remove Experience
                                  </button>
                                </div>
                              </div>
                            ))}
                            <button
                              type="button"
                              onClick={() =>
                                updateField('data.experience', [
                                  ...portfolio.data.experience,
                                  { title: '', company: '', duration: '', description: '' },
                                ])
                              }
                              className={`w-full px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                                darkMode
                                  ? 'bg-gray-900 text-white hover:bg-gray-800'
                                  : 'bg-gray-900 text-white hover:bg-gray-800'
                              }`}
                            >
                              Add Experience
                            </button>
                          </div>
                        </div>

                        <div>
                          <div className={`text-xs font-bold uppercase tracking-wide mb-2 ${
                            darkMode ? 'text-gray-400' : 'text-gray-600'
                          }`}>Education</div>
                          <div className="space-y-3">
                            {portfolio.data.education.map((edu, idx) => (
                              <div
                                key={idx}
                                className={`p-3 rounded-lg border ${
                                  darkMode ? 'border-gray-800 bg-gray-950/30' : 'border-gray-200 bg-white'
                                }`}
                              >
                                <div className="space-y-2">
                                  <input
                                    type="text"
                                    value={edu.degree}
                                    onChange={(e) =>
                                      updateField(`data.education.${idx}.degree`, e.target.value)
                                    }
                                    placeholder="Degree"
                                    className={`w-full px-3 py-2 rounded-lg border outline-none transition-all ${
                                      darkMode
                                        ? 'bg-gray-900 text-white border-gray-800 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20'
                                        : 'bg-gray-50 text-gray-900 border-gray-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20'
                                    }`}
                                  />
                                  <input
                                    type="text"
                                    value={edu.institution}
                                    onChange={(e) =>
                                      updateField(`data.education.${idx}.institution`, e.target.value)
                                    }
                                    placeholder="Institution"
                                    className={`w-full px-3 py-2 rounded-lg border outline-none transition-all ${
                                      darkMode
                                        ? 'bg-gray-900 text-white border-gray-800 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20'
                                        : 'bg-gray-50 text-gray-900 border-gray-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20'
                                    }`}
                                  />
                                  <input
                                    type="text"
                                    value={edu.year}
                                    onChange={(e) =>
                                      updateField(`data.education.${idx}.year`, e.target.value)
                                    }
                                    placeholder="Year"
                                    className={`w-full px-3 py-2 rounded-lg border outline-none transition-all ${
                                      darkMode
                                        ? 'bg-gray-900 text-white border-gray-800 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20'
                                        : 'bg-gray-50 text-gray-900 border-gray-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20'
                                    }`}
                                  />
                                  <textarea
                                    value={edu.description || ''}
                                    onChange={(e) =>
                                      updateField(
                                        `data.education.${idx}.description`,
                                        e.target.value.trim() ? e.target.value : undefined
                                      )
                                    }
                                    rows={2}
                                    placeholder="Description (optional)"
                                    className={`w-full px-3 py-2 rounded-lg border outline-none transition-all ${
                                      darkMode
                                        ? 'bg-gray-900 text-white border-gray-800 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20'
                                        : 'bg-gray-50 text-gray-900 border-gray-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20'
                                    }`}
                                  />
                                  <button
                                    type="button"
                                    onClick={() =>
                                      updateField(
                                        'data.education',
                                        portfolio.data.education.filter((_, i) => i !== idx)
                                      )
                                    }
                                    className={`w-full px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                                      darkMode
                                        ? 'bg-gray-900 text-gray-300 hover:bg-gray-800'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                  >
                                    Remove Education
                                  </button>
                                </div>
                              </div>
                            ))}
                            <button
                              type="button"
                              onClick={() =>
                                updateField('data.education', [
                                  ...portfolio.data.education,
                                  {
                                    degree: '',
                                    institution: '',
                                    year: '',
                                    description: '',
                                  },
                                ])
                              }
                              className={`w-full px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                                darkMode
                                  ? 'bg-gray-900 text-white hover:bg-gray-800'
                                  : 'bg-gray-900 text-white hover:bg-gray-800'
                              }`}
                            >
                              Add Education
                            </button>
                          </div>
                        </div>

                        <div>
                          <div className={`text-xs font-bold uppercase tracking-wide mb-2 ${
                            darkMode ? 'text-gray-400' : 'text-gray-600'
                          }`}>Projects</div>
                          <div className="space-y-3">
                            {portfolio.data.projects.map((proj, idx) => (
                              <div
                                key={idx}
                                className={`p-3 rounded-lg border ${
                                  darkMode ? 'border-gray-800 bg-gray-950/30' : 'border-gray-200 bg-white'
                                }`}
                              >
                                <div className="space-y-2">
                                  <input
                                    type="text"
                                    value={proj.name}
                                    onChange={(e) =>
                                      updateField(`data.projects.${idx}.name`, e.target.value)
                                    }
                                    placeholder="Project name"
                                    className={`w-full px-3 py-2 rounded-lg border outline-none transition-all ${
                                      darkMode
                                        ? 'bg-gray-900 text-white border-gray-800 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20'
                                        : 'bg-gray-50 text-gray-900 border-gray-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20'
                                    }`}
                                  />
                                  <textarea
                                    value={proj.description}
                                    onChange={(e) =>
                                      updateField(`data.projects.${idx}.description`, e.target.value)
                                    }
                                    rows={3}
                                    placeholder="Description"
                                    className={`w-full px-3 py-2 rounded-lg border outline-none transition-all ${
                                      darkMode
                                        ? 'bg-gray-900 text-white border-gray-800 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20'
                                        : 'bg-gray-50 text-gray-900 border-gray-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20'
                                    }`}
                                  />
                                  <input
                                    type="text"
                                    value={(proj.technologies || []).join(', ')}
                                    onChange={(e) =>
                                      updateField(
                                        `data.projects.${idx}.technologies`,
                                        e.target.value
                                          .split(',')
                                          .map((t) => t.trim())
                                          .filter(Boolean)
                                      )
                                    }
                                    placeholder="Technologies (comma-separated)"
                                    className={`w-full px-3 py-2 rounded-lg border outline-none transition-all ${
                                      darkMode
                                        ? 'bg-gray-900 text-white border-gray-800 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20'
                                        : 'bg-gray-50 text-gray-900 border-gray-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20'
                                    }`}
                                  />
                                  <input
                                    type="text"
                                    value={proj.link || ''}
                                    onChange={(e) =>
                                      updateField(
                                        `data.projects.${idx}.link`,
                                        e.target.value.trim() ? e.target.value : undefined
                                      )
                                    }
                                    placeholder="Link (optional)"
                                    className={`w-full px-3 py-2 rounded-lg border outline-none transition-all ${
                                      darkMode
                                        ? 'bg-gray-900 text-white border-gray-800 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20'
                                        : 'bg-gray-50 text-gray-900 border-gray-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20'
                                    }`}
                                  />
                                  <button
                                    type="button"
                                    onClick={() =>
                                      updateField(
                                        'data.projects',
                                        portfolio.data.projects.filter((_, i) => i !== idx)
                                      )
                                    }
                                    className={`w-full px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                                      darkMode
                                        ? 'bg-gray-900 text-gray-300 hover:bg-gray-800'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                  >
                                    Remove Project
                                  </button>
                                </div>
                              </div>
                            ))}
                            <button
                              type="button"
                              onClick={() =>
                                updateField('data.projects', [
                                  ...portfolio.data.projects,
                                  { name: '', description: '', technologies: [], link: '' },
                                ])
                              }
                              className={`w-full px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                                darkMode
                                  ? 'bg-gray-900 text-white hover:bg-gray-800'
                                  : 'bg-gray-900 text-white hover:bg-gray-800'
                              }`}
                            >
                              Add Project
                            </button>
                          </div>
                        </div>

                        <div>
                          <div className={`text-xs font-bold uppercase tracking-wide mb-2 ${
                            darkMode ? 'text-gray-400' : 'text-gray-600'
                          }`}>Certifications</div>
                          <div className="space-y-3">
                            {(portfolio.data.certifications || []).map((cert, idx) => (
                              <div
                                key={idx}
                                className={`p-3 rounded-lg border ${
                                  darkMode ? 'border-gray-800 bg-gray-950/30' : 'border-gray-200 bg-white'
                                }`}
                              >
                                <div className="space-y-2">
                                  <input
                                    type="text"
                                    value={cert.name}
                                    onChange={(e) =>
                                      updateField(
                                        `data.certifications.${idx}.name`,
                                        e.target.value
                                      )
                                    }
                                    placeholder="Certification"
                                    className={`w-full px-3 py-2 rounded-lg border outline-none transition-all ${
                                      darkMode
                                        ? 'bg-gray-900 text-white border-gray-800 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20'
                                        : 'bg-gray-50 text-gray-900 border-gray-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20'
                                    }`}
                                  />
                                  <input
                                    type="text"
                                    value={cert.issuer}
                                    onChange={(e) =>
                                      updateField(
                                        `data.certifications.${idx}.issuer`,
                                        e.target.value
                                      )
                                    }
                                    placeholder="Issuer"
                                    className={`w-full px-3 py-2 rounded-lg border outline-none transition-all ${
                                      darkMode
                                        ? 'bg-gray-900 text-white border-gray-800 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20'
                                        : 'bg-gray-50 text-gray-900 border-gray-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20'
                                    }`}
                                  />
                                  <input
                                    type="text"
                                    value={cert.year}
                                    onChange={(e) =>
                                      updateField(
                                        `data.certifications.${idx}.year`,
                                        e.target.value
                                      )
                                    }
                                    placeholder="Year"
                                    className={`w-full px-3 py-2 rounded-lg border outline-none transition-all ${
                                      darkMode
                                        ? 'bg-gray-900 text-white border-gray-800 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20'
                                        : 'bg-gray-50 text-gray-900 border-gray-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20'
                                    }`}
                                  />
                                  <button
                                    type="button"
                                    onClick={() =>
                                      updateField(
                                        'data.certifications',
                                        (portfolio.data.certifications || []).filter((_, i) => i !== idx)
                                      )
                                    }
                                    className={`w-full px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                                      darkMode
                                        ? 'bg-gray-900 text-gray-300 hover:bg-gray-800'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                  >
                                    Remove Certification
                                  </button>
                                </div>
                              </div>
                            ))}
                            <button
                              type="button"
                              onClick={() =>
                                updateField('data.certifications', [
                                  ...(portfolio.data.certifications || []),
                                  { name: '', issuer: '', year: '' },
                                ])
                              }
                              className={`w-full px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                                darkMode
                                  ? 'bg-gray-900 text-white hover:bg-gray-800'
                                  : 'bg-gray-900 text-white hover:bg-gray-800'
                              }`}
                            >
                              Add Certification
                            </button>
                          </div>
                        </div>

                        <div>
                          <div className={`text-xs font-bold uppercase tracking-wide mb-2 ${
                            darkMode ? 'text-gray-400' : 'text-gray-600'
                          }`}>Links</div>
                          <div className="space-y-2">
                            <input
                              type="text"
                              value={portfolio.data.links.linkedin || ''}
                              onChange={(e) =>
                                updateField(
                                  'data.links.linkedin',
                                  e.target.value.trim() ? e.target.value : undefined
                                )
                              }
                              placeholder="LinkedIn URL"
                              className={`w-full px-3 py-2 rounded-lg border outline-none transition-all ${
                                darkMode
                                  ? 'bg-gray-900 text-white border-gray-800 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20'
                                  : 'bg-gray-50 text-gray-900 border-gray-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20'
                              }`}
                            />
                            <input
                              type="text"
                              value={portfolio.data.links.github || ''}
                              onChange={(e) =>
                                updateField(
                                  'data.links.github',
                                  e.target.value.trim() ? e.target.value : undefined
                                )
                              }
                              placeholder="GitHub URL"
                              className={`w-full px-3 py-2 rounded-lg border outline-none transition-all ${
                                darkMode
                                  ? 'bg-gray-900 text-white border-gray-800 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20'
                                  : 'bg-gray-50 text-gray-900 border-gray-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20'
                              }`}
                            />
                            <input
                              type="text"
                              value={portfolio.data.links.website || ''}
                              onChange={(e) =>
                                updateField(
                                  'data.links.website',
                                  e.target.value.trim() ? e.target.value : undefined
                                )
                              }
                              placeholder="Website URL"
                              className={`w-full px-3 py-2 rounded-lg border outline-none transition-all ${
                                darkMode
                                  ? 'bg-gray-900 text-white border-gray-800 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20'
                                  : 'bg-gray-50 text-gray-900 border-gray-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20'
                              }`}
                            />
                            <input
                              type="text"
                              value={portfolio.data.links.twitter || ''}
                              onChange={(e) =>
                                updateField(
                                  'data.links.twitter',
                                  e.target.value.trim() ? e.target.value : undefined
                                )
                              }
                              placeholder="Twitter/X URL"
                              className={`w-full px-3 py-2 rounded-lg border outline-none transition-all ${
                                darkMode
                                  ? 'bg-gray-900 text-white border-gray-800 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20'
                                  : 'bg-gray-50 text-gray-900 border-gray-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20'
                              }`}
                            />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Sections */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mb-4"
              >
                <motion.button
                  whileHover={{ x: 2 }}
                  onClick={() => toggleSection('sections')}
                  className={`flex items-center justify-between w-full p-3 rounded-lg mb-2 transition-all ${
                    darkMode
                      ? 'bg-gray-900/50 hover:bg-gray-900'
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                      <Layout className="w-3 h-3 text-white" />
                    </div>
                    <h3 className={`text-sm font-bold uppercase tracking-wide ${
                      darkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Sections
                    </h3>
                  </div>
                  <motion.div
                    animate={{ rotate: collapsedSections.sections ? 0 : 180 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className={`w-4 h-4 ${
                      darkMode ? 'text-gray-500' : 'text-gray-600'
                    }`} />
                  </motion.div>
                </motion.button>

                <AnimatePresence>
                  {!collapsedSections.sections && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="space-y-2 px-2">
                        {portfolio.theme?.sections && Object.entries(portfolio.theme.sections).map(([key, value], index) => (
                          <motion.label
                            key={key}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 + index * 0.05 }}
                            className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all ${
                              darkMode
                                ? 'hover:bg-gray-900 border border-gray-800'
                                : 'hover:bg-gray-50 border border-gray-200'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-5 h-5 rounded flex items-center justify-center border-2 transition-all ${
                                value
                                  ? 'bg-gradient-to-br from-blue-500 to-purple-500 border-transparent'
                                  : darkMode
                                  ? 'border-gray-700'
                                  : 'border-gray-300'
                              }`}>
                                {value && <Check className="w-3 h-3 text-white" />}
                              </div>
                              <span className={`capitalize font-medium ${
                                darkMode ? 'text-gray-300' : 'text-gray-700'
                              }`}>{key}</span>
                            </div>
                            <input
                              type="checkbox"
                              checked={value}
                              onChange={(e) =>
                                updateField(`theme.sections.${key}`, e.target.checked)
                              }
                              className="sr-only"
                            />
                          </motion.label>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>
          </motion.aside>
        )}
        </AnimatePresence>

        {/* Toggle Settings Button (when sidebar is closed) */}
        {!showSettings && (
          <motion.button
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowSettings(true)}
            className={`fixed left-6 top-24 z-40 p-3 rounded-lg shadow-xl transition-all ${
              darkMode
                ? 'bg-gray-950 text-white border border-gray-800'
                : 'bg-white text-gray-900 border border-gray-200'
            }`}
          >
            <ChevronRight className="w-5 h-5" />
          </motion.button>
        )}

        {/* View Mode Toggle at Joint Point (Mobile Only) */}
        <div className={`md:hidden flex justify-center items-center p-2 ${
          darkMode ? 'bg-gray-900' : 'bg-gray-100'
        }`}>
          <div className={`flex items-center gap-1 p-0.5 rounded-lg ${
            darkMode ? 'bg-gray-800' : 'bg-gray-200'
          }`}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setViewMode('desktop')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'desktop'
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                  : darkMode
                  ? 'text-gray-400 hover:text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              title="Desktop View"
            >
              <Monitor className="w-4 h-4" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setViewMode('tablet')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'tablet'
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                  : darkMode
                  ? 'text-gray-400 hover:text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              title="Tablet View"
            >
              <Tablet className="w-4 h-4" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setViewMode('mobile')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'mobile'
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                  : darkMode
                  ? 'text-gray-400 hover:text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              title="Mobile View"
            >
              <Smartphone className="w-4 h-4" />
            </motion.button>
          </div>
        </div>

        {/* Preview */}
        <div className={`flex-1 overflow-auto transition-colors min-w-0 ${
          darkMode ? 'bg-black' : 'bg-gray-50'
        }`}>
          <motion.div
            layout
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={`mx-auto transition-all ${
              fullscreen 
                ? 'w-full h-full' 
                : viewMode === 'desktop' 
                ? 'w-full' 
                : viewMode === 'tablet'
                ? 'max-w-3xl mx-auto my-8'
                : 'max-w-sm mx-auto my-8'
            }`}
            style={{
              transform: `scale(${zoomLevel / 100})`,
              transformOrigin: 'top center',
            }}
          >
            {viewMode !== 'desktop' && (
              <div className={`text-center mb-4 text-sm ${
                darkMode ? 'text-gray-500' : 'text-gray-600'
              }`}>
                {viewMode === 'tablet' ? 'Tablet' : 'Mobile'} View Preview
              </div>
            )}
            <div className={`${
              viewMode !== 'desktop' 
                ? `rounded-xl overflow-hidden shadow-2xl ${
                    darkMode ? 'border border-gray-800' : 'border border-gray-200'
                  }`
                : ''
            }`}>
              <TemplateRenderer 
                templateId={portfolio.templateId} 
                data={portfolio.data}
                theme={portfolio.theme}
              />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Template Switcher Modal */}
      <AnimatePresence>
        {showTemplateSwitcher && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6"
            onClick={() => setShowTemplateSwitcher(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className={`w-full max-w-4xl rounded-2xl overflow-hidden ${
                darkMode ? 'bg-gray-950 border border-gray-800' : 'bg-white'
              } shadow-2xl`}
            >
              {/* Modal Header */}
              <div className={`p-6 border-b ${
                darkMode ? 'border-gray-800' : 'border-gray-200'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                      <RefreshCw className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className={`text-2xl font-bold ${
                        darkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        Switch Template
                      </h2>
                      <p className={`text-sm ${
                        darkMode ? 'text-gray-500' : 'text-gray-600'
                      }`}>
                        Choose a new template for your portfolio
                      </p>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowTemplateSwitcher(false)}
                    className={`p-2 rounded-lg ${
                      darkMode
                        ? 'text-gray-400 hover:text-white hover:bg-gray-900'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <X className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>

              {/* Templates Grid */}
              <div className={`p-6 max-h-[70vh] overflow-y-auto ${
                darkMode ? 'bg-gray-900/50' : 'bg-gray-50'
              }`}>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {templates.map((template, index) => {
                    const Icon = template.icon;
                    const isActive = portfolio.templateId === template.id;
                    
                    return (
                      <motion.button
                        key={template.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ scale: 1.02, y: -4 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleTemplateSwitch(template.id)}
                        disabled={isActive}
                        className={`relative p-6 rounded-xl text-left transition-all ${
                          isActive
                            ? darkMode
                              ? 'bg-gradient-to-br from-blue-900/50 to-purple-900/50 border-2 border-blue-500'
                              : 'bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-500'
                            : darkMode
                            ? 'bg-gray-900 border border-gray-800 hover:border-gray-700'
                            : 'bg-white border border-gray-200 hover:border-gray-300 hover:shadow-lg'
                        }`}
                      >
                        {/* Active Badge */}
                        {isActive && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center"
                          >
                            <Check className="w-5 h-5 text-white" />
                          </motion.div>
                        )}

                        {/* Template Icon */}
                        <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${template.color} flex items-center justify-center mb-4`}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>

                        {/* Template Info */}
                        <h3 className={`text-lg font-bold mb-2 ${
                          darkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          {template.name}
                        </h3>
                        
                        {isActive && (
                          <div className="flex items-center gap-2 mt-3">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            <span className={`text-xs font-medium ${
                              darkMode ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                              Currently Active
                            </span>
                          </div>
                        )}
                      </motion.button>
                    );
                  })}
                </div>
                
                {/* Info Box */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className={`mt-6 p-4 rounded-lg ${
                    darkMode
                      ? 'bg-blue-900/20 border border-blue-800/30'
                      : 'bg-blue-50 border border-blue-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <Info className={`w-5 h-5 mt-0.5 ${
                      darkMode ? 'text-blue-400' : 'text-blue-600'
                    }`} />
                    <div>
                      <p className={`text-sm font-medium ${
                        darkMode ? 'text-blue-300' : 'text-blue-900'
                      }`}>
                        Your content will be preserved
                      </p>
                      <p className={`text-xs mt-1 ${
                        darkMode ? 'text-blue-400/70' : 'text-blue-700'
                      }`}>
                        All your data, theme settings, and customizations will remain intact when switching templates.
                      </p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Publish Modal */}
      <AnimatePresence>
        {showPublishModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => !isPublishing && setShowPublishModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className={`w-full max-w-lg rounded-2xl shadow-2xl ${
                darkMode ? 'bg-gray-900' : 'bg-white'
              }`}
            >
              {/* Header */}
              <div className={`p-6 border-b ${
                darkMode ? 'border-gray-800' : 'border-gray-200'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                      <Globe className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className={`text-xl font-bold ${
                        darkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        {portfolio?.published ? 'Update Published Portfolio' : 'Publish Your Portfolio'}
                      </h2>
                      <p className={`text-sm ${
                        darkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        Make your portfolio live on the web
                      </p>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowPublishModal(false)}
                    disabled={isPublishing}
                    className={`p-2 rounded-lg transition-colors ${
                      darkMode
                        ? 'hover:bg-gray-800 text-gray-400'
                        : 'hover:bg-gray-100 text-gray-600'
                    } disabled:opacity-50`}
                  >
                    <X className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Custom URL */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    darkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Portfolio URL
                  </label>
                  <div className={`flex items-center gap-2 p-3 rounded-lg border ${
                    darkMode
                      ? 'bg-gray-800 border-gray-700'
                      : 'bg-gray-50 border-gray-200'
                  }`}>
                    <span className={`text-sm ${
                      darkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {window.location.origin}/Portfolio/
                    </span>
                    <input
                      type="text"
                      value={customUrl}
                      onChange={(e) => setCustomUrl(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                      placeholder="your-portfolio-name"
                      disabled={isPublishing}
                      className={`flex-1 bg-transparent outline-none ${
                        darkMode ? 'text-white' : 'text-gray-900'
                      } disabled:opacity-50`}
                    />
                  </div>
                  <p className={`mt-2 text-xs ${
                    darkMode ? 'text-gray-500' : 'text-gray-500'
                  }`}>
                    This will be your public portfolio URL
                  </p>
                </div>

                {/* Publishing Options */}
                <div className={`p-4 rounded-lg border ${
                  darkMode
                    ? 'bg-gray-800/50 border-gray-700'
                    : 'bg-blue-50 border-blue-200'
                }`}>
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      darkMode ? 'bg-blue-500/20' : 'bg-blue-100'
                    }`}>
                      <Sparkles className={`w-5 h-5 ${
                        darkMode ? 'text-blue-400' : 'text-blue-600'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <h3 className={`text-sm font-semibold mb-1 ${
                        darkMode ? 'text-blue-300' : 'text-blue-900'
                      }`}>
                        What happens when you publish?
                      </h3>
                      <ul className={`space-y-1 text-xs ${
                        darkMode ? 'text-gray-400' : 'text-gray-700'
                      }`}>
                        <li className="flex items-center gap-2">
                          <Check className="w-3 h-3 text-green-500" />
                          Your portfolio becomes publicly accessible
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="w-3 h-3 text-green-500" />
                          Get a shareable link for job applications
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="w-3 h-3 text-green-500" />
                          SEO optimized for better visibility
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="w-3 h-3 text-green-500" />
                          SSL certificate included (HTTPS)
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Preview URL */}
                {customUrl && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-lg ${
                      darkMode ? 'bg-gray-800' : 'bg-gray-100'
                    }`}
                  >
                    <p className={`text-xs font-medium mb-2 ${
                      darkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      Preview URL:
                    </p>
                    <div className={`flex items-center gap-2 ${
                      darkMode ? 'text-green-400' : 'text-green-600'
                    }`}>
                      <Globe className="w-4 h-4" />
                      <span className="text-sm font-mono">
                        {window.location.origin}/Portfolio/{customUrl}
                      </span>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Footer */}
              <div className={`p-6 border-t flex items-center justify-between ${
                darkMode ? 'border-gray-800' : 'border-gray-200'
              }`}>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowPublishModal(false)}
                  disabled={isPublishing}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    darkMode
                      ? 'text-gray-400 hover:bg-gray-800'
                      : 'text-gray-600 hover:bg-gray-100'
                  } disabled:opacity-50`}
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleConfirmPublish}
                  disabled={isPublishing || !customUrl}
                  className="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isPublishing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Publishing...
                    </>
                  ) : (
                    <>
                      <Globe className="w-4 h-4" />
                      {portfolio?.published ? 'Update Portfolio' : 'Publish Now'}
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Rating Modal */}
      <AnimatePresence>
        {showRatingModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => !submittingRating && handleSkipRating()}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className={`w-full max-w-md rounded-2xl shadow-2xl ${
                darkMode ? 'bg-gray-900' : 'bg-white'
              }`}
            >
              <div className={`p-6 border-b ${
                darkMode ? 'border-gray-800' : 'border-gray-200'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
                      <Star className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className={`text-xl font-bold ${
                        darkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        Rate your experience
                      </h2>
                      <p className={`text-sm ${
                        darkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        Help us improve Resume to Portfolio
                      </p>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleSkipRating}
                    disabled={submittingRating}
                    className={`p-2 rounded-lg transition-colors ${
                      darkMode
                        ? 'hover:bg-gray-800 text-gray-400'
                        : 'hover:bg-gray-100 text-gray-600'
                    } disabled:opacity-50`}
                  >
                    <X className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-center justify-center gap-2 mb-4">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <motion.button
                      key={n}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedRating(n)}
                      disabled={submittingRating}
                      className="p-1"
                    >
                      <Star
                        className={`w-10 h-10 ${
                          n <= selectedRating
                            ? 'text-yellow-400 fill-yellow-400'
                            : darkMode
                              ? 'text-gray-600'
                              : 'text-gray-300'
                        }`}
                      />
                    </motion.button>
                  ))}
                </div>

                <p className={`text-center text-sm mb-6 ${
                  darkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {selectedRating === 0
                    ? 'Select 1–5 stars'
                    : `You selected ${selectedRating}/5`}
                </p>

                <div className="flex items-center justify-between gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSkipRating}
                    disabled={submittingRating}
                    className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                      darkMode
                        ? 'text-gray-400 hover:bg-gray-800'
                        : 'text-gray-600 hover:bg-gray-100'
                    } disabled:opacity-50`}
                  >
                    Skip
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSubmitRating}
                    disabled={submittingRating || selectedRating === 0}
                    className="flex-1 px-6 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submittingRating ? 'Submitting...' : 'Submit'}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PortfolioEditor;
