import { NextRequest, NextResponse } from "next/server";

// Define categorized important skills
const HARD_SKILLS = new Set([
  "rag", "algorithms", "financial", "docker", "sql", "python", "java", "c++", "c", "go",
  "pytorch", "tensorflow", "node.js", "html/css", "react", "javascript", "next.js",
  "sql", "numpy", "sklearn", "pandas", "seaborn", "matplotlib", "reactjs", "snowflake",
  "tableau", "kubernetes", "firebase", "spacy", "fpgas", "verilog/system verilog", 
  "unix", "linux", "google colab", "microsoft azure", "git", "github", "directx", 
  "opengl", "unity", "eclipse", "mongodb", "jupyter", "cad", "pcie standard", 
  "cxl standard", "linux os", "swift", "vector dbs", "aws lambda", "mui", "mlflow", 
  "rds", "jira", "kpi", "cloud infrastructure", "containerization", "generative", 
  
  "programming languages", 
  "c#", "lua", "java", "go", "node.js", "ruby", "python", "c++", "swift", "software engineering", "coding standards", 
  "debugging", "testing", "shipping code to production","devops", "data",

  
  "ticketing", 
  "queue", 
  "creating", 
  "desk", 
  "tickets", 
  "diagnosing", 
  "resolving", 
  "supporting", 
  "conference rooms", 
  "zoom", 
  "itsystems", 
  "troubleshoots", 
  "failures", 
  "personal desktop", 
  "laptop computers", 
  "performing", 
  "regular equipment", 
  "notebook", 
  "printers", 
  "autoswitches", 
  "scanning", 
  "viruses", 
  "maintaining", 
  "inventory", 
  "providing relocation", 
  "specialized training", 
  "educate organizations", 
  "users about specialized", 
  "video", 
  "Comptia", 
  "general TCP/IP", 
  "routing", 
  "WANs", 
  "LANs", 
  "switches", 
  "firewalls", 
  "VPNs", 
  "wireless"


]);


const SOFT_SKILLS = new Set([

  "problem-solving","problemsolving", "fastpaced", "collaboration","collaborative", "leadership", "communication",
  "adaptability", "creativity", "teamwork", "critical thinking", "time management",
  "organization", "attention to detail", "resilience", "conflict resolution", "written", "decisionmaking", "diligence",

  "problem solving", "working in ambiguous environments", "collaboration", "communication",
  "passionate", "quick learning", "developing proficiency quickly", "attention to detail", "teamwork",

  "able assist", 
  "explain issue", 
  "terms user", 
  "clearly", 
  "members", 
  "verbally", 
  "written", 
  "flow charts", 
  "service", 
  "attention details", 
  "follow", 
  "sense urgency", 
  "independently"


]);

const EDUCATION_TERMS = new Set([
  "junior", "freshman", "senior", "sophomore", "bachelor", "masters", "phd", "university", "degree", 
  "certification", "undergraduate degree", "graduate degree", "computer science", "engineering", "related field"
  
]);

