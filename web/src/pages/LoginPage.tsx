import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Chrome } from 'lucide-react';

export function LoginPage() {
  const { signInWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Error signing in:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Gestir V2</h1>
          <p className="text-lg text-gray-600 mb-8">
            AI-Powered Fashion Assistant
          </p>
        </div>

        <div className="card">
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                Welcome Back
              </h2>
              <p className="text-gray-600">
                Sign in with your Google account to get started
              </p>
            </div>

            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full flex items-center justify-center space-x-3 bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors disabled:opacity-50"
            >
              <Chrome className="h-5 w-5" />
              <span>{loading ? 'Signing in...' : 'Continue with Google'}</span>
            </button>
          </div>
        </div>

        <div className="text-center text-sm text-gray-500">
          <p>
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
}




