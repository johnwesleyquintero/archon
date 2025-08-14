import Groq from "groq-sdk";
import { NextRequest, NextResponse } from "next/server";
import { taskSchema } from "@/lib/validators";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// We only need a subset of the task schema for the AI to parse
const aiTaskParserSchema = taskSchema.pick({
  title: true,
  priority: true,
  due_date: true,
  tags: true,
  notes: true,
});

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { userInput: string };
    const { userInput } = body;

    if (!userInput) {
      return NextResponse.json(
        { error: "User input is required" },
        { status: 400 },
      );
    }

    const systemPrompt = `You are an intelligent task management assistant. Your role is to take a user's natural language input and convert it into a structured JSON object that conforms to the provided Zod schema.

The current date is ${new Date().toISOString()}.

Analyze the user's input and extract the following fields:
- title: The main objective of the task.
- priority: 'low', 'medium', or 'high'. Infer from words like 'urgent', 'important', etc. Default to 'medium' if not specified.
- due_date: An ISO 8601 string. Infer from phrases like 'tomorrow', 'next Friday', 'end of month'.
- tags: An array of strings. Extract any words prefixed with '#'.
- notes: Any additional details or context provided by the user.

Your response MUST be a valid JSON object that satisfies the following Zod schema:
${JSON.stringify(aiTaskParserSchema.shape, null, 2)}

Do not include any extra text, explanations, or markdown formatting in your response. Only the JSON object is allowed.`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: userInput,
        },
      ],
      model: "llama3-8b-8192",
      temperature: 0,
      max_tokens: 1024,
      top_p: 1,
      stream: false,
      response_format: { type: "json_object" },
    });

    const rawResponse = chatCompletion.choices[0]?.message?.content;

    if (!rawResponse) {
      return NextResponse.json(
        { error: "Failed to get a response from the AI model." },
        { status: 500 },
      );
    }

    // Validate the response from the AI against our schema
    const parsedJson = JSON.parse(rawResponse) as unknown;
    const validationResult = aiTaskParserSchema.safeParse(parsedJson);

    if (!validationResult.success) {
      console.error("AI response validation error:", validationResult.error);
      return NextResponse.json(
        {
          error: "AI response did not match the expected format.",
          details: validationResult.error.flatten(),
        },
        { status: 500 },
      );
    }

    return NextResponse.json(validationResult.data);
  } catch (error) {
    console.error("Error in groq-chat API:", error);
    let errorMessage = "An unknown error occurred.";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
