
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { SYSTEM_INSTRUCTION } from "../constants";

const getApiKey = () => {
  const key = process.env.API_KEY;
  if (!key) throw new Error("API Key not found");
  return key;
};

export const getMarketUpdate = async (query: string = "Give me a full market update for all metals."): Promise<{ text: string, sources: any[] }> => {
  const ai = new GoogleGenAI({ apiKey: getApiKey() });
  
  const response: GenerateContentResponse = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: query,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      tools: [{ googleSearch: {} }],
    },
  });

  const text = response.text || "No data available.";
  const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

  return { text, sources };
};

export const streamMarketAnalysis = async (message: string, onChunk: (chunk: string) => void) => {
  const ai = new GoogleGenAI({ apiKey: getApiKey() });
  
  const response = await ai.models.generateContentStream({
    model: 'gemini-3-flash-preview',
    contents: message,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      tools: [{ googleSearch: {} }],
    },
  });

  for await (const chunk of response) {
    if (chunk.text) {
      onChunk(chunk.text);
    }
  }
};
