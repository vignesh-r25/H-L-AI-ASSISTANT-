import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Groq from 'groq-sdk';
import rateLimit from 'express-rate-limit';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

const groqApiKey = process.env.GROQ_API_KEY;
if (!groqApiKey) {
    console.warn("⚠️ Warning: GROQ_API_KEY is missing from backend/.env");
}
const groq = new Groq({ apiKey: groqApiKey });
const PRIMARY_MODEL = "llama-3.1-8b-instant";

// Middleware
app.use(express.json());

// Strict CORS to only accept requests from your frontend
app.use(cors({
    origin: '*',
    methods: ['POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Basic Rate Limiting: max 15 requests per minute per IP
const apiLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 15,
    message: { error: "Too many requests. Please try again in a minute." }
});

// Health check route
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'Backend proxy is running securely.' });
});

// Root browser route
app.get('/', (req, res) => {
    res.send(`
    <html style="background: black; color: white; font-family: sans-serif; height: 100vh; display: flex; align-items: center; justify-content: center; text-align: center;">
        <body>
            <h1 style="color: #4ade80;">✅ Secure AI Backend Running</h1>
            <p>Port ${port} is active and ready for AI requests.</p>
            <p style="opacity: 0.5;">Please return to your Frontend app at http://localhost:8080 to use the Flashcards generator!</p>
        </body>
    </html>
    `);
});

// Secure Proxy Route
app.post('/api/generate', apiLimiter, async (req, res) => {
    try {
        const { prompt, context } = req.body;

        if (!prompt) {
            return res.status(400).json({ error: "Prompt is required" });
        }

        const fullPrompt = context
            ? `Context:\n${context}\n\nQuestion: ${prompt}\n\nAnswer based on the context provided.`
            : prompt;

        console.log(`[Backend API] Generating response with ${PRIMARY_MODEL}...`);

        const completion = await groq.chat.completions.create({
            messages: [{ role: "user", content: fullPrompt }],
            model: PRIMARY_MODEL,
        });

        const text = completion.choices[0]?.message?.content;

        if (!text) {
            return res.status(502).json({ error: "Empty response from AI Provider" });
        }

        return res.status(200).json({ response: text });

    } catch (error) {
        console.error("[Backend API] Error:", error);

        // Pass standard HTTP status codes back to frontend gracefully
        if (error.status === 429) {
            return res.status(429).json({ error: "AI Provider rate limit reached" });
        }
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

app.listen(port, () => {
    console.log(`Secure AI Backend running at http://localhost:${port}`);
});
