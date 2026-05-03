import { supabase } from "@/integrations/supabase/client";

export interface UserProfile {
  id: string;
  email?: string;
  phone?: string;
  full_name?: string;
  visitor_id?: string;
  lead_status: "hot" | "warm" | "cold" | "none";
  lead_score: number;
  preferences: Record<string, any>;
  tags: string[];
  notes?: string;
  total_conversations: number;
}

export interface ConversationMemory {
  summary: string;
  intent?: string;
  key_points: string[];
  extracted_data: Record<string, any>;
  sentiment?: "positive" | "neutral" | "negative";
}

/**
 * Find or create user profile based on available identifiers
 */
export async function findOrCreateUserProfile(params: {
  visitorId?: string;
  email?: string;
  phone?: string;
  fullName?: string;
}): Promise<UserProfile | null> {
  try {
    // Try to find existing profile by email or phone or visitor_id
    let query = supabase.from("user_profiles").select("*");
    
    if (params.email) {
      query = query.eq("email", params.email);
    } else if (params.phone) {
      query = query.eq("phone", params.phone);
    } else if (params.visitorId) {
      query = query.eq("visitor_id", params.visitorId);
    } else {
      return null;
    }

    const { data: existingProfile } = await query.single();

    if (existingProfile) {
      // Update last seen and merge any new data
      const updates: any = { last_seen_at: new Date().toISOString() };
      if (params.email && !existingProfile.email) updates.email = params.email;
      if (params.phone && !existingProfile.phone) updates.phone = params.phone;
      if (params.fullName && !existingProfile.full_name) updates.full_name = params.fullName;

      await supabase
        .from("user_profiles")
        .update(updates)
        .eq("id", existingProfile.id);

      return { 
        ...existingProfile, 
        ...updates,
        lead_status: existingProfile.lead_status as "hot" | "warm" | "cold" | "none",
        preferences: existingProfile.preferences as Record<string, any>,
        tags: existingProfile.tags as string[]
      };
    }

    // Create new profile
    const { data: newProfile, error } = await supabase
      .from("user_profiles")
      .insert({
        email: params.email,
        phone: params.phone,
        full_name: params.fullName,
        visitor_id: params.visitorId,
        total_conversations: 0,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating user profile:", error);
      return null;
    }

    return newProfile ? {
      ...newProfile,
      lead_status: newProfile.lead_status as "hot" | "warm" | "cold" | "none",
      preferences: newProfile.preferences as Record<string, any>,
      tags: newProfile.tags as string[]
    } : null;
  } catch (error) {
    console.error("Error in findOrCreateUserProfile:", error);
    return null;
  }
}

/**
 * Get user's conversation history (summarized for efficiency)
 */
export async function getUserMemory(userProfileId: string): Promise<{
  recentSummaries: ConversationMemory[];
  userAttributes: Record<string, string>;
  profile: UserProfile | null;
}> {
  try {
    // Get user profile
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("id", userProfileId)
      .single();

    // Get recent conversation summaries (last 5)
    const { data: summaries } = await supabase
      .from("conversation_summaries")
      .select("*")
      .eq("user_profile_id", userProfileId)
      .order("created_at", { ascending: false })
      .limit(5);

    // Get user attributes
    const { data: attributes } = await supabase
      .from("user_attributes")
      .select("*")
      .eq("user_profile_id", userProfileId);

    const attributesMap: Record<string, string> = {};
    attributes?.forEach((attr) => {
      attributesMap[attr.attribute_key] = attr.attribute_value || "";
    });

    const formattedSummaries: ConversationMemory[] = (summaries || []).map(s => ({
      summary: s.summary,
      intent: s.intent || undefined,
      key_points: (s.key_points as string[]) || [],
      extracted_data: (s.extracted_data as Record<string, any>) || {},
      sentiment: (s.sentiment as "positive" | "neutral" | "negative") || undefined,
    }));

    return {
      recentSummaries: formattedSummaries,
      userAttributes: attributesMap,
      profile: profile ? {
        ...profile,
        lead_status: profile.lead_status as "hot" | "warm" | "cold" | "none",
        preferences: profile.preferences as Record<string, any>,
        tags: profile.tags as string[]
      } : null,
    };
  } catch (error) {
    console.error("Error getting user memory:", error);
    return { recentSummaries: [], userAttributes: {}, profile: null };
  }
}

/**
 * Generate conversation summary using AI
 */
export async function generateConversationSummary(
  conversationId: string,
  messages: Array<{ role: string; content: string }>
): Promise<ConversationMemory | null> {
  try {
    // Simple rule-based summarization (you can replace with OpenAI later)
    const userMessages = messages.filter((m) => m.role === "user");
    const lastUserMessage = userMessages[userMessages.length - 1]?.content || "";

    // Extract intent from keywords
    let intent = "general_inquiry";
    const lowerContent = lastUserMessage.toLowerCase();
    if (lowerContent.includes("price") || lowerContent.includes("cost")) intent = "pricing_inquiry";
    if (lowerContent.includes("demo") || lowerContent.includes("trial")) intent = "demo_request";
    if (lowerContent.includes("problem") || lowerContent.includes("issue")) intent = "support_request";
    if (lowerContent.includes("buy") || lowerContent.includes("purchase")) intent = "purchase_intent";

    // Extract key points
    const keyPoints: string[] = [];
    if (userMessages.length > 0) {
      keyPoints.push(`Asked about: ${lastUserMessage.substring(0, 100)}`);
    }

    // Sentiment (simple)
    const sentiment = lowerContent.includes("thanks") || lowerContent.includes("great") ? "positive" : "neutral";

    const summary = `User had ${messages.length} message exchange. Primary intent: ${intent}`;

    return {
      summary,
      intent,
      key_points: keyPoints,
      extracted_data: {},
      sentiment,
    };
  } catch (error) {
    console.error("Error generating summary:", error);
    return null;
  }
}

/**
 * Store conversation summary
 */
export async function storeConversationSummary(
  conversationId: string,
  userProfileId: string,
  memory: ConversationMemory
): Promise<void> {
  try {
    await supabase.from("conversation_summaries").insert({
      conversation_id: conversationId,
      user_profile_id: userProfileId,
      summary: memory.summary,
      intent: memory.intent,
      key_points: memory.key_points,
      extracted_data: memory.extracted_data,
      sentiment: memory.sentiment,
    });

    // Mark conversation as summarized
    await supabase
      .from("conversations")
      .update({
        needs_summary: false,
        summary_generated_at: new Date().toISOString(),
      })
      .eq("id", conversationId);

    // Update user profile conversation count
    await supabase.rpc("increment_user_conversations", { profile_id: userProfileId });
  } catch (error) {
    console.error("Error storing summary:", error);
  }
}

/**
 * Update user attributes
 */
export async function updateUserAttribute(
  userProfileId: string,
  key: string,
  value: string,
  source?: string
): Promise<void> {
  try {
    await supabase
      .from("user_attributes")
      .upsert({
        user_profile_id: userProfileId,
        attribute_key: key,
        attribute_value: value,
        source: source || "ai_conversation",
        updated_at: new Date().toISOString(),
      });
  } catch (error) {
    console.error("Error updating user attribute:", error);
  }
}

/**
 * Build memory context for AI prompt
 */
export function buildMemoryContext(memory: {
  recentSummaries: ConversationMemory[];
  userAttributes: Record<string, string>;
  profile: UserProfile | null;
}): string {
  if (!memory.profile) return "";

  let context = "";

  // User profile info
  if (memory.profile.full_name) {
    context += `User name: ${memory.profile.full_name}\n`;
  }

  if (memory.profile.lead_status && memory.profile.lead_status !== "none") {
    context += `Lead status: ${memory.profile.lead_status.toUpperCase()}\n`;
  }

  // Past conversation summaries
  if (memory.recentSummaries.length > 0) {
    context += `\nPrevious conversations:\n`;
    memory.recentSummaries.forEach((summary, idx) => {
      context += `${idx + 1}. ${summary.summary} (Intent: ${summary.intent})\n`;
    });
  }

  // User preferences/attributes
  if (Object.keys(memory.userAttributes).length > 0) {
    context += `\nKnown preferences:\n`;
    Object.entries(memory.userAttributes).forEach(([key, value]) => {
      context += `- ${key}: ${value}\n`;
    });
  }

  return context.trim();
}