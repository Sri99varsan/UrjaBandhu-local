import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || "");

export async function POST(req: Request) {
  if (!process.env.GOOGLE_GEMINI_API_KEY) {
    return NextResponse.json(
      { error: "API key not configured" },
      { status: 500 }
    );
  }

  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      },
    });

    const systemPrompt = `You are UrjaBandhu, an AI assistant specializing in energy optimization, electricity usage, and smart home energy management. 
    You provide concise, helpful responses about reducing electricity bills, understanding usage patterns, and implementing energy-saving practices.
    Focus on Indian households and electricity usage patterns. Use Indian Rupees (₹) for cost calculations.
    Your responses should be specific, practical, and relevant to Indian energy consumers.
    
    User query: ${prompt}`;

    const result = await model.generateContent(systemPrompt);
    const response = await result.response;

    // Clean up any remaining asterisks from the response
    const cleanedResponse = response.text().replace(/\*/g, "");

    return NextResponse.json({
      response: cleanedResponse,
      status: "success",
    });
  } catch (error: any) {
    console.error("Chat API Error:", error);

    const errorMessage = error.message || "Failed to process the request";
    return NextResponse.json(
      {
        error: errorMessage,
        status: "error",
      },
      { status: 500 }
    );
  }
}
