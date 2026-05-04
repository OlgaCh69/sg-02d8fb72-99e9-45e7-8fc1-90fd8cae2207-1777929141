import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/integrations/supabase/client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const {
      conversationId,
      visitorProfileId,
      appointmentType,
      scheduledAt,
      duration,
      notes,
    } = req.body;

    if (!conversationId || !visitorProfileId || !scheduledAt) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Create appointment
    const { data: appointment, error } = await supabase
      .from("appointments")
      .insert({
        conversation_id: conversationId,
        visitor_profile_id: visitorProfileId,
        appointment_type: appointmentType || "consultation",
        scheduled_at: scheduledAt,
        duration_minutes: duration || 30,
        notes: notes || null,
        status: "pending",
      })
      .select()
      .single();

    if (error) {
      console.error("Appointment creation error:", error);
      return res.status(500).json({ error: "Failed to create appointment" });
    }

    // Update lead score (+30 for booking)
    await supabase.rpc("increment_lead_score", {
      profile_id: visitorProfileId,
      score_change: 30,
    });

    // Track analytics event
    await supabase.from("analytics_events").insert({
      visitor_profile_id: visitorProfileId,
      conversation_id: conversationId,
      event_name: "appointment_booked",
      metadata: { appointment_id: appointment.id, scheduled_at: scheduledAt },
    });

    // Send notification
    await supabase.from("notifications").insert({
      notification_type: "booking",
      visitor_profile_id: visitorProfileId,
      conversation_id: conversationId,
      title: "New Appointment Booked",
      message: `${appointmentType || "Consultation"} scheduled for ${new Date(scheduledAt).toLocaleString()}`,
      metadata: { appointment_id: appointment.id },
      status: "pending",
    });

    return res.status(200).json({
      success: true,
      appointment,
    });
  } catch (error) {
    console.error("Appointment booking error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}