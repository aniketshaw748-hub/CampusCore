import { Switch } from '@/components/ui/switch';
import { AlertTriangle, BookOpen } from 'lucide-react';
import { useExamMode } from './ExamModeContext';

export function ExamModeToggle() {
  const { isExamMode, setIsExamMode, resetExamMode } = useExamMode();

  const handleToggle = (checked: boolean) => {
    if (checked) {
      setIsExamMode(true);
    } else {
      resetExamMode();
    }
  };

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        {isExamMode ? (
          <AlertTriangle className="w-4 h-4 text-primary" />
        ) : (
          <BookOpen className="w-4 h-4 text-muted-foreground" />
        )}
        <span className={`text-sm font-medium ${isExamMode ? 'text-primary' : 'text-muted-foreground'}`}>
          Exam Mode
        </span>
      </div>
      <Switch
        checked={isExamMode}
        onCheckedChange={handleToggle}
        className="data-[state=checked]:bg-primary"
      />
    </div>
  );
}
