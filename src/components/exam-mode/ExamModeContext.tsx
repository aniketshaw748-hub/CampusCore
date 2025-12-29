import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export type ExamType = 'unit_test' | 'mid_semester' | 'end_semester' | 'viva';

export interface ExamContext {
  exam_type: ExamType | null;
  subject_id: string | null;
  subject_name: string | null;
  units: string[];
  marks_style: string | null;
  semester: number | null;
  mode: 'exam';
}

interface ExamModeContextType {
  isExamMode: boolean;
  setIsExamMode: (value: boolean) => void;
  examContext: ExamContext | null;
  setExamContext: (context: ExamContext | null) => void;
  currentStep: number;
  setCurrentStep: (step: number) => void;
  resetExamMode: () => void;
}

const ExamModeContext = createContext<ExamModeContextType | undefined>(undefined);

export function ExamModeProvider({ children }: { children: ReactNode }) {
  const [isExamMode, setIsExamMode] = useState(false);
  const [examContext, setExamContext] = useState<ExamContext | null>(null);
  const [currentStep, setCurrentStep] = useState(1);

  // Apply exam-mode class to document
  useEffect(() => {
    const root = document.documentElement;
    if (isExamMode) {
      root.classList.add('exam-mode');
    } else {
      root.classList.remove('exam-mode');
    }
    return () => {
      root.classList.remove('exam-mode');
    };
  }, [isExamMode]);

  const resetExamMode = () => {
    setIsExamMode(false);
    setExamContext(null);
    setCurrentStep(1);
  };

  return (
    <ExamModeContext.Provider
      value={{
        isExamMode,
        setIsExamMode,
        examContext,
        setExamContext,
        currentStep,
        setCurrentStep,
        resetExamMode,
      }}
    >
      {children}
    </ExamModeContext.Provider>
  );
}

export function useExamMode() {
  const context = useContext(ExamModeContext);
  if (context === undefined) {
    throw new Error('useExamMode must be used within an ExamModeProvider');
  }
  return context;
}
