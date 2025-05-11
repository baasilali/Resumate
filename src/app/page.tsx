'use client';

import Image from 'next/image';
import Link from 'next/link';
import NavBar from './components/NavBar';
import { Typewriter } from 'react-simple-typewriter';
import { useAuth } from './hooks/useAuth';
import { PricingSection } from '@/components/pricing/pricing-section';
import ContactSection from '@/components/contact/contact-section';
import { FiUpload, FiTarget, FiLayout, FiShield } from 'react-icons/fi';

export default function Home() {
  const { user, loading } = useAuth();

  const getStartedLink = loading ? '#' : user ? '/GetStarted' : '/signup';

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
          <div className="lg:w-7/12 flex justify-center lg:justify-end">
            <Image src="/HomePageGraphic.svg" alt="SVG illustration" width={500} height={400} />
          </div>
        </div>
        <div id="features" className="w-full py-24 bg-white">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-14">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500">Features</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {/* Feature 1 */}
              <div className="group bg-white rounded-2xl border border-gray-100 shadow-sm p-10 flex flex-col items-center transition-all hover:shadow-pink-100 hover:border-pink-400">
                <FiUpload size={40} className="mb-6 text-pink-500 transition-colors group-hover:text-pink-600" />
                <h3 className="font-semibold text-lg mb-2 text-center">Upload Any Format</h3>
                <p className="text-gray-500 text-sm text-center">Upload your resume as PDF, image, or text for instant parsing.</p>
              </div>
              {/* Feature 2 */}
              <div className="group bg-white rounded-2xl border border-gray-100 shadow-sm p-10 flex flex-col items-center transition-all hover:shadow-purple-100 hover:border-purple-400">
                <FiTarget size={40} className="mb-6 text-purple-500 transition-colors group-hover:text-purple-600" />
                <h3 className="font-semibold text-lg mb-2 text-center">AI Role Matching</h3>
                <p className="text-gray-500 text-sm text-center">Get tailored suggestions for specific jobs using AI.</p>
              </div>
              {/* Feature 3 */}
              <div className="group bg-white rounded-2xl border border-gray-100 shadow-sm p-10 flex flex-col items-center transition-all hover:shadow-pink-100 hover:border-pink-400">
                <FiLayout size={40} className="mb-6 text-pink-500 transition-colors group-hover:text-pink-600" />
                <h3 className="font-semibold text-lg mb-2 text-center">Beautiful Templates</h3>
                <p className="text-gray-500 text-sm text-center">Choose from modern, recruiter-approved templates.</p>
              </div>
              {/* Feature 4 */}
              <div className="group bg-white rounded-2xl border border-gray-100 shadow-sm p-10 flex flex-col items-center transition-all hover:shadow-purple-100 hover:border-purple-400">
                <FiShield size={40} className="mb-6 text-purple-500 transition-colors group-hover:text-purple-600" />
                <h3 className="font-semibold text-lg mb-2 text-center">Secure & Private</h3>
                <p className="text-gray-500 text-sm text-center">Your data is encrypted and never shared without your consent.</p>
              </div>
            </div>
          </div>
        </div>
        <div id="pricing" className="w-full">
          <PricingSection />
        </div>
        <div id="contact" className="w-full">
          <ContactSection />
        </div>
      </main>
    </>
  );
}
