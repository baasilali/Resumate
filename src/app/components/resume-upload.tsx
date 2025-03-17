"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/app/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs"
import { Textarea } from "@/app/components/ui/textarea"
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setUploadedFile(file)
    }
  }

  const removeFile = () => {
    setUploadedFile(null)
  }

  const compareResumeToJob = async () => {
    setIsComparing(true)
    setError(null)

    const resumeContent = uploadedFile ? await uploadedFile.text() : resumeText
    const jobDescriptionContent = jobDescriptionLink || jobDescription

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
        resumeText,
        jobDescription
      )
    } catch (err) {
      console.error("Error analyzing resume:", err)
      setError(`An error occurred while analyzing the resume: ${err instanceof Error ? err.message : "Unknown error"}`)
    } finally {
      setIsComparing(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Resume
              {resumeText && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setResumeText('')}
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
                placeholder="Paste resume text..."
                className="min-h-[300px] h-full"
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
              />
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
          disabled={isComparing || (!resumeText && !uploadedFile) || (!jobDescription && !jobDescriptionLink)}
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