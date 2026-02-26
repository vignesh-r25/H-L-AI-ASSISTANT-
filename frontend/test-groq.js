import Groq from 'groq-sdk';
import dotenv from 'dotenv';
dotenv.config();

const apiKey = process.env.VITE_GROQ_API_KEY;

if (!apiKey) {
    console.error("Missing VITE_GROQ_API_KEY in .env");
    process.exit(1);
}

const groq = new Groq({ apiKey });

async function test() {
    console.log("Testing Groq API with key:", apiKey.substring(0, 10) + "...");
    try {
        const completion = await groq.chat.completions.create({
            messages: [{ role: "user", content: "Hello" }],
            model: "llama-3.3-70b-versatile",
        });
        console.log("Success! Response:", completion.choices[0]?.message?.content);
    } catch (error) {
        console.error("Error caught:", error.message);
        if (error.response) {
            console.error("Status:", error.response.status);
            console.error("Data:", error.response.data);
        }
    }
}

test();
