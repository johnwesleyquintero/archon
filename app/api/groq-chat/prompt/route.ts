import Groq from "groq-sdk";
import { NextResponse } from "next/server";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function GET() {
  try {
    const systemPrompt = `You are a helpful assistant that provides inspiring and thought-provoking journal prompts. Today is ${new Date().toLocaleDateString()}. Create a unique journal prompt for today.`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: "Give me a journal prompt for today.",
        },
      ],
      model: "llama3-8b-8192",
      temperature: 0.7,
      max_tokens: 100,
      top_p: 1,
      stream: false,
    });

    const prompt = chatCompletion.choices[0]?.message?.content;

    if (!prompt) {
      return NextResponse.json(
        { error: "Failed to generate a prompt." },
        { status: 500 },
      );
    }

    return NextResponse.json({ prompt });
  } catch (error) {
    console.error("Error in prompt generation API:", error);
    let errorMessage = "An unknown error occurred.";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
