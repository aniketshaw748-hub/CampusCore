import { AlertTriangle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useExamMode } from './ExamModeContext';

export function ExamModeIndicator() {
  const { isExamMode, examContext, resetExamMode } = useExamMode();

  if (!isExamMode) return null;

  return (
    <div className="bg-primary/10 border border-primary/30 rounded-lg px-4 py-2 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <AlertTriangle className="w-5 h-5 text-primary" />
        <div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-primary text-sm">EXAM MODE ACTIVE</span>
            {examContext?.subject_name && (
              <span className="text-xs text-muted-foreground">
                — {examContext.subject_name}
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Answers are optimized for exams, not deep understanding.
          </p>
        </div>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={resetExamMode}
        className="text-muted-foreground hover:text-foreground"
      >
        <X className="w-4 h-4" />
      </Button>
    </div>
  );
}
