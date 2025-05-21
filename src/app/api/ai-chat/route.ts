import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

// Get API key from environment variable
const apiKey = process.env.GROQ_API_KEY;

if (!apiKey) {
  throw new Error("GROQ_API_KEY environment variable is not set");
}

const groq = new Groq({
  apiKey: apiKey,
});

export async function POST(req: NextRequest) {
  try {
    // Validate request body
    let body;
    try {
      body = await req.json();
    } catch (e) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    const { message, projects, tasks } = body;

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // Compose a prompt with context
    const prompt = `
You are an HR assistant for a project management tool. Here is the current context:

Projects: ${JSON.stringify(projects, null, 2)}
Tasks: ${JSON.stringify(tasks, null, 2)}

User question: ${message}

Please provide a helpful and concise response as an HR assistant. Focus on being informative and professional.
`;

    const chatCompletion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { 
          role: "system", 
          content: "You are a helpful HR assistant for a project management tool. You help users understand their projects, tasks, and provide guidance on project management best practices." 
        },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 1024,
      top_p: 1,
      stream: false,
    });

    if (!chatCompletion.choices?.[0]?.message?.content) {
      return NextResponse.json(
        { error: "No response from AI model" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      reply: chatCompletion.choices[0].message.content,
    });
  } catch (error) {
    console.error("Error in AI chat:", error);
    
    // More detailed error response
    const errorMessage = error instanceof Error 
      ? error.message 
      : "Failed to get response from AI";
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
} 