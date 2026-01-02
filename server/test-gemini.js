import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

async function listModels() {
    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        // Hum check kar rahe hain ki aapki key ko kaunse models allowed hain
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
        const data = await response.json();

        console.log("--- Available Models ---");
        if (data.models) {
            data.models.forEach(m => console.log(m.name));
        } else {
            console.log("No models found. Error Detail:", data);
        }
    } catch (e) {
        console.error("Diagnostic Failed:", e);
    }
}

listModels();