import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { CheckCircle, XCircle } from 'lucide-react';

const EmailVerification: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { verifyEmail } = useAuth();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const token = searchParams.get('token');

  useEffect(() => {
    const verifyEmailToken = async () => {
      if (!token) {
        setError('No verification token provided.');
        setIsLoading(false);
        return;
      }

      try {
        await verifyEmail(token);
        setIsSuccess(true);
      } catch (err: any) {
        setError(err.message || 'Email verification failed.');
      } finally {
        setIsLoading(false);
      }
    };

    verifyEmailToken();
  }, [token, verifyEmail]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card>
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <h2 className="text-xl font-semibold text-secondary-900 mb-2">Verifying Email</h2>
              <p className="text-secondary-600">Please wait while we verify your email address...</p>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card>
          <div className="text-center">
            {isSuccess ? (
              <>
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h1 className="text-2xl font-bold text-green-600 mb-2">Email Verified!</h1>
                <p className="text-secondary-600 mb-6">
                  Your email has been successfully verified. You can now sign in to your account.
                </p>
                <Button onClick={() => navigate('/login')} className="w-full">
                  Sign In
                </Button>
              </>
            ) : (
              <>
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
                  <XCircle className="h-8 w-8 text-red-600" />
                </div>
                <h1 className="text-2xl font-bold text-red-600 mb-2">Verification Failed</h1>
                <p className="text-secondary-600 mb-6">
                  {error || 'We couldn\'t verify your email address. The link may be invalid or expired.'}
                </p>
                <div className="space-y-3">
                  <Button onClick={() => navigate('/login')} variant="outline" className="w-full">
                    Go to Sign In
                  </Button>
                  <Button onClick={() => navigate('/register')} className="w-full">
                    Create New Account
                  </Button>
                </div>
              </>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default EmailVerification;
