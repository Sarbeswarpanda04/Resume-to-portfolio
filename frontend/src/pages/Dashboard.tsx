import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { 
  Plus, Edit, Trash2, Eye, LogOut, FileText, Upload, 
  Palette, Download, Globe, TrendingUp, Clock, 
  Sparkles, Zap, Moon, Sun, X, AlertTriangle, Crown, Tag
} from 'lucide-react';
import { getPortfolios, deletePortfolio, downloadPortfolio, Portfolio } from '../services/portfolioService';
import toast from 'react-hot-toast';
import {
  getBillingStatus,
  validateCoupon,
  checkoutPremium,
  verifyRazorpayPayment,
  BillingStatus,
  ValidateCouponResponse,
} from '../services/billingService';

const Dashboard = () => {
  const { user, logout, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [portfolioToDelete, setPortfolioToDelete] = useState<string | null>(null);
  const [downloadModalOpen, setDownloadModalOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const [billingStatus, setBillingStatus] = useState<BillingStatus | null>(null);
  const [planModalOpen, setPlanModalOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<'plans' | 'checkout'>('plans');
  const [couponCode, setCouponCode] = useState('');
  const [couponResult, setCouponResult] = useState<ValidateCouponResponse | null>(null);
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);

  const lastLoadedUidRef = useRef<string | null>(null);

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
    if (authLoading) return;
    if (!user?.uid) return;

    // React 18 StrictMode can mount/unmount and re-run effects in dev.
    // Only load once per user id.
    if (lastLoadedUidRef.current === user.uid) return;
    lastLoadedUidRef.current = user.uid;

    loadPortfolios();
    loadBilling();
  }, [authLoading, user?.uid]);

  const loadBilling = async () => {
    try {
      const status = await getBillingStatus();
      setBillingStatus(status);
    } catch (e) {
      // Non-blocking
    }
  };

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

  const loadPortfolios = async () => {
    try {
      const data = await getPortfolios();
      setPortfolios(data);
    } catch (error: any) {
      const status = error?.response?.status;
      // Common first-login cases:
      // - token not ready yet -> 401
      // - access not yet established -> 403
      // - no portfolios yet (some backends may use 404) -> treat as empty
      if (status === 401 || status === 403) {
        return;
      }
      if (status === 404) {
        setPortfolios([]);
        return;
      }
      toast.error('Failed to load portfolios', { id: 'load-portfolios' });
    } finally {
      setLoading(false);
    }
  };

  const openPlanModal = () => {
    setCheckoutStep('plans');
    setCouponCode('');
    setCouponResult(null);
    setPlanModalOpen(true);
  };

  const handleCreateNew = () => {
    if (billingStatus && !billingStatus.isPremium && !billingStatus.canCreatePortfolio) {
      toast.error('Free plan allows only 2 portfolios. Upgrade to Premium.');
      openPlanModal();
      return;
    }
    navigate('/upload');
  };

  const applyCoupon = async () => {
    const code = couponCode.trim();
    if (!code) {
      toast.error('Enter a coupon code');
      return;
    }
    setApplyingCoupon(true);
    try {
      const res = await validateCoupon(code);
      setCouponResult(res);
      if (res.valid) {
        toast.success('Coupon applied');
      } else {
        toast.error('Invalid coupon');
      }
    } catch (e) {
      toast.error('Failed to apply coupon');
    } finally {
      setApplyingCoupon(false);
    }
  };

  const loadRazorpay = () => {
    return new Promise<boolean>((resolve) => {
      if ((window as any).Razorpay) return resolve(true);
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const startCheckout = async () => {
    setCheckingOut(true);
    try {
      const coupon = couponResult?.valid ? couponResult.code : undefined;
      const res = await checkoutPremium(coupon);

      if (res.status === 'already_premium') {
        toast.success('Premium already active');
        await loadBilling();
        setPlanModalOpen(false);
        return;
      }

      if (res.status === 'success') {
        toast.success('Premium purchased successfully');
        await loadBilling();
        await loadPortfolios();
        setPlanModalOpen(false);
        return;
      }

      // Payment flow
      const ok = await loadRazorpay();
      if (!ok) {
        toast.error('Payment SDK failed to load');
        return;
      }

      const options = {
        key: res.keyId,
        amount: res.amount * 100,
        currency: res.currency,
        name: 'Resume to Portfolio',
        description: 'Premium Plan',
        order_id: res.orderId,
        handler: async (response: any) => {
          try {
            await verifyRazorpayPayment({
              couponCode: coupon,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            toast.success('Premium purchased successfully');
            await loadBilling();
            setPlanModalOpen(false);
          } catch (e) {
            toast.error('Payment verification failed');
          }
        },
        prefill: {
          email: user?.email || '',
        },
        theme: {
          color: '#6366f1',
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (e: any) {
      const message = e?.response?.data?.detail || 'Checkout failed';
      toast.error(message);
    } finally {
      setCheckingOut(false);
    }
  };

  const handleDelete = (id: string) => {
    setPortfolioToDelete(id);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!portfolioToDelete) return;

    try {
      await deletePortfolio(portfolioToDelete);
      toast.success('Portfolio deleted');
      loadPortfolios();
    } catch (error) {
      toast.error('Failed to delete portfolio');
    } finally {
      setDeleteModalOpen(false);
      setPortfolioToDelete(null);
    }
  };

  const cancelDelete = () => {
    setDeleteModalOpen(false);
    setPortfolioToDelete(null);
  };

  const handleDownloadClick = () => {
    if (portfolios.length === 0) {
      toast.error('No portfolios to download');
      return;
    }
    setDownloadModalOpen(true);
  };

  const handleDownload = async (portfolioId: string, format: 'react' | 'static') => {
    setDownloading(true);
    try {
      const portfolio = portfolios.find(p => p.id === portfolioId);
      const blob = await downloadPortfolio(portfolioId, format);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${portfolio?.name || 'portfolio'}-${format}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Download started!');
      setDownloadModalOpen(false);
    } catch (error) {
      toast.error('Failed to download portfolio');
    } finally {
      setDownloading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        darkMode ? 'bg-black' : 'bg-gray-50'
      }`}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  const stats = [
    {
      icon: FileText,
      label: 'Total Portfolios',
      value: portfolios.length,
      color: 'from-blue-500 to-blue-600',
      bgColor: darkMode ? 'bg-blue-500/10' : 'bg-blue-50',
    },
    {
      icon: Globe,
      label: 'Published',
      value: portfolios.filter(p => p.published).length,
      color: 'from-green-500 to-green-600',
      bgColor: darkMode ? 'bg-green-500/10' : 'bg-green-50',
    },
    {
      icon: Clock,
      label: 'Drafts',
      value: portfolios.filter(p => !p.published).length,
      color: 'from-orange-500 to-orange-600',
      bgColor: darkMode ? 'bg-orange-500/10' : 'bg-orange-50',
    },
    {
      icon: TrendingUp,
      label: 'Total Views',
      value: '0',
      color: 'from-purple-500 to-purple-600',
      bgColor: darkMode ? 'bg-purple-500/10' : 'bg-purple-50',
    },
  ];

  const quickActions = [
    {
      icon: Upload,
      title: 'Upload Resume',
      description: 'Create a new portfolio from your resume',
      action: handleCreateNew,
      color: 'from-blue-500 to-purple-500',
    },
    {
      icon: Palette,
      title: 'Browse Templates',
      description: 'Explore our beautiful template collection',
      action: () => navigate('/templates'),
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: Download,
      title: 'Download Portfolio',
      description: 'Export your portfolio as source code',
      action: handleDownloadClick,
      color: 'from-pink-500 to-red-500',
    },
  ];

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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2 sm:gap-3 min-w-0"
            >
              <div className="relative flex-shrink-0">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl blur-md opacity-50" />
                <div className="relative bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl p-2">
                  <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
              </div>
              <div className="min-w-0">
                <h1 className={`text-xl sm:text-2xl font-bold truncate ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>Dashboard</h1>
                <p className={`text-xs sm:text-sm truncate ${
                  darkMode ? 'text-gray-400' : 'text-gray-600'
                }`}>{user?.email}</p>
              </div>
            </motion.div>
            <div className="flex items-center gap-2 sm:gap-3">
              <motion.button
                onClick={openPlanModal}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl border transition-all text-sm font-semibold ${
                  darkMode
                    ? 'bg-gray-900 border-gray-800 text-white hover:bg-gray-800'
                    : 'bg-gray-50 border-gray-200 text-gray-900 hover:bg-gray-100'
                }`}
                title="Plan"
              >
                <Crown className={`w-4 h-4 ${billingStatus?.isPremium ? 'text-yellow-500' : (darkMode ? 'text-gray-300' : 'text-gray-700')}`} />
                <span className="whitespace-nowrap">
                  {billingStatus?.isPremium ? 'Premium' : 'Free'}
                </span>
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
                  <Moon className="w-5 h-5 text-indigo-600" />
                )}
              </motion.button>
              <motion.button
                onClick={handleLogout}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  darkMode
                    ? 'text-gray-300 hover:text-white hover:bg-gray-900'
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <LogOut className="w-5 h-5" />
                Logout
              </motion.button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-4 gap-3 mb-8 overflow-x-auto"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5, scale: 1.02 }}
              className={`rounded-xl p-3 sm:p-4 shadow-lg border transition-all flex-shrink-0 ${
                darkMode
                  ? 'bg-gray-950 border-gray-800'
                  : 'bg-white border-gray-100'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <motion.div 
                  className={`p-2 rounded-lg bg-gradient-to-br ${stat.color} flex-shrink-0`}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <stat.icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </motion.div>
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className={`text-xl sm:text-2xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}
                >
                  {stat.value}
                </motion.div>
              </div>
              <h3 className={`text-xs sm:text-sm font-medium mt-2 ${
                darkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>{stat.label}</h3>
            </motion.div>
          ))}
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <div className="flex items-center gap-2 mb-6">
            <Zap className={`w-6 h-6 ${darkMode ? 'text-yellow-500' : 'text-yellow-600'}`} />
            <h2 className={`text-2xl font-bold ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>Quick Actions</h2>
          </div>
          <div className="grid grid-cols-3 gap-3 overflow-x-auto">
            {quickActions.map((action, index) => (
              <motion.button
                key={index}
                onClick={action.action}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                whileHover={{ y: -8, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`relative overflow-hidden rounded-xl p-3 sm:p-4 text-left shadow-lg border group transition-all flex-shrink-0 ${
                  darkMode
                    ? 'bg-gray-950 border-gray-800 hover:border-gray-700'
                    : 'bg-white border-gray-100 hover:border-gray-200'
                }`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-0 group-hover:opacity-10 transition-opacity`} />
                <div className="relative">
                  <div className={`inline-block p-2 rounded-lg mb-2 sm:mb-3 bg-gradient-to-br ${action.color}`}>
                    <action.icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <h3 className={`text-sm sm:text-base font-semibold mb-1 ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  }`}>{action.title}</h3>
                  <p className={`text-xs ${
                    darkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>{action.description}</p>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Portfolios Section */}
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-start sm:items-center gap-2 sm:gap-3">
            <Sparkles className={`w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
            <div>
              <h2 className={`text-xl sm:text-2xl font-bold ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>My Portfolios</h2>
              <p className={`text-xs sm:text-sm mt-1 ${
                darkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Manage and edit your portfolio websites
              </p>
            </div>
          </div>
          <motion.button
            onClick={handleCreateNew}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="relative w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-semibold overflow-hidden group shadow-lg text-sm sm:text-base"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600" />
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            <span className="relative text-white flex items-center justify-center gap-1.5 sm:gap-2">
              <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Create New</span>
            </span>
          </motion.button>
        </div>

        {portfolios.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-2xl text-center py-16 px-8 shadow-lg border ${
              darkMode
                ? 'bg-gray-950 border-gray-800'
                : 'bg-white border-gray-100'
            }`}
          >
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="inline-block mb-6"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-2xl opacity-50" />
                <div className="relative bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl p-8">
                  <FileText className="w-20 h-20 text-white" />
                </div>
              </div>
            </motion.div>
            <h3 className={`text-2xl font-bold mb-3 ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              No portfolios yet
            </h3>
            <p className={`text-lg mb-8 max-w-md mx-auto ${
              darkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Get started by creating your first portfolio from your resume
            </p>
            <motion.button
              onClick={handleCreateNew}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="relative px-8 py-4 rounded-xl font-semibold overflow-hidden group shadow-xl"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600" />
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="relative text-white flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Create Portfolio
              </span>
            </motion.button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {portfolios.map((portfolio, index) => (
              <motion.div
                key={portfolio.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className={`relative overflow-hidden rounded-2xl shadow-lg border group transition-all ${
                  darkMode
                    ? 'bg-gray-950 border-gray-800'
                    : 'bg-white border-gray-100'
                }`}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="relative p-6">
                  {/* Portfolio Header */}
                  <div className="flex items-start justify-between gap-2 mb-4">
                    <div className="flex-1 min-w-0">
                      <h3 className={`text-lg sm:text-xl font-bold mb-2 break-words ${
                        darkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        {portfolio.name}
                      </h3>
                      <div className="flex items-center gap-2 mb-2 min-w-0">
                        <Palette className={`w-4 h-4 flex-shrink-0 ${
                          darkMode ? 'text-purple-400' : 'text-purple-600'
                        }`} />
                        <p className={`text-xs sm:text-sm truncate ${
                          darkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          {portfolio.templateId}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className={`w-4 h-4 flex-shrink-0 ${
                          darkMode ? 'text-gray-500' : 'text-gray-400'
                        }`} />
                        <p className={`text-xs whitespace-nowrap ${
                          darkMode ? 'text-gray-500' : 'text-gray-500'
                        }`}>
                          {new Date(portfolio.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    {portfolio.published && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg flex-shrink-0"
                      >
                        <Globe className="w-3 h-3" />
                        <span className="hidden sm:inline">Live</span>
                      </motion.span>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 mt-6 flex-wrap">
                    <motion.button
                      onClick={() => navigate(`/editor/${portfolio.id}`)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex-1 min-w-0 flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all font-medium text-sm sm:text-base"
                    >
                      <Edit className="w-4 h-4 flex-shrink-0" />
                      <span className="hidden sm:inline">Edit</span>
                      <span className="inline sm:hidden">Edit</span>
                    </motion.button>
                    {portfolio.published && (
                      <motion.button
                        onClick={() => {
                          const publishedUrl = portfolio.publishedUrl;
                          if (!publishedUrl) {
                            toast.error('This portfolio is not published yet.');
                            return;
                          }

                          const url = publishedUrl.startsWith('http')
                            ? publishedUrl
                            : `${window.location.origin}${publishedUrl.startsWith('/') ? publishedUrl : `/${publishedUrl}`}`;
                          window.open(url, '_blank');
                        }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`flex-1 min-w-0 flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl transition-all text-sm sm:text-base font-medium ${
                          darkMode
                            ? 'bg-gray-900 text-gray-300 hover:bg-gray-800'
                            : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                        }`}
                      >
                        <Eye className="w-4 h-4 flex-shrink-0" />
                        <span className="hidden sm:inline">View</span>
                      </motion.button>
                    )}
                    <motion.button
                      onClick={() => handleDelete(portfolio.id)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-3 bg-red-500/10 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-500/20 transition-all text-sm sm:text-base"
                    >
                      <Trash2 className="w-4 h-4 flex-shrink-0" />
                      <span className="hidden sm:inline">Delete</span>
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={cancelDelete}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={`relative max-w-md w-full rounded-2xl shadow-2xl ${
              darkMode
                ? 'bg-gray-950 border border-gray-800'
                : 'bg-white'
            }`}
          >
            {/* Close Button */}
            <button
              onClick={cancelDelete}
              className={`absolute right-4 top-4 p-2 rounded-lg transition-colors ${
                darkMode
                  ? 'text-gray-400 hover:text-white hover:bg-gray-900'
                  : 'text-gray-400 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <X className="w-4 h-4" />
            </button>

            {/* Content */}
            <div className="p-6">
              {/* Icon */}
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
                  <motion.div
                    animate={{
                      scale: [1, 1.1, 1],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                    }}
                  >
                    <AlertTriangle className="w-8 h-8 text-red-500" />
                  </motion.div>
                </div>
              </div>

              {/* Title */}
              <h3 className={`text-xl font-bold text-center mb-2 ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Delete Portfolio?
              </h3>

              {/* Description */}
              <p className={`text-center mb-6 ${
                darkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Are you sure you want to delete this portfolio? This action cannot be undone.
              </p>

              {/* Actions */}
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={cancelDelete}
                  className={`flex-1 px-4 py-3 rounded-xl font-medium transition-all ${
                    darkMode
                      ? 'bg-gray-900 text-white hover:bg-gray-800'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-medium hover:shadow-lg transition-all"
                >
                  Delete
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Download Portfolio Modal */}
      {downloadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !downloading && setDownloadModalOpen(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={`relative max-w-2xl w-full rounded-2xl shadow-2xl max-h-[80vh] overflow-y-auto ${
              darkMode
                ? 'bg-gray-950 border border-gray-800'
                : 'bg-white'
            }`}
          >
            {/* Close Button */}
            <button
              onClick={() => !downloading && setDownloadModalOpen(false)}
              disabled={downloading}
              className={`absolute right-4 top-4 p-2 rounded-lg transition-colors z-10 ${
                darkMode
                  ? 'text-gray-400 hover:text-white hover:bg-gray-900'
                  : 'text-gray-400 hover:text-gray-900 hover:bg-gray-100'
              } disabled:opacity-50`}
            >
              <X className="w-4 h-4" />
            </button>

            {/* Content */}
            <div className="p-6">
              {/* Icon */}
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-500 to-red-500 flex items-center justify-center">
                  <Download className="w-8 h-8 text-white" />
                </div>
              </div>

              {/* Title */}
              <h3 className={`text-2xl font-bold text-center mb-2 ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Download Portfolio
              </h3>

              {/* Description */}
              <p className={`text-center mb-6 ${
                darkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Select a portfolio and format to download
              </p>

              {/* Portfolio List */}
              <div className="space-y-3">
                {portfolios.map((portfolio) => (
                  <div
                    key={portfolio.id}
                    className={`p-4 rounded-xl border ${
                      darkMode
                        ? 'bg-gray-900 border-gray-800'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className={`font-semibold ${
                          darkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          {portfolio.name}
                        </h4>
                        <p className={`text-sm ${
                          darkMode ? 'text-gray-500' : 'text-gray-600'
                        }`}>
                          Template: {portfolio.templateId}
                        </p>
                      </div>
                      {portfolio.published && (
                        <span className="px-3 py-1 text-xs font-medium bg-green-500/10 text-green-600 dark:text-green-400 rounded-full">
                          Published
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleDownload(portfolio.id, 'react')}
                        disabled={downloading}
                        className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {downloading ? 'Downloading...' : 'React Source'}
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleDownload(portfolio.id, 'static')}
                        disabled={downloading}
                        className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                          darkMode
                            ? 'bg-gray-800 text-white hover:bg-gray-700'
                            : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
                        }`}
                      >
                        {downloading ? 'Downloading...' : 'Static HTML'}
                      </motion.button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Plan / Checkout Modal */}
      {planModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !checkingOut && setPlanModalOpen(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={`relative max-w-xl w-full rounded-2xl shadow-2xl overflow-hidden ${
              darkMode ? 'bg-gray-950 border border-gray-800' : 'bg-white'
            }`}
          >
            <button
              onClick={() => !checkingOut && setPlanModalOpen(false)}
              disabled={checkingOut}
              className={`absolute right-4 top-4 p-2 rounded-lg transition-colors z-10 ${
                darkMode
                  ? 'text-gray-400 hover:text-white hover:bg-gray-900'
                  : 'text-gray-400 hover:text-gray-900 hover:bg-gray-100'
              } disabled:opacity-50`}
            >
              <X className="w-4 h-4" />
            </button>

            <div className="p-6">
              <div className="flex items-center justify-center mb-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                  <Crown className="w-7 h-7 text-white" />
                </div>
              </div>

              <h3 className={`text-2xl font-bold text-center mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Plans
              </h3>
              <p className={`text-center mb-6 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Free: 2 portfolios • Premium: unlimited portfolios
              </p>

              {checkoutStep === 'plans' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className={`rounded-xl border p-4 ${darkMode ? 'border-gray-800 bg-gray-900/30' : 'border-gray-200 bg-gray-50'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Free</div>
                      <div className={`text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>₹0</div>
                    </div>
                    <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Up to 2 portfolios</div>
                    <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>All templates</div>
                    <div className="mt-4">
                      <button
                        type="button"
                        className={`w-full px-4 py-2 rounded-lg font-semibold ${
                          billingStatus?.isPremium
                            ? (darkMode ? 'bg-gray-800 text-gray-400' : 'bg-gray-200 text-gray-500')
                            : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                        }`}
                        disabled={Boolean(billingStatus?.isPremium)}
                      >
                        {billingStatus?.isPremium ? 'Not Active' : 'Current Plan'}
                      </button>
                    </div>
                  </div>

                  <div className={`rounded-xl border p-4 ${darkMode ? 'border-gray-800 bg-gray-900/30' : 'border-gray-200 bg-gray-50'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Premium</div>
                      <div className={`text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>₹{billingStatus?.premiumPrice ?? 19}</div>
                    </div>
                    <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Unlimited portfolios</div>
                    <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Priority features</div>
                    <div className="mt-4">
                      <button
                        type="button"
                        onClick={() => setCheckoutStep('checkout')}
                        className={`w-full px-4 py-2 rounded-lg font-semibold ${
                          billingStatus?.isPremium
                            ? (darkMode ? 'bg-gray-800 text-gray-400' : 'bg-gray-200 text-gray-500')
                            : 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white'
                        }`}
                        disabled={Boolean(billingStatus?.isPremium)}
                      >
                        {billingStatus?.isPremium ? 'Active' : 'Upgrade'}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <button
                    type="button"
                    onClick={() => {
                      setCheckoutStep('plans');
                      setCouponCode('');
                      setCouponResult(null);
                    }}
                    className={`mb-4 text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}
                    disabled={checkingOut}
                  >
                    ← Back
                  </button>

                  <div className={`rounded-xl border p-4 mb-4 ${darkMode ? 'border-gray-800 bg-gray-900/30' : 'border-gray-200 bg-gray-50'}`}>
                    <div className="flex items-center justify-between">
                      <div className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Premium Plan</div>
                      <div className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>₹{billingStatus?.premiumPrice ?? 19}</div>
                    </div>
                    <div className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Unlimited portfolios</div>
                  </div>

                  <div className="flex gap-2 mb-3">
                    <div className="flex-1">
                      <label className={`block text-xs font-semibold mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Coupon Code
                      </label>
                      <div className={`flex items-center gap-2 rounded-lg border px-3 py-2 ${darkMode ? 'border-gray-800 bg-gray-900' : 'border-gray-200 bg-white'}`}>
                        <Tag className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                        <input
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value)}
                          placeholder="Enter coupon"
                          className={`w-full bg-transparent outline-none text-sm ${darkMode ? 'text-white placeholder:text-gray-500' : 'text-gray-900 placeholder:text-gray-400'}`}
                          disabled={applyingCoupon || checkingOut}
                        />
                      </div>
                    </div>
                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={applyCoupon}
                        disabled={applyingCoupon || checkingOut}
                        className={`px-4 py-2 rounded-lg font-semibold text-sm ${
                          darkMode ? 'bg-gray-800 text-white hover:bg-gray-700' : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
                        } disabled:opacity-50`}
                      >
                        {applyingCoupon ? 'Applying...' : 'Apply'}
                      </button>
                    </div>
                  </div>

                  <div className={`rounded-xl border p-4 mb-4 ${darkMode ? 'border-gray-800 bg-gray-900/30' : 'border-gray-200 bg-gray-50'}`}>
                    <div className="flex items-center justify-between text-sm">
                      <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Price</span>
                      <span className={darkMode ? 'text-white' : 'text-gray-900'}>₹{billingStatus?.premiumPrice ?? 19}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm mt-2">
                      <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Discount</span>
                      <span className={darkMode ? 'text-white' : 'text-gray-900'}>
                        ₹{couponResult?.valid ? couponResult.discount : 0}
                      </span>
                    </div>
                    <div className={`h-px my-3 ${darkMode ? 'bg-gray-800' : 'bg-gray-200'}`} />
                    <div className="flex items-center justify-between font-bold">
                      <span className={darkMode ? 'text-white' : 'text-gray-900'}>Payable</span>
                      <span className={darkMode ? 'text-white' : 'text-gray-900'}>
                        ₹{couponResult?.valid ? couponResult.finalAmount : (billingStatus?.premiumPrice ?? 19)}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={startCheckout}
                    disabled={checkingOut}
                    className="w-full px-4 py-3 rounded-xl font-bold bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:shadow-lg transition-all disabled:opacity-50"
                  >
                    {checkingOut ? 'Processing...' : 'Checkout'}
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
