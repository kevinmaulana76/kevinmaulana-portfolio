
import { GoogleGenAI } from "@google/genai";

export const generateDescription = async (title: string, category: string): Promise<string> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("API_KEY is not configured. Returning fallback description.");
    return "A high-impact design focusing on modern aesthetics and clear visual communication.";
  }

  const ai = new GoogleGenAI({ apiKey });
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are a professional graphic design critic and copywriter. 
      Write a compelling, professional 2-sentence description for a design project titled "${title}" 
      in the category "${category}". Focus on visual impact and design intent.`,
      config: {
        temperature: 0.7,
        topP: 0.95,
        maxOutputTokens: 100,
      }
    });

    return response.text.trim() || "A stunning visual exploration of modern design principles.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "A high-impact design focusing on modern aesthetics and clear visual communication.";
  }
};
