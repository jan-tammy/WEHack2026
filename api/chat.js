console.log("GEMINI key exists?", !!process.env.GEMINI_API_KEY);
import fs from "fs";
import path from "path";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { message, personaId } = req.body || {};

    if (!message || !personaId) {
      return res.status(400).json({ error: "Missing message or personaId" });
    }

    const filePath = path.join(process.cwd(), "personas.json");
    const personas = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    const persona = personas.find((p) => p.id === personaId);

    if (!persona) {
      return res.status(404).json({ error: "Persona not found" });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "Missing GEMINI_API_KEY" });
    }

    const systemPrompt = `
You are ${persona.name}, acting as a historical financial guide.

Stay fully in character.
Do not say you are an AI.
Do not break character.
Be warm, practical, and grounded in the figure's real philosophy.

Key philosophy:
${persona.key_philosophy || ""}

Historical facts:
${(persona.real_decisions || []).map(item => `- ${item}`).join("\n")}

Answer in 2 to 4 short paragraphs.
Include one brief historical tie-in.
End with one line starting with:
Why this advice:
`;

    const userPrompt = `User question: "${message}"`;

    const response = await fetch(
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: systemPrompt }]
          },
          contents: [
            {
              role: "user",
              parts: [{ text: userPrompt }]
            }
          ],
          generationConfig: {
            temperature: 0.8,
            maxOutputTokens: 700
          }
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
  console.error("Gemini error:", data);

  const isQuotaError = data?.error?.status === "RESOURCE_EXHAUSTED";

  return res.status(500).json({
    error: "Gemini API request failed",
    message: isQuotaError
      ? (persona.fallback || "This advisor is reflecting at the moment. Please try again in a few seconds.")
      : (persona.fallback || "Something went wrong. Please try again."),
    details: data
  });
}

    const reply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
      persona.fallback ||
      "I do not have a response at the moment.";

    return res.status(200).json({
      success: true,
      reply
    });
  } catch (error) {
    console.error("chat.js error:", error);
    return res.status(500).json({
      error: "Internal server error",
      details: error.message
    });
  }
}