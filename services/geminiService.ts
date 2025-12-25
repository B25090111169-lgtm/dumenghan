import { GoogleGenAI } from "@google/genai";

// Initialize Gemini Client
// We assume process.env.API_KEY is available.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateChristmasWish = async (theme: string): Promise<string> => {
  try {
    const modelId = 'gemini-2.5-flash';
    
    const prompt = `Write a short, heartwarming, and poetic Christmas wish (max 2 sentences). 
    The theme is: "${theme}". 
    Make it magical and evocative. Do not use quotes.`;

    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 0 } // Speed over complex reasoning
      }
    });

    return response.text?.trim() || "May your holidays be filled with light and joy.";
  } catch (error) {
    console.error("Failed to generate wish:", error);
    return "Wishing you peace, love, and joy this festive season.";
  }
};
