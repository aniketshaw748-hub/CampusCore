import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Detect tone from message
function detectTone(message: string): 'confused' | 'frustrated' | 'neutral' | 'confident' {
  const lowerMsg = message.toLowerCase();
  
  // Confused indicators
  const confusedPatterns = [
    /i don'?t understand/i,
    /what does .+ mean/i,
    /can you explain/i,
    /i'?m confused/i,
    /what is/i,
    /how does/i,
    /\?{2,}/,
    /please help/i,
    /not sure/i,
    /lost/i,
  ];
  
  // Frustrated indicators
  const frustratedPatterns = [
    /still don'?t get/i,
    /this is hard/i,
    /i give up/i,
    /too difficult/i,
    /can'?t understand/i,
    /makes no sense/i,
    /ugh/i,
    /frustrated/i,
    /impossible/i,
  ];
  
  // Confident indicators
  const confidentPatterns = [
    /i understand/i,
    /i know/i,
    /i got it/i,
    /makes sense/i,
    /easy/i,
    /simple/i,
    /i can do/i,
    /no problem/i,
  ];

  for (const pattern of frustratedPatterns) {
    if (pattern.test(lowerMsg)) return 'frustrated';
  }
  
  for (const pattern of confusedPatterns) {
    if (pattern.test(lowerMsg)) return 'confused';
  }
  
  for (const pattern of confidentPatterns) {
    if (pattern.test(lowerMsg)) return 'confident';
  }
  
  return 'neutral';
}

// Get tone-based response style
function getToneGuidance(tone: string, recentTones: string[]): string {
  // Check if user has been frustrated/confused for multiple messages
  const frustratedCount = recentTones.filter(t => t === 'frustrated').length;
  const confusedCount = recentTones.filter(t => t === 'confused').length;
  
  if (frustratedCount >= 2) {
    return `The student seems frustrated. Be extra patient, break things down into very small steps, and offer encouragement. Use phrases like "Let's take this slowly" or "You're making progress".`;
  }
  
  if (tone === 'confused' || confusedCount >= 2) {
    return `The student seems confused. Provide slower, simpler explanations. Use more examples. Be reassuring and patient. Start with the basics before advancing.`;
  }
  
  if (tone === 'frustrated') {
    return `The student seems frustrated. Acknowledge their effort, simplify your explanation, and offer a different approach. Be supportive without being condescending.`;
  }
  
  if (tone === 'confident') {
    return `The student seems confident. You can be more concise and provide more advanced information. Skip basic explanations unless asked.`;
  }
  
  return '';
}

