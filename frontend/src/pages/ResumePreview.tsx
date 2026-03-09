import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Moon as MoonIcon, Sun, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

import {
  fetchResumeFileBlob,
  previewResumeSession,
  cleanupResumeSession,
  previewAndBasicParseResumeText,
  geminiOptimizeFromParsed,
} from '../services/resumeService';

const ResumePreview = () => {
  const navigate = useNavigate();

  const [darkMode, setDarkMode] = useState(false);

  const [documentText, setDocumentText] = useState('');
  const [basicParsedData, setBasicParsedData] = useState<any>(null);
  const [geminiStructuredData, setGeminiStructuredData] = useState<any>(null);

  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileContentType, setFileContentType] = useState<string | null>(null);

  const [loadingPreview, setLoadingPreview] = useState(false);
  const [loadingGemini, setLoadingGemini] = useState(false);

  useEffect(() => {
    const savedMode = localStorage.getItem('darkMode');
    const isDark = savedMode === 'true';
    setDarkMode(isDark);
    if (isDark) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('darkMode', String(newMode));
    if (newMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  };

  useEffect(() => {
    const loadPreview = async () => {
      const sessionId = sessionStorage.getItem('resumeSessionId');
      const resumeRawText = sessionStorage.getItem('resumeRawText');

      if (!sessionId && !resumeRawText) {
        toast.error('Resume data not found. Please upload again.');
        navigate('/upload');
        return;
      }

      setLoadingPreview(true);
      try {
        // FILE UPLOAD: show the original document (pdf/doc/docx)
        if (sessionId) {
          const file = await fetchResumeFileBlob(sessionId);
          const objUrl = URL.createObjectURL(file.blob);
          setFileUrl(objUrl);
          setFileName(file.fileName);
          setFileContentType(file.contentType);

          // Extract text + basic parse WITHOUT deleting the file
          // If raw text already exists (e.g., reload), reuse it but still compute parsedData
          const text = resumeRawText || (await previewResumeSession(sessionId)).text;

          setDocumentText(text);
          const preview = await previewAndBasicParseResumeText(text);
          setBasicParsedData(preview.parsedData);

          // Store raw text for the next step (templates)
          sessionStorage.setItem('resumeRawText', text);
          return;
        }

        // TEXT UPLOAD: no original file to render
        if (resumeRawText) {
          setDocumentText(resumeRawText);
          // For text upload, basic parse comes from preview-text
          const preview = await previewAndBasicParseResumeText(resumeRawText);
          setBasicParsedData(preview.parsedData);
          return;
        }
      } catch (err: any) {
        toast.error(err?.message || 'Failed to prepare preview');
      } finally {
        setLoadingPreview(false);
      }
    };

    loadPreview();
  }, [navigate]);

  useEffect(() => {
    return () => {
      // Revoke object URL when leaving the page
      if (fileUrl) URL.revokeObjectURL(fileUrl);
    };
  }, [fileUrl]);

  useEffect(() => {
    const generateGemini = async () => {
      if (!documentText || documentText.trim().length < 50) return;
      if (!basicParsedData) return;

      setLoadingGemini(true);
      try {
        // Preview-only enhancement: use a stable template baseline
        const res = await geminiOptimizeFromParsed(documentText, 'minimal-dev', basicParsedData);
        setGeminiStructuredData(res.structuredData);
      } catch (err: any) {
        setGeminiStructuredData(null);
        toast.error(err?.message || 'Failed to generate Gemini data');
      } finally {
        setLoadingGemini(false);
      }
    };

    generateGemini();
  }, [documentText, basicParsedData]);

  const handleNext = () => {
    const sessionId = sessionStorage.getItem('resumeSessionId');
    if (sessionId) {
      cleanupResumeSession(sessionId).catch(() => {
        // best-effort cleanup
      });
      sessionStorage.removeItem('resumeSessionId');
    }

    navigate('/templates');
  };

  return (
    <div className={`min-h-screen transition-colors ${darkMode ? 'bg-black' : 'bg-gray-50'}`}>
      <header
        className={`shadow-sm border-b transition-colors ${
          darkMode ? 'bg-gray-950 border-gray-900' : 'bg-white border-gray-200'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <motion.button
              onClick={() => navigate('/upload')}
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
              className="flex items-center justify-center gap-3 mb-3"
            >
              <div className="relative">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                  className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full blur-xl opacity-50"
                />
                <div className="relative bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-3">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
              </div>
              <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Preview Uploaded Document
              </h1>
            </motion.div>
            <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
              Verify what we extracted before choosing a template.
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div
            className={`rounded-2xl border shadow-sm overflow-hidden ${
              darkMode ? 'bg-gray-950 border-gray-900' : 'bg-white border-gray-200'
            }`}
          >
            <div
              className={`px-4 py-3 border-b font-semibold ${
                darkMode ? 'border-gray-900 text-white' : 'border-gray-200 text-gray-900'
              }`}
            >
              Document Preview
            </div>
            <div className="p-4 max-h-[420px] overflow-auto">
              {loadingPreview ? (
                <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Loading…</p>
              ) : (
                <div>
                  {fileUrl ? (
                    fileContentType?.includes('pdf') ? (
                      <iframe
                        title="Resume PDF"
                        src={fileUrl}
                        className="w-full h-[380px] rounded-xl border border-gray-200"
                      />
                    ) : (
                      <div className={darkMode ? 'text-gray-200' : 'text-gray-800'}>
                        <p className="text-sm mb-2">Inline preview is not supported for this file type.</p>
                        <a
                          href={fileUrl}
                          download={fileName || 'resume'}
                          className={`inline-flex items-center justify-center px-4 py-2 rounded-xl font-medium transition-colors ${
                            darkMode
                              ? 'bg-gray-900 text-white hover:bg-gray-800'
                              : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                          }`}
                        >
                          Download / Open {fileName ? `(${fileName})` : ''}
                        </a>
                      </div>
                    )
                  ) : (
                    <pre
                      className={`whitespace-pre-wrap text-xs leading-relaxed ${
                        darkMode ? 'text-gray-200' : 'text-gray-800'
                      }`}
                    >
                      {documentText ? documentText.slice(0, 8000) : 'No preview available.'}
                    </pre>
                  )}
                </div>
              )}
            </div>
          </div>

          <div
            className={`rounded-2xl border shadow-sm overflow-hidden ${
              darkMode ? 'bg-gray-950 border-gray-900' : 'bg-white border-gray-200'
            }`}
          >
            <div
              className={`px-4 py-3 border-b font-semibold ${
                darkMode ? 'border-gray-900 text-white' : 'border-gray-200 text-gray-900'
              }`}
            >
              Parse Data
            </div>
            <div className="p-4 max-h-[420px] overflow-auto">
              {loadingPreview ? (
                <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Loading…</p>
              ) : (
                <pre
                  className={`whitespace-pre-wrap text-xs leading-relaxed ${
                    darkMode ? 'text-gray-200' : 'text-gray-800'
                  }`}
                >
                  {basicParsedData ? JSON.stringify(basicParsedData, null, 2) : 'No parsed data.'}
                </pre>
              )}
            </div>
          </div>

          <div
            className={`rounded-2xl border shadow-sm overflow-hidden ${
              darkMode ? 'bg-gray-950 border-gray-900' : 'bg-white border-gray-200'
            }`}
          >
            <div
              className={`px-4 py-3 border-b font-semibold ${
                darkMode ? 'border-gray-900 text-white' : 'border-gray-200 text-gray-900'
              }`}
            >
              Gemini Generated Data
            </div>
            <div className="p-4 max-h-[420px] overflow-auto">
              {loadingGemini ? (
                <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Generating…</p>
              ) : (
                <pre
                  className={`whitespace-pre-wrap text-xs leading-relaxed ${
                    darkMode ? 'text-gray-200' : 'text-gray-800'
                  }`}
                >
                  {geminiStructuredData
                    ? JSON.stringify(geminiStructuredData, null, 2)
                    : 'No Gemini data.'}
                </pre>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-center mt-10">
          <motion.button
            onClick={handleNext}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="relative px-12 py-4 text-lg font-semibold rounded-xl overflow-hidden shadow-2xl transition-all"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600" />
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 hover:opacity-100 transition-opacity" />
            <span className="relative text-white">Next</span>
          </motion.button>
        </div>
      </main>
    </div>
  );
};

export default ResumePreview;
