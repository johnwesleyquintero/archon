import { Message, streamText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";

// IMPORTANT! Set the runtime to edge
export const runtime = "edge";

const groq = createOpenAI({
  baseURL: "https://api.groq.com/openai/v1",
  apiKey: process.env.GROQ_API_KEY as string,
});

export async function POST(req: Request) {
  const { messages } = (await req.json()) as {
    messages: Array<{ role: string; content: string }>;
  };

  const result = streamText({
    model: groq("llama3-8b-8192"), // You can choose other Groq models like 'mixtral-8x7b-32768'
    messages: messages as Message[],
  });

  return result.toDataStreamResponse();
}
