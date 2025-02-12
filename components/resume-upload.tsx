"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Upload, FileText, X, LinkIcon } from "lucide-react"

interface ResumeUploadProps {
  onScoreUpdate: (
    score: number,
    categories: Array<{ name: string; score: number; issues: Array<{ description: string }> }>,
  ) => void
}

export function ResumeUpload({ onScoreUpdate }: ResumeUploadProps) {
  const [resumeText, setResumeText] = useState("")
  const [jobDescription, setJobDescription] = useState("")
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

    const formData = new FormData()
    if (uploadedFile) {
      formData.append("resume", uploadedFile)
    } else {
      formData.append("resume", resumeText)
    }

    if (jobDescriptionLink) {
      formData.append("jobDescriptionLink", jobDescriptionLink)
    } else {
      formData.append("jobDescription", jobDescription)
    }

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resumeText,
          jobDescription,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to analyze resume")
      }

      const data = await response.json()
      onScoreUpdate(data.matchRate, data.categories)
    } catch (err) {
      console.error("Error analyzing resume:", err)
      setError("An error occurred while analyzing the resume. Please try again.")
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
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="paste" className="h-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="paste">Paste</TabsTrigger>
                <TabsTrigger value="upload">Upload</TabsTrigger>
              </TabsList>
              <TabsContent value="paste" className="h-[calc(100%-40px)]">
                <Textarea
                  placeholder="Paste resume text..."
                  className="min-h-[300px] h-full"
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                />
              </TabsContent>
              <TabsContent value="upload" className="h-[calc(100%-40px)]">
                {uploadedFile ? (
                  <div className="border rounded-lg p-4 flex items-center justify-between h-full">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-6 w-6 text-blue-500" />
                      <span className="font-medium">{uploadedFile.name}</span>
                    </div>
                    <Button variant="ghost" size="sm" onClick={removeFile}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed rounded-lg p-6 text-center h-full flex flex-col items-center justify-center">
                    <input
                      type="file"
                      accept=".pdf,.docx"
                      className="hidden"
                      id="resume-upload"
                      onChange={handleFileUpload}
                    />
                    <label htmlFor="resume-upload" className="flex flex-col items-center gap-2 cursor-pointer">
                      <Upload className="h-8 w-8 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Drag & Drop or Upload PDF/DOCX</span>
                    </label>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Job Description</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="paste" className="h-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="paste">Paste</TabsTrigger>
                <TabsTrigger value="link">Link</TabsTrigger>
              </TabsList>
              <TabsContent value="paste" className="h-[calc(100%-40px)]">
                <Textarea
                  placeholder="Copy and paste job description here"
                  className="min-h-[300px] h-full"
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                />
              </TabsContent>
              <TabsContent value="link" className="h-[calc(100%-40px)]">
                <div className="flex flex-col h-full">
                  <Input
                    type="url"
                    placeholder="Paste job description URL here"
                    value={jobDescriptionLink}
                    onChange={(e) => setJobDescriptionLink(e.target.value)}
                    className="mb-4"
                  />
                  <div className="flex-grow flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      <LinkIcon className="h-12 w-12 mx-auto mb-2" />
                      <p>Enter a URL to automatically fetch the job description</p>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
      <div className="flex flex-col items-center space-y-4">
        <Button
          onClick={compareResumeToJob}
          disabled={isComparing || (!resumeText && !uploadedFile) || (!jobDescription && !jobDescriptionLink)}
          className="w-full max-w-md"
        >
          {isComparing ? "Analyzing..." : "Compare Resume to Job Description"}
        </Button>
        {error && <p className="text-red-500 text-sm">{error}</p>}
      </div>
    </div>
  )
}

