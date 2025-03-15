import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { supabase } from '@/services/supabase/client';
import { authApi } from '@/services/api/auth';

export default function UpdatePassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [isRecoveryMode, setIsRecoveryMode] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // Check auth state and verify token if present
  useEffect(() => {
    const verifySession = async () => {
      console.log('Checking session and URL parameters...');
      setIsVerifying(true);
      
      try {
        // Get current session
        const { data } = await supabase.auth.getSession();
        console.log('Session status:', data.session ? 'exists' : 'none');
        
        // Check URL for recovery parameters
        const params = new URLSearchParams(location.search);
        const tokenHash = params.get('token_hash');
        const token = params.get('token'); // For direct Supabase links
        const type = params.get('type');
        
        // If we have recovery parameters, try to verify the token
        if ((tokenHash || token) && type === 'recovery') {
          console.log('In recovery mode with token, attempting verification');
          setIsRecoveryMode(true);
          
          try {
            // Try to verify the token
            await authApi.verifyToken(tokenHash || token || '', 'recovery');
            console.log('Token verification successful');
            // Token is valid, we can continue
            setIsVerifying(false);
            return;
          } catch (error) {
            console.error('Token verification failed:', error);
            toast.error('Invalid or expired password reset link');
            navigate('/login');
            return;
          }
        }
        
        // If we have a session, we can continue without verification
        if (data.session) {
          console.log('User has a valid session');
          setIsVerifying(false);
          return;
        }
        
        // If we don't have a session and no recovery parameters, redirect to login
        console.log('No session and no recovery parameters - redirecting to login');
        toast.error('Please log in to update your password');
        navigate('/login');
      } catch (error) {
        console.error('Error verifying session:', error);
        toast.error('Something went wrong. Please try again.');
        navigate('/login');
      } finally {
        setIsVerifying(false);
      }
    };

    verifySession();
  }, [navigate, location.search]);

  const validatePassword = () => {
    if (password.length < 8) {
      setPasswordError('Password must be at least 8 characters long');
      return false;
    }
    
    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return false;
    }
    
    setPasswordError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePassword()) {
      return;
    }

    setIsLoading(true);
    console.log('Attempting to update password');

    try {
      await authApi.updatePassword(password);
      console.log('Password updated successfully');
      toast.success('Password updated successfully');
      
      // Redirect to login
      navigate('/login', { 
        state: { message: 'Your password has been updated. Please log in with your new password.' }
      });
    } catch (error) {
      console.error('Error updating password:', error);
      toast.error('Failed to update password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F8F8] px-4">
        <div className="w-full max-w-md text-center">
          <div className="mb-4">
            <img src="/PropEase.png" alt="PropEase" className="h-12 mx-auto" />
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-xl font-semibold text-[#2C3539] mb-2">Verifying your request</h2>
            <p className="text-[#6B7280]">Please wait while we verify your password reset request...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F8F8] px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <img src="/PropEase.png" alt="PropEase" className="h-12 mx-auto" />
        </div>

        {/* Update Password Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold text-[#2C3539]">Update Password</h1>
            <p className="text-[#6B7280] mt-1">
              Enter your new password
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-[#2C3539] mb-2">
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539]"
                  placeholder="Enter new password"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#2C3539] mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539]"
                  placeholder="Confirm new password"
                />
              </div>
              {passwordError && (
                <p className="mt-2 text-sm text-red-600">{passwordError}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#2C3539] hover:bg-[#3d474c] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2C3539] disabled:opacity-50"
            >
              {isLoading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
} 