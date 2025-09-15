import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { Layout } from './components/Layout';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { UploadPage } from './pages/UploadPage';
import { SparkPage } from './pages/SparkPage';
import { PalettePage } from './pages/PalettePage';
import { Loader2 } from 'lucide-react';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 mx-auto animate-spin text-primary-600 mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/upload" element={<UploadPage />} />
          <Route path="/spark" element={<SparkPage />} />
          <Route path="/palette" element={<PalettePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;


