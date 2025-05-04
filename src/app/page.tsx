'use client';

import Image from 'next/image';
import Link from 'next/link';
import NavBar from './components/NavBar';
import { Typewriter } from 'react-simple-typewriter';
import { useAuth } from './hooks/useAuth';

export default function Home() {
  const { user, loading } = useAuth();

  const getStartedLink = loading ? '#' : user ? '/GetStarted' : '/signin';

  return (
    <>
      <NavBar />
      <main className="flex min-h-screen flex-col items-center justify-start bg-white w-full py-24">
        <div className="container mx-auto flex flex-col lg:flex-row items-center justify-center px-4 bg-white mb-40">
          <div className="text-center lg:text-left lg:w-5/12 space-y-4 mb-8 lg:mb-0">
            <h1 className="text-5xl font-bold text-black leading-tight">
              Customize your SWE <br /> resume <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500">in seconds</span>
            </h1>
            <p className="text-gray-700">
              Our AI is trained on thousands of resumes and allows you to <br /> create new resume for specific jobs
            </p>
            <ul className="list-none space-y-2">
              <li className="flex items-center">
                <Image src="/check.png" alt="Check mark" width={24} height={24} />
                <span className="ml-2 text-gray-500">Input images and PDFs</span>
              </li>
              <li className="flex items-center">
                <Image src="/check.png" alt="Check mark" width={24} height={24} />
                <span className="ml-2 text-gray-500">Adjust for specific roles</span>
              </li>
            </ul>
            <div className="mt-4 flex flex-col items-center lg:items-start space-y-2">
              <div className="typewriter-container px-4 py-2 bg-gray-100 rounded-md flex items-center justify-between w-full lg:w-auto">
                <div className="text-gray-700 text-lg" style={{ width: '340px', whiteSpace: 'nowrap', fontFamily: 'monospace' }}>
                  Customize my resume for <Typewriter
                    words={['Google', 'Netflix', 'Meta']}
                    loop={5}
                    cursor
                    cursorStyle='|'
                    typeSpeed={100}
                    deleteSpeed={75}
                    delaySpeed={1000}
                    onLoopDone={() => console.log('Done with loop!')}
                  />
                </div>
                <Link href={getStartedLink} legacyBehavior>
                  <a className={`ml-4 px-4 py-2 text-white bg-gradient-to-r from-pink-500 to-purple-500 rounded-md hover:from-pink-600 hover:to-purple-600 focus:outline-none whitespace-nowrap no-underline ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    Get Started
                  </a>
                </Link>
              </div>
            </div>
          </div>
          <div className="lg:w-5/12 flex justify-center lg:justify-start mt-2">
            <Image src="/HomePageGraphic.svg" alt="SVG illustration" width={500} height={400} />
          </div>
        </div>
        <div id="features" className="w-full text-center mt-0">
          <div className="flex flex-col items-center mt-10">
            <h2 className="text-2xl font-medium text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500 mb-0">
              Features
            </h2>
            <Image src="/Features.svg" alt="Features illustration" width={1800} height={1300} className="mt-[-200px]" />
          </div>
        </div>
        {/* <div id="pricing" className="w-full text-center mt-40">
          <div className="flex flex-col items-center mt-10">
            <h2 className="text-2xl font-medium text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500 mb-0">
              Pricing
            </h2>
            <Image src="/Pricing.svg" alt="Features illustration" width={1800} height={1300} className="mt-[-200px]" />
          </div>
        </div> */}
      </main>
    </>
  );
}
