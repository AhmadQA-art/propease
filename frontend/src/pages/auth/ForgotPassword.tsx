import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { authApi } from '@/services/api/auth';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    console.log('Attempting password reset for:', email);

    try {
      await authApi.resetPassword(email);
      console.log('Password reset email sent successfully');
      
      // Redirect to login with success message
      navigate('/login', { 
        state: { message: 'Check your email for password reset instructions' }
      });
    } catch (error) {
      console.error('Reset password error:', error);
      toast.error('Error sending reset email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F8F8] px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <img src="/PropEase.png" alt="PropEase" className="h-12 mx-auto" />
        </div>

        {/* Forgot Password Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold text-[#2C3539]">Reset Password</h1>
            <p className="text-[#6B7280] mt-1">
              Enter your email to receive reset instructions
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-[#2C3539] mb-2">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539]"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#2C3539] hover:bg-[#3d474c] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2C3539] disabled:opacity-50"
            >
              {isLoading ? 'Sending...' : 'Send Reset Instructions'}
            </button>

            <div className="text-center mt-4">
              <Link to="/login" className="text-sm text-[#2C3539] hover:underline">
                Back to Login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 