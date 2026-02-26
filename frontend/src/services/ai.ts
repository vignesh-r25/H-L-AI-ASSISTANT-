import Groq from "groq-sdk";

// API Keys from environment
const groqApiKey = import.meta.env.VITE_GROQ_API_KEY;

let groq: Groq | null = null;
const PRIMARY_MODEL = "llama-3.1-8b-instant";

/**
 * Initialize Groq client
 */
export const initGroq = () => {
    if (!groqApiKey || groqApiKey.startsWith("gsk_placeholder") || groqApiKey.length < 10) {
        console.warn("[AI-Service] Groq API key missing or invalid");
        return false;
    }
    try {
        groq = new Groq({
            apiKey: groqApiKey,
            dangerouslyAllowBrowser: true // Essential for Vite browser environments
        });
        return true;
    } catch (error) {
        console.error("[AI-Service] Groq init failed:", error);
        return false;
    }
};

/**
 * Generate response with Groq using the official SDK
 */
export const generateResponse = async (prompt: string, context?: string, signal?: AbortSignal): Promise<string> => {
    const fullPrompt = context
        ? `Context:\n${context}\n\nQuestion: ${prompt}\n\nAnswer based on the context provided.`
        : prompt;

    try {
        if (!groq) initGroq();
        if (!groq) throw new Error("Groq API Key missing or invalid in .env");

        console.log(`[AI-Service] SDK: Attempting generation with ${PRIMARY_MODEL}...`);

        const completion = await groq.chat.completions.create({
            messages: [{ role: "user", content: fullPrompt }],
            model: PRIMARY_MODEL,
        }, { signal });

        const text = completion.choices[0]?.message?.content;
        if (text) return text;
        throw new Error("Empty response from Groq");

    } catch (error: any) {
        if (error.name === "AbortError") return "Request cancelled.";

        console.error(`[AI-Service] Generation Error:`, error);

        let errorMsg = error.message || "Unknown Error";
        if (errorMsg.includes("429")) errorMsg = "Rate limit reached (Try again in a bit)";
        if (errorMsg.includes("Connection error") || errorMsg.includes("Failed to fetch")) {
            errorMsg = "Network Error (Please check your internet or VPN settings)";
        }
        
        return `AI Service Error: Groq failed (${errorMsg}).`;
    }
};

// Compatibility aliases for the rest of the app
export const initGemini = initGroq;