// Build exam mode system prompt
function buildExamModePrompt(examContext: any): string {
  const { exam_type, subject_name, units, marks_style, semester } = examContext;
  
  const examTypeLabels: Record<string, string> = {
    'unit_test': 'Unit Test',
    'mid_semester': 'Mid Semester Examination',
    'end_semester': 'End Semester Examination',
    'viva': 'Viva / Internal Assessment',
  };

  let prompt = `## EXAM MODE ACTIVE - STRICT ACADEMIC RESPONSE PROTOCOL

You are now in EXAM MODE for a college student preparing for their ${examTypeLabels[exam_type] || exam_type}.

### Exam Context:
- **Subject**: ${subject_name}
- **Semester**: ${semester || 'Not specified'}
- **Exam Type**: ${examTypeLabels[exam_type] || exam_type}
- **Marks Style**: ${marks_style || 'Not specified'}
${units && units.length > 0 ? `- **Syllabus Scope**: ${units.join(', ')}` : '- **Scope**: Complete syllabus'}

EXAM MODE — SYSTEM PROMPT (STRUCTURED)

Role:
You are an exam-focused academic assistant designed to optimize answers for scoring, clarity, and syllabus relevance.

1. CORE BEHAVIOR

Exam Mode does not block questions.

It reframes responses to maximize exam relevance and marks.

The goal is performance in exams, not exploration or curiosity.

2. SYLLABUS HANDLING

Prioritize questions within the selected subject and units.

If a question is outside the syllabus:

Do NOT reject or refuse.

Respond briefly.

Clearly label it as Low Exam Priority.

Redirect the student toward syllabus-relevant content.

Use phrasing like:

“This topic is not directly part of the ${subject_name} syllabus. For exam relevance, focus on: ___.”

3. INTENT-AWARE RESPONSES

Classify the user’s intent implicitly:

Conceptual (definitions, explanations)
→ Answer strictly within syllabus, exam-oriented.

Strategic (planning, revision, prioritization)
→ Allow. Keep advice concise and exam-focused.

Emotional (stress, anxiety, confusion)
→ Briefly acknowledge, then redirect to actionable exam-relevant steps.

Do NOT treat all queries as conceptual.

4. ANSWER STRUCTURE (CONDITIONAL)

Use structured formatting only when appropriate:

Definition (if the question asks for one)

Key Points (bullet points, exam-ready)

Example / Application (only if it improves scoring)

Diagram Suggestion (only if commonly expected)

Conclusion (1-line summary, optional)

Do NOT force structure for emotional or strategic queries.

5. MARKS-BASED FORMATTING

Apply formatting based on marks_style:

2 marks

2–3 sentences

Core definition and keywords

5 marks

4–5 key points

One example or application

10 marks

Introduction, body, conclusion

Diagram suggestion where relevant

Complete coverage of topic

Mixed / unspecified

Default to concise, structured, marks-oriented response

6. TONE GUIDELINES

Formal, academic, and clear

No emojis

No slang or casual language

No exaggerated praise (“Great question!”)

No scolding or rejection

Neutral, faculty-like, but human

7. CONTENT RESTRICTIONS

Prefer syllabus and faculty-provided material

No hallucinated content

No invented references

No unnecessary depth

No web-style explanations

8. PROHIBITED BEHAVIORS

Do NOT hard-reject questions

Do NOT act as a syllabus gatekeeper

Do NOT block emotional or strategic queries

Do NOT moralize, lecture, or shame

Do NOT introduce unrelated subjects

9. META RULE

When Exam Mode is active:

Answers should be shorter

Priority order:

Definitions

Likely exam questions

High-scoring content

Always bias toward time efficiency and marks

SYSTEM IDENTITY (INTERNAL)

You are an exam-oriented academic assistant that helps students perform better in exams through clarity, structure, and relevance — not restriction.`;

  return prompt;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, userId, userContext, customInstructions, memories, examMode } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Detect tone from latest user message
    const latestUserMessage = messages.filter((m: any) => m.role === 'user').pop();
    const currentTone = latestUserMessage ? detectTone(latestUserMessage.content) : 'neutral';
    
    // Get recent tones if Supabase is configured
    let recentTones: string[] = [];
    if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY && userId && userId !== 'demo-user') {
      try {
        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
        const { data: toneData } = await supabase
          .from('tone_history')
          .select('tone')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(5);
        
        if (toneData) {
          recentTones = toneData.map(t => t.tone);
        }
      } catch (e) {
        console.error("Failed to fetch tone history:", e);
      }
    }

    let systemPrompt: string;

    // Check if exam mode is active
    if (examMode && examMode.active && examMode.context) {
      // EXAM MODE - Use strict exam prompt
      systemPrompt = buildExamModePrompt(examMode.context);
      
      // Add minimal user context in exam mode
      if (userContext) {
        systemPrompt += `\n\n## Student Info:
- Name: ${userContext.fullName || 'Student'}
- Branch: ${userContext.branch || 'Not specified'}
- Semester: ${userContext.semester || 'Not specified'}`;
      }
    } else {
      // NORMAL MODE - Use regular CampusGPT prompt
      let contextInfo = "";
      
      // User context (branch, semester, name)
      if (userContext) {
        const { branch, semester, fullName } = userContext;
        if (branch || semester) {
          contextInfo += `\n\n## Current Student Context
- Student Name: ${fullName || 'Student'}
- Branch/Course: ${branch || 'Not set'}
- Semester: ${semester || 'Not set'}

Use this context to provide personalized responses. Prioritize content relevant to their branch and semester.`;
        }
      }

      // Custom instructions (only in normal mode)
      if (customInstructions) {
        if (customInstructions.aboutMe) {
          contextInfo += `\n\n## What the student wants you to know about them:
${customInstructions.aboutMe}`;
        }
        if (customInstructions.responseStyle) {
          contextInfo += `\n\n## How the student wants you to respond:
${customInstructions.responseStyle}`;
        }
      }

      // Memory summaries
      if (memories && memories.length > 0) {
        contextInfo += `\n\n## Student's Academic Profile (from memory):`;
        
        const preferences = memories.filter((m: any) => m.memory_type === 'preference');
        const weaknesses = memories.filter((m: any) => m.memory_type === 'weakness');
        const goals = memories.filter((m: any) => m.memory_type === 'goal');
        const behaviors = memories.filter((m: any) => m.memory_type === 'behavior');
        const contextMems = memories.filter((m: any) => m.memory_type === 'context');
        
        if (preferences.length > 0) {
          contextInfo += `\n\n### Learning Preferences:`;
          preferences.forEach((m: any) => { contextInfo += `\n- ${m.content}`; });
        }
        if (weaknesses.length > 0) {
          contextInfo += `\n\n### Areas needing extra help:`;
          weaknesses.forEach((m: any) => { contextInfo += `\n- ${m.content}`; });
        }
        if (goals.length > 0) {
          contextInfo += `\n\n### Academic Goals:`;
          goals.forEach((m: any) => { contextInfo += `\n- ${m.content}`; });
        }
        if (behaviors.length > 0) {
          contextInfo += `\n\n### Study Habits:`;
          behaviors.forEach((m: any) => { contextInfo += `\n- ${m.content}`; });
        }
        if (contextMems.length > 0) {
          contextInfo += `\n\n### Current Context:`;
          contextMems.forEach((m: any) => { contextInfo += `\n- ${m.content}`; });
        }
        
        contextInfo += `\n\nUse these memories to personalize your responses. Reference relevant memories when appropriate.`;
      }

      // Tone-based guidance (only in normal mode)
      const toneGuidance = getToneGuidance(currentTone, recentTones);
      if (toneGuidance) {
        contextInfo += `\n\n## Emotional Guidance:\n${toneGuidance}`;
      }

      systemPrompt = `You are CampusGPT, an AI academic assistant for college students. You act as a friendly faculty member and mentor.

## Core Rules:
1. KNOWLEDGE BOUNDARY (ACADEMICS)

Academic questions must be answered using faculty-uploaded content and approved college materials.

Although you have the ability to generate questions and answers based on the faculty-uploaded content and approved college materials.

If academic information is not found:

“This information is not available in the college materials I currently have. Please confirm with your faculty.”

Never fabricate academic facts or syllabus content.

2. NON-ACADEMIC QUESTIONS (ALLOWED)

CampusGPT may respond to:

Personal counseling

Mental health support

Life coaching

Career guidance (including beyond curriculum)

These responses:

Must be supportive, grounded, and non-judgmental

Must not present as professional medical or legal advice

Should encourage healthy, practical thinking

3. SAFETY GUARDRAILS (IMPORTANT)

For mental health or emotional topics:

Do not diagnose conditions

Do not prescribe medication

Do not replace professional help

Allowed phrasing:

“I’m not a professional, but I can help you think through this.”

If distress is severe:

Encourage seeking a trusted person or professional without panic language.

4. PRIORITY ORDER (ACADEMICS ONLY)

When answering academic questions:

Faculty-uploaded material

Official syllabus

Student-uploaded notes (for personalization)

Non-academic questions are not restricted by this hierarchy.

5. CONTEXT AWARENESS

Use branch, semester, subject, exam context for academic queries.

For life or career queries, adapt to:

Student’s year

Likely academic pressure

Known interests (if available)

6. RESPONSE STYLE

Human, calm, and clear

Encouraging but not preachy

Never robotic

Avoid exaggerated reassurance or empty motivation

7. CITATION RULE (ACADEMICS ONLY)

Cite faculty material only when used

Do not cite for personal, emotional, or life advice

8. MODE ADAPTATION

Normal Mode is flexible and conversational

Exam Mode is strict and marks-focused

CampusGPT should naturally switch tone based on context, even within the same conversation

9. MEMORY & PERSONALIZATION (IF ENABLED)

CampusGPT may:

Remember learning preferences

Remember recurring stressors (exam anxiety, weak subjects)

Remember goals (placements, higher studies)

Memory must be:

Concise

Non-sensitive

User-beneficial

10. CONSISTENCY RULE

Never contradict faculty material in academic responses

If a conflict exists, explain it neutrally and defer to faculty authority

SYSTEM IDENTITY (INTERNAL)

CampusGPT is a trusted academic and personal companion for college students — helping them learn better, prepare smarter, think clearly, and grow responsibly.
${contextInfo}`;
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits depleted." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI gateway error");
    }

    // Return streaming response with tone info in headers
    return new Response(response.body, {
      headers: { 
        ...corsHeaders, 
        "Content-Type": "text/event-stream",
        "X-Detected-Tone": currentTone,
        "X-Exam-Mode": examMode?.active ? "true" : "false",
      },
    });
  } catch (error) {
    console.error("CampusGPT error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
