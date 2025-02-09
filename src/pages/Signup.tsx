import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building2, Mail, Lock, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Signup() {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    organizationName: '',
    role: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await signup(
        formData.email,
        formData.password,
        formData.organizationName,
        formData.role
      );
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign up');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F8F8] px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <img
            src="/propease.png"
            alt="PropEase"
            className="h-12 mx-auto"
          />
        </div>

        {/* Signup Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold text-[#2C3539]">Create Account</h1>
            <p className="text-[#6B7280] mt-1">Get started with PropEase</p>
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
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539]"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#2C3539] mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539]"
                  placeholder="Create a password"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#2C3539] mb-2">
                Organization Name
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  required
                  value={formData.organizationName}
                  onChange={(e) => setFormData(prev => ({ ...prev, organizationName: e.target.value }))}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539]"
                  placeholder="Enter organization name"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#2C3539] mb-2">
                Role
              </label>
              <select
                required
                value={formData.role}
                onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539]"
              >
                <option value="">Select your role</option>
                <option value="admin">Administrator</option>
                <option value="manager">Property Manager</option>
                <option value="maintenance">Maintenance Staff</option>
                <option value="leasing">Leasing Agent</option>
              </select>
            </div>

            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center px-4 py-2 bg-[#2C3539] text-white rounded-lg hover:bg-[#3d474c] transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Creating account...' : 'Create Account'}
              {!isLoading && <ArrowRight className="ml-2 w-4 h-4" />}
            </button>
          </form>
        </div>

        {/* Login Link */}
        <p className="mt-4 text-center text-[#6B7280]">
          Already have an account?{' '}
          <Link to="/login" className="text-[#2C3539] hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
} 