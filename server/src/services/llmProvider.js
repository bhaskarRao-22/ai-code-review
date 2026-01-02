import { config } from '../config/env.js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { OpenAI } from 'openai';

let geminiClient = null;

function getGeminiClient() {
    if (!geminiClient) {
        if (!config.geminiApiKey) throw new Error('GEMINI_API_KEY is missing');
        geminiClient = new GoogleGenerativeAI(config.geminiApiKey);
    }
    return geminiClient;
}

// ---------- Gemini Implementation ----------
async function chatWithGemini({ systemPrompt, userPrompt, temperature }) {
    const genAI = getGeminiClient();

    try {
        const model = genAI.getGenerativeModel({
            model: "gemini-flash-latest"
        });

        const fullPrompt = `System: ${systemPrompt}\n\nUser: ${userPrompt}`;

        const result = await model.generateContent({
            contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
            generationConfig: {
                temperature: temperature || 0.1,
                responseMimeType: "application/json",
            },
        });

        const response = await result.response;
        return response.text();

    } catch (error) {
        if (error.status === 429) {
            console.error("QUOTA ERROR: Please wait 1 minute.");
            return JSON.stringify({
                syntax: [],
                quality: [],
                refactoredCode: "",
                overallSummary: "Limit reached. Please try again after a short break.",
                message: "Limit reached. Please try again after a short break.",
            });
        }
        console.error("Gemini Error Details:", error.message);
        throw error;
    }
}


// ---------- Groq Implementation ----------
async function chatWithGroq({ systemPrompt, userPrompt, temperature }) {
    if (!config.groqApiKey) {
        throw new Error("GROQ_API_KEY is missing");
    }

    const groq = new OpenAI({
        apiKey: config.groqApiKey,
        baseURL: "https://api.groq.com/openai/v1"
    });

    try {
        const response = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
            ],
            temperature: temperature || 0.2,
            response_format: { type: "json_object" }
        });

        return response.choices[0]?.message?.content;
    } catch (error) {
        console.error("Groq API Error:", error.message);
        throw error;
    }
}

// ---------- ChatGPT Implementation ----------
async function chatWithOpenAI({ systemPrompt, userPrompt, model, temperature }) {
    if (!config.openaiApiKey) throw new Error('OPENAI_API_KEY missing');
    const openai = new OpenAI({ apiKey: config.openaiApiKey });
    const response = await openai.chat.completions.create({
        model: model || 'gpt-4o-mini',
        messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
        ],
        temperature
    });
    return response.choices[0].message.content;
}


export async function chatWithLLM({ provider = 'gemini', systemPrompt, userPrompt, model, temperature = 0.2 }) {
    if (provider === 'openai') {
        return chatWithOpenAI({ systemPrompt, userPrompt, model, temperature });
    }
    if (provider === "groq") {
        return chatWithGroq({ systemPrompt, userPrompt, temperature });
    }
    return chatWithGemini({ systemPrompt, userPrompt, temperature });
}