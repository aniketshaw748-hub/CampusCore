import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, userId, currentTone } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Supabase configuration missing");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get last 5-10 messages for memory extraction
    const recentMessages = messages.slice(-10);
    
    if (recentMessages.length < 2) {
      return new Response(JSON.stringify({ success: true, extracted: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Extract memories using AI
    const extractionPrompt = `You are a memory extraction system for an academic AI assistant. Analyze the following conversation and extract ONLY long-term academic memories that would be useful for future conversations.

Extract memories in these categories:
- preference: Learning style preferences (e.g., "Prefers step-by-step explanations", "Likes visual examples")
- weakness: Academic weak areas (e.g., "Struggles with recursion concepts", "Weak in calculus integration")
- goal: Academic goals (e.g., "Preparing for GATE exam", "Focusing on placements")
- behavior: Study behaviors (e.g., "Studies late at night", "Prefers short study sessions")
- context: Important context (e.g., "Has project deadline next week", "Taking 6 subjects this semester")

Rules:
1. ONLY extract academically relevant information
2. Each memory must be 1-2 lines maximum
3. Do not extract temporary information or specific question content
4. Do not extract emotional states (those are handled separately)
5. Return ONLY a JSON array with objects having "type" and "content" fields
6. If no memories worth storing, return empty array []

Conversation:
${recentMessages.map((m: any) => `${m.role}: ${m.content}`).join('\n')}

Return ONLY valid JSON array, no other text:`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "user", content: extractionPrompt }],
      }),
    });

    if (!response.ok) {
      console.error("AI extraction failed:", response.status);
      return new Response(JSON.stringify({ success: false, error: "Extraction failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const extractedText = data.choices?.[0]?.message?.content || "[]";
    
    // Parse the extracted memories
    let memories: { type: string; content: string }[] = [];
    try {
      // Clean the response - remove markdown code blocks if present
      const cleanedText = extractedText.replace(/```json\n?|\n?```/g, '').trim();
      memories = JSON.parse(cleanedText);
    } catch (e) {
      console.error("Failed to parse memories:", extractedText);
      memories = [];
    }

    // Store new memories (avoiding duplicates)
    let storedCount = 0;
    for (const memory of memories) {
      if (!memory.type || !memory.content) continue;
      
      // Check for similar existing memory
      const { data: existing } = await supabase
        .from('student_memories')
        .select('id, content')
        .eq('user_id', userId)
        .eq('memory_type', memory.type)
        .ilike('content', `%${memory.content.substring(0, 30)}%`);

      if (!existing || existing.length === 0) {
        const { error } = await supabase
          .from('student_memories')
          .insert({
            user_id: userId,
            memory_type: memory.type,
            content: memory.content,
          });
        
        if (!error) storedCount++;
      }
    }

    // Store tone if provided
    if (currentTone && userId) {
      await supabase
        .from('tone_history')
        .insert({
          user_id: userId,
          tone: currentTone,
        });
    }

    return new Response(JSON.stringify({ success: true, extracted: storedCount }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Memory extraction error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
