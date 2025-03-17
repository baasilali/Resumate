import { type NextRequest, NextResponse } from "next/server"
import { distance as levenshteinDistance } from 'fastest-levenshtein'
import * as natural from 'natural'

// Initialize tokenizer and stemmer
const tokenizer = new natural.WordTokenizer()
const stemmer = natural.PorterStemmer

// Define categorized important skills with their variations
const HARD_SKILLS = new Map([
  // Programming Languages
  ["python", ["python3", "python programming", "py", "pytorch", "pandas", "numpy", "scikit-learn"]],
  ["javascript", ["js", "ecmascript", "typescript", "ts", "node.js", "nodejs", "express"]],
  ["java", ["java programming", "jdk", "spring", "spring boot"]],
  ["sql", ["mysql", "postgresql", "sqlite", "oracle", "database", "rdbms"]],
  ["c++", ["cpp", "cplusplus"]],
  ["go", ["golang"]],
  ["rust", ["rustlang"]],
  ["swift", ["swift programming"]],
  
  // Frameworks & Libraries
  ["react", ["reactjs", "react.js", "reactjs", "next.js", "gatsby"]],
  ["angular", ["angularjs"]],
  ["vue", ["vue.js", "vuejs"]],
  ["django", ["django framework"]],
  ["flask", ["flask framework"]],
  ["spring", ["spring framework", "spring boot"]],
  ["laravel", ["laravel framework"]],
  
  // Tools & Technologies
  ["docker", ["docker container", "dockerfile", "containerization"]],
  ["kubernetes", ["k8s", "kube", "container orchestration"]],
  ["aws", ["amazon web services", "aws cloud", "s3", "ec2", "lambda"]],
  ["azure", ["microsoft azure", "azure cloud"]],
  ["gcp", ["google cloud platform", "google cloud"]],
  ["git", ["github", "gitlab", "bitbucket", "version control"]],
  ["jenkins", ["ci/cd", "continuous integration", "continuous deployment"]],
  ["terraform", ["infrastructure as code", "iac"]],
  
  // Databases
  ["mongodb", ["mongo"]],
  ["redis", ["redis database"]],
  ["elasticsearch", ["elastic search"]],
  ["postgresql", ["postgres"]],
  
  // Other Technical Skills
  ["machine learning", ["ml", "artificial intelligence", "ai", "deep learning"]],
  ["data science", ["data analysis", "data analytics"]],
  ["devops", ["devops engineering", "site reliability engineering", "sre"]],
  ["security", ["cybersecurity", "information security"]],
  ["testing", ["unit testing", "integration testing", "test automation"]],
  ["agile", ["scrum", "kanban", "agile methodology"]],
])

const SOFT_SKILLS = new Map([
  // Leadership & Management
  ["leadership", ["leading", "lead", "team lead", "management", "mentoring"]],
  ["decision making", ["decision-making", "decision making skills", "strategic thinking"]],
  ["project management", ["project planning", "project coordination"]],
  
  // Communication
  ["communication", ["communicating", "communicate", "written communication", "verbal communication", "presentation"]],
  ["technical writing", ["documentation", "technical documentation"]],
  ["public speaking", ["presentation skills", "speaking"]],
  
  // Problem Solving & Analysis
  ["problem solving", ["problem-solving", "problem solver", "analytical thinking", "critical thinking"]],
  ["research", ["research skills", "investigation"]],
  ["creativity", ["creative thinking", "innovation"]],
  
  // Team & Collaboration
  ["teamwork", ["team player", "collaboration", "collaborative", "interpersonal skills"]],
  ["conflict resolution", ["conflict management", "negotiation"]],
  ["mentoring", ["coaching", "teaching"]],
  
  // Work Style
  ["time management", ["time management skills", "organizational skills", "prioritization"]],
  ["adaptability", ["flexibility", "resilience", "change management"]],
  ["attention to detail", ["detail-oriented", "accuracy"]],
  ["work ethic", ["dedication", "commitment", "reliability"]],
])

