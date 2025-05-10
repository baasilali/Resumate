"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/app/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs"
import { Textarea } from "@/app/components/ui/textarea"
import { Input } from "@/app/components/ui/input"
import { Upload, FileText, X, LinkIcon } from "lucide-react"
import { useAuth } from "@/app/hooks/useAuth";

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
    optimized: string,
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
  const [resumeError, setResumeError] = useState<string | null>(null)

  const { user } = useAuth();

  const handleResumeFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type === "application/pdf") {
      setUploadedFile(file)
      setResumeText('')
      setResumeError(null)
    } else if (file) {
      setUploadedFile(null)
      setResumeError("Please upload a PDF file for the resume.")
      e.target.value = '';
    }
  }

  const removeResumeFile = () => {
    setUploadedFile(null)
    setResumeError(null)
  }

  const FileDisplay = ({ file, onRemove }: { file: File | null, onRemove: () => void }) => {
    if (!file) return null;
    return (
      <div className="mt-2 flex items-center justify-between p-2 border rounded-md bg-gray-50 w-full max-w-full">
        <div className="flex items-center space-x-2 text-sm overflow-hidden mr-2">
          <FileText className="h-4 w-4 text-gray-500 flex-shrink-0" />
          <span className="truncate" title={file.name}>{file.name}</span>
          <span className="text-gray-400 text-xs flex-shrink-0 whitespace-nowrap">({(file.size / 1024).toFixed(1)} KB)</span>
        </div>
        <Button variant="ghost" size="icon" onClick={onRemove} className="hover:bg-red-100 hover:text-red-600 flex-shrink-0 h-6 w-6">
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  };

  const compareResumeToJob = async () => {
    setIsComparing(true)
    setError(null)

    if (!user) {
      setError("Please sign in to compare your resume.");
      setIsComparing(false);
      return;
    }

    const firebaseId = user.uid;

    const resumeInputProvided = !!uploadedFile || !!resumeText.trim();
    const jobInputProvided = !!jobDescription.trim() || !!jobDescriptionLink.trim();

    if (uploadedFile && resumeError) {
      setError("Please upload a valid PDF file for the resume or clear the selection.");
      setIsComparing(false);
      return;
    }
    if (!resumeInputProvided) {
      setError("Please provide resume content (upload PDF or paste text).");
      setIsComparing(false);
      return;
    }
    if (!jobInputProvided) {
      setError("Please provide job description content (paste text or link).");
      setIsComparing(false);
      return;
    }

    const idToken = await user.getIdToken();

    const jobContent = jobDescriptionLink || jobDescription;
    let fetchOptions: RequestInit = { method: "POST" };

    if (uploadedFile) {
      console.log("Uploading file...");
      const formData = new FormData();
      fetchOptions.headers = { 
        'Authorization': `Bearer ${idToken}`
      };
      formData.append('file', uploadedFile);
      fetchOptions.body = formData;
    } else {
      fetchOptions.headers = { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`
      };
      fetchOptions.body = JSON.stringify({
        resumeText: resumeText,
        jobDescription: jobContent,
      });
    }

    try {
      const resumeUploadResponse = await fetch("http://localhost:3001/api/v1/user/upload-resume", fetchOptions);

      if (!resumeUploadResponse.ok) {
        const errorData = await resumeUploadResponse.json().catch(() => ({ error: 'Failed to parse error response' }));
        throw new Error(errorData.error || `HTTP error! status: ${resumeUploadResponse.status} - Message: ${errorData.message}`)
      }

      const upload_data = await resumeUploadResponse.json();
      const resume_id = upload_data.resumeId;

      const optimizeResponse = await fetch('http://localhost:3001/api/v1/ai/optimize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({
          resume_id: resume_id,
          job_description: jobContent,
          firebase_id: firebaseId,
        }),
      });

      const optimize_data = await optimizeResponse.json();

      if (!optimizeResponse.ok) {
        // Handle error from the optimize API call
        throw new Error(optimize_data.error || `Optimize API error! status: ${optimizeResponse.status}`);
      }

      // --- Process and Pass Data ---
      const changesData = optimize_data?.changes_accumulated; // Safely access the data

      if (typeof changesData === 'object' && changesData !== null) {
        const optimizeJsonString = JSON.stringify(changesData);
        onScoreUpdate(optimizeJsonString); // Pass the stringified JSON
      } else {
        // Handle cases where changes_accumulated is missing or not an object
        console.error("Optimization data 'changes_accumulated' is missing or not an object:", optimize_data);
        setError("Received invalid optimization data structure from the server.");
        console.log("Calling onScoreUpdate with fallback '{}'");
        onScoreUpdate('{}'); // Pass an empty object string as fallback
      }
    } catch (err) {
      console.error("Error during analysis process:", err); // Log the full error
      setError(`An error occurred during analysis: ${err instanceof Error ? err.message : "Unknown error"}`)
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
              {(resumeText.trim() || uploadedFile) && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => { 
                    setResumeText(''); 
                    removeResumeFile(); 
                    setResumeError(null); 
                    const fileInput = document.getElementById('resume-upload') as HTMLInputElement;
                    if(fileInput) fileInput.value = '';
                  }}
                  className="hover:bg-purple-100 hover:text-purple-600"
                >
                  <X className="h-4 w-4 mr-1" /> Clear
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="upload" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="upload">Upload PDF</TabsTrigger>
                <TabsTrigger value="text">Paste Text</TabsTrigger>
              </TabsList>
              <TabsContent value="upload">
                <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-md p-6 min-h-[300px] space-y-2">
                  <Upload className="h-10 w-10 text-gray-400" />
                  <Input
                    id="resume-upload"
                    type="file"
                    className="hidden"
                    onChange={handleResumeFileUpload}
                    accept="application/pdf"
                  />
                  <label
                    htmlFor="resume-upload"
                    className="cursor-pointer text-sm text-blue-600 hover:underline font-medium bg-gray-100 px-4 py-2 rounded-md hover:bg-gray-200"
                  >
                    Choose PDF File
                  </label>
                  <p className="text-xs text-gray-500">Upload your resume as a PDF</p>
                  {resumeError && <p className="text-red-500 text-sm mt-1 text-center">{resumeError}</p>}
                  {!resumeError && <FileDisplay file={uploadedFile} onRemove={removeResumeFile} />}
                </div>
              </TabsContent>
              <TabsContent value="text">
                <Textarea
                  placeholder="Paste resume text here..."
                  className="min-h-[300px] h-full"
                  value={resumeText}
                  onChange={(e) => {
                    setResumeText(e.target.value);
                    if (uploadedFile) removeResumeFile();
                    if (resumeError) setResumeError(null);
                  }}
                  disabled={!!uploadedFile && !resumeError}
                />
                {resumeError && !uploadedFile && <p className="text-red-500 text-sm mt-1">{resumeError}</p>}
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
          disabled={!user || isComparing || (!uploadedFile && !resumeText.trim()) || (!jobDescription.trim() && !jobDescriptionLink.trim()) || !!resumeError}
          className="w-full max-w-md bg-black hover:bg-black/90 text-white relative overflow-hidden disabled:opacity-50"
        >
          {isComparing ? (
            <>
              <span>Analyzing...</span>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-700">
                <div className="h-full bg-white animate-loading-bar" />
              </div>
            </>
          ) : (
            "Optimize Resume"
          )}
        </Button>
        {(error || resumeError) && <p className="text-red-500 text-sm text-center mt-2">{error || resumeError}</p>}
      </div>
    </div>
  )
}