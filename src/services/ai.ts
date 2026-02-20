import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini API
// Note: In a production app, you should proxy this through a backend to protect the key
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

let genAI: GoogleGenerativeAI | null = null;
let model: any = null;

export const initGemini = () => {
    if (!apiKey || apiKey === "AIzaSy...") {
        console.warn("VITE_GEMINI_API_KEY is missing or is a placeholder");
        return false;
    }
    try {
        genAI = new GoogleGenerativeAI(apiKey);
        model = genAI.getGenerativeModel({ model: "gemini-pro" });
        return true;
    } catch (error) {
        console.error("Failed to initialize Gemini:", error);
        return false;
    }
};

export const generateResponse = async (prompt: string, context?: string): Promise<string> => {
    if (!model) {
        const success = initGemini();
        if (!success) {
            if (apiKey === "AIzaSy...") {
                return "Error: You are using the placeholder API Key. Please get a real key from Google AI Studio and put it in your .env file.";
            }
            return "Error: Gemini API key is missing or invalid. Please check your settings.";
        }
    }

    try {
        let fullPrompt = prompt;
        if (context) {
            fullPrompt = `Context:\n${context}\n\nQuestion: ${prompt}\n\nAnswer based on the context provided above.`;
        }

        const result = await model.generateContent(fullPrompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Gemini generation error:", error);
        return "I'm having trouble connecting to my AI brain right now. Please try again later.";
    }
};
