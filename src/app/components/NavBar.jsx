'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUser } from '../hooks/useUser';
import { auth } from '../firebase/config';
import { signOut } from 'firebase/auth';

export default function NavBar() {
  const pathname = usePathname();
  const isLandingPage = pathname === '/';
  const { user, loading } = useUser();

  const scrollToSection = (id) => {
    document.getElementById(id).scrollIntoView({ behavior: 'smooth' });
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <nav className="w-full bg-white border-b border-gray-200">
      <div className="container mx-auto flex items-center justify-between p-4">
        <div className="flex items-center space-x-4">
          <Link href="/" legacyBehavior>
            <a className="flex items-center space-x-4 no-underline">
              <Image src="/Resumate.svg" alt="Logo" width={40} height={40} />
              <span className="ml-2 text-xl font-medium text-black hover:text-gray-700 transition-colors">Resumate</span>
            </a>
          </Link>
        </div>
        <div className="flex items-center space-x-8 ml-8">
          <button onClick={() => scrollToSection('features')} className="text-gray-600 hover:text-gray-900 cursor-pointer">
            Features
          </button>
          <a href="mailto:resumateservice@gmail.com" className="text-gray-600 hover:text-gray-900 no-underline">
            Contact Us
          </a>
        </div>
        {!loading && (
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Link href="/profile" className="text-gray-600 hover:text-gray-900 no-underline">
                  Profile
                </Link>
                <button
                  onClick={handleSignOut}
                  className="px-4 py-2 text-white bg-gradient-to-r from-pink-500 to-purple-500 rounded-md hover:from-pink-600 hover:to-purple-600"
                >
                  Sign Out
                </button>
              </>
            ) : (
              isLandingPage && (
                <Link href="/signin" legacyBehavior>
                  <a className="px-4 py-2 text-white bg-gradient-to-r from-pink-500 to-purple-500 rounded-md hover:from-pink-600 hover:to-purple-600 no-underline">
                    Sign In
                  </a>
                </Link>
              )
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
