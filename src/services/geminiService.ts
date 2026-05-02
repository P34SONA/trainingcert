import { GoogleGenAI, Type } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

let ai: any = null;

export function getGemini() {
  if (!ai) {
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is missing. Please set it in your secrets.");
    }
    ai = new GoogleGenAI({ apiKey });
  }
  return ai;
}

export async function analyzeCertificate(fileBase64: string, mimeType: string) {
  const gemini = getGemini();

  const prompt = `Analyze this certificate/document. 
  Extract the following information in JSON format:
  1. Recipient Name
  2. Course or Training Name
  3. Issue Date
  4. Issuing Organization
  5. A summary of what the certificate represents.
  6. A validity score (0-100) based on authenticity indicators visible in the document.

  If it's not a certificate, flag it.`;

  const result = await gemini.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: {
      parts: [
        {
          inlineData: {
            mimeType,
            data: fileBase64.split(',')[1] || fileBase64,
          },
        },
        { text: prompt },
      ],
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          recipient_name: { type: Type.STRING },
          course_name: { type: Type.STRING },
          issue_date: { type: Type.STRING },
          issuer: { type: Type.STRING },
          summary: { type: Type.STRING },
          validity_score: { type: Type.NUMBER },
          is_valid_certificate: { type: Type.BOOLEAN }
        },
        required: ["recipient_name", "course_name", "issue_date", "issuer", "summary", "validity_score", "is_valid_certificate"]
      }
    }
  });

  try {
    return JSON.parse(result.text);
  } catch (e) {
    console.error("Failed to parse Gemini response:", result.text);
    throw new Error("Failed to analyze document");
  }
}
