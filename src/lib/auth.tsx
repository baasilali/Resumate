"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define User type
interface User {
  uid: string;
  email?: string;
  displayName?: string;
}

// Define AuthContextType
interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

// Create context with default values
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider props
interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if user is signed in on mount
  useEffect(() => {
    // This is where you would typically set up your Firebase auth listener
    // For now, we'll just simulate it with localStorage
    const checkAuth = () => {
      try {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
          setUser(JSON.parse(savedUser));
        }
      } catch (error) {
        console.error('Error checking auth:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Sign in function - replace with your actual Firebase auth
  const signIn = async (email: string, password: string) => {
    // Replace with your actual Firebase authentication
    // Simulate a sign in for now
    const mockUser = { uid: 'mock-user-id', email };
    localStorage.setItem('user', JSON.stringify(mockUser));
    setUser(mockUser);
  };

  // Sign out function
  const signOut = async () => {
    // Replace with your actual Firebase sign out
    localStorage.removeItem('user');
    setUser(null);
  };

  const value = {
    user,
    loading,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 