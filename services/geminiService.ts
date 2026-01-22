
import { GoogleGenAI } from "@google/genai";

const getAIClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
};

export const generatePuzzleImage = async (prompt: string): Promise<string> => {
  const ai = getAIClient();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: prompt }]
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1"
        }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No image data found in response");
  } catch (error) {
    console.error("Error generating image:", error);
    // Return a high-quality placeholder if API fails or isn't available
    return `https://picsum.photos/800/800?random=${Math.random()}`;
  }
};

export const getPuzzleNarrative = async (theme: string): Promise<string> => {
  const ai = getAIClient();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Write a 2-sentence mysterious and encouraging introduction for a puzzle game themed around ${theme}. Keep it atmospheric.`,
    });
    return response.text || "The fragments of reality are scattered. Restore the vision to unlock the secrets of this realm.";
  } catch (error) {
    return "The fragments of reality are scattered. Restore the vision to unlock the secrets of this realm.";
  }
};
