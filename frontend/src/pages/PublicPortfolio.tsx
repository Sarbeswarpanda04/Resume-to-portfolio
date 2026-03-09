import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, AlertCircle, Home } from 'lucide-react';
import { Portfolio } from '../services/portfolioService';
import TemplateRenderer from '../components/TemplateRenderer';
import api from '../services/api';

const PublicPortfolio = () => {
  const { portfolioSlug } = useParams();
  const navigate = useNavigate();
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPublicPortfolio();
  }, [portfolioSlug]);

  const loadPublicPortfolio = async () => {
    if (!portfolioSlug) {
      setError('Invalid portfolio URL');
      setLoading(false);
      return;
    }

    try {
      // Try to get portfolio by slug/custom URL
      const response = await api.get(`/api/portfolio/public/${encodeURIComponent(portfolioSlug)}`);
      setPortfolio(response.data);
    } catch (err: any) {
      console.error('Failed to load portfolio:', err);
      setError(err.response?.data?.detail || 'Portfolio not found');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Loading portfolio...</p>
        </motion.div>
      </div>
    );
  }

  if (error || !portfolio) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center"
        >
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Portfolio Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            {error || 'The portfolio you are looking for does not exist or has been removed.'}
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition-all"
          >
            <Home className="w-5 h-5" />
            Go to Homepage
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <TemplateRenderer
        templateId={portfolio.templateId}
        data={portfolio.data}
        theme={portfolio.theme}
      />
    </div>
  );
};

export default PublicPortfolio;
