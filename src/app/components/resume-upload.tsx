"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/app/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs"
import { Input } from "@/app/components/ui/input"
import { Upload, FileText, X, LinkIcon } from "lucide-react"

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
    jobDescription: string
  ) => void;
  initialResumeText?: string;
  initialJobDescription?: string;
}

export function ResumeUpload({ onScoreUpdate, initialResumeText = '', initialJobDescription = '' }: ResumeUploadProps) {
  const [resumeText, setResumeText] = useState(initialResumeText)
  const [jobDescription, setJobDescription] = useState(initialJobDescription)
  const [jobDescriptionLink, setJobDescriptionLink] = useState("")
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isComparing, setIsComparing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type === "application/pdf") { 
      setUploadedFile(file)
    } else if (file) {
      setError("Please upload a PDF file.");
      e.target.value = ''; 
    }
  }

  const removeFile = () => {
    setUploadedFile(null)
    const fileInput = document.getElementById('resume-upload-input') as HTMLInputElement;
    if (fileInput) fileInput.value = ''; 
  }

  const compareResumeToJob = async () => {
    setIsComparing(true)
    setError(null)

    let resumeContent = '';
    if (uploadedFile) {
      try {
        resumeContent = await uploadedFile.text(); 
        setResumeText(resumeContent); 
      } catch (readError) {
        console.error("Error reading file:", readError);
        setError("Could not read the uploaded PDF file.");
        setIsComparing(false);
        return;
      }
    } else {
       resumeContent = resumeText;
    }
    
    const jobDescriptionContent = jobDescriptionLink || jobDescription

    if (!resumeContent) {
        setError("Please upload a resume PDF.");
        setIsComparing(false);
        return;
    }

    if (!jobDescriptionContent) {
        setError("Please provide the job description text or a link.");
        setIsComparing(false);
        return;
    }

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resumeText: resumeContent,
          jobDescription: jobDescriptionContent,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      onScoreUpdate(
        data.matchRate,
        data.categories,
        data.matchedKeywords,
        resumeContent, 
        jobDescriptionContent 
      )
    } catch (err) {
      console.error("Error analyzing resume:", err)
      setError(`An error occurred while analyzing the resume: ${err instanceof Error ? err.message : "Unknown error"}`)
    } finally {
      setIsComparing(false)
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); 
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    setError(null); 

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type === "application/pdf") {
        setUploadedFile(file);
      } else {
        setError("Please drop a PDF file.");
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Resume
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div 
              className={`flex flex-col items-center justify-center min-h-[300px] h-full border-2 border-dashed rounded-lg p-6 text-center ${isDragging ? 'border-purple-500 bg-purple-50' : 'border-gray-300'} transition-colors`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {!uploadedFile ? (
                <>
                  <Upload className="h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-600">Drag & drop your PDF resume here, or click to select</p>
                  <Input
                    id="resume-upload-input"
                    type="file"
                    className="hidden"
                    accept=".pdf" 
                    onChange={handleFileUpload}
                  />
                  <Button 
                    variant="outline"
                    className="mt-4"
                    onClick={() => document.getElementById('resume-upload-input')?.click()}
                  >
                    Select PDF File
                  </Button>
                </>
              ) : (
                <div className="flex flex-col items-center">
                  <FileText className="h-12 w-12 text-green-500" />
                  <p className="mt-2 text-sm font-medium text-gray-700">{uploadedFile.name}</p>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={removeFile} 
                    className="mt-2 text-red-500 hover:text-red-700 hover:bg-red-100"
                  >
                    <X className="h-4 w-4 mr-1" /> Remove
                  </Button>
                </div>
              )}
            </div>
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
              <Input
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
          disabled={isComparing || !uploadedFile || (!jobDescription && !jobDescriptionLink)}
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
        {error && <p className="text-red-500 text-sm">{error}</p>}
      </div>
    </div>
  )
} 