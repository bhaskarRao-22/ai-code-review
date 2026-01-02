// src/utils/extractJson.js

/**
 * LLM ke response se JSON nikalne ke liye robust helper
 * - ```json fences hataata hai
 * - first '{' se last '}' tak ka slice leta hai
 * - trailing commas cleanup karta hai
 */
export function extractJson(text) {
    if (!text) return null;
  
    let cleaned = text.trim();
  
    // 1) Agar ``` se start ho raha hai (markdown code fence)
    if (cleaned.startsWith('```')) {
      // first line remove (```json ya ```)
      const firstNewline = cleaned.indexOf('\n');
      if (firstNewline !== -1) {
        cleaned = cleaned.slice(firstNewline + 1);
      }
  
      // last ``` hata do
      const lastFence = cleaned.lastIndexOf('```');
      if (lastFence !== -1) {
        cleaned = cleaned.slice(0, lastFence);
      }
      cleaned = cleaned.trim();
    }
  
    // 2) first '{' se last '}' tak ka portion nikaalo
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    if (firstBrace === -1 || lastBrace === -1) {
      return null;
    }
  
    let jsonStr = cleaned.slice(firstBrace, lastBrace + 1);
  
    // 3) Pehle direct parse try karo
    try {
      JSON.parse(jsonStr);
      return jsonStr;
    } catch {
      // ignore, neeche cleanup karenge
    }
  
    // 4) Simple cleanup: trailing commas before } ya ]
    jsonStr = jsonStr.replace(/,\s*([}\]])/g, '$1');
  
    // 5) Ek aur parse try karne layak string return karo
    return jsonStr;
  }
  