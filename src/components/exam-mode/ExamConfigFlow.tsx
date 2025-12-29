import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ChevronRight, Check, BookOpen, FileText, Target } from 'lucide-react';
import { useExamMode, ExamType } from './ExamModeContext';

interface Subject {
  id: string;
  name: string;
  code: string;
  semester: number;
}

const EXAM_TYPES: { value: ExamType; label: string; description: string }[] = [
  { value: 'unit_test', label: 'Unit Test', description: 'Focus on specific units' },
  { value: 'mid_semester', label: 'Mid Semester', description: 'First half of syllabus' },
  { value: 'end_semester', label: 'End Semester', description: 'Complete syllabus' },
  { value: 'viva', label: 'Viva / Internal', description: 'Oral examination prep' },
];

const MARKS_STYLES = ['2 marks', '5 marks', '10 marks', 'Mixed'];

// Predefined units for demo - in production, fetch from syllabus
const DEMO_UNITS = [
  'Unit 1: Introduction & Basics',
  'Unit 2: Core Concepts',
  'Unit 3: Advanced Topics',
  'Unit 4: Applications',
  'Unit 5: Case Studies',
];

export function ExamConfigFlow() {
  const { profile } = useAuth();
  const { currentStep, setCurrentStep, setExamContext, examContext } = useExamMode();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedExamType, setSelectedExamType] = useState<ExamType | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [selectedUnits, setSelectedUnits] = useState<string[]>([]);
  const [selectedMarksStyle, setSelectedMarksStyle] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch subjects based on student's branch and semester
  useEffect(() => {
    const fetchSubjects = async () => {
      if (!profile?.semester) {
        setLoading(false);
        return;
      }

      try {
        let query = supabase
          .from('subjects')
          .select('*')
          .eq('semester', profile.semester);

        // If branch is set, filter by branch
        if (profile.branch) {
          const { data: branchData } = await supabase
            .from('branches')
            .select('id')
            .eq('name', profile.branch)
            .single();

          if (branchData) {
            query = query.eq('branch_id', branchData.id);
          }
        }

        const { data } = await query;
        if (data) {
          setSubjects(data);
        }
      } catch (error) {
        console.error('Error fetching subjects:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubjects();
  }, [profile?.semester, profile?.branch]);

  const handleExamTypeSelect = (type: ExamType) => {
    setSelectedExamType(type);
  };

  const handleSubjectSelect = (subject: Subject) => {
    setSelectedSubject(subject);
  };

  const handleUnitToggle = (unit: string) => {
    setSelectedUnits((prev) =>
      prev.includes(unit) ? prev.filter((u) => u !== unit) : [...prev, unit]
    );
  };

  const handleNextStep = () => {
    if (currentStep === 1 && selectedExamType) {
      setCurrentStep(2);
    } else if (currentStep === 2 && selectedSubject) {
      setCurrentStep(3);
    }
  };

  const handleComplete = () => {
    if (selectedExamType && selectedSubject) {
      setExamContext({
        exam_type: selectedExamType,
        subject_id: selectedSubject.id,
        subject_name: selectedSubject.name,
        units: selectedUnits.length > 0 ? selectedUnits : DEMO_UNITS,
        marks_style: selectedMarksStyle,
        semester: profile?.semester || null,
        mode: 'exam',
      });
      setCurrentStep(4); // Configuration complete
    }
  };

  // If configuration is complete, don't show the flow
  if (examContext && currentStep === 4) {
    return null;
  }

  return (
    <Card className="p-6 border-2 border-primary/20 bg-card">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <div className="flex gap-1">
            {[1, 2, 3].map((step) => (
              <div
                key={step}
                className={`w-8 h-1 rounded-full transition-colors ${
                  step <= currentStep ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>
        </div>
        <h3 className="text-lg font-semibold">
          {currentStep === 1 && 'Step 1: Select Exam Type'}
          {currentStep === 2 && 'Step 2: Select Subject'}
          {currentStep === 3 && 'Step 3: Select Scope'}
        </h3>
      </div>

      {/* Step 1: Exam Type */}
      {currentStep === 1 && (
        <div className="space-y-4">
          <RadioGroup
            value={selectedExamType || ''}
            onValueChange={(v) => handleExamTypeSelect(v as ExamType)}
          >
            <div className="grid gap-3">
              {EXAM_TYPES.map((type) => (
                <Label
                  key={type.value}
                  htmlFor={type.value}
                  className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedExamType === type.value
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <RadioGroupItem value={type.value} id={type.value} />
                  <div className="flex-1">
                    <p className="font-medium">{type.label}</p>
                    <p className="text-sm text-muted-foreground">{type.description}</p>
                  </div>
                </Label>
              ))}
            </div>
          </RadioGroup>
          <Button
            onClick={handleNextStep}
            disabled={!selectedExamType}
            className="w-full"
          >
            Next <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      )}

      {/* Step 2: Subject Selection */}
      {currentStep === 2 && (
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading subjects...
            </div>
          ) : subjects.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No subjects found for your semester. Please update your profile.
            </div>
          ) : (
            <RadioGroup
              value={selectedSubject?.id || ''}
              onValueChange={(id) => {
                const subject = subjects.find((s) => s.id === id);
                if (subject) handleSubjectSelect(subject);
              }}
            >
              <div className="grid gap-3 max-h-64 overflow-y-auto">
                {subjects.map((subject) => (
                  <Label
                    key={subject.id}
                    htmlFor={subject.id}
                    className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedSubject?.id === subject.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <RadioGroupItem value={subject.id} id={subject.id} />
                    <div className="flex-1">
                      <p className="font-medium">{subject.name}</p>
                      <p className="text-sm text-muted-foreground">{subject.code}</p>
                    </div>
                  </Label>
                ))}
              </div>
            </RadioGroup>
          )}
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setCurrentStep(1)} className="flex-1">
              Back
            </Button>
            <Button
              onClick={handleNextStep}
              disabled={!selectedSubject}
              className="flex-1"
            >
              Next <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Scope Selection */}
      {currentStep === 3 && (
        <div className="space-y-6">
          {/* Units */}
          <div>
            <Label className="text-sm font-medium mb-3 block">
              <BookOpen className="w-4 h-4 inline mr-2" />
              Select Units (optional)
            </Label>
            <div className="grid gap-2 max-h-40 overflow-y-auto">
              {DEMO_UNITS.map((unit) => (
                <Label
                  key={unit}
                  className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-secondary/50 cursor-pointer"
                >
                  <Checkbox
                    checked={selectedUnits.includes(unit)}
                    onCheckedChange={() => handleUnitToggle(unit)}
                  />
                  <span className="text-sm">{unit}</span>
                </Label>
              ))}
            </div>
          </div>

          {/* Marks Style */}
          <div>
            <Label className="text-sm font-medium mb-3 block">
              <Target className="w-4 h-4 inline mr-2" />
              Marks Style (optional)
            </Label>
            <div className="flex flex-wrap gap-2">
              {MARKS_STYLES.map((style) => (
                <Button
                  key={style}
                  variant={selectedMarksStyle === style ? 'default' : 'outline'}
                  size="sm"
                  onClick={() =>
                    setSelectedMarksStyle(selectedMarksStyle === style ? null : style)
                  }
                >
                  {style}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setCurrentStep(2)} className="flex-1">
              Back
            </Button>
            <Button onClick={handleComplete} className="flex-1">
              <Check className="w-4 h-4 mr-2" /> Start Exam Mode
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
