import { type NextRequest, NextResponse } from "next/server"
import { distance as levenshteinDistance } from 'fastest-levenshtein'
import winkTokenizer from 'wink-tokenizer'
import porterStemmer from 'wink-porter2-stemmer'

// Initialize tokenizer and stemmer
const tokenizer = new winkTokenizer()
const stemmer = porterStemmer

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
  const stemmedWord = stemmer(word.toLowerCase())
  for (const [skill, variations] of skillMap) {
    if (stemmedWord === stemmer(skill.toLowerCase())) return skill
    if (variations.some((v: string) => stemmedWord === stemmer(v.toLowerCase()))) return skill
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
  const stemmedWord = stemmer(word.toLowerCase())
  for (const [skill, variations] of skillMap) {
    if (stemmedWord === stemmer(skill.toLowerCase())) return true
    if (variations.some((v: string) => stemmedWord === stemmer(v.toLowerCase()))) return true
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
    const tokens = tokenizer.tokenize(sentence.toLowerCase())
    const words = tokens
      .filter(token => token.tag === 'word' || token.tag === 'email' || token.tag === 'hashtag')
      .map(token => token.value)
    
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

// Main API handler
export async function POST(req: NextRequest) {
  try {
    const { resumeText, jobDescription } = await req.json()

    if (!resumeText || !jobDescription) {
      return NextResponse.json(
        { error: 'Both resume text and job description are required' },
        { status: 400 }
      )
    }

    // Simulate analysis (in a real app, this would call an AI service)
    const analysisResult = simulateResumeAnalysis(resumeText, jobDescription)

    return NextResponse.json(analysisResult)
  } catch (error) {
    console.error('Error analyzing resume:', error)
    return NextResponse.json(
      { error: 'Failed to analyze resume' },
      { status: 500 }
    )
  }
}

function simulateResumeAnalysis(resumeText: string, jobDescription: string) {
  // Simple keyword matching simulation
  const jobKeywords = extractKeywords(jobDescription)
  const resumeKeywords = extractKeywords(resumeText)
  
  const matchedKeywords: MatchedKeyword[] = []
  const hardSkillsIssues: Issue[] = []
  const softSkillsIssues: Issue[] = []
  const experienceIssues: Issue[] = []
  const educationIssues: Issue[] = []

  // Common tech keywords for simulation
  const commonTechSkills = ['javascript', 'python', 'react', 'node.js', 'sql', 'aws', 'docker', 'git']
  const commonSoftSkills = ['leadership', 'communication', 'teamwork', 'problem-solving', 'analytical']
  const commonExperience = ['project management', 'agile', 'scrum', 'development', 'engineering']
  const commonEducation = ['bachelor', 'master', 'degree', 'certification', 'training']

  let totalMatches = 0
  let totalPossibleMatches = 0

  // Check for hard skills
  commonTechSkills.forEach(skill => {
    if (jobKeywords.includes(skill)) {
      totalPossibleMatches++
      if (resumeKeywords.includes(skill)) {
        totalMatches++
        matchedKeywords.push({
          keyword: skill,
          context: `Found in resume: relevant ${skill} experience`,
          category: 'Hard Skills'
        })
      } else {
        hardSkillsIssues.push({
          description: `Missing: ${skill} (Context: Required technical skill for this role)`
        })
      }
    }
  })

  // Check for soft skills
  commonSoftSkills.forEach(skill => {
    if (jobKeywords.includes(skill)) {
      totalPossibleMatches++
      if (resumeKeywords.includes(skill)) {
        totalMatches++
        matchedKeywords.push({
          keyword: skill,
          context: `Demonstrated ${skill} abilities in resume`,
          category: 'Soft Skills'
        })
      } else {
        softSkillsIssues.push({
          description: `Missing: ${skill} (Context: Important interpersonal skill for this position)`
        })
      }
    }
  })

  // Check for experience keywords
  commonExperience.forEach(exp => {
    if (jobKeywords.includes(exp)) {
      totalPossibleMatches++
      if (resumeKeywords.includes(exp)) {
        totalMatches++
        matchedKeywords.push({
          keyword: exp,
          context: `Relevant ${exp} experience found`,
          category: 'Experience'
        })
      } else {
        experienceIssues.push({
          description: `Missing: ${exp} (Context: Relevant experience requirement)`
        })
      }
    }
  })

  // Check for education keywords
  commonEducation.forEach(edu => {
    if (jobKeywords.includes(edu)) {
      totalPossibleMatches++
      if (resumeKeywords.includes(edu)) {
        totalMatches++
        matchedKeywords.push({
          keyword: edu,
          context: `Educational background matches requirement`,
          category: 'Education'
        })
      } else {
        educationIssues.push({
          description: `Missing: ${edu} (Context: Educational requirement for this role)`
        })
      }
    }
  })

  // Calculate match rate
  const matchRate = totalPossibleMatches > 0 ? Math.round((totalMatches / totalPossibleMatches) * 100) : 75

  // Calculate category scores
  const hardSkillsScore = calculateCategoryScore(commonTechSkills, jobKeywords, resumeKeywords)
  const softSkillsScore = calculateCategoryScore(commonSoftSkills, jobKeywords, resumeKeywords)
  const experienceScore = calculateCategoryScore(commonExperience, jobKeywords, resumeKeywords)
  const educationScore = calculateCategoryScore(commonEducation, jobKeywords, resumeKeywords)

  const categories: Category[] = [
    {
      name: 'Hard Skills',
      score: hardSkillsScore,
      issues: hardSkillsIssues
    },
    {
      name: 'Soft Skills',
      score: softSkillsScore,
      issues: softSkillsIssues
    },
    {
      name: 'Experience',
      score: experienceScore,
      issues: experienceIssues
    },
    {
      name: 'Education',
      score: educationScore,
      issues: educationIssues
    }
  ]

  return {
    matchRate,
    categories,
    matchedKeywords
  }
}

function extractKeywords(text: string): string[] {
  return text.toLowerCase()
    .replace(/[^\w\s-]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2)
}

function calculateCategoryScore(categorySkills: string[], jobKeywords: string[], resumeKeywords: string[]): number {
  const relevantSkills = categorySkills.filter(skill => jobKeywords.includes(skill))
  if (relevantSkills.length === 0) return 100 // If no skills in this category are required, score is 100%
  
  const matchedSkills = relevantSkills.filter(skill => resumeKeywords.includes(skill))
  return Math.round((matchedSkills.length / relevantSkills.length) * 100)
} 