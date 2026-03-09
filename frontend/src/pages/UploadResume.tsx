import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload,
  CheckCircle,
  ArrowLeft, Sparkles, Brain, Zap, Layout, 
  Moon, Sun, File, Type
} from 'lucide-react';
import { uploadResume } from '../services/resumeService';
import toast from 'react-hot-toast';

const UploadResume = () => {
  const navigate = useNavigate();
  const [uploadMethod, setUploadMethod] = useState<'file' | 'text'>('file');
  const [resumeText, setResumeText] = useState('');
  const [uploading, setUploading] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [processingSteps, setProcessingSteps] = useState<string[]>([]);
  const [darkMode, setDarkMode] = useState(false);

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

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    await handleFileUpload(file);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/msword': ['.doc'],
    },
    maxFiles: 1,
  });

  const handleFileUpload = async (file: File) => {
    setUploading(true);
    setProcessingSteps([]);

    try {
      // Clear any previous text-upload session so Preview renders the file
      sessionStorage.removeItem('resumeRawText');
      // Also clear any previous sessionId before setting a new one
      sessionStorage.removeItem('resumeSessionId');

      // Step 1: Upload
      setProcessingSteps(['Uploading resume...']);
      const { sessionId } = await uploadResume(file);

      // Store session ID for later AI parsing with template
      sessionStorage.setItem('resumeSessionId', sessionId);
      
      // Step 2: Quick extraction for preview
      setParsing(true);
      setProcessingSteps(prev => [...prev, 'Extracting text...']);
      
      await new Promise(resolve => setTimeout(resolve, 500));
      setProcessingSteps(prev => [...prev, '✓ File processed successfully!']);
      
      await new Promise(resolve => setTimeout(resolve, 500));
      setProcessingSteps(prev => [...prev, 'Ready for template selection...']);
      
      await new Promise(resolve => setTimeout(resolve, 800));

      // Navigate to template selection
      // AI parsing will happen when user selects a template
      toast.success('Resume uploaded! Now choose your template.');
      navigate('/preview');

    } catch (error: any) {
      toast.error(error.message || 'Failed to process resume');
      setProcessingSteps([]);
    } finally {
      setUploading(false);
      setParsing(false);
    }
  };

  const handleTextSubmit = async () => {
    if (!resumeText.trim()) {
      toast.error('Please enter your resume text');
      return;
    }

    setUploading(true);
    setParsing(true);
    setProcessingSteps([]);

    try {
      setProcessingSteps(['Processing text...']);

      // Clear any previous file-upload session so Preview renders the text
      sessionStorage.removeItem('resumeSessionId');
      
      // Store the raw resume text for AI parsing at template selection
      sessionStorage.setItem('resumeRawText', resumeText);
      
      await new Promise(resolve => setTimeout(resolve, 500));
      setProcessingSteps(prev => [...prev, '✓ Ready for template selection!']);

      setTimeout(() => {
        toast.success('Resume text ready! Now choose your template.');
        navigate('/preview');
      }, 500);

    } catch (error: any) {
      toast.error(error.message || 'Failed to process resume text');
      setProcessingSteps([]);
    } finally {
      setUploading(false);
      setParsing(false);
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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
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
              
              <div className="flex items-center gap-3">
                <div className="relative">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                    className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-xl blur-lg opacity-50"
                  />
                  <div className="relative bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl p-2">
                    <Upload className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className={`text-2xl font-bold ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  }`}>Upload Resume</h1>
                  <p className={`text-sm ${
                    darkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>Transform your resume into a stunning portfolio</p>
                </div>
              </div>
            </div>

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
                <Moon className="w-5 h-5 text-indigo-600" />
              )}
            </motion.button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <AnimatePresence mode="wait">
          {uploading || parsing ? (
            <motion.div
              key="processing"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={`rounded-3xl text-center py-16 px-8 shadow-2xl border ${
                darkMode
                  ? 'bg-gray-950 border-gray-800'
                  : 'bg-white border-gray-100'
              }`}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="relative w-20 h-20 mx-auto mb-8"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full blur-xl opacity-50" />
                <div className="relative w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                  <Brain className="w-10 h-10 text-white" />
                </div>
              </motion.div>
              
              <h2 className={`text-3xl font-bold mb-3 ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Processing Your Resume
              </h2>
              <p className={`text-lg mb-8 ${
                darkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Our AI is analyzing your resume...
              </p>
              
              <div className="space-y-4 max-w-md mx-auto">
                {processingSteps.map((step, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`flex items-center gap-3 text-left p-4 rounded-xl ${
                      darkMode ? 'bg-gray-900' : 'bg-gray-50'
                    }`}
                  >
                    {step.includes('✓') ? (
                      <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-white" />
                      </div>
                    ) : (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full"
                      />
                    )}
                    <span className={`font-medium ${
                      darkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>{step}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* Upload Method Toggle */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 flex gap-4 justify-center"
              >
                <motion.button
                  onClick={() => setUploadMethod('file')}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`relative px-8 py-4 rounded-xl font-semibold transition-all shadow-lg overflow-hidden group ${
                    uploadMethod === 'file'
                      ? ''
                      : darkMode
                      ? 'bg-gray-900 text-gray-300 hover:bg-gray-800'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {uploadMethod === 'file' && (
                    <>
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600" />
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </>
                  )}
                  <span className={`relative flex items-center gap-2 ${
                    uploadMethod === 'file' ? 'text-white' : ''
                  }`}>
                    <File className="w-5 h-5" />
                    Upload File
                  </span>
                </motion.button>
                
                <motion.button
                  onClick={() => setUploadMethod('text')}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`relative px-8 py-4 rounded-xl font-semibold transition-all shadow-lg overflow-hidden group ${
                    uploadMethod === 'text'
                      ? ''
                      : darkMode
                      ? 'bg-gray-900 text-gray-300 hover:bg-gray-800'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {uploadMethod === 'text' && (
                    <>
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600" />
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </>
                  )}
                  <span className={`relative flex items-center gap-2 ${
                    uploadMethod === 'text' ? 'text-white' : ''
                  }`}>
                    <Type className="w-5 h-5" />
                    Paste Text
                  </span>
                </motion.button>
              </motion.div>

              {uploadMethod === 'file' ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <div
                    {...getRootProps()}
                    className={`relative overflow-hidden cursor-pointer transition-all rounded-3xl border-3 border-dashed py-20 group ${
                      darkMode
                        ? isDragActive
                          ? 'border-purple-500 bg-purple-500/10'
                          : 'border-gray-800 bg-gray-950 hover:border-gray-700'
                        : isDragActive
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 bg-white hover:border-blue-400'
                    }`}
                  >
                    <input {...getInputProps()} />
                    
                    {/* Animated Background */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                      <motion.div
                        animate={{
                          scale: [1, 1.2, 1],
                          opacity: [0.1, 0.2, 0.1],
                        }}
                        transition={{
                          duration: 4,
                          repeat: Infinity,
                          ease: 'easeInOut',
                        }}
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full blur-3xl"
                      />
                    </div>

                    <div className="text-center relative z-10">
                      <motion.div
                        animate={{
                          y: isDragActive ? -10 : [0, -10, 0],
                        }}
                        transition={{
                          duration: 2,
                          repeat: isDragActive ? 0 : Infinity,
                          ease: 'easeInOut',
                        }}
                        className="inline-block mb-6"
                      >
                        <div className="relative">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                            className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl blur-xl opacity-50"
                          />
                          <div className="relative bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-6">
                            <Upload className="w-16 h-16 text-white" />
                          </div>
                        </div>
                      </motion.div>

                      <h3 className={`text-2xl font-bold mb-3 ${
                        darkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        {isDragActive ? 'Drop your resume here' : 'Upload your resume'}
                      </h3>
                      <p className={`text-lg mb-6 ${
                        darkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        Drag & drop or click to browse
                      </p>
                      <div className="flex items-center justify-center gap-3">
                        <span className={`px-4 py-2 rounded-lg text-sm font-medium ${
                          darkMode
                            ? 'bg-gray-900 text-gray-300'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          PDF
                        </span>
                        <span className={`px-4 py-2 rounded-lg text-sm font-medium ${
                          darkMode
                            ? 'bg-gray-900 text-gray-300'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          DOC
                        </span>
                        <span className={`px-4 py-2 rounded-lg text-sm font-medium ${
                          darkMode
                            ? 'bg-gray-900 text-gray-300'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          DOCX
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className={`rounded-3xl p-8 shadow-2xl border ${
                    darkMode
                      ? 'bg-gray-950 border-gray-800'
                      : 'bg-white border-gray-100'
                  }`}
                >
                  <div className="mb-6">
                    <label className={`block text-lg font-semibold mb-3 ${
                      darkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      Paste Your Resume Text
                    </label>
                    <textarea
                      value={resumeText}
                      onChange={(e) => setResumeText(e.target.value)}
                      placeholder="Paste your resume content here..."
                      className={`w-full min-h-[400px] px-4 py-3 rounded-xl border-2 font-mono text-sm transition-all outline-none resize-none ${
                        darkMode
                          ? 'bg-gray-900 border-gray-800 text-white placeholder-gray-500 focus:border-purple-500'
                          : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-blue-500'
                      } focus:ring-4 focus:ring-blue-100 dark:focus:ring-purple-900/30`}
                    />
                  </div>
                  <motion.button
                    onClick={handleTextSubmit}
                    disabled={!resumeText.trim()}
                    whileHover={resumeText.trim() ? { scale: 1.02, y: -2 } : {}}
                    whileTap={resumeText.trim() ? { scale: 0.98 } : {}}
                    className={`w-full relative px-8 py-4 rounded-xl text-lg font-semibold overflow-hidden shadow-xl transition-all ${
                      !resumeText.trim()
                        ? darkMode
                          ? 'bg-gray-900 text-gray-600 cursor-not-allowed'
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : ''
                    }`}
                  >
                    {resumeText.trim() && (
                      <>
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600" />
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 hover:opacity-100 transition-opacity" />
                      </>
                    )}
                    <span className={`relative flex items-center justify-center gap-2 ${
                      resumeText.trim() ? 'text-white' : ''
                    }`}>
                      <Sparkles className="w-5 h-5" />
                      Process Resume
                    </span>
                  </motion.button>
                </motion.div>
              )}

              {/* Info Cards */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-12 grid md:grid-cols-3 gap-6"
              >
                {[
                  {
                    icon: Brain,
                    title: 'AI-Powered Analysis',
                    description: 'Advanced AI extracts all important information',
                    color: 'from-blue-500 to-cyan-500',
                  },
                  {
                    icon: Zap,
                    title: 'Lightning Fast',
                    description: 'Process your resume in seconds',
                    color: 'from-purple-500 to-pink-500',
                  },
                  {
                    icon: Layout,
                    title: '6+ Templates',
                    description: 'Choose from professional designs',
                    color: 'from-orange-500 to-red-500',
                  },
                ].map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    whileHover={{ y: -5, scale: 1.02 }}
                    className={`rounded-2xl p-6 shadow-lg border group transition-all ${
                      darkMode
                        ? 'bg-gray-950 border-gray-800'
                        : 'bg-white border-gray-100'
                    }`}
                  >
                    <div className={`inline-block p-3 rounded-xl mb-4 bg-gradient-to-br ${feature.color}`}>
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <h4 className={`font-semibold text-lg mb-2 ${
                      darkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {feature.title}
                    </h4>
                    <p className={`text-sm ${
                      darkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {feature.description}
                    </p>
                  </motion.div>
                ))}
              </motion.div>

              {/* Process Steps */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className={`mt-8 rounded-2xl p-8 shadow-lg border ${
                  darkMode
                    ? 'bg-gradient-to-br from-blue-950/50 to-purple-950/50 border-blue-900/50'
                    : 'bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className={`p-3 rounded-xl ${
                      darkMode
                        ? 'bg-blue-900/50'
                        : 'bg-blue-100'
                    }`}>
                      <Sparkles className={`w-8 h-8 ${
                        darkMode ? 'text-blue-400' : 'text-blue-600'
                      }`} />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className={`font-bold text-xl mb-4 ${
                      darkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      What happens next?
                    </h4>
                    <ul className={`space-y-3 ${
                      darkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      {[
                        'Your resume will be analyzed using AI',
                        "We'll extract your education, experience, skills, and projects",
                        "You'll choose from 6 professional portfolio templates",
                        'Customize your portfolio with a live editor',
                        'Download or publish your portfolio online',
                      ].map((step, index) => (
                        <motion.li
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.7 + index * 0.1 }}
                          className="flex items-center gap-3"
                        >
                          <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500" />
                          {step}
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default UploadResume;
