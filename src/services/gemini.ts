import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export const ARCHITECTURE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    style: {
      type: Type.STRING,
      description: "The architectural style (e.g., Modern, Brutalist, Gothic, Minimalism).",
    },
    buildingType: {
      type: Type.STRING,
      description: "Type of building (e.g., Residential, Commercial, Industrial, Pavilion).",
    },
    materials: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "List of primary materials visible (e.g., Exposed concrete, Glass, Timber, Steel).",
    },
    lighting: {
      type: Type.OBJECT,
      properties: {
        timeOfDay: { type: Type.STRING, description: "Morning, Golden Hour, Night, etc." },
        source: { type: Type.STRING, description: "Natural, Artificial, Diffused, etc." },
        mood: { type: Type.STRING, description: "Dramatic, Serene, Harsh, etc." },
      },
      required: ["timeOfDay", "source", "mood"],
    },
    environment: {
      type: Type.OBJECT,
      properties: {
        setting: { type: Type.STRING, description: "Urban, Forest, Coastal, Desert, etc." },
        weather: { type: Type.STRING, description: "Clear, Foggy, Rainy, etc." },
        vegetation: { type: Type.ARRAY, items: { type: Type.STRING } },
      },
      required: ["setting", "weather"],
    },
    composition: {
      type: Type.OBJECT,
      properties: {
        cameraAngle: { type: Type.STRING, description: "Eye-level, Aerial, Worm's eye view, etc." },
        focalPoint: { type: Type.STRING, description: "The main element the viewer's eye is drawn to." },
      },
      required: ["cameraAngle", "focalPoint"],
    },
    detailedPrompt: {
      type: Type.STRING,
      description: "A comprehensive, descriptive paragraph that can be used as a prompt for image generation models.",
    },
  },
  required: ["style", "buildingType", "materials", "lighting", "environment", "composition", "detailedPrompt"],
};

export async function analyzeArchitectureImage(base64Image: string, mimeType: string) {
  const model = "gemini-3-flash-preview";
  
  const response = await ai.models.generateContent({
    model,
    contents: [
      {
        parts: [
          {
            inlineData: {
              data: base64Image,
              mimeType: mimeType,
            },
          },
          {
            text: "Analyze this architectural image in extreme detail. Identify the style, materials, lighting conditions, environment, and composition. Provide a structured analysis and a comprehensive prompt for an AI image generator.",
          },
        ],
      },
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: ARCHITECTURE_SCHEMA,
    },
  });

  return JSON.parse(response.text || "{}");
}
