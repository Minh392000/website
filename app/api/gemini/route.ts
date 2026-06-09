import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is required");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

export async function POST(req: NextRequest) {
  try {
    const { messages, systemInstruction } = await req.json();
    
    const ai = getAiClient();
    
    // Convert input messages to the SDK format
    // Expecting messages format: [{ role: "user" | "model", parts: [{ text: "..." }] }]
    let response;
    let lastError: any = null;
    const modelsToTry = [
      "gemini-3.5-flash",
      "gemini-3.1-pro-preview",
      "gemini-3.1-flash-lite",
      "gemini-flash-latest"
    ];

    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    for (const modelName of modelsToTry) {
      let attempts = 2;
      for (let attempt = 1; attempt <= attempts; attempt++) {
        try {
          console.log(`Attempting generateContent with model: ${modelName} (Attempt ${attempt}/${attempts})`);
          response = await ai.models.generateContent({
            model: modelName,
            contents: messages,
            config: {
              systemInstruction: systemInstruction || "Bạn là Trợ lý AI học tập An ninh mạng (VWA Cybersecurity Assistant) xuất sắc. Bạn giải đáp toàn diện và trả lời mọi câu hỏi của học viên không hạn chế chủ đề. Hãy viết câu trả lời thật ngắn gọn, súc tích, đi thẳng vào ý chính, sử dụng các gạch đầu dòng rõ ràng, tuyệt đối không viết lan man hoặc dông dài.",
              temperature: 0.3,
            }
          });
          if (response) {
            console.log(`Successfully generated content using model: ${modelName}`);
            break;
          }
        } catch (err: any) {
          console.warn(`Attempt with model ${modelName} (Attempt ${attempt}/${attempts}) failed:`, err?.message || err);
          lastError = err;
          if (attempt < attempts) {
            await delay(300);
          }
        }
      }
      if (response) {
        break;
      }
    }

    if (!response) {
      throw lastError || new Error("All fallback models failed.");
    }

    return NextResponse.json({ text: response.text });
  } catch (error: any) {
    console.error("Gemini API Error in backend:", error);
    return NextResponse.json(
      { error: error.message || "Quá trình gọi Gemini API không thành công." },
      { status: 500 }
    );
  }
}
