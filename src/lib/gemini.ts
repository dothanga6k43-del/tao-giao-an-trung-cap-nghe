import { GoogleGenAI, ApiError } from "@google/genai";

const SO_LAN_THU_LAI = 2;
const CHO_GIUA_CAC_LAN_MS = [2000, 5000];

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Goi Gemini va bat model tra ve dung JSON theo schema (JSON Schema chuan,
// subset ma Gemini ho tro: xem responseJsonSchema trong @google/genai).
// Gemini free tier hay bi 503 (qua tai) hoac 429 (rate limit) tam thoi nen
// tu dong thu lai vai lan truoc khi bao loi cho nguoi dung.
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

  let loiCuoi: unknown;

  for (let lan = 0; lan <= SO_LAN_THU_LAI; lan++) {
    try {
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
    } catch (e) {
      loiCuoi = e;
      const coTheThuLai =
        e instanceof ApiError && (e.status === 503 || e.status === 429);
      if (!coTheThuLai || lan === SO_LAN_THU_LAI) break;
      await sleep(CHO_GIUA_CAC_LAN_MS[lan] ?? 15000);
    }
  }

  if (loiCuoi instanceof ApiError && (loiCuoi.status === 503 || loiCuoi.status === 429)) {
    throw new Error(
      "Gemini đang quá tải hoặc vượt giới hạn miễn phí, đã thử lại nhiều lần nhưng chưa được. Vui lòng đợi một chút rồi thử lại."
    );
  }
  throw loiCuoi;
}
