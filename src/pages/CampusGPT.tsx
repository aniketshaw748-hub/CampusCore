import { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Brain, Send, Loader2, Sparkles, BookOpen, User } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { CampusGPTSettings } from '@/components/campus-gpt/CampusGPTSettings';
import { MemoryIndicator } from '@/components/campus-gpt/MemoryIndicator';
import { ExamModeProvider, useExamMode } from '@/components/exam-mode/ExamModeContext';
import { ExamModeToggle } from '@/components/exam-mode/ExamModeToggle';
import { ExamModeIndicator } from '@/components/exam-mode/ExamModeIndicator';
import { ExamConfigFlow } from '@/components/exam-mode/ExamConfigFlow';
import { ExamResourcesPanel } from '@/components/exam-mode/ExamResourcesPanel';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  source_label?: string;
  created_at: string;
}

interface Memory {
  id: string;
  memory_type: 'preference' | 'weakness' | 'goal' | 'behavior' | 'context';
  content: string;
  created_at: string;
}

interface CustomInstructions {
  id?: string;
  response_style: string | null;
  about_me: string | null;
}

function CampusGPTContent() {
  const { profile, userRole } = useAuth();
  const { isExamMode, examContext } = useExamMode();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [customInstructions, setCustomInstructions] = useState<CustomInstructions | null>(null);
  const [isLoadingMemory, setIsLoadingMemory] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const messageCountRef = useRef(0);

  const loadUserData = useCallback(async () => {
    if (!profile?.id || profile.id === 'demo-user') {
      setIsLoadingMemory(false);
      return;
    }

    try {
      const { data: memoriesData } = await supabase
        .from('student_memories')
        .select('*')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false });

      if (memoriesData) setMemories(memoriesData as Memory[]);

      const { data: instructionsData } = await supabase
        .from('custom_instructions')
        .select('*')
        .eq('user_id', profile.id)
        .single();

      if (instructionsData) setCustomInstructions(instructionsData as CustomInstructions);
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setIsLoadingMemory(false);
    }
  }, [profile?.id]);

  useEffect(() => { loadUserData(); }, [loadUserData]);
  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [messages]);

  const extractMemories = async (allMessages: Message[]) => {
    if (!profile?.id || profile.id === 'demo-user' || allMessages.length < 4) return;
    try {
      await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/extract-memory`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
        body: JSON.stringify({ messages: allMessages.slice(-10).map(m => ({ role: m.role, content: m.content })), userId: profile.id }),
      });
      const { data: memoriesData } = await supabase.from('student_memories').select('*').eq('user_id', profile.id).order('created_at', { ascending: false });
      if (memoriesData) setMemories(memoriesData as Memory[]);
    } catch (error) { console.error('Error extracting memories:', error); }
  };

  const handleDeleteMemory = async (id: string) => {
    if (!profile?.id || profile.id === 'demo-user') { toast.error('Sign in to manage memories'); return; }
    try {
      const { error } = await supabase.from('student_memories').delete().eq('id', id).eq('user_id', profile.id);
      if (error) throw error;
      setMemories(prev => prev.filter(m => m.id !== id));
      toast.success('Memory deleted');
    } catch (error) { console.error('Error deleting memory:', error); toast.error('Failed to delete memory'); }
  };

  const handleSaveInstructions = async (instructions: { response_style: string; about_me: string }) => {
    if (!profile?.id || profile.id === 'demo-user') { toast.error('Sign in to save custom instructions'); return; }
    try {
      const { data: existing } = await supabase.from('custom_instructions').select('id').eq('user_id', profile.id).single();
      if (existing) {
        await supabase.from('custom_instructions').update({ response_style: instructions.response_style || null, about_me: instructions.about_me || null }).eq('user_id', profile.id);
      } else {
        await supabase.from('custom_instructions').insert({ user_id: profile.id, response_style: instructions.response_style || null, about_me: instructions.about_me || null });
      }
      setCustomInstructions({ response_style: instructions.response_style || null, about_me: instructions.about_me || null });
      toast.success('Custom instructions saved');
    } catch (error) { console.error('Error saving instructions:', error); toast.error('Failed to save instructions'); }
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMessage: Message = { id: crypto.randomUUID(), role: 'user', content: input.trim(), created_at: new Date().toISOString() };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);
    messageCountRef.current += 1;

    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/campus-gpt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
        body: JSON.stringify({
          messages: updatedMessages.map(m => ({ role: m.role, content: m.content })),
          userId: profile?.id || 'demo-user',
          userContext: { branch: profile?.branch, semester: profile?.semester, fullName: profile?.full_name },
          customInstructions: !isExamMode && customInstructions ? { responseStyle: customInstructions.response_style, aboutMe: customInstructions.about_me } : null,
          memories: !isExamMode ? memories.map(m => ({ memory_type: m.memory_type, content: m.content })) : [],
          examMode: isExamMode && examContext ? { active: true, context: examContext } : { active: false },
        }),
      });

      if (!response.ok) {
        if (response.status === 429) throw new Error('Rate limit exceeded. Please try again later.');
        if (response.status === 402) throw new Error('AI credits depleted. Please contact support.');
        throw new Error('Failed to get response');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantContent = '';
      let textBuffer = '';

      if (reader) {
        const assistantMessage: Message = { id: crypto.randomUUID(), role: 'assistant', content: '', source_label: isExamMode ? 'Exam Mode' : 'Faculty Material', created_at: new Date().toISOString() };
        setMessages((prev) => [...prev, assistantMessage]);

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          textBuffer += decoder.decode(value, { stream: true });
          let newlineIndex: number;
          while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
            let line = textBuffer.slice(0, newlineIndex);
            textBuffer = textBuffer.slice(newlineIndex + 1);
            if (line.endsWith('\r')) line = line.slice(0, -1);
            if (line.startsWith(':') || line.trim() === '' || !line.startsWith('data: ')) continue;
            const jsonStr = line.slice(6).trim();
            if (jsonStr === '[DONE]') break;
            try {
              const parsed = JSON.parse(jsonStr);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                assistantContent += content;
                setMessages((prev) => { const updated = [...prev]; updated[updated.length - 1] = { ...updated[updated.length - 1], content: assistantContent }; return updated; });
              }
            } catch { textBuffer = line + '\n' + textBuffer; break; }
          }
        }
        if (!isExamMode && messageCountRef.current % 5 === 0) extractMemories([...updatedMessages, { ...assistantMessage, content: assistantContent }]);
      }
    } catch (error: any) { toast.error(error.message || 'Failed to send message'); setMessages((prev) => prev.slice(0, -1)); } finally { setLoading(false); inputRef.current?.focus(); }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } };
  const hasCustomInstructions = !!(customInstructions?.response_style || customInstructions?.about_me);
  const isConfigured = isExamMode && examContext;

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-8rem)] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isExamMode ? 'bg-primary' : 'gradient-primary'}`}>
              <Brain className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold font-display">CampusGPT</h1>
                {!isExamMode && <MemoryIndicator memoryCount={memories.length} hasCustomInstructions={hasCustomInstructions} />}
              </div>
              <p className="text-sm text-muted-foreground">{isExamMode ? 'Exam preparation mode active' : 'AI assistant using your college material'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ExamModeToggle />
            {userRole === 'student' && !isExamMode && (
              <CampusGPTSettings memories={memories} customInstructions={customInstructions} onDeleteMemory={handleDeleteMemory} onSaveInstructions={handleSaveInstructions} isLoading={isLoadingMemory} />
            )}
          </div>
        </div>

        {/* Exam Mode Indicator */}
        {isExamMode && <div className="mb-4"><ExamModeIndicator /></div>}

        {/* Exam Config or Resources */}
        {isExamMode && !isConfigured && <div className="mb-4"><ExamConfigFlow /></div>}
        {isConfigured && <div className="mb-4"><ExamResourcesPanel /></div>}

        {/* Chat Area */}
        <Card className="flex-1 flex flex-col overflow-hidden">
          <ScrollArea ref={scrollRef} className="flex-1 p-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 ${isExamMode ? 'bg-primary' : 'gradient-primary'}`}>
                  <Sparkles className="w-8 h-8 text-primary-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{isExamMode ? 'Exam Mode Ready' : 'Start a Conversation'}</h3>
                <p className="text-muted-foreground max-w-sm">
                  {isExamMode && isConfigured ? `Ask exam-focused questions about ${examContext?.subject_name}. Answers will be formatted for exams.` : isExamMode ? 'Configure your exam settings above to begin.' : 'Ask me anything about your course material, syllabus, or exam preparation.'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => (
                  <div key={message.id} className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : ''}`}>
                    {message.role === 'assistant' && <Avatar className="w-8 h-8 shrink-0"><AvatarFallback className={isExamMode ? 'bg-primary text-primary-foreground' : 'gradient-primary text-primary-foreground'}><Brain className="w-4 h-4" /></AvatarFallback></Avatar>}
                    <div className={`max-w-[80%] rounded-xl px-4 py-3 ${message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}>
                      <p className="whitespace-pre-wrap">{message.content}</p>
                      {message.source_label && message.role === 'assistant' && <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground"><BookOpen className="w-3 h-3" />{message.source_label}</div>}
                    </div>
                    {message.role === 'user' && <Avatar className="w-8 h-8 shrink-0"><AvatarImage src={profile?.avatar_url || ''} /><AvatarFallback className="bg-primary/10"><User className="w-4 h-4" /></AvatarFallback></Avatar>}
                  </div>
                ))}
                {loading && <div className="flex gap-3"><Avatar className="w-8 h-8 shrink-0"><AvatarFallback className={isExamMode ? 'bg-primary text-primary-foreground' : 'gradient-primary text-primary-foreground'}><Brain className="w-4 h-4" /></AvatarFallback></Avatar><div className="bg-secondary rounded-xl px-4 py-3"><div className="flex gap-1"><span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '0ms' }} /><span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '150ms' }} /><span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '300ms' }} /></div></div></div>}
              </div>
            )}
          </ScrollArea>

          {/* Input */}
          <div className="p-4 border-t border-border">
            <div className="flex gap-2">
              <Input ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown} placeholder={isExamMode ? 'Ask an exam question...' : 'Ask about your course material...'} disabled={loading || (isExamMode && !isConfigured)} className="flex-1" />
              <Button onClick={sendMessage} disabled={loading || !input.trim() || (isExamMode && !isConfigured)}>{loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}</Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">{isExamMode ? 'Answers are optimized for exams, not deep understanding.' : 'CampusGPT only uses your college\'s uploaded material. No web search.'}</p>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}

export default function CampusGPT() {
  return <ExamModeProvider><CampusGPTContent /></ExamModeProvider>;
}
