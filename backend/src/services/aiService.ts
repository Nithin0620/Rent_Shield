import { AppError } from "../utils/AppError";
import { logger } from "../utils/logger";

const model = () => process.env.GROQ_MODEL || "llama3-8b-8192";

interface AiAnalysisInput {
  reason: string;
  moveInEvidence: Array<{ fileUrl: string; mimeType: string; uploadedAt: string }>;
  moveOutEvidence: Array<{ fileUrl: string; mimeType: string; uploadedAt: string }>;
}

export interface AiAnalysisResult {
  damageDetected: boolean;
  damageSummary: string;
  severityLevel: "low" | "medium" | "high";
  confidenceScore: number;
  recommendedPayoutPercentage: number;
}

const mockResult = (): AiAnalysisResult => ({
  damageDetected: false,
  damageSummary: "Mock analysis – no damage detected",
  severityLevel: "low",
  confidenceScore: 0.75,
  recommendedPayoutPercentage: 100
});

const buildPrompt = (input: AiAnalysisInput) => {
  return `You are an impartial inspection analyst. Compare move-in vs move-out evidence and the dispute reason.\n\nDispute reason: ${input.reason}\n\nMove-in evidence (URLs):\n${input.moveInEvidence
    .map((item, index) => `${index + 1}. ${item.fileUrl} (${item.mimeType}) at ${item.uploadedAt}`)
    .join("\n")}\n\nMove-out evidence (URLs):\n${input.moveOutEvidence
    .map((item, index) => `${index + 1}. ${item.fileUrl} (${item.mimeType}) at ${item.uploadedAt}`)
    .join("\n")}\n\nReturn ONLY valid JSON matching this schema:\n{\n  \"damageDetected\": boolean,\n  \"damageSummary\": string,\n  \"severityLevel\": \"low\"|\"medium\"|\"high\",\n  \"confidenceScore\": number,\n  \"recommendedPayoutPercentage\": number\n}`;
};

const parseResult = (content: string): AiAnalysisResult => {
  let parsed: AiAnalysisResult;
  try {
    parsed = JSON.parse(content);
  } catch {
    throw new AppError("AI response invalid JSON", 502);
  }

  if (
    typeof parsed.damageDetected !== "boolean" ||
    typeof parsed.damageSummary !== "string" ||
    !["low", "medium", "high"].includes(parsed.severityLevel) ||
    typeof parsed.confidenceScore !== "number" ||
    typeof parsed.recommendedPayoutPercentage !== "number"
  ) {
    throw new AppError("AI response schema invalid", 502);
  }

  parsed.confidenceScore = Math.min(Math.max(parsed.confidenceScore, 0), 1);
  parsed.recommendedPayoutPercentage = Math.min(
    Math.max(parsed.recommendedPayoutPercentage, 0),
    100
  );

  return parsed;
};

export const runAiReview = async (input: AiAnalysisInput) => {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return { result: mockResult(), latencyMs: 0, usage: null };
  }

  const prompt = buildPrompt(input);

  const controller = new AbortController();
  const timeoutMs = Number(process.env.AI_TIMEOUT_MS || 20000);
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  const start = Date.now();
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: model(),
      messages: [
        { role: "system", content: "You return only strict JSON. No prose." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.2
    }),
    signal: controller.signal
  });
  clearTimeout(timeout);
  const latencyMs = Date.now() - start;

  if (!response.ok) {
    throw new AppError("AI review failed", 502);
  }

  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
    usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number };
    model?: string;
  };

  const content = payload.choices?.[0]?.message?.content || "";
  const usage = payload.usage;

  logger.info({
    event: "AI_REVIEW",
    model: payload.model,
    latencyMs,
    promptTokens: usage?.prompt_tokens,
    completionTokens: usage?.completion_tokens,
    totalTokens: usage?.total_tokens
  });

  return { result: parseResult(content), latencyMs, usage };
};
