import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import UploadResume from './pages/UploadResume';
import TemplateSelection from './pages/TemplateSelection';
import ResumePreview from './pages/ResumePreview';
import PortfolioEditor from './pages/PortfolioEditor';
import PublicPortfolio from './pages/PublicPortfolio';
import PrivateRoute from './components/PrivateRoute';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/upload"
              element={
                <PrivateRoute>
                  <UploadResume />
                </PrivateRoute>
              }
            />
            <Route
              path="/templates"
              element={
                <PrivateRoute>
                  <TemplateSelection />
                </PrivateRoute>
              }
            />
            <Route
              path="/preview"
              element={
                <PrivateRoute>
                  <ResumePreview />
                </PrivateRoute>
              }
            />
            <Route
              path="/editor/:portfolioId"
              element={
                <PrivateRoute>
                  <PortfolioEditor />
                </PrivateRoute>
              }
            />
            <Route path="/Portfolio/:portfolioSlug" element={<PublicPortfolio />} />
          </Routes>
          <Toaster position="top-right" />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
