import { NextResponse } from 'next/server'
import { HfInference } from '@huggingface/inference'

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY)

export async function GET() {
  try {
    // Simple test with a small prompt
    const result = await hf.textGeneration({
      model: 'google/flan-t5-base',
      inputs: 'Say hello!',
      parameters: {
        max_new_tokens: 10,
      },
    })
    
    return NextResponse.json({ success: true, result })
  } catch (error) {
    console.error('API Test Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to connect to Hugging Face API' },
      { status: 500 }
    )
  }
} 