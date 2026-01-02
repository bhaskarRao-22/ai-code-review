import { chatWithLLM } from "./llmProvider.js";
import { extractJson } from "../utils/extractJson.js";

async function runSimpleReview({ code, language = 'javascript', provider = 'gemini' }) {
    const systemPrompt = `
        You are a senior ${language} engineer and code reviewer.
        You must respond STRICTLY in JSON only.
        No markdown, no backticks, no comments, no extra keys.
        `.trim();

    const userPrompt = `
        Review the following ${language} code.

        Do three things:

        1) List syntax or obvious errors (undefined variables, unreachable code, wrong function calls, missing imports, etc.).
        2) List code quality issues based on clean code principles (naming, long functions, duplication, bad practices).
        3) Provide a short improved/refactored version of the code.

        Rules:
            - Respond with a SINGLE JSON object only.
            - Do NOT wrap the JSON in markdown or backticks.
            - Do NOT include any text before or after the JSON.
            - Do NOT include comments inside JSON.
            - Use double quotes for all keys and string values.
            - Do NOT include trailing commas.

        Return JSON only with this exact shape:
        {
            "syntax": [{ "message": string, "lineHint": string }],
            "quality": [{ "message": string, "lineHint": string }],
            "refactoredCode": string,
            "overallSummary": string
        }

        Here is the code:

        """${code}"""
        `.trim();

    const raw = await chatWithLLM({
        provider,
        systemPrompt,
        userPrompt,
        temperature: 0.1
    })

    const jsonStr = extractJson(raw);

    if (!jsonStr) {
        // Fallback: wrap raw in a simple structure
        return {
            syntax: [],
            quality: [],
            refactoredCode: '',
            overallSummary: 'Could not parse structured JSON from model.',
            raw
        };
    }
    try {
        const parsed = JSON.parse(jsonStr);
        return parsed;
    } catch (err) {
        console.error('Failed to parse JSON from LLM:', err);
        return {
            syntax: [],
            quality: [],
            refactoredCode: '',
            overallSummary: 'Failed to parse structured JSON from model.',
            raw
        };
    }
}

export { runSimpleReview };