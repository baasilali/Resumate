import { useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  UserCredential,
  onAuthStateChanged, 
  User 
} from 'firebase/auth';
import { auth } from '../firebase/config';
import { useRouter } from 'next/navigation';

export const useAuth = () => {
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    setLoading(true);
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithEmail = async (email: string, password: string): Promise<void> => {
    try {
      setLoading(true);
      setError('');
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'An error occurred during sign in');
    } finally {
      setLoading(false);
    }
  };

  const signUpWithEmail = async (email: string, password: string): Promise<string | undefined> => {
    try {
      setLoading(true);
      setError('');
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const userId = userCredential.user.uid;
      try {
        const response = await fetch('http://localhost:3001/api/v1/user/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            firebase_id: userId,
            email: email, // email is available from component state
          }),
        });

        if (!response.ok) {
          // Handle non-successful responses (e.g., 4xx, 5xx)
          const errorData = await response.json();
          console.error('Error creating user in backend:', response.status, errorData);
          // Optionally set an error state here to show feedback to the user
        } else {
          const result = await response.json();
          console.log('Backend user creation successful:', result);
          // Handle successful backend response (e.g., maybe navigate or show success message)
        }
      } catch (error) {
        console.error('Network error or issue making POST request:', error);
        // Optionally set an error state here
      }

      router.push('/');
      return userCredential.user.uid;
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setError('An account with this email already exists');
      } else if (err.code === 'auth/weak-password') {
        setError('Password should be at least 6 characters');
      } else {
        setError(err.message || 'An error occurred during sign up');
      }
      return undefined;
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async (): Promise<void> => {
    try {
      setLoading(true);
      setError('');
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'An error occurred during Google sign in');
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string): Promise<void> => {
    try {
      setLoading(true);
      setError('');
      await sendPasswordResetEmail(auth, email);
      setResetEmailSent(true);
    } catch (err: any) {
      if (err.code === 'auth/user-not-found') {
        setError('No account exists with this email address');
      } else {
        setError(err.message || 'An error occurred while resetting password');
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    error,
    loading,
    resetEmailSent,
    signInWithEmail,
    signInWithGoogle,
    signUpWithEmail,
    resetPassword
  };
}; 