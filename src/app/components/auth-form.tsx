"use client"

import { useState } from 'react';
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/app/components/ui/card";
import Link from 'next/link';

export function AuthForm() {
  const [isLoginView, setIsLoginView] = useState(false); // false = SignUp, true = Login
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    if (!isLoginView && password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    // TODO: Implement actual signup/login logic based on isLoginView
    console.log(isLoginView ? 'Logging in with:' : 'Signing up with:', { email, password });
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500)); 
    setLoading(false);
    // TODO: Redirect on successful signup/login (e.g., using useRouter from 'next/navigation')
    alert(`${isLoginView ? 'Login' : 'Signup'} successful! (Placeholder - implement redirection)`);
  };

  const toggleView = () => {
    setIsLoginView(!isLoginView);
    setError(''); // Clear errors when switching views
    // Optionally clear form fields too
    // setEmail('');
    // setPassword('');
    // setConfirmPassword('');
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle>{isLoginView ? 'Log In' : 'Create an Account'}</CardTitle>
        <CardDescription>{isLoginView ? 'Enter your credentials to access your account.' : 'Enter your details below to get started.'}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="you@example.com" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input 
              id="password" 
              type="password" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {!isLoginView && (
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input 
                id="confirm-password" 
                type="password" 
                required 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          )}
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button type="submit" className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white" disabled={loading}>
            {loading 
              ? (isLoginView ? 'Logging In...' : 'Creating Account...') 
              : (isLoginView ? 'Log In' : 'Create Account')}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="text-center text-sm">
        <p>
          {isLoginView ? "Don't have an account? " : 'Already have an account? '}
          <button 
            type="button" 
            onClick={toggleView} 
            className="text-purple-600 hover:underline font-medium"
          >
            {isLoginView ? 'Sign up' : 'Log in'}
          </button>
        </p>
      </CardFooter>
    </Card>
  );
}
