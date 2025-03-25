import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Lock, User, Mail, Phone } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/services/supabase/client';
import { invitationApi } from '@/services/api/invitation';
import { toast } from 'react-hot-toast';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { isPossiblePhoneNumber } from 'react-phone-number-input';

export default function AcceptInvitation() {
  const [searchParams] = useSearchParams();
  const emailFromUrl = searchParams.get('email'); // Optional, for pre-filling
  const token = searchParams.get('token'); // Get token from URL
  
  // Custom styles for the phone input to ensure icons are visible
  const phoneInputStyle = {
    '--PhoneInputCountryFlag-height': '20px',
    '--PhoneInputCountryFlag-width': '28px',
    '--PhoneInputCountrySelect-marginRight': '0.5em',
    '--PhoneInputCountrySelect-position': 'relative',
    '--PhoneInputCountrySelectArrow-margin': '0px 0.35em',
    '--PhoneInputCountrySelectArrow-width': '0.3em',
    paddingLeft: '2.5rem',
  };
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [invitationValid, setInvitationValid] = useState(false);
  const [organizationName, setOrganizationName] = useState('');
  const [role, setRole] = useState('');
  const [invitationData, setInvitationData] = useState(null);
  const [isNewUser, setIsNewUser] = useState(false);
  
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const checkSessionAndInvitation = async () => {
      try {
        console.log('Checking session and invitation status...');
        setIsVerifying(true);
        
        if (!token) {
          setError('Missing invitation token. Please check your invitation link.');
          setIsVerifying(false);
          return;
        }

        if (!emailFromUrl) {
          setError('Missing email parameter. Please check your invitation link.');
          setIsVerifying(false);
          return;
        }

        // First check if this is a valid invitation
        try {
          console.log(`Verifying invitation for token: ${token} and email: ${emailFromUrl}`);
          const { invitation } = await invitationApi.verifyInvitation(token, emailFromUrl);
          
          if (!invitation) {
            setError('Invalid invitation. Please check your invitation link.');
            setIsVerifying(false);
            return;
          }
          
          // Store invitation data regardless of auth status
          setInvitationData(invitation);
          setOrganizationName(invitation.organization_name);
          setRole(invitation.role);
        } catch (invitationError: any) {
          console.error('Error verifying invitation:', invitationError);
          setError(invitationError.message || 'Error verifying invitation. Please try again or contact support.');
          setInvitationValid(false);
          setIsVerifying(false);
          return;
        }

        // Check if user is already authenticated
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          console.log('User is already authenticated:', session.user.email);
          
          // If authenticated user matches the invitation email
          if (session.user.email === emailFromUrl) {
            console.log('Authenticated user matches invitation email');
            setInvitationValid(true);
          } else {
            console.log('Authenticated user does not match invitation email');
            setError(`This invitation was sent to ${emailFromUrl}, but you're logged in as ${session.user.email}. Please log out and try again.`);
            setInvitationValid(false);
          }
        } else {
          console.log('No active session, handling as new user');
          // No session - we need to handle this as a new user
          setIsNewUser(true);
          setInvitationValid(true);
          
          // Sign in with the one-time password flow (invitation)
          try {
            console.log('Attempting to sign in with OTP...');
            const { data, error } = await supabase.auth.signInWithOtp({
              email: emailFromUrl,
            });
            
            if (error) {
              console.error('Error signing in with OTP:', error);
              // Don't set an error - we'll handle this as a new user needing to set a password
            } else {
              console.log('OTP sign in successful');
            }
          } catch (signInError) {
            console.error('Exception during OTP sign in:', signInError);
            // Similarly, don't set an error here
          }
        }
      } catch (error) {
        console.error('Session/invitation check error:', error);
        setError('Error checking invitation status. Please try again or contact support.');
        setInvitationValid(false);
      } finally {
        setIsVerifying(false);
      }
    };

    checkSessionAndInvitation();
  }, [token, emailFromUrl, navigate]);

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

    // Add phone validation
    if (phone && !isPossiblePhoneNumber(phone)) {
      setError('Please enter a valid phone number.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      let session = null;
      
      // Step 1: Handle authentication based on whether user is new or existing
      if (isNewUser) {
        // For new users, sign up with Supabase
        console.log('Setting up new user with password');
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: emailFromUrl,
          password: password,
        });
        
        if (signUpError) throw signUpError;
        session = data.session;
      } else {
        // For existing users, update password
        console.log('Updating existing user password');
        const { error: updateError } = await supabase.auth.updateUser({ password });
        if (updateError) throw updateError;
        
        // Get a fresh session
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;
        session = sessionData.session;
      }
      
      if (!session) {
        throw new Error('Failed to get session');
      }

      // Step 2: Accept the invitation with user's details
      console.log('Accepting invitation with user details');
      const response = await invitationApi.acceptInvitation(token, {
        password,
        firstName,
        lastName,
        phone,
        accessToken: session.access_token
      });

      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Error accepting invitation:', error);
      const errorMessage = error.message || 'An error occurred while creating your account.';
      setError(errorMessage);
      toast.error(errorMessage);
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
                        value={emailFromUrl || ''}
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
                      Phone Number
                    </label>
                    <div className="relative phone-input-container">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10" />
                      <PhoneInput
                        international
                        countryCallingCodeEditable={false}
                        defaultCountry="QA"
                        value={phone}
                        onChange={(value) => setPhone(value || '')}
                        className="w-full border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539]"
                        style={phoneInputStyle}
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
