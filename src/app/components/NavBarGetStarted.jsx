'use client';

import Image from 'next/image';
import Link from 'next/link';

export default function NavBarGetStarted() {
  const scrollToSection = (id) => {
    document.getElementById(id).scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <nav className="w-full bg-white border-b border-gray-200 mb-[-100px]">
      <div className="container mx-auto flex items-center justify-between p-4">
        <div className="flex items-center space-x-4">
          <Link href="/" legacyBehavior>
            <a>
              <Image src="/Resumate.svg" alt="Logo" width={40} height={40} />
            </a>
          </Link>
          <span className="ml-2 text-xl font-medium text-black">Resumate</span>
        </div>
        <div className="flex items-center space-x-8 ml-8">
          <a href="mailto:resumateservice@gmail.com" className="text-gray-600 hover:text-gray-900 no-underline">
            Contact Us
          </a>
        </div>
        <div className="flex space-x-4">
          <Link href="/GetStarted" legacyBehavior>
            <a className="px-4 py-2 text-white bg-gradient-to-r from-pink-500 to-purple-500 rounded-md hover:from-pink-600 hover:to-purple-600 no-underline">Get Started</a>
          </Link>
        </div>
      </div>
    </nav>
  );
}
