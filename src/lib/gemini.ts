import { GoogleGenAI } from "@google/genai";

// Goi Gemini va bat model tra ve dung JSON theo schema (JSON Schema chuan,
// subset ma Gemini ho tro: xem responseJsonSchema trong @google/genai).
export async function goiGeminiJson<T>(
  prompt: string,
  jsonSchema: object
): Promise<T> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY chưa được cấu hình. Vào Settings → Environment Variables để thêm."
    );
  }

  const ai = new GoogleGenAI({ apiKey });
  const model = process.env.GEMINI_MODEL || "gemini-flash-latest";

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseJsonSchema: jsonSchema,
    },
  });

  const text = response.text;
  if (!text) {
    throw new Error("AI không trả về kết quả hợp lệ, vui lòng thử lại");
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error("AI trả về dữ liệu không đúng định dạng JSON, vui lòng thử lại");
  }
}