const EXPERIENCE_TERMS = new Map([
  // Years of Experience
  ["years of experience", ["experience", "work experience", "professional experience"]],
  ["senior", ["senior level", "senior position"]],
  ["junior", ["junior level", "junior position", "entry level"]],
  ["lead", ["leadership experience", "leading teams"]],
  
  // Industry Experience
  ["industry experience", ["domain experience", "sector experience"]],
  ["startup experience", ["startup", "entrepreneurial experience"]],
  ["enterprise experience", ["enterprise", "corporate experience"]],
  
  // Project Experience
  ["project experience", ["project delivery", "project execution"]],
  ["client experience", ["client interaction", "client management"]],
  ["team experience", ["team management", "team leadership"]],
])

const EDUCATION_TERMS = new Map([
  // Degrees
  ["bachelor", ["bachelors", "bs", "ba", "bachelor's degree"]],
  ["masters", ["master", "ms", "ma", "master's degree"]],
  ["phd", ["doctorate", "doctoral", "ph.d."]],
  
  // Fields of Study
  ["computer science", ["cs", "computing", "software engineering"]],
  ["engineering", ["electrical engineering", "mechanical engineering", "civil engineering"]],
  ["data science", ["data analytics", "analytics"]],
  
  // Certifications
  ["certification", ["certified", "certifications", "professional certification"]],
  ["aws certified", ["aws certification"]],
  ["azure certified", ["azure certification"]],
  ["pmp", ["project management professional"]],
])

// Function to get the canonical form of a skill
function getCanonicalForm(word: string, skillMap: Map<string, string[]>): string {
  const stemmedWord = stemmer.stem(word)
  for (const [skill, variations] of skillMap) {
    if (stemmedWord === stemmer.stem(skill)) return skill
    if (variations.some((v: string) => stemmedWord === stemmer.stem(v))) return skill
  }
  return word
}

// Function to consolidate similar terms
function consolidateTerms(terms: Array<{skill: string, context: string, category: string}>): Array<{skill: string, context: string, category: string}> {
  const consolidated = new Map<string, {skill: string, context: string, category: string}>()
  
  terms.forEach(term => {
    let canonicalSkill: string
    switch (term.category) {
      case "hard":
        canonicalSkill = getCanonicalForm(term.skill, HARD_SKILLS)
        break
      case "soft":
        canonicalSkill = getCanonicalForm(term.skill, SOFT_SKILLS)
        break
      case "experience":
        canonicalSkill = getCanonicalForm(term.skill, EXPERIENCE_TERMS)
        break
      case "education":
        canonicalSkill = getCanonicalForm(term.skill, EDUCATION_TERMS)
        break
      default:
        canonicalSkill = term.skill
    }

    if (!consolidated.has(canonicalSkill)) {
      consolidated.set(canonicalSkill, {
        skill: canonicalSkill,
        context: term.context,
        category: term.category
      })
    }
  })

  return Array.from(consolidated.values())
}

// Function to check if a word matches any variations of a skill
function matchesSkillVariations(word: string, skillMap: Map<string, string[]>): boolean {
  const stemmedWord = stemmer.stem(word)
  for (const [skill, variations] of skillMap) {
    if (stemmedWord === stemmer.stem(skill)) return true
    if (variations.some((v: string) => stemmedWord === stemmer.stem(v))) return true
  }
  return false
}

// Function to find fuzzy matches for a word
function findFuzzyMatches(word: string, targetWords: string[]): string[] {
  return targetWords.filter(target => {
    const distance = levenshteinDistance(word, target)
    return distance <= 2 // Allow for small typos and variations
  })
}

// Function to get context window around a word
function getContextWindow(words: string[], wordIndex: number, windowSize: number = 5): string {
  const start = Math.max(0, wordIndex - windowSize)
  const end = Math.min(words.length, wordIndex + windowSize + 1)
  return words.slice(start, end).join(' ')
}

