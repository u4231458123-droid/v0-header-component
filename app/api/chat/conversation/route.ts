import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const { companyId, participant1Type, participant1Id, participant2Type, participant2Id, bookingId } = await request.json()

    if (!companyId || !participant1Type || !participant1Id || !participant2Type || !participant2Id) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
    }

    const supabase = await createClient()

    // Prüfe ob Konversation existiert
    const { data: existing } = await supabase
      .from("chat_conversations")
      .select("id")
      .eq("company_id", companyId)
      .or(
        `and(participant_1_type.eq.${participant1Type},participant_1_id.eq.${participant1Id},participant_2_type.eq.${participant2Type},participant_2_id.eq.${participant2Id}),and(participant_1_type.eq.${participant2Type},participant_1_id.eq.${participant2Id},participant_2_type.eq.${participant1Type},participant_2_id.eq.${participant1Id})`,
      )
      .eq("booking_id", bookingId || null)
      .maybeSingle()

    if (existing) {
      return NextResponse.json({ conversationId: existing.id })
    }

    // Erstelle neue Konversation
    const { data: newConv, error } = await supabase
      .from("chat_conversations")
      .insert({
        company_id: companyId,
        participant_1_type: participant1Type,
        participant_1_id: participant1Id,
        participant_2_type: participant2Type,
        participant_2_id: participant2Id,
        booking_id: bookingId || null,
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating conversation:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ conversationId: newConv.id })
  } catch (error: any) {
    console.error("Error in conversation route:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}

