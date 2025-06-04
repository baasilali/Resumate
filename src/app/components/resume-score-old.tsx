"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/app/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card"
import { Zap, ChevronDown, ChevronUp, Check, AlertCircle } from "lucide-react"
import { usePathname } from 'next/navigation'

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
  onRescan: () => void
}

export function ResumeScore({ matchRate, categories, matchedKeywords, onRescan }: ResumeScoreProps) {
  const [openCategories, setOpenCategories] = useState<string[]>([])
  const [isKeywordsOpen, setIsKeywordsOpen] = useState(false)
  const [animatedMatchRate, setAnimatedMatchRate] = useState(0)
  const [isAnimating, setIsAnimating] = useState(true)
  const [optimizationSuggestions, setOptimizationSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const keywordsRef = useRef<HTMLDivElement>(null)
  const categoryRefs = useRef<{ [key: string]: HTMLDivElement | null }>({})

  const circumference = 2 * Math.PI * 60
  const strokeDasharray = `${circumference} ${circumference}`
  const strokeDashoffset = circumference - (animatedMatchRate / 100) * circumference

  const colorClass = animatedMatchRate >= 70 ? "text-green-500" : animatedMatchRate >= 40 ? "text-yellow-500" : "text-red-500"

  useEffect(() => {
    if (isAnimating) {
      const duration = 1500 // 1.5 seconds
      const steps = 60 // 60 steps for smooth animation
      const increment = matchRate / steps
      let current = 0
      let step = 0

      const timer = setInterval(() => {
        if (step < steps) {
          current += increment
          setAnimatedMatchRate(Math.min(Math.round(current), matchRate))
          step++
        } else {
          setIsAnimating(false)
          clearInterval(timer)
        }
      }, duration / steps)

      return () => clearInterval(timer)
    }
  }, [matchRate, isAnimating])

  const toggleCategory = (categoryName: string) => {
    setOpenCategories((prev) =>
      prev.includes(categoryName) ? prev.filter((name) => name !== categoryName) : [...prev, categoryName],
    )
  }

  const toggleKeywords = () => {
    setIsKeywordsOpen(!isKeywordsOpen)
  }

  const generateOptimizationSuggestions = () => {
    const suggestions: string[] = []
    
    // Add general match rate assessment first
    if (matchRate < 40) {
      suggestions.push("Your resume needs significant improvements to better match the job requirements")
    } else if (matchRate < 70) {
      suggestions.push("Your resume has potential but could use some adjustments")
    }

    // Analyze each category and generate specific suggestions
    categories.forEach(category => {
      if (category.issues && category.issues.length > 0) {
        const issues = category.issues.map(issue => {
          // Extract just the keyword from the description, removing "Missing: " and context
          const keyword = issue.description.replace(/^Missing: /, '').split(' (Context:')[0]
          return keyword
        })
        
        switch (category.name) {
          case "Hard Skills":
            suggestions.push(`Add these technical skills: ${issues.join(", ")}`)
            break
          case "Soft Skills":
            suggestions.push(`Include examples of: ${issues.join(", ")}`)
            break
          case "Experience":
            suggestions.push(`Add relevant experience in: ${issues.join(", ")}`)
            break
          case "Education":
            suggestions.push(`Consider adding: ${issues.join(", ")}`)
            break
        }
      }
    })

    setOptimizationSuggestions(suggestions)
    setShowSuggestions(true)
  }

  return (
    <>
      <Card className="max-w-5xl mx-auto mt-16">
        <CardHeader>
          <CardTitle className="text-center">Resume Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full">
            {/* Left side - Match Rate Circle */}
            <div className="flex flex-col items-center justify-center space-y-6 h-full">
              <div className={`text-xl font-semibold ${colorClass}`}>
                {animatedMatchRate >= 70 ? "Great Match!" : animatedMatchRate >= 40 ? "Good Match" : "Bad Match"}
              </div>
              <div className="relative w-48 h-48">
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
                <div className={`absolute inset-0 flex items-center justify-center text-4xl font-bold ${colorClass} transition-colors duration-300`}>
                  {animatedMatchRate}%
                </div>
              </div>
              <div className="space-y-4 w-full">
                <Button className="w-full bg-black hover:bg-black/90 text-white" onClick={onRescan}>Upload & rescan</Button>
                <Button 
                  variant="outline" 
                  className="w-full hover:bg-purple-100 hover:text-purple-600 hover:border-purple-600"
                  onClick={generateOptimizationSuggestions}
                >
                  <Zap className="mr-2 h-4 w-4" />
                  Optimize
                </Button>
              </div>
            </div>

            {/* Right side - Dropdowns */}
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
              <div className="border rounded-lg p-4">
                <div className="flex justify-between items-center cursor-pointer" onClick={toggleKeywords}>
                  <span className="text-sm font-medium">Matched Keywords</span>
                  <div className="flex items-center">
                    <span className="text-sm text-purple-600 mr-2">
                      {matchedKeywords.length} {matchedKeywords.length === 1 ? "keyword" : "keywords"} matched
                    </span>
                    <Button variant="ghost" size="sm" className="p-0 h-auto hover:bg-transparent hover:text-purple-600">
                      {isKeywordsOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                {isKeywordsOpen && (
                  <div className="mt-2 space-y-2 max-h-[200px] overflow-y-auto">
                    {matchedKeywords.length > 0 ? (
                      <>
                        {matchedKeywords.map((keyword, index) => (
                          <div key={index} className="flex items-start space-x-2 text-sm text-gray-600 mb-2">
                            <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <div>
                              <span className="font-medium">{keyword.keyword}</span>
                              <p className="text-xs text-gray-500 mt-1">{keyword.context}</p>
                            </div>
                          </div>
                        ))}
                        <div className="text-xs text-gray-400 text-center mt-2">Scroll for more</div>
                      </>
                    ) : (
                      <p className="text-sm text-gray-600">No keywords matched.</p>
                    )}
                  </div>
                )}
              </div>

              {categories.map((category) => (
                <div key={category.name} className="border rounded-lg p-4">
                  <div
                    className="flex justify-between items-center cursor-pointer"
                    onClick={() => toggleCategory(category.name)}
                  >
                    <span className="text-sm font-medium">{category.name}</span>
                    <div className="flex items-center">
                      {category.issues?.length > 0 ? (
                        <span className="text-sm text-purple-600 mr-2">
                          {category.issues.length} {category.issues.length === 1 ? "issue" : "issues"} to fix
                        </span>
                      ) : (
                        <span className="text-sm text-green-500 mr-2 flex items-center">
                          <Check className="w-4 h-4 mr-1" />
                          Complete
                        </span>
                      )}
                      <Button variant="ghost" size="sm" className="p-0 h-auto hover:bg-transparent hover:text-purple-600">
                        {openCategories.includes(category.name) ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden my-2">
                    <div
                      className="h-full bg-black"
                      style={{ width: `${category.score}%`, transition: "width 0.5s ease-in-out" }}
                    />
                  </div>
                  {openCategories.includes(category.name) && (
                    <div className="mt-2 space-y-2 max-h-[200px] overflow-y-auto">
                      {category.issues && category.issues.length > 0 ? (
                        <>
                          {category.issues.map((issue, index) => (
                            <div key={index} className="flex items-start space-x-2 text-sm text-gray-600 mb-2">
                              <div className="w-2 h-2 rounded-full bg-purple-500 mt-1.5 flex-shrink-0"></div>
                              <p>{issue.description}</p>
                            </div>
                          ))}
                          <div className="text-xs text-gray-400 text-center mt-2">Scroll for more</div>
                        </>
                      ) : (
                        <p className="text-sm text-gray-600">No issues to fix in this category.</p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {showSuggestions && optimizationSuggestions.length > 0 && (
        <div className="max-w-5xl mx-auto mt-6 p-4 bg-purple-50 rounded-lg">
          <div className="flex items-center mb-2">
            <AlertCircle className="h-5 w-5 text-purple-600 mr-2" />
            <h3 className="font-medium text-purple-900">Optimization Suggestions</h3>
          </div>
          <ul className="space-y-2">
            {optimizationSuggestions.map((suggestion, index) => (
              <li key={index} className="text-sm text-purple-800 flex items-start">
                <span className="mr-2">•</span>
                {suggestion}
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  )
} 