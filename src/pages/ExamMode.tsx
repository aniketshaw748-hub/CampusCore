import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { BookOpen, Play, Clock, CheckCircle, XCircle, Loader2, Trophy, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import type { Subject, Question } from '@/types';

type ExamType = 'mcq' | 'short_answer' | 'mock_test';

interface ExamState {
  started: boolean;
  completed: boolean;
  currentQuestion: number;
  answers: (number | string)[];
  startTime: number;
  endTime?: number;
}

export default function ExamMode() {
  const { profile } = useAuth();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [examType, setExamType] = useState<ExamType>('mcq');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [exam, setExam] = useState<ExamState>({
    started: false,
    completed: false,
    currentQuestion: 0,
    answers: [],
    startTime: 0,
  });
  const [timeRemaining, setTimeRemaining] = useState(0);

  useEffect(() => {
    fetchSubjects();
  }, [profile]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (exam.started && !exam.completed && examType === 'mock_test') {
      interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - exam.startTime) / 1000);
        const remaining = 30 * 60 - elapsed; // 30 minutes for mock test
        setTimeRemaining(Math.max(0, remaining));
        
        if (remaining <= 0) {
          finishExam();
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [exam.started, exam.completed, examType]);

  const fetchSubjects = async () => {
    if (!profile?.branch) return;
    
    const { data: branchData } = await supabase
      .from('branches')
      .select('id')
      .eq('code', profile.branch)
      .single();
    
    if (!branchData) return;

    const { data } = await supabase
      .from('subjects')
      .select('*')
      .eq('branch_id', branchData.id)
      .eq('semester', profile.semester || 1);
    
    if (data) setSubjects(data as Subject[]);
    setLoading(false);
  };

  const generateQuestions = async () => {
    if (!selectedSubject) {
      toast.error('Please select a subject');
      return;
    }

    setGenerating(true);
    
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-exam`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          subjectId: selectedSubject,
          examType,
          userId: 'demo-user',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate questions');
      }

      const data = await response.json();
      setQuestions(data.questions);
      
      setExam({
        started: true,
        completed: false,
        currentQuestion: 0,
        answers: new Array(data.questions.length).fill(-1),
        startTime: Date.now(),
      });
      
      if (examType === 'mock_test') {
        setTimeRemaining(30 * 60);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to generate exam');
    } finally {
      setGenerating(false);
    }
  };

  const selectAnswer = (answer: number | string) => {
    setExam((prev) => {
      const newAnswers = [...prev.answers];
      newAnswers[prev.currentQuestion] = answer;
      return { ...prev, answers: newAnswers };
    });
  };

  const nextQuestion = () => {
    if (exam.currentQuestion < questions.length - 1) {
      setExam((prev) => ({ ...prev, currentQuestion: prev.currentQuestion + 1 }));
    } else {
      finishExam();
    }
  };

  const prevQuestion = () => {
    if (exam.currentQuestion > 0) {
      setExam((prev) => ({ ...prev, currentQuestion: prev.currentQuestion - 1 }));
    }
  };

  const finishExam = async () => {
    const endTime = Date.now();
    const score = questions.reduce((acc, q, i) => {
      return acc + (exam.answers[i] === q.correctAnswer ? 1 : 0);
    }, 0);

    setExam((prev) => ({ ...prev, completed: true, endTime }));
  };

  const resetExam = () => {
    setExam({
      started: false,
      completed: false,
      currentQuestion: 0,
      answers: [],
      startTime: 0,
    });
    setQuestions([]);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const currentQ = questions[exam.currentQuestion];
  const score = exam.completed
    ? questions.reduce((acc, q, i) => acc + (exam.answers[i] === q.correctAnswer ? 1 : 0), 0)
    : 0;

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl gradient-accent flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-accent-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold font-display">Exam Mode</h1>
            <p className="text-sm text-muted-foreground">Practice with AI-generated questions</p>
          </div>
        </div>

        {!exam.started ? (
          <Card>
            <CardHeader>
              <CardTitle>Start Practice Session</CardTitle>
              <CardDescription>
                Generate questions from your faculty-uploaded materials
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Subject</Label>
                <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((subject) => (
                      <SelectItem key={subject.id} value={subject.id}>
                        {subject.name} ({subject.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Exam Type</Label>
                <RadioGroup value={examType} onValueChange={(v) => setExamType(v as ExamType)} className="mt-2">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="mcq" id="mcq" />
                    <Label htmlFor="mcq" className="cursor-pointer">MCQ (10 questions)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="short_answer" id="short" />
                    <Label htmlFor="short" className="cursor-pointer">Short Answer (5 questions)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="mock_test" id="mock" />
                    <Label htmlFor="mock" className="cursor-pointer">Mock Test (30 min, 20 questions)</Label>
                  </div>
                </RadioGroup>
              </div>

              <Button 
                variant="hero" 
                className="w-full" 
                onClick={generateQuestions}
                disabled={generating || !selectedSubject}
              >
                {generating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating Questions...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    Start Practice
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        ) : exam.completed ? (
          <Card>
            <CardContent className="py-12 text-center">
              <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
                <Trophy className="w-10 h-10 text-success" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Exam Complete!</h2>
              <p className="text-4xl font-bold text-primary mb-4">
                {score} / {questions.length}
              </p>
              <p className="text-muted-foreground mb-6">
                {Math.round((score / questions.length) * 100)}% correct •{' '}
                {formatTime(Math.floor((exam.endTime! - exam.startTime) / 1000))} taken
              </p>

              {/* Review answers */}
              <div className="text-left space-y-4 mb-6">
                {questions.map((q, i) => (
                  <div key={q.id} className={`p-4 rounded-lg ${exam.answers[i] === q.correctAnswer ? 'bg-success/10' : 'bg-destructive/10'}`}>
                    <div className="flex items-start gap-2 mb-2">
                      {exam.answers[i] === q.correctAnswer ? (
                        <CheckCircle className="w-5 h-5 text-success shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                      )}
                      <p className="font-medium">{q.question}</p>
                    </div>
                    <p className="text-sm text-muted-foreground ml-7">
                      Correct: {q.options[q.correctAnswer]}
                    </p>
                  </div>
                ))}
              </div>

              <Button onClick={resetExam} variant="outline">
                <RotateCcw className="w-4 h-4" />
                Try Again
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            {/* Timer for mock test */}
            {examType === 'mock_test' && (
              <div className="p-4 border-b border-border flex items-center justify-between">
                <span className="text-sm font-medium">Time Remaining</span>
                <span className={`text-lg font-mono font-bold ${timeRemaining < 300 ? 'text-destructive' : ''}`}>
                  <Clock className="w-4 h-4 inline mr-1" />
                  {formatTime(timeRemaining)}
                </span>
              </div>
            )}

            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">
                  Question {exam.currentQuestion + 1} of {questions.length}
                </CardTitle>
                <span className="text-sm text-muted-foreground">
                  {exam.answers.filter(a => a !== -1).length} answered
                </span>
              </div>
              <Progress value={((exam.currentQuestion + 1) / questions.length) * 100} className="h-2" />
            </CardHeader>

            <CardContent className="space-y-6">
              <p className="text-lg font-medium">{currentQ?.question}</p>

              {currentQ?.type === 'mcq' && (
                <RadioGroup
                  value={exam.answers[exam.currentQuestion]?.toString()}
                  onValueChange={(v) => selectAnswer(parseInt(v))}
                >
                  {currentQ.options.map((option, i) => (
                    <div key={i} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-secondary transition-colors">
                      <RadioGroupItem value={i.toString()} id={`option-${i}`} />
                      <Label htmlFor={`option-${i}`} className="flex-1 cursor-pointer">
                        {option}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              )}

              <div className="flex justify-between pt-4">
                <Button
                  variant="outline"
                  onClick={prevQuestion}
                  disabled={exam.currentQuestion === 0}
                >
                  Previous
                </Button>
                <Button onClick={nextQuestion}>
                  {exam.currentQuestion === questions.length - 1 ? 'Finish' : 'Next'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
