import { groq } from "@ai-sdk/groq"
import { streamText } from "ai"
import { NextResponse } from "next/server"

// Allow streaming responses up to 30 seconds
export const maxDuration = 30

export async function POST(req: Request) {
  try {
    // Extract the `messages` from the body of the request
    const { messages } = await req.json()

    // Validate messages input
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid messages format" }, { status: 400 })
    }

    // Call the Groq language model
    // You can choose different models like 'llama-3.1-8b-instant', 'llama-3.3-70b-instruct-turbo', etc. [^1]
    const result = streamText({
      model: groq("llama-3.1-8b-instant"), // Using a fast and efficient model [^1]
      messages,
    })

    // Respond with the stream
    return result.toDataStreamResponse()
  } catch (error) {
    console.error("Error in Groq chat API route:", error)
    return NextResponse.json(
      { error: "Failed to generate text from Groq", details: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    )
  }
}
