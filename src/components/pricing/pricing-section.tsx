"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Star, CreditCard, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";

const creditPackages = [
  {
    credits: 5,
    price: 1.50,
    perCredit: 0.30,
  },
  {
    credits: 10,
    price: 3.00,
    perCredit: 0.30,
    popular: true,
  },
  {
    credits: 20,
    price: 6.00,
    perCredit: 0.30,
  },
];

const subscriptionPlan = {
  name: "Pro Subscription",
  price: 4.99,
  features: [
    "Unlimited resume customizations",
    "All premium templates",
    "AI writing assistance",
    "Priority email support",
    "Custom sections",
    "No watermarks",
  ],
};

export function PricingSection() {
  const [selectedCredits, setSelectedCredits] = useState(10);
  const [isPro, setIsPro] = useState(false);

  const selectedPackage = creditPackages.find(pkg => pkg.credits === selectedCredits) || creditPackages[1];

  return (
    <section className="py-12 px-4 relative overflow-hidden">
      {/* Background Pattern with gradient overlay */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 to-purple-500/10" />
        <div className="h-full w-full bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:35px_35px] opacity-30 [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
      </div>

      <div className="max-w-5xl mx-auto">
        <div className="text-center space-y-3 mb-10">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Choose Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500">Plan</span>
          </h2>
          <p className="text-gray-600 text-base max-w-2xl mx-auto">
            Pay per resume or get unlimited access with a monthly subscription
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 items-stretch justify-center">
          {/* Credits Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full lg:w-[340px] bg-white rounded-xl p-6 shadow-lg border border-gray-100 flex flex-col"
          >
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="w-5 h-5 text-pink-500 -mt-1" />
              <h3 className="text-xl font-semibold">Pay Per Resume</h3>
            </div>

            {/* Credit Slider */}
            <div className="space-y-4 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-sm">Number of Resumes</span>
                <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500">
                  {selectedCredits}
                </span>
              </div>
              <input
                type="range"
                min="5"
                max="20"
                step="5"
                value={selectedCredits}
                onChange={(e) => setSelectedCredits(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-pink-500"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>5</span>
                <span>10</span>
                <span>15</span>
                <span>20</span>
              </div>
            </div>

            {/* Price Display */}
            <div className="text-center p-4 bg-gradient-to-r from-pink-500/5 to-purple-500/5 rounded-lg mb-6">
              <div className="flex justify-center items-baseline gap-1">
                <span className="text-3xl font-bold">${selectedPackage.price.toFixed(2)}</span>
                <span className="text-gray-500 text-sm">one-time</span>
              </div>
              <p className="text-xs text-gray-600 mt-1">
                Just ${selectedPackage.perCredit.toFixed(2)} per resume
              </p>
            </div>

            <button className="mt-auto w-full py-2.5 px-4 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg font-semibold hover:from-pink-600 hover:to-purple-600 transition-all duration-200 shadow-lg shadow-purple-500/20 text-sm">
              Buy Credits
            </button>
          </motion.div>

          {/* Monthly Subscription */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="w-full lg:w-[340px] bg-white rounded-xl p-6 shadow-lg border border-gray-100 flex flex-col"
          >
            <div className="flex items-center gap-2 mb-4">
              <CalendarDays className="w-5 h-5 text-purple-500 -mt-1" />
              <h3 className="text-xl font-semibold">Monthly Unlimited</h3>
            </div>

            <div className="text-center p-4 bg-gradient-to-r from-pink-500/5 to-purple-500/5 rounded-lg mb-6">
              <div className="flex justify-center items-baseline gap-1">
                <span className="text-3xl font-bold">${subscriptionPlan.price}</span>
                <span className="text-gray-500 text-sm">/month</span>
              </div>
              <p className="text-xs text-gray-600 mt-1">
                Create unlimited resumes
              </p>
            </div>

            <ul className="space-y-2 mb-6 flex-grow">
              {subscriptionPlan.features.map((feature) => (
                <li key={feature} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <span className="text-gray-600 text-sm">{feature}</span>
                </li>
              ))}
            </ul>

            <button className="mt-auto w-full py-2.5 px-4 bg-white border-2 border-purple-500 text-purple-500 rounded-lg font-semibold hover:bg-purple-50 transition-all duration-200 text-sm">
              Start Monthly Plan
            </button>
          </motion.div>
        </div>

        {/* FAQ or Additional Info */}
        <div className="mt-10 text-center">
          <p className="text-gray-600 text-sm">
            Questions about our pricing? Contact us for more information
          </p>
        </div>
      </div>
    </section>
  );
} 