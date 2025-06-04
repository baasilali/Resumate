'use client'; // Added for Next.js App Router compatibility with react-pdf worker

import { useState, useEffect, useRef } from "react"
import { useUser } from '../hooks/useUser'
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card"
import { Button } from "@/app/components/ui/button"
import { Zap, ChevronDown, ChevronUp, Check, AlertCircle, X, Download, ChevronLeft, ChevronRight } from "lucide-react"
import { Document, Page, pdfjs } from 'react-pdf'

// Explicitly set workerSrc to the path in the public folder
pdfjs.GlobalWorkerOptions.workerSrc = `/pdf.worker.min.mjs`; 

interface Issue {
  description: string
}

interface Category {
  name: string
  score: number
  issues: Issue[]
}

interface MatchedKeyword {
  keyword: string
  context: string
  category: string
}

interface ResumeScoreProps {
  matchRate: number
  categories: Category[]
  matchedKeywords: MatchedKeyword[]
  jobDescription: string
  onRescan: () => void
  atsData?: {
    score: number;
    matched_keywords: string[];
    missing_keywords: string[];
  }
}

export function ResumeScore({ matchRate, categories, matchedKeywords, jobDescription, onRescan, atsData }: ResumeScoreProps) {
  const { user, loading: userLoading } = useUser();
  
  // Scoring component state
  const [openCategories, setOpenCategories] = useState<string[]>([])
  const [isKeywordsOpen, setIsKeywordsOpen] = useState(false)
  const [isMissingKeywordsOpen, setIsMissingKeywordsOpen] = useState(false)
  const [animatedMatchRate, setAnimatedMatchRate] = useState(0)
  const [isAnimating, setIsAnimating] = useState(true)
  const [isOptimizationComplete, setIsOptimizationComplete] = useState(false)

  // PDF optimization state
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [optimizationError, setOptimizationError] = useState<string | null>(null)
  const [showOptimizedPdf, setShowOptimizedPdf] = useState(false)
  
  // PDF display state
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [isLoadingPdf, setIsLoadingPdf] = useState<boolean>(false);
  const [pdfError, setPdfError] = useState<string | null>(null);

  // Refs for scrolling
  const optimizedPdfRef = useRef<HTMLDivElement>(null);

  const circumference = 2 * Math.PI * 60
  const strokeDasharray = `${circumference} ${circumference}`
  const strokeDashoffset = circumference - (animatedMatchRate / 100) * circumference

  const colorClass = animatedMatchRate >= 70 ? "text-green-500" : animatedMatchRate >= 40 ? "text-yellow-500" : "text-red-500"

  // Animate the ATS score initially, then to 100% after optimization
  useEffect(() => {
    if (isAnimating) {
      const duration = 1500 // 1.5 seconds
      const steps = 60 // 60 steps for smooth animation
      
      // If optimization is complete, animate to 100%, otherwise animate to ATS score
      const targetScore = isOptimizationComplete ? 100 : (atsData?.score || 0)
      const increment = targetScore / steps
      let current = isOptimizationComplete ? (atsData?.score || 0) : 0
      let step = 0

      const timer = setInterval(() => {
        if (step < steps) {
          current += increment
          setAnimatedMatchRate(Math.min(Math.round(current), targetScore))
          step++
        } else {
          setIsAnimating(false)
          clearInterval(timer)
        }
      }, duration / steps)

      return () => clearInterval(timer)
    }
  }, [atsData?.score, isAnimating, isOptimizationComplete])

  // Cleanup PDF URL on unmount
  useEffect(() => {
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [pdfUrl]);

  const toggleCategory = (categoryName: string) => {
    setOpenCategories((prev) =>
      prev.includes(categoryName) ? prev.filter((name) => name !== categoryName) : [...prev, categoryName],
    )
  }

  const toggleKeywords = () => {
    setIsKeywordsOpen(!isKeywordsOpen)
  }

  const toggleMissingKeywords = () => {
    setIsMissingKeywordsOpen(!isMissingKeywordsOpen)
  }

  const handleOptimizeResume = async () => {
    if (!user?.uid) {
      setOptimizationError("Please sign in to optimize your resume.");
      return;
    }

    setIsOptimizing(true);
    setOptimizationError(null);
    setPdfUrl(null);
    setPdfBlob(null);

    try {
      // Get Firebase ID token for authentication
      const idToken = await user.getIdToken();

      // First validate subscription
      const validateSubscription = await fetch("http://localhost:3001/api/v1/user/validate_membership", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firebase_id: user.uid,
        }),
      });

      if (!validateSubscription.ok) {
        console.error("Subscription validation failed. Status:", validateSubscription.status);
        throw new Error("We couldn't verify your subscription status. Purchase a membership or contact support if the issue persists.");
      }

      // Call the optimization API
      const optimizeResponse = await fetch('http://localhost:3001/api/v1/ai/optimize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({
          firebase_id: user.uid,
          job_description: jobDescription,
        }),
      });

      if (!optimizeResponse.ok) {
        const errorData = await optimizeResponse.json().catch(() => ({ message: 'Could not parse error from server' }));
        console.error("Optimize API error. Status:", optimizeResponse.status, "Data:", errorData);
        throw new Error(errorData.message && !errorData.message.includes("status:") ? errorData.message : "We had trouble optimizing your resume. Please try again.");
      }

      // Now fetch the optimized PDF
      const response = await fetch('http://localhost:3001/api/v1/user/retrieve_resume', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ firebase_id: user.uid }),
      });

      if (!response.ok) {
        console.error(`Failed to fetch optimized PDF: ${response.status} ${response.statusText}`);
        throw new Error("We couldn't load your optimized resume right now. Please try again in a few moments.");
      }

      const blob = await response.blob();
      if (blob.type !== 'application/pdf') {
        console.error("Retrieved file is not a PDF. Type:", blob.type);
        throw new Error("The optimized resume file we received doesn't seem to be a standard PDF. Please try again or contact support.");
      }
      setPdfBlob(blob);
      setPdfUrl(URL.createObjectURL(blob));
      setShowOptimizedPdf(true);

      // Trigger animation to 100% after successful optimization
      setIsOptimizationComplete(true);
      setIsAnimating(true);

      // Scroll to the PDF section after a short delay to ensure it's rendered
      setTimeout(() => {
        optimizedPdfRef.current?.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }, 100);

    } catch (error: any) {
      console.error("Error optimizing resume:", error.message);
      setOptimizationError(error.message.startsWith("We couldn't") || error.message.startsWith("The optimized resume file") || error.message.startsWith("We had trouble")
        ? error.message 
        : "Something went wrong while optimizing your resume. Please try again.");
    } finally {
      setIsOptimizing(false);
    }
  };

  function onDocumentLoadSuccess({ numPages: nextNumPages }: { numPages: number }): void {
    setNumPages(nextNumPages);
    setPageNumber(1);
  }

  function changePage(offset: number) {
    setPageNumber(prevPageNumber => Math.min(Math.max(prevPageNumber + offset, 1), numPages || 1));
  }

  const handleDownload = () => {
    if (pdfBlob) {
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${user?.uid || 'user'}_optimized_resume.pdf`; 
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else {
      setOptimizationError("PDF data is not available for download. Please try again.");
    }
  };

  if (userLoading) {
    return (
      <Card className="w-full">
        <CardHeader><CardTitle className="text-center">Resume Analysis</CardTitle></CardHeader>
        <CardContent className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {/* Side by Side Layout: Analysis Card (left) and PDF Card (right) */}
      <div className="max-w-7xl mx-auto mt-20">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Main Resume Analysis Card - Left Side (2/5 width) */}
          <div className="lg:col-span-2">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="text-center">Resume Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center space-y-6">
                  {/* ATS Score Circle */}
                  <div className={`text-xl font-semibold ${colorClass}`}>
                    {animatedMatchRate >= 70 ? "Great Match!" : animatedMatchRate >= 40 ? "Good Match" : "Bad Match"}
                  </div>
                  <div className="relative w-40 h-40">
                    <svg className="w-full h-full" viewBox="0 0 128 128">
                      <circle
                        className="text-gray-200"
                        strokeWidth="8"
                        stroke="currentColor"
                        fill="transparent"
                        r="60"
                        cx="64"
                        cy="64"
                      />
                      <circle
                        className={`${colorClass} transition-all duration-[1500ms] ease-out`}
                        strokeWidth="8"
                        strokeDasharray={strokeDasharray}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="transparent"
                        r="60"
                        cx="64"
                        cy="64"
                        style={{
                          transformOrigin: "50% 50%",
                          transform: "rotate(-90deg)",
                        }}
                      />
                    </svg>
                    <div className={`absolute inset-0 flex items-center justify-center text-3xl font-bold ${colorClass} transition-colors duration-300`}>
                      {animatedMatchRate}%
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="space-y-3 w-full">
                    <Button className="w-full bg-black hover:bg-black/90 text-white" onClick={onRescan}>
                      Upload & rescan
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full hover:bg-purple-100 hover:text-purple-600 hover:border-purple-600"
                      onClick={handleOptimizeResume}
                      disabled={isOptimizing || !user || isOptimizationComplete}
                    >
                      <Zap className={`mr-2 h-4 w-4 ${isOptimizing ? 'animate-spin' : ''}`} />
                      {isOptimizing ? 'Optimizing...' : isOptimizationComplete ? 'Optimized' : 'Optimize'}
                    </Button>
                  </div>
                </div>

                {/* Keywords Section - Only show if optimization is not complete */}
                {!isOptimizationComplete && (
                  <div className="mt-6 space-y-3 max-h-[400px] overflow-y-auto">
                    {/* Matched Keywords */}
                    <div className="border rounded-lg p-3">
                      <div className="flex justify-between items-center cursor-pointer" onClick={toggleKeywords}>
                        <span className="text-sm font-medium">Matched Keywords</span>
                        <div className="flex items-center">
                          <span className="text-xs text-green-600 mr-2">
                            {atsData?.matched_keywords?.length || 0} matched
                          </span>
                          <Button variant="ghost" size="sm" className="p-0 h-auto hover:bg-transparent hover:text-purple-600">
                            {isKeywordsOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>
                      {isKeywordsOpen && (
                        <div className="mt-2 space-y-2 max-h-[150px] overflow-y-auto">
                          {atsData?.matched_keywords && atsData.matched_keywords.length > 0 ? (
                            <>
                              {atsData.matched_keywords.map((keyword, index) => (
                                <div key={index} className="flex items-start space-x-2 text-xs text-gray-600 mb-2">
                                  <Check className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                                  <div>
                                    <span className="font-medium">{keyword}</span>
                                  </div>
                                </div>
                              ))}
                            </>
                          ) : (
                            <p className="text-xs text-gray-600">No keywords matched.</p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Missing Keywords */}
                    <div className="border rounded-lg p-3">
                      <div className="flex justify-between items-center cursor-pointer" onClick={toggleMissingKeywords}>
                        <span className="text-sm font-medium">Missing Keywords</span>
                        <div className="flex items-center">
                          <span className="text-xs text-red-600 mr-2">
                            {atsData?.missing_keywords?.length || 0} missing
                          </span>
                          <Button variant="ghost" size="sm" className="p-0 h-auto hover:bg-transparent hover:text-purple-600">
                            {isMissingKeywordsOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>
                      {isMissingKeywordsOpen && (
                        <div className="mt-2 space-y-1 max-h-[120px] overflow-y-auto">
                          {atsData?.missing_keywords && atsData.missing_keywords.length > 0 ? (
                            <>
                              {atsData.missing_keywords.map((keyword, index) => (
                                <div key={index} className="flex items-start space-x-2 text-xs text-gray-600 mb-1">
                                  <X className="w-3 h-3 text-red-500 mt-0.5 flex-shrink-0" />
                                  <span className="font-medium">{keyword}</span>
                                </div>
                              ))}
                            </>
                          ) : (
                            <p className="text-xs text-gray-600">No missing keywords.</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Optimized PDF Display Card - Right Side (3/5 width) */}
          <div className="lg:col-span-3">
            {showOptimizedPdf ? (
              <Card className="h-full" ref={optimizedPdfRef}>
                <CardHeader>
                  <CardTitle className="text-center">Your Optimized Resume</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Download and Rescan buttons */}
                  <div className="mb-4 flex justify-center items-center space-x-4"> 
                    {pdfBlob && !isOptimizing && !optimizationError && (
                      <Button onClick={handleDownload} variant="outline" size="sm" className="bg-gradient-to-r from-pink-500 to-purple-500 text-white">
                        <Download className="mr-2 h-4 w-4" />
                        Download PDF
                      </Button>
                    )}
                    <Button size="sm" className="bg-black hover:bg-black/90 text-white" onClick={onRescan}>
                      Make Changes & Rescan
                    </Button>
                  </div>

                  {/* Loading state */}
                  {isOptimizing && (
                    <div className="flex justify-center items-center h-96">
                      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-gray-900"></div>
                      <p className="ml-3 text-gray-700">Generating optimized resume...</p>
                    </div>
                  )}

                  {/* Error state */}
                  {optimizationError && (
                    <div className="text-center text-red-600 bg-red-50 p-4 rounded-md flex items-center justify-center">
                      <AlertCircle className="mr-2 h-5 w-5" />
                      <span>{optimizationError}</span>
                    </div>
                  )}

                  {/* PDF Display */}
                  {!isOptimizing && !optimizationError && pdfUrl && (
                    <div className="flex flex-col items-center space-y-4">
                      <div className="w-full border rounded-md overflow-hidden shadow-lg bg-gray-50">
                        <Document
                          file={pdfUrl}
                          onLoadSuccess={onDocumentLoadSuccess}
                          onLoadError={(err) => {
                            console.error("React-PDF Document Load Error:", err.message);
                            setOptimizationError("We had trouble displaying your optimized resume. Please try downloading it instead or contact support if the issue persists.");
                          }}
                          loading={<div className="p-4 text-center">Loading optimized resume...</div>}
                          error={<div className="p-4 text-center text-red-500">Error loading PDF document.</div>}
                        >
                          <Page 
                            pageNumber={pageNumber} 
                            renderTextLayer={false}
                            renderAnnotationLayer={false}
                            width={Math.min(600, typeof window !== 'undefined' ? window.innerWidth - 200 : 600)}
                          />
                        </Document>
                      </div>
                      {numPages && numPages > 1 && (
                        <div className="flex items-center justify-center space-x-4 p-2 bg-gray-100 rounded-md">
                          <Button onClick={() => changePage(-1)} disabled={pageNumber <= 1} variant="ghost" size="sm">
                            <ChevronLeft className="h-5 w-5" />
                            Previous
                          </Button>
                          <span className="text-sm text-gray-700">
                            Page {pageNumber} of {numPages}
                          </span>
                          <Button onClick={() => changePage(1)} disabled={pageNumber >= numPages} variant="ghost" size="sm">
                            Next
                            <ChevronRight className="h-5 w-5" />
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="text-center">Optimized Resume</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center h-96">
                  <Zap className={`h-16 w-16 text-gray-400 mb-4 ${isOptimizing ? 'animate-spin' : ''}`} />
                  {isOptimizing ? (
                    <>
                      <p className="text-lg font-medium text-gray-600 mb-2">Optimizing...</p>
                      <p className="text-sm text-gray-500 text-center">Generating your improved resume, please wait.</p>
                    </>
                  ) : (
                    <>
                      <p className="text-lg font-medium text-gray-600 mb-2">Ready to Optimize</p>
                      <p className="text-sm text-gray-500 text-center">Click the "Optimize" button on the left to generate your improved resume and see it here.</p>
                    </>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </>
  )
}