// Function to filter out common useless words and retain meaningful keywords
function extractKeywords(text: string): Set<string> {
  const STOP_WORDS = new Set([
    "a", "an", "and", "are", "as", "at", "be", "but", "by", "for", "if", "in",
    "into", "is", "it", "no", "not", "of", "on", "or", "such", "that", "the",
    "their", "then", "there", "these", "they", "this", "to", "was", "will",
    "with", "your", "you", "from", "can", "using", "use", "like", "new",
    "including", "across", "various", "different", "via", "any", "well",
    "based", "ability", "within", "variety", "background", "currently",
    "preferred", "expected", "team", "teams", "among", "through", "working",
    "work", "role", "position", "tasks", "responsibilities", "duties", "function",
    "functions", "career", "goal", "objectives", "achieve", "achieving",
    "successful", "success", "impact", "contribute", "contributing", "effective",
    "efficient", "efficiency", "environment", "opportunity", "opportunities",
    "develop", "development", "developing", "improve", "improving", "enhance",
    "enhancing", "growth", "expanding", "expand", "support", "help", "helping",
    "provide", "provided", "provides", "learn", "learning", "knowledge",
    "self", "motivated", "eager", "strong", "excellent", "good", "nice",
    "basic", "preferably", "abilities", "skills", "understanding",
    "technologies", "familiarity", "methodologies", "version", "systems",
    "control", "platforms", "science", "engineering", "degree", "field",
    "related", "academic", "education", "school", "university", "certification",
    "industry", "industries", "finetuning", "solutions", "our", "platform",
    "ensuring", "seamless", "interaction", "existing", "latest", "techniques",
    "ensure", "performance", "scalability", "reliability", "conduct", "rigorous",
    "validation", "robustness", "monitor", "maintain", "addressing", "issues",
    "improvements", "needed", "stay", "date", "advancements", "apply", "solve",
    "problems", "crossfunctional", "understand", "participate", "code",
    "reviews", "mentor",

    // Newly added words to filter out (02/09/2025)
    "equivalent", "years", "focus", "fine", "tuning", "prompt", 
    "application", "architectures", "principles", "exposure", "particularly", 
    "ingestion", "pipelines", "quality", "collaborative", "both", "verbal", "convey", 
    "complex", "concepts", "nontechnical", "stakeholders", "utilize", "models", 
    "optimize", "investment", "due", "diligence", "processes", "analysts", 
    "translate", "research", "robust", "integrate", "requirements", "desired", 
    "qualifications", "markets", "strategies", "plus",

    "daily", 
    "check", 
    "snow", 
    "update", 
    "all", 
    "identifies", 
    "when", 
    "relate", 
    "assisting", 
    "endusers", 
    "person", 
    "remote", 
    "corporate", 
    "itil", 
    "itsm", 
    "best practices"

  ]);

  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-z\s]/g, "") // Remove special characters
      .split(/\s+/)
      .filter((word) => word.length > 2 && !STOP_WORDS.has(word)) // Exclude stop words
  );
}

// Main API handler
export async function POST(req: NextRequest) {
  try {
    const { resumeText, jobDescription } = await req.json();

    if (!resumeText || !jobDescription) {
      return NextResponse.json(
        { error: "Both resume and job description are required" },
        { status: 400 }
      );
    }

    console.log("✅ Resume and Job Description received. Processing...");

    const resumeKeywords = extractKeywords(resumeText);
    const jobKeywords = extractKeywords(jobDescription);

    // Categorizing Matched & Missed Skills
    const matchedKeywords = [...jobKeywords].filter((word) =>
      resumeKeywords.has(word)
    );

    const missedKeywords = [...jobKeywords].filter(
      (word) => !resumeKeywords.has(word)
    );

    // Separate missing hard & soft skills
    const missingHardSkills = missedKeywords.filter((word) =>
      HARD_SKILLS.has(word)
    );

    const missingSoftSkills = missedKeywords.filter((word) =>
      SOFT_SKILLS.has(word)
    );

    const missingEducationTerms = missedKeywords.filter((word) =>
      EDUCATION_TERMS.has(word)
    );

    // Scoring Logic: Start at 10, lose 1 point per missing keyword
    const hardSkillsScore = Math.max(10 - missingHardSkills.length, 0) * 10;
    const softSkillsScore = Math.max(10 - missingSoftSkills.length, 0) * 10;
    const experienceScore = Math.max(
      10 - missedKeywords.length + missingHardSkills.length + missingSoftSkills.length,
      0
    ) * 10;
    const educationScore = Math.min(100, experienceScore + 10);

    const analysisResult = {
      matchRate: Math.round((matchedKeywords.length / jobKeywords.size) * 100),
      categories: [
        {
          name: "Hard Skills",
          score: hardSkillsScore,
          issues: missingHardSkills.length
            ? [{ description: `Words Missed: ${missingHardSkills.join(", ")}` }]
            : [],
        },
        {
          name: "Soft Skills",
          score: softSkillsScore,
          issues: missingSoftSkills.length
            ? [{ description: `Words Missed: ${missingSoftSkills.join(", ")}` }]
            : [],
        },
        {
          name: "Experience",
          score: experienceScore,
          issues: missedKeywords.length
            ? [{ description: `Words Missed: ${missedKeywords.join(", ")}` }]
            : [],
        },
        {
          name: "Education",
          score: educationScore,
          issues: missingEducationTerms.length
            ? [{ description: `Words Missed: ${missingEducationTerms.join(", ")}` }]
            : [],
        },
      ],
    };

    console.log("📊 Analysis Completed. Sending response...");
    return NextResponse.json(analysisResult, { status: 200 });
  } catch (error) {
    console.error("❌ API Error:", error);

    let errorMessage = "Unknown error occurred";
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    return NextResponse.json(
      { error: "Failed to analyze resume", details: errorMessage },
      { status: 500 }
    );
  }
}
