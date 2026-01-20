import { GoogleGenAI } from "@google/genai";

export const generateDescription = async (title: string, category: string): Promise<string> => {
  try {
    // Always use new GoogleGenAI({apiKey: process.env.API_KEY}) as per guidelines
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Use gemini-3-flash-preview for basic text tasks like writing project descriptions
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are a professional graphic design critic and copywriter. 
      Write a compelling, professional 2-sentence description for a design project titled "${title}" 
      in the category "${category}". Focus on visual impact and design intent.`,
      config: {
        temperature: 0.7,
        topP: 0.95,
        // Recommended: omit maxOutputTokens unless a specific limit is needed with a thinkingBudget
      }
    });

    // Directly access the .text property of GenerateContentResponse
    const text = response.text;
    return text?.trim() || "A stunning visual exploration of modern design principles.";
  } catch (error) {
    console.error("Gemini AI Error:", error);
    return "A high-impact design focusing on modern aesthetics and clear visual communication.";
  }
};