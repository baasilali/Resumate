'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUser } from '../hooks/useUser';
import { auth } from '../firebase/config';
import { signOut } from 'firebase/auth';
import { useState, useRef, useEffect } from 'react';

export default function NavBar() {
  const pathname = usePathname();
  const isLandingPage = pathname === '/';
  const { user, loading } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const scrollToSection = (id) => {
    document.getElementById(id).scrollIntoView({ behavior: 'smooth' });
    setIsOpen(false);
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setIsOpen(false);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const buttonBaseStyle = "px-4 py-2 rounded-md transition-all duration-200 text-sm font-medium w-full text-left";
  const lightButtonStyle = `${buttonBaseStyle} bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200`;
  const primaryButtonStyle = `${buttonBaseStyle} text-white bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600`;
  const signInButtonStyle = "px-4 py-2 rounded-md transition-all duration-200 text-sm font-medium text-white bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 no-underline";

  return (
    <nav className="w-full bg-white border-b border-gray-200 relative">
      <div className="container mx-auto flex items-center justify-between p-4">
        <div className="flex items-center space-x-4">
          <Link href="/" legacyBehavior>
            <a>
              <Image src="/Resumate.svg" alt="Logo" width={40} height={40} />
            </a>
          </Link>
          <span className="ml-2 text-xl font-medium text-black">Resumate</span>
        </div>
        
        {/* Desktop Links - visible on larger screens (md and up) */}
        <div className="hidden md:flex items-center space-x-8 ml-8">
          <button onClick={() => scrollToSection('features')} className="text-gray-600 hover:text-gray-900 cursor-pointer">
            Features
          </button>
          <button onClick={() => scrollToSection('pricing')} className="text-gray-600 hover:text-gray-900 cursor-pointer">
            Pricing
          </button>
          <button onClick={() => scrollToSection('contact')} className="text-gray-600 hover:text-gray-900 cursor-pointer">
            Contact
          </button>
        </div>
        
        {/* Right side items: Sign In button OR User Profile & Menu Icon */}
        <div className="flex items-center space-x-4">
          {/* Sign In Button: Shown if NOT loading, NOT user, AND isLandingPage */}
          {!loading && !user && isLandingPage && (
            <Link href="/signin" legacyBehavior>
              <a className={signInButtonStyle}>
                Sign In
              </a>
            </Link>
          )}

          {/* User profile icon and Hamburger menu: Only shown if !loading, user IS logged in, AND isLandingPage */}
          {!loading && user && isLandingPage && (
            <div className="relative" ref={dropdownRef}>
              {/* Profile Picture / Icon Area */}
              <div 
                className="w-8 h-8 rounded-full overflow-hidden cursor-pointer border border-gray-200 mr-2 inline-block align-middle"
                onClick={() => setIsOpen(!isOpen)}
              >
                {user.photoURL ? (
                  <Image
                    src={user.photoURL}
                    alt="Profile"
                    width={32}
                    height={32}
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center text-white text-sm font-medium">
                    {user.email?.charAt(0).toUpperCase() || 'U'}
                  </div>
                )}
              </div>
              
              {/* Hamburger Icon */}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 hover:bg-gray-100 rounded-md inline-block align-middle"
                aria-label="Menu"
              >
                <svg
                  className="w-6 h-6 text-gray-700"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M4 6h16M4 12h16M4 18h16"></path>
                </svg>
              </button>

              {/* Dropdown Menu Content */}
              {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                  <div className="px-2 py-1">
                    {/* User Email Display */}
                    <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-200 mb-1">
                      {user.email}
                    </div>
                    
                    {/* Links for mobile/dropdown - hidden on larger screens */}
                    <Link 
                      href="/" 
                      className={lightButtonStyle + " mb-1 block md:hidden"} 
                      onClick={() => setIsOpen(false)}
                    >
                      Home
                    </Link>
                    <button 
                      onClick={() => scrollToSection('features')} 
                      className={lightButtonStyle + " mb-1 md:hidden"}
                    >
                      Features
                    </button>
                    <button 
                      onClick={() => scrollToSection('pricing')} 
                      className={lightButtonStyle + " mb-1 md:hidden"}
                    >
                      Pricing
                    </button>
                    <button 
                      onClick={() => scrollToSection('contact')} 
                      className={lightButtonStyle + " mb-1 md:hidden"}
                    >
                      Contact
                    </button>
                    
                    {/* Profile Link */}
                    <Link 
                      href="/profile" 
                      className={lightButtonStyle + " mb-1 block"} 
                      onClick={() => setIsOpen(false)}
                    >
                      Profile
                    </Link>
                    {/* Sign Out Button */}
                    <button
                      onClick={handleSignOut}
                      className={primaryButtonStyle}
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
