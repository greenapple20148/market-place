
import { GoogleGenAI, Type } from "@google/genai";
import { AIProductSuggestion } from "../types";

// Fix: Always use named parameter and direct process.env.API_KEY without fallback
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateProductDetails = async (input: string): Promise<AIProductSuggestion> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Based on the user's basic product idea "${input}", generate a professional Etsy-style product listing.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: "Catchy product title" },
          description: { type: Type.STRING, description: "Detailed, persuasive product description" },
          suggestedPrice: { type: Type.NUMBER, description: "Market-competitive price in USD" },
          tags: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
            description: "Search keywords" 
          },
        },
        required: ["title", "description", "suggestedPrice", "tags"],
      },
    },
  });

  try {
    // Fix: Access .text property directly (not a method)
    return JSON.parse(response.text || '{}') as AIProductSuggestion;
  } catch (e) {
    console.error("Failed to parse Gemini response", e);
    throw new Error("Could not generate product details.");
  }
};

export const enhanceSearch = async (query: string): Promise<string[]> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `The user searched for "${query}" in a handmade marketplace. Generate 5 broader or related search tags that might interest them. Return as a simple JSON array of strings.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: { type: Type.STRING }
      }
    }
  });

  try {
    return JSON.parse(response.text || '[]') as string[];
  } catch {
    return [];
  }
};

export interface GrowthTip {
  title: string;
  advice: string;
  impact: 'High' | 'Medium' | 'Low';
}

export const getGrowthTips = async (): Promise<GrowthTip[]> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: "Generate 3 actionable, professional growth tips for an online artisan seller. Focus on things like SEO, photography, customer engagement, or seasonal trends. Return as a JSON array of objects with title, advice, and impact level.",
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            advice: { type: Type.STRING },
            impact: { type: Type.STRING, enum: ["High", "Medium", "Low"] }
          },
          required: ["title", "advice", "impact"]
        }
      }
    }
  });

  try {
    return JSON.parse(response.text || '[]') as GrowthTip[];
  } catch {
    return [];
  }
};
