"use client";

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Get the payment_intent and payment_intent_client_secret from URL
    const paymentIntent = searchParams.get('payment_intent');
    const paymentIntentClientSecret = searchParams.get('payment_intent_client_secret');

    if (paymentIntent && paymentIntentClientSecret) {
      // If both parameters exist, we can assume payment was successful
      setStatus('success');
      setMessage('Your payment was successful! Your subscription is now active.');
    } else {
      // If parameters are missing, there might be an error
      setStatus('error');
      setMessage('There was an issue processing your payment. Please try again or contact support.');
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-lg">
        <h1 className="text-2xl font-bold text-center mb-6">
          {status === 'loading' ? 'Processing Payment...' : 
           status === 'success' ? 'Payment Successful!' : 'Payment Issue'}
        </h1>
        
        {status === 'loading' && (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
          </div>
        )}
        
        {status !== 'loading' && (
          <>
            <div className={`text-center mb-6 ${status === 'success' ? 'text-green-600' : 'text-red-600'}`}>
              <p>{message}</p>
            </div>
            
            <div className="flex flex-col space-y-4">
              <Link 
                href="/"
                className="py-2 px-4 bg-purple-500 text-white font-semibold rounded-lg shadow-md hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-opacity-75 text-center"
              >
                Return to Home
              </Link>
              
              {status === 'error' && (
                <button 
                  onClick={() => window.history.back()}
                  className="py-2 px-4 bg-gray-200 text-gray-800 font-semibold rounded-lg shadow-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-75"
                >
                  Try Again
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
} 