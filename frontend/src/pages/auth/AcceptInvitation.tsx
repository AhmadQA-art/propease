import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Lock, User, Mail } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/services/supabase/client';
import { toast } from 'react-hot-toast';

export default function AcceptInvitation() {
  const [searchParams] = useSearchParams();
  const emailFromUrl = searchParams.get('email'); // Optional, for pre-filling
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [invitationValid, setInvitationValid] = useState(false);
  const [organizationName, setOrganizationName] = useState('');
  const [role, setRole] = useState('');
  
  const { user } = useAuth(); // Get authenticated user from context
  const navigate = useNavigate();

  // Check session and fetch invitation details on mount
  useEffect(() => {
    const checkSessionAndInvitation = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session || !session.user) {
        setError('Invalid or expired invitation link. Please contact your administrator.');
        setIsVerifying(false);
        return;
      }

      const userEmail = session.user.email;

      try {
        // Fetch invitation details based on email
        const { data: invitation, error: invitationError } = await supabase
          .from('organization_invitations')
          .select('id, organization_id, role_id')
          .eq('email', userEmail)
          .eq('status', 'pending')
          .single();

        if (invitationError || !invitation) {
          setError('No valid invitation found. Please contact your administrator.');
          setIsVerifying(false);
          return;
        }

        // Get organization name
        const { data: orgData, error: orgError } = await supabase
          .from('organizations')
          .select('name')
          .eq('id', invitation.organization_id)
          .single();
          
        if (!orgError && orgData) {
          setOrganizationName(orgData.name);
        }
        
        // Get role name
        const { data: roleData, error: roleError } = await supabase
          .from('roles')
          .select('name')
          .eq('id', invitation.role_id)
          .single();
          
        if (!roleError && roleData) {
          setRole(roleData.name);
        }
        
        setInvitationValid(true);
      } catch (error) {
        console.error('Error verifying invitation:', error);
        setError('Error verifying invitation. Please try again or contact support.');
      } finally {
        setIsVerifying(false);
      }
    };

    checkSessionAndInvitation();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    
    if (!firstName || !lastName) {
      setError('Please provide your name.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // Set the user's password
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;

      // Update user profile with name
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { error: profileError } = await supabase
          .from('user_profiles')
          .upsert({
            id: user.id,
            email: user.email,
            first_name: firstName,
            last_name: lastName
          }, { onConflict: 'id' });

        if (profileError) throw profileError;

        // Assign role and update invitation status
        const { data: invitation } = await supabase
          .from('organization_invitations')
          .select('id, organization_id, role_id')
          .eq('email', user.email)
          .eq('status', 'pending')
          .single();

        if (invitation) {
          const { data: roleData } = await supabase
            .from('roles')
            .select('name')
            .eq('id', invitation.role_id)
            .single();

          await fetch('/api/users/assign-role', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: user.id,
              role: roleData.name,
              organizationId: invitation.organization_id
            }),
          });

          await supabase
            .from('organization_invitations')
            .update({ status: 'accepted' })
            .eq('id', invitation.id);
        }
      }

      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error accepting invitation:', error);
      setError(error.message || 'An error occurred while creating your account.');
      toast.error(error.message || 'An error occurred while creating your account.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFormattedRoleName = (roleName) => {
    if (!roleName) return '';
    return roleName
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F8F8] px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <img src="/PropEase.png" alt="PropEase" className="h-12 mx-auto" />
        </div>

        {isVerifying ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
            <div className="flex flex-col items-center justify-center py-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2C3539] mb-4"></div>
              <p className="text-[#6B7280]">Verifying your invitation...</p>
            </div>
          </div>
        ) : (
          <>
            {!invitationValid ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">
                  {error || 'Invalid invitation link.'}
                </div>
                <div className="text-center mt-4">
                  <Link to="/login" className="text-sm text-[#2C3539] hover:underline">
                    Back to Login
                  </Link>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                <div className="mb-6 text-center">
                  <h1 className="text-2xl font-bold text-[#2C3539]">Accept Invitation</h1>
                  <p className="text-[#6B7280] mt-1">
                    You've been invited to join <strong>{organizationName}</strong> as a <strong>{getFormattedRoleName(role)}</strong>
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
                        disabled
                        value={user?.email || emailFromUrl || ''}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 bg-gray-50 rounded-lg"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#2C3539] mb-2">
                      First Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        required
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539]"
                        placeholder="Enter your first name"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#2C3539] mb-2">
                      Last Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        required
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539]"
                        placeholder="Enter your last name"
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
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539]"
                        placeholder="Create a password (min. 8 characters)"
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
                        placeholder="Confirm your password"
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#2C3539] hover:bg-[#3d474c] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2C3539] disabled:opacity-50"
                  >
                    {isSubmitting ? 'Creating Account...' : 'Create Account'}
                  </button>
                </form>
              </div>
            )}

            <p className="mt-4 text-center text-[#6B7280]">
              Already have an account?{' '}
              <Link to="/login" className="text-[#2C3539] hover:underline">
                Sign in
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
} 