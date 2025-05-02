'use client';

import NavBar from './components/NavBar';
import Image from 'next/image';
import Link from 'next/link';
import { Typewriter } from 'react-simple-typewriter';
import { PricingSection } from '@/components/pricing/pricing-section';
import ContactSection from '@/components/contact/contact-section';
import { FileText, SlidersHorizontal, Sparkles, ShieldCheck } from 'lucide-react';

export default function Home() {
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
                <Link href="/signup" legacyBehavior>
                  <a className="ml-4 px-4 py-2 text-white bg-gradient-to-r from-pink-500 to-purple-500 rounded-md hover:from-pink-600 hover:to-purple-600 focus:outline-none whitespace-nowrap no-underline">
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
          <div className="max-w-5xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-16">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500">Features</span>
            </h2>
            <div className="relative flex items-center justify-center">
              {/* Minimal Oval Burst Gradient */}
              <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-0 w-[140%] h-[110%]">
                <div className="w-full h-full rounded-full bg-[radial-gradient(ellipse_60%_40%_at_50%_50%,rgba(236,72,153,0.18)_0%,rgba(168,85,247,0.13)_60%,transparent_100%)]"></div>
              </div>
              {/* Feature Cards Grid */}
              <div className="relative z-10 w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">
                {/* Feature 1 */}
                <div className="group bg-white rounded-xl border border-gray-100 shadow-sm p-8 flex flex-col items-center transition-all hover:shadow-lg hover:border-pink-400">
                  <FileText className="text-pink-500 mb-6" size={36} />
                  <h3 className="font-semibold text-lg mb-3 text-center">Input Images & PDFs</h3>
                  <p className="text-gray-500 text-sm text-center">Upload your resume as an image or PDF for instant parsing.</p>
                </div>
                {/* Feature 2 */}
                <div className="group bg-white rounded-xl border border-gray-100 shadow-sm p-8 flex flex-col items-center transition-all hover:shadow-lg hover:border-purple-400">
                  <SlidersHorizontal className="text-purple-500 mb-6" size={36} />
                  <h3 className="font-semibold text-lg mb-3 text-center">Role-Specific Tuning</h3>
                  <p className="text-gray-500 text-sm text-center">Tailor your resume for specific jobs with AI-powered suggestions.</p>
                </div>
                {/* Feature 3 */}
                <div className="group bg-white rounded-xl border border-gray-100 shadow-sm p-8 flex flex-col items-center transition-all hover:shadow-lg hover:border-pink-400">
                  <Sparkles className="text-pink-500 mb-6" size={36} />
                  <h3 className="font-semibold text-lg mb-3 text-center">Premium Templates</h3>
                  <p className="text-gray-500 text-sm text-center">Choose from modern, recruiter-approved templates.</p>
                </div>
                {/* Feature 4 */}
                <div className="group bg-white rounded-xl border border-gray-100 shadow-sm p-8 flex flex-col items-center transition-all hover:shadow-lg hover:border-purple-400">
                  <ShieldCheck className="text-purple-500 mb-6" size={36} />
                  <h3 className="font-semibold text-lg mb-3 text-center">Privacy & Security</h3>
                  <p className="text-gray-500 text-sm text-center">Your data is encrypted and never shared without your consent.</p>
                </div>
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
