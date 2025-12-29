import { StoreType } from '../types';

// Uses OpenAI Chat Completions to recommend useful columns for a store dataset.
export const suggestColumns = async (store: StoreType, headers: string[]): Promise<string[]> => {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    console.warn("OPENAI_API_KEY not found. Skipping AI suggestion.");
    return headers;
  }

  const systemPrompt = `
    You are a data engineer specializing in Korean department store data processing.
    Return a JSON object with the key "recommendedColumns" as an array of column names to KEEP.
    Only include columns that exist in the provided list. Prefer dates, branch names, product names,
    quantities, sales amounts, customer IDs, and category/category-path information.
  `;

  const userPrompt = `
    Store: ${store}
    Available Columns: ${JSON.stringify(headers)}
  `;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt.trim() },
          { role: "user", content: userPrompt.trim() },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI request failed with status ${response.status}`);
    }

    const json = await response.json();
    const content = json?.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error("OpenAI response did not contain message content.");
    }

    const parsed = JSON.parse(content);
    const suggested = Array.isArray(parsed?.recommendedColumns) ? parsed.recommendedColumns : [];
    const validated = suggested.filter((col: string) => headers.includes(col));

    return validated.length > 0 ? validated : headers;
  } catch (error) {
    console.error("OpenAI suggestion failed:", error);
    return headers; // Fallback to all columns on failure
  }
};
