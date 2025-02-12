"use client"

import { useState } from "react"
import { Navbar } from "@/components/navbar"
import { ResumeUpload } from "@/components/resume-upload"
import { ResumeScore } from "@/components/resume-score"

interface Issue {
  description: string
}

interface Category {
  name: string
  score: number
  issues: Issue[]
}

export default function HomePage() {
  const [score, setScore] = useState(0)
  const [categories, setCategories] = useState<Category[]>([])

  const handleScoreUpdate = (newScore: number, newCategories: Category[]) => {
    setScore(newScore)
    setCategories(newCategories)
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto py-6">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold">
              Customize your SWE resume <span className="text-pink-500">in seconds</span>
            </h1>
            <p className="text-muted-foreground">
              Our AI is trained on thousands of resumes and allows you to create new resume for specific jobs
            </p>
          </div>
          <ResumeUpload onScoreUpdate={handleScoreUpdate} />
          <ResumeScore matchRate={score} categories={categories} />
        </div>
      </main>
    </div>
  )
}

