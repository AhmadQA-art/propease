import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/services/supabase/client';
import { toast } from 'react-hot-toast';
import { invitationApi } from '@/services/api/invitation';

export default function AuthRedirect() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const processAuthRedirect = async () => {
      try {
        console.log('Starting auth redirect processing...');
        
        // Get the user's session - this is the key to handling the redirect
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          console.log('No active session found');
          setError('No active session. Please log in to continue.');
          setIsProcessing(false);
          navigate('/login');
          return;
        }
        
        console.log('Active session found for user:', session.user.email);
        
        // Extract user metadata - Supabase stores custom data here
        const metadata = session.user.user_metadata || {};
        console.log('User metadata:', metadata);
        
        // Look for invitation data in user metadata
        if (metadata.invitation_id) {
          console.log('Found invitation ID in user metadata:', metadata.invitation_id);
          handleInvitationRedirect(session);
        } 
        // If there's no invitation data but we have an active session,
        // assume this is a password reset or other auth action
        else if (searchParams.get('type') === 'recovery') {
          console.log('Handling password recovery flow');
          navigate('/auth/update-password');
        }
        // If no special metadata but we have an active session, assume 
        // this is just a general authentication redirect
        else {
          console.log('No special metadata found, checking for pending invitations');
          handleInvitationRedirect(session);
        }
      } catch (error) {
        console.error('Auth redirect error:', error);
        setError('Error processing authentication. Please try again.');
        setIsProcessing(false);
      }
    };

    const handleInvitationRedirect = async (session) => {
      try {
        const email = session.user.email;
        
        if (!email) {
          setError('Unable to determine user email.');
          setIsProcessing(false);
          return;
        }
        
        console.log('Checking for pending invitations for:', email);
        
        // Query database for pending invitations for this email
        const { data: invitations, error } = await supabase
          .from('organization_invitations')
          .select('*')
          .eq('email', email)
          .eq('status', 'pending')
          .order('created_at', { ascending: false })
          .limit(1);
          
        if (error) {
          console.error('Error fetching invitations:', error);
          throw new Error('Error fetching invitation details.');
        }
        
        if (!invitations || invitations.length === 0) {
          console.log('No pending invitations found for:', email);
          
          // If no pending invitations but user is authenticated, go to dashboard
          if (session) {
            console.log('User is authenticated, redirecting to dashboard');
            navigate('/');
            return;
          }
          
          setError('No pending invitation found for your email address.');
          setIsProcessing(false);
          return;
        }
        
        const invitation = invitations[0];
        console.log('Found pending invitation:', invitation.id);
        
        // Redirect to our accept invitation page with the custom token
        navigate(`/auth/accept-invitation?token=${invitation.token}&email=${encodeURIComponent(email)}`);
      } catch (error) {
        console.error('Error processing invitation:', error);
        setError('Error processing invitation. Please contact support.');
        setIsProcessing(false);
      }
    };

    processAuthRedirect();
  }, [searchParams, navigate]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F8F8] px-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
            <h1 className="text-2xl font-bold text-[#2C3539] mb-4">Authentication Error</h1>
            <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">
              {error}
            </div>
            <button
              onClick={() => navigate('/login')}
              className="mt-4 px-4 py-2 bg-[#2C3539] text-white rounded-lg hover:bg-[#3d474c] transition-colors"
            >
              Return to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F8F8] px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
          <h1 className="text-lg font-semibold text-[#2C3539] mb-4">Processing Authentication</h1>
          <div className="flex flex-col items-center justify-center py-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2C3539] mb-4"></div>
            <p className="text-[#6B7280]">Please wait while we verify your authentication...</p>
          </div>
        </div>
      </div>
    </div>
  );
} 