// Function to extract skills with context
function extractSkillsWithContext(text: string): Array<{skill: string, context: string, category: string}> {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim())
  const skills: Array<{skill: string, context: string, category: string}> = []
  
  sentences.forEach(sentence => {
    const words = tokenizer.tokenize(sentence.toLowerCase()) || []
    words.forEach((word: string, index: number) => {
      let category = ""
      let canonicalSkill = ""

      // Check for hard skills
      if (matchesSkillVariations(word, HARD_SKILLS)) {
        canonicalSkill = getCanonicalForm(word, HARD_SKILLS)
        category = "hard"
      }
      // Check for soft skills
      else if (matchesSkillVariations(word, SOFT_SKILLS)) {
        canonicalSkill = getCanonicalForm(word, SOFT_SKILLS)
        category = "soft"
      }
      // Check for experience terms
      else if (matchesSkillVariations(word, EXPERIENCE_TERMS)) {
        canonicalSkill = getCanonicalForm(word, EXPERIENCE_TERMS)
        category = "experience"
      }
      // Check for education terms
      else if (matchesSkillVariations(word, EDUCATION_TERMS)) {
        canonicalSkill = getCanonicalForm(word, EDUCATION_TERMS)
        category = "education"
      }

      if (category && canonicalSkill) {
        const context = getContextWindow(words, index)
        skills.push({
          skill: canonicalSkill,
          context: `"...${context}..."`,
          category: category
        })
      }
    })
  })
  
  return consolidateTerms(skills)
}

// Main API handler
export async function POST(req: NextRequest) {
  try {
    const { resumeText, jobDescription } = await req.json()

    if (!resumeText || !jobDescription) {
      return NextResponse.json({ error: "Both resume and job description are required" }, { status: 400 })
    }

    console.log("✅ Resume and Job Description received. Processing...")

    // Extract skills with context from both texts
    const resumeSkills = extractSkillsWithContext(resumeText)
    const jobSkills = extractSkillsWithContext(jobDescription)

    // Find matched and missed skills
    const matchedSkills = jobSkills.filter(jobSkill => 
      resumeSkills.some(resumeSkill => 
        findFuzzyMatches(jobSkill.skill, [resumeSkill.skill]).length > 0
      )
    )

    const missedSkills = jobSkills.filter(jobSkill => 
      !resumeSkills.some(resumeSkill => 
        findFuzzyMatches(jobSkill.skill, [resumeSkill.skill]).length > 0
      )
    )

    // Categorize missed skills
    const missingHardSkills = missedSkills.filter(skill => skill.category === "hard")
    const missingSoftSkills = missedSkills.filter(skill => skill.category === "soft")
    const missingExperienceTerms = missedSkills.filter(skill => skill.category === "experience")
    const missingEducationTerms = missedSkills.filter(skill => skill.category === "education")

    // Calculate scores with context consideration
    const hardSkillsScore = Math.max(10 - missingHardSkills.length, 0) * 10
    const softSkillsScore = Math.max(10 - missingSoftSkills.length, 0) * 10
    const experienceScore = Math.max(10 - missingExperienceTerms.length, 0) * 10
    const educationScore = Math.max(10 - missingEducationTerms.length, 0) * 10

    const analysisResult = {
      matchRate: Math.round((matchedSkills.length / jobSkills.length) * 100),
      categories: [
        {
          name: "Hard Skills",
          score: hardSkillsScore,
          issues: missingHardSkills.map(skill => ({
            description: `Missing: ${skill.skill} (Context: ${skill.context})`
          }))
        },
        {
          name: "Soft Skills",
          score: softSkillsScore,
          issues: missingSoftSkills.map(skill => ({
            description: `Missing: ${skill.skill} (Context: ${skill.context})`
          }))
        },
        {
          name: "Experience",
          score: experienceScore,
          issues: missingExperienceTerms.map(skill => ({
            description: `Missing: ${skill.skill} (Context: ${skill.context})`
          }))
        },
        {
          name: "Education",
          score: educationScore,
          issues: missingEducationTerms.map(skill => ({
            description: `Missing: ${skill.skill} (Context: ${skill.context})`
          }))
        }
      ],
      matchedKeywords: matchedSkills.map(skill => ({
        keyword: skill.skill,
        context: skill.context,
        category: skill.category
      }))
    }

    console.log("📊 Analysis Completed. Sending response...")
    return NextResponse.json(analysisResult, { status: 200 })
  } catch (error) {
    console.error("❌ API Error:", error)

    let errorMessage = "Unknown error occurred"
    if (error instanceof Error) {
      errorMessage = error.message
    }

    return NextResponse.json({ error: "Failed to analyze resume", details: errorMessage }, { status: 500 })
  }
} 