"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/app/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs"
import { Textarea } from "@/app/components/ui/textarea"
import { Input } from "@/app/components/ui/input"
import { Upload, FileText, X, LinkIcon } from "lucide-react"
import { useUser } from '../hooks/useUser'
import { getBaseUrl } from '../../utils/getBaseUrl'

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

interface ResumeUploadProps {
  onScoreUpdate: (
    score: number,
    categories: Category[],
    matchedKeywords: MatchedKeyword[],
    resumeText: string,
    jobDescription: string,
    atsData?: {
      score: number;
      matched_keywords: string[];
      missing_keywords: string[];
    }
  ) => void;
  initialResumeText?: string;
  initialJobDescription?: string;
}

export function ResumeUpload({ onScoreUpdate, initialResumeText = '', initialJobDescription = '' }: ResumeUploadProps) {
  const [resumeText, setResumeText] = useState(initialResumeText)
  const [jobDescription, setJobDescription] = useState(initialJobDescription)
  const [jobDescriptionLink, setJobDescriptionLink] = useState("")
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [extractedText, setExtractedText] = useState<string>("")
  const [isComparing, setIsComparing] = useState(false)
  const [isExtracting, setIsExtracting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<string>("text")
  const baseUrl = getBaseUrl()

  const { user } = useUser();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.type !== 'application/pdf') {
        setError('Please upload a PDF file only.')
        return
      }
      
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB.')
        return
      }

      setUploadedFile(file)
      setError(null)
      setIsExtracting(true)

      try {
        // For now, we'll upload the PDF to the backend and extract text there
        // This maintains compatibility with the existing backend
        setExtractedText("PDF file selected - text will be extracted during analysis")
      } catch (err) {
        console.error('Error handling PDF file:', err)
        setError('We couldn\'t process your PDF file. Please make sure it\'s a valid PDF, or try using the text input option instead.')
        setUploadedFile(null)
      } finally {
        setIsExtracting(false)
      }
    }
  }

  const removeFile = () => {
    setUploadedFile(null)
    setExtractedText('')
    setError(null)
  }

  const compareResumeToJob = async () => {
    setIsComparing(true)
    setError(null)

    if (!user) {
      setError("Please sign in to compare your resume.");
      setIsComparing(false);
      return;
    }

    // Get resume content based on active tab
    const resumeContent = activeTab === 'upload' ? (uploadedFile ? "" : "") : resumeText
    const jobDescriptionContent = jobDescriptionLink || jobDescription

    if (!resumeContent.trim() && !uploadedFile) {
      setError('Please provide your resume content.')
      setIsComparing(false)
      return
    }

    if (!jobDescriptionContent.trim()) {
      setError('Please provide the job description.')
      setIsComparing(false)
      return
    }

    try {
      const idToken = await user.getIdToken();

      // Upload resume to backend first (either file or text)
      if (uploadedFile) {
        // Upload PDF file
        const formData = new FormData();
        formData.append('file', uploadedFile);

        const uploadResponse = await fetch(`${baseUrl}/user/upload_resume`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${idToken}`
          },
          body: formData
        });

        if (!uploadResponse.ok) {
          const errorData = await uploadResponse.json().catch(() => ({ message: 'Could not parse error from server' }));
          throw new Error(errorData.message || 'Failed to upload resume file');
        }
      } else if (resumeText.trim()) {
        const uploadResponse = await fetch(`${baseUrl}/user/upload_resume`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${idToken}`
          },
          body: JSON.stringify({
            text: resumeText
          })
        });

        if (!uploadResponse.ok) {
          const errorData = await uploadResponse.json().catch(() => ({ message: 'Could not parse error from server' }));
          throw new Error(errorData.message || 'Failed to upload resume text');
        }
      }

      // Call the ATS endpoint
      const atsResponse = await fetch(`${baseUrl}/ai/ats`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({
          firebase_id: user.uid,
          job_description: jobDescriptionContent
        }),
      });

      if (!atsResponse.ok) {
        const errorData = await atsResponse.json().catch(() => ({ message: 'Could not parse error from server' }));
        throw new Error(errorData.message || 'Failed to analyze resume');
      }

      const atsData = await atsResponse.json();
      
      // Create mock categories for compatibility
      const mockCategories = [
        { name: 'Hard Skills', score: atsData.message.ats.score, issues: [] },
        { name: 'Soft Skills', score: atsData.message.ats.score, issues: [] },
        { name: 'Experience', score: atsData.message.ats.score, issues: [] },
        { name: 'Education', score: atsData.message.ats.score, issues: [] }
      ];

      // Create mock matched keywords for compatibility
      const mockMatchedKeywords = atsData.message.ats.matched_keywords.map((keyword: string) => ({
        keyword,
        context: `Found relevant experience with ${keyword}`,
        category: 'Technical Skills'
      }));

      onScoreUpdate(
        atsData.message.ats.score,
        mockCategories,
        mockMatchedKeywords,
        resumeContent,
        jobDescriptionContent,
        {
          score: atsData.message.ats.score,
          matched_keywords: atsData.message.ats.matched_keywords,
          missing_keywords: atsData.message.ats.missing_keywords
        }
      )
    } catch (err) {
      console.error("Error analyzing resume:", err)
      setError('We couldn\'t analyze your resume right now. Please check your internet connection or try again in a few moments.')
    } finally {
      setIsComparing(false)
    }
  }

  const hasResumeContent = activeTab === 'upload' ? !!uploadedFile : !!resumeText.trim()
  const hasJobContent = !!(jobDescriptionLink.trim() || jobDescription.trim())

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Resume
              {((activeTab === 'text' && resumeText) || (activeTab === 'upload' && uploadedFile)) && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => {
                    if (activeTab === 'text') {
                      setResumeText('')
                    } else {
                      removeFile()
                    }
                  }}
                  className="hover:bg-purple-100 hover:text-purple-600"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="text" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Paste Text
                </TabsTrigger>
                <TabsTrigger value="upload" className="flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  Upload PDF
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="text" className="mt-4">
                <div className="flex flex-col h-full">
                  <Textarea
                    placeholder="Paste your resume text here..."
                    className="min-h-[280px] h-full resize-none"
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="upload" className="mt-4">
                <div className="flex flex-col h-full min-h-[280px]">
                  {!uploadedFile ? (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-purple-400 transition-colors">
                      <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <p className="text-gray-600 mb-4">Drop your PDF here or click to browse</p>
                      <Input
                        type="file"
                        accept=".pdf"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="pdf-upload"
                        disabled={isExtracting}
                      />
                      <Button
                        variant="outline"
                        onClick={() => document.getElementById('pdf-upload')?.click()}
                        disabled={isExtracting}
                        className="hover:bg-purple-100 hover:text-purple-600 hover:border-purple-600"
                      >
                        {isExtracting ? 'Processing...' : 'Choose PDF File'}
                      </Button>
                      <p className="text-xs text-gray-500 mt-2">PDF files only, max 10MB</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <FileText className="h-5 w-5 text-green-600" />
                          <span className="text-sm font-medium text-green-800">{uploadedFile.name}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={removeFile}
                          className="text-green-600 hover:text-green-700 hover:bg-green-100"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-800">PDF ready for analysis. Click "Compare Resume to Job Description" to proceed.</p>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Job Description
              {jobDescription && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setJobDescription('')}
                  className="hover:bg-purple-100 hover:text-purple-600"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col h-full">
              <Textarea
                placeholder="Copy and paste job description here"
                className="min-h-[300px] h-full"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="flex flex-col items-center space-y-4">
        <Button
          onClick={compareResumeToJob}
          disabled={isComparing || !hasResumeContent || !hasJobContent || isExtracting || !user}
          className="w-full max-w-md bg-black hover:bg-black/90 text-white relative overflow-hidden"
        >
          {isComparing ? (
            <>
              <span>Analyzing...</span>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-700">
                <div className="h-full bg-white animate-loading-bar" />
              </div>
            </>
          ) : (
            "Compare Resume to Job Description"
          )}
        </Button>
        {error && (
          <p className="text-red-500 text-sm text-center max-w-md">{error}</p>
        )}
      </div>
    </div>
  )
}