import type { NextApiRequest, NextApiResponse } from "next";

/**
 * Calculate confidence score for AI responses
 * Based on:
 * - Knowledge match quality
 * - Source availability
 * - Answer completeness
 */
export function calculateConfidence(params: {
  knowledgeMatches: number;
  hasExactMatch: boolean;
  sourceType: string | null;
  answerLength: number;
}): number {
  let confidence = 0.5; // Base confidence

  // Knowledge match boost
  if (params.hasExactMatch) {
    confidence += 0.3;
  } else if (params.knowledgeMatches > 0) {
    confidence += 0.1 * Math.min(params.knowledgeMatches, 3);
  }

  // Source quality boost
  if (params.sourceType === "knowledge_base") {
    confidence += 0.15;
  } else if (params.sourceType === "website") {
    confidence += 0.1;
  } else if (params.sourceType === "document") {
    confidence += 0.1;
  }

  // Answer completeness
  if (params.answerLength > 100) {
    confidence += 0.05;
  }

  // Cap at 1.0
  return Math.min(confidence, 1.0);
}

export function shouldAnswerWithConfidence(confidence: number): boolean {
  // Don't answer if confidence is below 40%
  return confidence >= 0.4;
}

export function getLowConfidenceFallback(): string {
  return "I'm not entirely sure about that. Let me connect you with someone from our team who can give you a definitive answer. Could you share your email or phone number so we can reach out?";
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { knowledgeMatches, hasExactMatch, sourceType, answerLength } = req.body;

    const confidence = calculateConfidence({
      knowledgeMatches,
      hasExactMatch,
      sourceType,
      answerLength,
    });

    const shouldAnswer = shouldAnswerWithConfidence(confidence);

    return res.status(200).json({
      confidence,
      shouldAnswer,
      fallback: shouldAnswer ? null : getLowConfidenceFallback(),
    });
  } catch (error) {
    console.error("Confidence calculation error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}