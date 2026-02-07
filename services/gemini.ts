
import { GoogleGenAI, Type } from "@google/genai";
import { AIProductSuggestion } from "../types";

const getAI = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
};

// Add enhanceSearch to fix the error in Navbar.tsx
export const enhanceSearch = async (query: string): Promise<string[]> => {
  const ai = getAI();
  if (!ai) return [];
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate 5 related search terms or tags for a handmade marketplace based on the query: "${query}". Return only a JSON array of strings.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });
    return JSON.parse(response.text || '[]');
  } catch (err) {
    console.error("Search enhancement failed:", err);
    return [];
  }
};

export const generateProductDetails = async (input: string): Promise<AIProductSuggestion> => {
  const ai = getAI();
  if (!ai) throw new Error("AI service unavailable: Missing API Key");
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Based on the user's basic product idea "${input}", generate a professional Etsy-style product listing.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          suggestedPrice: { type: Type.NUMBER },
          tags: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ["title", "description", "suggestedPrice", "tags"],
      },
    },
  });
  return JSON.parse(response.text || '{}');
};

/**
 * AI vision check for safety and compliance.
 * Distinguishes between 'safe' (allow), 'unsafe' (prohibit), and 'flagged' (manual review).
 */
export const scanImageForIntegrity = async (base64Data: string, mimeType: string): Promise<{ safe: boolean; flagged: boolean; reason: string }> => {
  const ai = getAI();
  if (!ai) return { safe: true, flagged: false, reason: "AI not configured" };

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          parts: [
            { inlineData: { data: base64Data.split(',')[1], mimeType } },
            { text: `Analyze this image for an artisanal handmade marketplace.
            1. Safe: Does it contain explicit NSFW, violence, or prohibited symbols?
            2. Flagged: Does it look like a mass-produced stock photo, or does it lack artisanal qualities?
            Return JSON: { "safe": boolean, "flagged": boolean, "reason": string }` },
          ],
        },
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            safe: { type: Type.BOOLEAN },
            flagged: { type: Type.BOOLEAN },
            reason: { type: Type.STRING }
          },
          required: ["safe", "flagged", "reason"]
        }
      },
    });
    return JSON.parse(response.text || '{"safe":true, "flagged":false, "reason": ""}');
  } catch (err) {
    console.error("Image scan failed:", err);
    return { safe: true, flagged: false, reason: "Scan error" };
  }
};

export interface ModerationResult {
  isLikelyMassProduced: boolean;
  confidenceScore: number;
  reason: string;
}

export const analyzeProductForModeration = async (title: string, description: string): Promise<ModerationResult> => {
  const ai = getAI();
  if (!ai) return { isLikelyMassProduced: false, confidenceScore: 0, reason: "AI Service Offline" };
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Analyze listing for non-handmade indicators. Title: "${title}" Description: "${description}"`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          isLikelyMassProduced: { type: Type.BOOLEAN },
          confidenceScore: { type: Type.NUMBER },
          reason: { type: Type.STRING }
        },
        required: ["isLikelyMassProduced", "confidenceScore", "reason"]
      }
    }
  });
  return JSON.parse(response.text || '{}');
};

export interface GrowthTip {
  title: string;
  advice: string;
  impact: 'High' | 'Medium' | 'Low';
}

export const getGrowthTips = async (): Promise<GrowthTip[]> => {
  const ai = getAI();
  if (!ai) return [];
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: "Generate 3 growth tips for an online artisan. Return JSON array.",
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
  return JSON.parse(response.text || '[]');
};
