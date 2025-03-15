import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Lock, User, Mail, Phone } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/services/supabase/client';
import { toast } from 'react-hot-toast';

export default function AcceptInvitation() {
  const [searchParams] = useSearchParams();
  const emailFromUrl = searchParams.get('email'); // Optional, for pre-filling
  const token = searchParams.get('token'); // Get token from URL
  
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
  const [invitationData, setInvitationData] = useState(null); // Store invitation details
  
  const { user } = useAuth(); // Get authenticated user from context
  const navigate = useNavigate();

  useEffect(() => {
    const checkSessionAndInvitation = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session || !session.user) {
        setError('Invalid or expired invitation link. Please contact your administrator.');
        setIsVerifying(false);
        return;
      }

      const userEmail = session.user.email;

      if (!token) {
        setError('Missing invitation token. Please check your invitation link.');
        setIsVerifying(false);
        return;
      }

      try {
        // Verify invitation via backend endpoint
        const response = await fetch(`/api/invite/verify/${token}?email=${encodeURIComponent(userEmail)}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const errorData = await response.json();
            setError(errorData.error || 'No valid invitation found.');
          } else {
            setError('Unexpected server response. Please try again or contact support.');
          }
          setIsVerifying(false);
          return;
        }

        const { invitation } = await response.json();
        setInvitationData(invitation); // Store invitation data
        setOrganizationName(invitation.organization_name);
        setRole(invitation.role);
        setInvitationValid(true);
      } catch (error) {
        console.error('Error verifying invitation:', error);
        setError('Error verifying invitation. Please try again or contact support.');
      } finally {
        setIsVerifying(false);
      }
    };

    checkSessionAndInvitation();
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log("Starting form submission process");
    
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
      // Update user password
      console.log("Updating user password");
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;

      // Get authenticated user
      console.log("Getting authenticated user");
      const { data: { user }, error: getUserError } = await supabase.auth.getUser();
      if (getUserError || !user) throw new Error('No authenticated user found');

      console.log("User found:", user);
      console.log("User metadata:", user.user_metadata || {});

      // Get metadata from the user object
      const metadata = user.user_metadata || {};
      console.log("Job title from metadata:", metadata.job_title);
      console.log("Department from metadata:", metadata.department);

      // Use verified invitation data
      console.log("Using verified invitation data:", invitationData);

      // Update user profile
      console.log("Updating user profile with:", {
        id: user.id,
        email: user.email,
        first_name: firstName,
        last_name: lastName,
        organization_id: invitationData.organization_id,
        phone: phone
      });

      const { error: profileError } = await supabase
        .from('user_profiles')
        .upsert({
          id: user.id,
          email: user.email,
          first_name: firstName,
          last_name: lastName,
          organization_id: invitationData.organization_id,
          phone: phone
        }, { onConflict: 'id' });

      if (profileError) throw profileError;

      console.log("Profile updated successfully");

      // Get role information
      console.log("Fetching role information for role_id:", invitationData.role_id);
      const roleData = { name: invitationData.role };
      console.log("Role from verified invitation:", roleData);

      // Get the session for the auth token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No active session found');

      // Assign role via API
      console.log("Assigning role via API:", {
        userId: user.id,
        role: roleData.name,
        organizationId: invitationData.organization_id
      });
      
      const roleResponse = await fetch('/api/users/assign-role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          userId: user.id,
          role: roleData.name,
          organizationId: invitationData.organization_id
        }),
      });

      if (!roleResponse.ok) {
        const roleResponseData = await roleResponse.json();
        console.error("Role assignment API error:", roleResponseData);
        throw new Error(`Role assignment failed: ${roleResponseData.error || 'Unknown error'}`);
      }

      console.log("Role assigned successfully");

      // CRITICAL FIX: For team members, add to team_members table WITHOUT job_title/department columns
      // These columns ONLY exist in team_members table, not organization_invitations
      if (roleData.name === 'team_member') {
        // Get metadata from the user object
        const metadata = user.user_metadata || {};
        console.log("User is a team member. Adding to team_members table with metadata:");
        console.log("  - job_title:", metadata.job_title);
        console.log("  - department:", metadata.department);
        
        const teamMemberData = {
          user_id: user.id,
          role_id: invitationData.role_id,
          job_title: metadata.job_title || null,
          department: metadata.department || null
        };
        
        console.log("Team member data to insert:", teamMemberData);
        
        const { error: teamMemberError } = await supabase
          .from('team_members')
          .insert(teamMemberData);
          
        if (teamMemberError) {
          console.error('Team member insertion error:', teamMemberError);
          console.error('Team member error details:', JSON.stringify(teamMemberError, null, 2));
          throw teamMemberError;
        }
        
        console.log("Team member record created successfully");
      }

      // Update invitation status
      console.log("Updating invitation status to accepted");
      const { error: invitationUpdateError } = await supabase
        .from('organization_invitations')
        .update({ status: 'accepted' })
        .eq('id', invitationData.id);
        
      if (invitationUpdateError) {
        console.error("Error updating invitation status:", invitationUpdateError);
        // We'll continue anyway since the critical parts worked
      }

      console.log("Account setup completed successfully");
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error accepting invitation:', error);
      console.error('Error stack:', error.stack);
      console.error('Error details:', JSON.stringify(error, null, 2));
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
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C3539]"
                        placeholder="+1 (123) 456-7890"
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
