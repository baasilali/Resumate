"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Zap, ChevronDown, ChevronUp } from "lucide-react"

interface Issue {
  description: string
}

interface Category {
  name: string
  score: number
  issues: Issue[]
}

interface ResumeScoreProps {
  matchRate: number
  categories: Category[]
}

export function ResumeScore({ matchRate, categories }: ResumeScoreProps) {
  const [openCategories, setOpenCategories] = useState<string[]>([])

  const circumference = 2 * Math.PI * 60
  const strokeDasharray = `${circumference} ${circumference}`
  const strokeDashoffset = circumference - (matchRate / 100) * circumference

  const colorClass = matchRate >= 70 ? "text-green-500" : matchRate >= 40 ? "text-yellow-500" : "text-red-500"

  const toggleCategory = (categoryName: string) => {
    setOpenCategories((prev) =>
      prev.includes(categoryName) ? prev.filter((name) => name !== categoryName) : [...prev, categoryName],
    )
  }

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center">Match Rate</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="relative w-48 h-48 mx-auto">
          <svg className="w-full h-full" viewBox="0 0 128 128">
            <circle
              className="text-muted-foreground/20"
              strokeWidth="8"
              stroke="currentColor"
              fill="transparent"
              r="60"
              cx="64"
              cy="64"
            />
            <circle
              className={colorClass}
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
                transition: "stroke-dashoffset 0.5s ease-in-out, stroke 0.5s ease-in-out",
              }}
            />
          </svg>
          <div className={`absolute inset-0 flex items-center justify-center text-4xl font-bold ${colorClass}`}>
            {matchRate}%
          </div>
        </div>
        <div className="space-y-4">
          <Button variant="outline" className="w-full">
            <Zap className="mr-0 h-4 w-4" />
            Optimize
          </Button>
        </div>
        <div className="space-y-4">
          {categories.map((category) => (
            <div key={category.name} className="border rounded-lg p-4">
              <div
                className="flex justify-between items-center cursor-pointer"
                onClick={() => toggleCategory(category.name)}
              >
                <span className="text-sm font-medium">{category.name}</span>
                <div className="flex items-center">
                  <span className="text-sm text-purple-600 mr-2">
                    {category.issues?.length || 0} {category.issues?.length === 1 ? "issue" : "issues"} to fix
                  </span>
                  <Button variant="ghost" size="sm" className="p-0 h-auto">
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
                <div className="mt-2 space-y-2">
                  {category.issues && category.issues.length > 0 ? (
                    category.issues.map((issue, index) => (
                      <div key={index} className="flex items-start space-x-2 text-sm text-gray-600 mb-2">
                        <div className="w-2 h-2 rounded-full bg-purple-500 mt-1.5 flex-shrink-0"></div>
                        <p>{issue.description}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-600">No issues to fix in this category.</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

