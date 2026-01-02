import dotenv from 'dotenv';

dotenv.config();
// console.log("process.env==>,", process.env)
const config = {
    port: process.env.PORT || 5000,
    nodeEnv: process.env.NODE_ENV || 'development',
    mongoUri: process.env.MONGO_URI,

    // jwt
    jwtAccessSecret: process.env.JWT_ACCESS_SECRET,
    jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
    jwtAccessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',

    // providers
    geminiApiKey: process.env.GEMINI_API_KEY,
    groqApiKey: process.env.GROQ_API_KEY,
    openaiApiKey: process.env.OPENAI_API_KEY,
    openaiModel: process.env.OPENAI_MODEL,
    // openaiTemperature: process.env.OPENAI_TEMPERATURE,
    // openaiMaxTokens: process.env.OPENAI_MAX_TOKENS,
    // openaiFrequencyPenalty: process.env.OPENAI_FREQUENCY_PENALTY,
    // openaiPresencePenalty: process.env.OPENAI_PRESENCE_PENALTY,
    // openaiTopP: process.env.OPENAI_TOP_P,
    // openaiStop: process.env.OPENAI_STOP,
    // openaiResponseFormat: process.env.OPENAI_RESPONSE_FORMAT,
    // openaiSeed: process.env.OPENAI_SEED,
    // openaiLogprobs: process.env.OPENAI_LOGPROBS,
    // openaiEcho: process.env.OPENAI_ECHO,
}

if (!config.mongoUri) {
    console.warn('⚠️ MONGO_URI is not set');
}

if (!config.geminiApiKey) {
    console.warn('⚠️ Warning: GEMINI_API_KEY is not set. Gemini provider will not work.');
}

if (!config.groqApiKey) {
    console.warn('⚠️ Warning: GROQ_API_KEY is not set. Groq provider will not work.');
}

if (!config.openaiApiKey) {
    console.warn('ℹ️ Info: OPENAI_API_KEY is not set. OpenAI provider will be unavailable.');
}

export { config };