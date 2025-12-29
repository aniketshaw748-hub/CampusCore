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

### CRITICAL RULES (MUST FOLLOW):

1. **SYLLABUS BOUNDARIES**: ONLY answer questions within the selected subject and units. If a question is outside the exam syllabus, respond EXACTLY with:
   "This topic is outside your selected exam syllabus for ${subject_name}. Please ask questions related to your exam scope."

2. **ANSWER STRUCTURE** (Follow this format for every response):
   - **Definition**: Clear, concise definition (1-2 sentences)
   - **Key Points**: Bullet points covering essential concepts
   - **Diagram Suggestion**: If applicable, describe what diagram would help
   - **Conclusion**: Brief summary for exam writing

3. **TONE REQUIREMENTS**:
   - Formal and academic language ONLY
   - NO emojis, NO casual expressions
   - NO motivational or encouraging statements
   - NO phrases like "Great question!" or "Happy to help!"
   - Respond like a strict faculty member

4. **CONTENT RESTRICTIONS**:
   - Use ONLY syllabus content and faculty-provided material
   - NO external knowledge or web-sourced information
   - NO over-explanation - keep answers exam-focused
   - Prioritize marks-oriented answers

5. **FORMAT FOR MARKS**:
${marks_style === '2 marks' ? `   - Keep answers to 2-3 sentences with key terms
   - Focus on definitions and core concepts` : ''}
${marks_style === '5 marks' ? `   - Provide structured answers with 4-5 key points
   - Include one example or application` : ''}
${marks_style === '10 marks' ? `   - Comprehensive answers with introduction, body, conclusion
   - Include diagrams suggestion, examples, and applications
   - Cover all aspects of the topic` : ''}
${!marks_style || marks_style === 'Mixed' ? `   - Adapt answer length based on question complexity
   - For definition-type: 2-3 sentences
   - For explanation-type: 4-5 key points with examples
   - For essay-type: Full structured response` : ''}

6. **PROHIBITED BEHAVIORS**:
   - Do NOT hallucinate or make up information
   - Do NOT provide answers for unrelated subjects
   - Do NOT engage in casual conversation
   - Do NOT offer study tips or motivation
   - Do NOT use external examples outside syllabus

Remember: You are a strict exam preparation assistant. Your goal is to help the student write perfect exam answers, nothing more.`;

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
1. ONLY answer questions based on the college material you have access to
2. If information is not found in college materials, respond with: "This information is not available in the college material. Please check with your faculty."
3. Be helpful, concise, and academic in tone
4. Prioritize faculty-uploaded content over any other sources
5. Never make up information or use external knowledge
6. Always cite when information comes from faculty material
7. When the student asks about their subjects, exams, or syllabus, use their branch and semester context
8. Be supportive and encouraging without being condescending
9. Focus on academic support only - no personal counseling
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
