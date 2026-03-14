/**
 * Initialize Groq client (Stubbed for compatibility since keys are now in the backend)
 */
export const initGroq = () => {
    return true;
};

/**
 * Generate response securely using the backend proxy
 */
export const generateResponse = async (prompt: string, context?: string, signal?: AbortSignal): Promise<string> => {
    try {
        console.log(`[AI-Service] Proxy: Attempting secure generation...`);

        const response = await fetch('/api/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ prompt, context }),
            signal
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || `HTTP error! status: ${response.status}`);
        }

        if (data.response) {
            return data.response;
        }

        throw new Error("Empty response from Backend Proxy");

    } catch (error: any) {
        if (error.name === "AbortError") return "Request cancelled.";

        console.error(`[AI-Service] Generation Error:`, error);

        let errorMsg = error.message || "Unknown Error";
        if (errorMsg.includes("429") || errorMsg.includes("Rate limit")) {
            errorMsg = "Rate limit reached (Try again in a minute)";
        } else if (errorMsg.includes("Failed to fetch") || errorMsg.includes("Network")) {
            errorMsg = "Network Error (Please check your internet or VPN settings)";
        }

        return `AI Service Error: Generation failed (${errorMsg}).`;
    }
};

// Compatibility aliases for the rest of the app
export const initGemini = initGroq;
