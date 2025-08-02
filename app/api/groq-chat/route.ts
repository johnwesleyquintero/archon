import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";
import { serverEnv } from "@/lib/env.server"; // Import serverEnv
import { apiErrorResponse, AppError } from "@/lib/utils";
import { messagesSchema } from "@/lib/zod-schemas";

// IMPORTANT! Set the runtime to edge
export const runtime = "edge";

const groq = createOpenAI({
  baseURL: "https://api.groq.com/openai/v1",
  apiKey: serverEnv.GROQ_API_KEY, // Use serverEnv.GROQ_API_KEY
});

export async function POST(req: Request) {
  try {
    if (!serverEnv.GROQ_API_KEY) {
      throw new AppError(
        "GROQ_API_KEY is not set. Please ensure it's configured in your environment variables.",
        "MISSING_API_KEY",
        {},
        500,
      );
    }

    const { messages } = (await req.json()) as {
      messages: Array<{ role: string; content: string }>;
    };

    const validatedMessages = messagesSchema.parse(messages);

    const groqModel = serverEnv.GROQ_MODEL || "llama3-8b-8192";

    const result = streamText({
      model: groq(groqModel),
      messages: validatedMessages,
    });

    return result.toDataStreamResponse();
  } catch (error) {
    return apiErrorResponse(error, "Groq Chat API");
  }
}
