'use client';

import React, { useState } from 'react';
import NavBar2 from '../components/NavBarGetStarted';
import { ResumeUpload } from '../components/resume-upload';
import { ResumeScore } from '../components/resume-score';

interface Issue {
  description: string;
}

interface Category {
  name: string;
  score: number;
  issues: Issue[];
}

interface MatchedKeyword {
  keyword: string;
  context: string;
  category: string;
}

export default function GetStarted() {
  const [formStep, setFormStep] = useState(1);
  const [optimizationJson, setOptimizationJson] = useState<string>('');
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');

  const handleScoreUpdate = (
    optimizeDataString: string
  ) => {
    setOptimizationJson(optimizeDataString);
    setFormStep(2);
  };

  const handleRescan = () => {
    setFormStep(1);
    // ResumeUpload component receives initial text, so clearing state here might not be needed
    // depending on desired behavior when rescanning.
  };

  const renderForm = () => {
    switch (formStep) {
      case 1:
        return (
          <div className="w-full">
            <ResumeUpload 
              onScoreUpdate={handleScoreUpdate} 
              initialResumeText={resumeText}
              initialJobDescription={jobDescription}
            />
          </div>
        );
      case 2:
        return (
          <div className="w-full">
            <ResumeScore 
              optimize={optimizationJson} 
              onRescan={handleRescan}
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <NavBar2 />
      <main className="flex flex-col items-center justify-center min-h-screen bg-white w-full py-10">
        <div className="container mx-auto flex flex-col items-center space-y-10">
          <div className="w-full max-w-4xl">
            {renderForm()}
          </div>
        </div>
      </main>
    </>
  );
}
