'use client';

import { useState, useEffect } from 'react';
import { useUser } from '../hooks/useUser';
import { useAuth } from '../hooks/useAuth';
import NavBarGetStarted from '../components/NavBarGetStarted';
import { useRouter } from 'next/navigation';

interface DbUserData {
  _id: string;
  firebase_id: string;
  email: string;
  credits: number;
  membership: string;
  __v: number;
  resumeFileId?: string;
}

export default function Profile() {
  const { user, loading: userLoading } = useUser();
  const router = useRouter();
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const { resetPassword, error: authError, resetEmailSent } = useAuth();
  const [dbUserData, setDbUserData] = useState<DbUserData | null>(null);
  const [dbLoading, setDbLoading] = useState(true);
  const [dbError, setDbError] = useState<string | null>(null);

  // Redirect if not logged in
  if (!userLoading && !user) {
    router.push('/signin');
    return null;
  }

  useEffect(() => {
    const fetchDbUserData = async () => {
      if (user?.uid) {
        setDbLoading(true);
        setDbError(null);
        try {
          const response = await fetch('http://localhost:3001/api/v1/user/get', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ firebase_id: user.uid }),
          });
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to fetch user data');
          }
          const data: DbUserData = await response.json();
          setDbUserData(data);
        } catch (err: any) {
          setDbError(err.message);
          console.error("Error fetching DB user data:", err);
        } finally {
          setDbLoading(false);
        }
      }
    };

    fetchDbUserData();
  }, [user?.uid]);

  const handlePasswordReset = async () => {
    if (user?.email) {
      await resetPassword(user.email);
    }
  };

  if (userLoading || (dbLoading && user)) {
    return (
      <>
        <NavBarGetStarted />
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      </>
    );
  }

  return (
    <>
      <NavBarGetStarted />
      <div className="min-h-screen bg-gray-50 pt-32 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Account Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <p className="mt-1 text-gray-900">{user?.email}</p>
              </div>
              
              <div>
                <button
                  onClick={() => setShowPasswordReset(true)}
                  className="text-purple-600 hover:text-purple-500 text-sm font-medium"
                >
                  Change Password
                </button>
                
                {showPasswordReset && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-md">
                    <p className="text-sm text-gray-600 mb-4">
                      We&apos;ll send a password reset link to your email address.
                    </p>
                    <button
                      onClick={handlePasswordReset}
                      className="bg-purple-600 text-white px-4 py-2 rounded-md text-sm hover:bg-purple-700"
                    >
                      Send Reset Link
                    </button>
                    {authError && <p className="mt-2 text-sm text-red-600">{authError}</p>}
                    {resetEmailSent && (
                      <p className="mt-2 text-sm text-green-600">
                        Password reset link has been sent to your email!
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Payment & Plan</h2>
            {dbError && <p className="text-red-500">Error loading plan details: {dbError}</p>}
            {!dbUserData && !dbError && !dbLoading && <p>No plan information found.</p>}
            {dbUserData && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Current Plan</label>
                  <p className="mt-1 text-gray-900 capitalize">{dbUserData.membership.replace('_', ' ') || 'N/A'}</p>
                  <p className="mt-1 text-sm text-gray-500">{dbUserData.credits} Credits Remaining</p>
                </div>
                
                <div className="border-t pt-4">
                  <button
                    className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-4 py-2 rounded-md hover:from-pink-600 hover:to-purple-600"
                    onClick={() => router.push('/#pricing')}
                  >
                    {dbUserData.membership === 'monthly_unlimited' ? 'Manage Subscription' : 'Upgrade to Unlimited'}
                  </button>
                  <p className="mt-2 text-sm text-gray-500">
                    {dbUserData.membership === 'monthly_unlimited' ? 'Manage your current subscription.' : 'Get unlimited access to all features'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
} 