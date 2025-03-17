import { type NextRequest, NextResponse } from "next/server"
import { HfInference } from '@huggingface/inference'

// Initialize Hugging Face client
const hf = new HfInference(process.env.HUGGINGFACE_API_KEY)

export async function POST(req: NextRequest) {
  try {
    const { resumeText, jobDescription, issues } = await req.json()

    if (!resumeText || !jobDescription || !issues) {
      return NextResponse.json({ error: "Resume, job description, and issues are required" }, { status: 400 })
    }

    // Format the issues into a clear prompt
    const issuesList = issues.map((issue: string) => `- ${issue}`).join('\n')

    // Create the prompt for the LLM
    const prompt = `You are a professional resume writer. Given the following resume and job description, please optimize the resume to address these issues:

RESUME:
${resumeText}

JOB DESCRIPTION:
${jobDescription}

ISSUES TO ADDRESS:
${issuesList}

Please provide an optimized version of the resume that addresses these issues while maintaining the original information and structure. Focus on:
1. Adding missing skills naturally into existing experience
2. Highlighting relevant experience
3. Using industry-standard terminology
4. Maintaining a professional tone
5. Keeping the original format and structure

Optimized Resume:`

    // Use FLAN-T5 model for optimization
    const response = await hf.textGeneration({
      model: 'google/flan-t5-base',
      inputs: prompt,
      parameters: {
        max_length: 1000,
        temperature: 0.7,
        top_p: 0.95,
        repetition_penalty: 1.2,
      }
    })

    return NextResponse.json({ optimizedResume: response.generated_text }, { status: 200 })
  } catch (error) {
    console.error("❌ API Error:", error)
    return NextResponse.json(
      { error: "Failed to optimize resume", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
} 