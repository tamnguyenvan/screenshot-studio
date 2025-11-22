import { GoogleGenAI, Type } from "@google/genai";
import { GeneratedPalette } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const generateSmartPalette = async (base64Image: string): Promise<GeneratedPalette> => {
    if (!apiKey) {
        console.warn("No API Key provided for Gemini.");
        return { colors: ['#3b82f6', '#8b5cf6', '#ec4899'] }; // Fallback
    }

    try {
        const model = 'gemini-2.5-flash';
        
        // Clean base64 string if it contains metadata prefix
        const cleanBase64 = base64Image.includes('base64,') 
            ? base64Image.split('base64,')[1] 
            : base64Image;

        const response = await ai.models.generateContent({
            model,
            contents: {
                parts: [
                    {
                        inlineData: {
                            data: cleanBase64,
                            mimeType: 'image/png' // Assuming PNG/JPEG generic handling by API
                        }
                    },
                    {
                        text: "Analyze this image and generate a color palette of 3 distinct colors that would look good as a background gradient for this screenshot. Also provide a very short 5-word description of the image style."
                    }
                ]
            },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        colors: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING },
                            description: "3 hex color codes"
                        },
                        description: {
                            type: Type.STRING,
                            description: "Short style description"
                        }
                    },
                    required: ["colors"]
                }
            }
        });

        const jsonText = response.text;
        if (!jsonText) throw new Error("Empty response from Gemini");
        
        const data = JSON.parse(jsonText) as GeneratedPalette;
        return data;

    } catch (error) {
        console.error("Gemini analysis failed:", error);
        return { colors: ['#18181b', '#27272a', '#3f3f46'], description: "Fallback Dark Mode" };
    }
};
