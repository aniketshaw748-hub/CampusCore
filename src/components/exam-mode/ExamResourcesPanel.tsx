import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { BookOpen, FileText, StickyNote, CheckCircle, AlertCircle, Download } from 'lucide-react';
import { useExamMode } from './ExamModeContext';

interface FacultyUpload {
  id: string;
  title: string;
  description: string | null;
  content_type: string;
  file_url: string | null;
  file_name: string | null;
  created_at: string;
}

interface StudentUpload {
  id: string;
  title: string;
  description: string | null;
  file_url: string | null;
  file_name: string | null;
  created_at: string;
}

// Demo syllabus topics
const DEMO_SYLLABUS = [
  { topic: 'Introduction to Data Structures', priority: 'high', unit: 1 },
  { topic: 'Arrays and Linked Lists', priority: 'high', unit: 1 },
  { topic: 'Stacks and Queues', priority: 'high', unit: 2 },
  { topic: 'Trees and Binary Trees', priority: 'high', unit: 2 },
  { topic: 'Graph Algorithms', priority: 'medium', unit: 3 },
  { topic: 'Hashing Techniques', priority: 'medium', unit: 3 },
  { topic: 'Sorting Algorithms', priority: 'high', unit: 4 },
  { topic: 'Searching Algorithms', priority: 'medium', unit: 4 },
  { topic: 'Dynamic Programming', priority: 'low', unit: 5 },
  { topic: 'Greedy Algorithms', priority: 'low', unit: 5 },
];

export function ExamResourcesPanel() {
  const { profile } = useAuth();
  const { examContext } = useExamMode();
  const [facultyMaterials, setFacultyMaterials] = useState<FacultyUpload[]>([]);
  const [studentNotes, setStudentNotes] = useState<StudentUpload[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResources = async () => {
      if (!examContext?.subject_id) {
        setLoading(false);
        return;
      }

      try {
        // Fetch faculty materials for selected subject
        const { data: materials } = await supabase
          .from('faculty_uploads')
          .select('*')
          .eq('subject_id', examContext.subject_id)
          .in('content_type', ['study_material', 'syllabus'])
          .order('created_at', { ascending: false });

        if (materials) {
          setFacultyMaterials(materials);
        }

        // Fetch student's own notes for selected subject
        if (profile?.id && profile.id !== 'demo-user') {
          const { data: notes } = await supabase
            .from('student_uploads')
            .select('*')
            .eq('user_id', profile.id)
            .eq('subject_id', examContext.subject_id)
            .order('created_at', { ascending: false });

          if (notes) {
            setStudentNotes(notes);
          }
        }
      } catch (error) {
        console.error('Error fetching resources:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchResources();
  }, [examContext?.subject_id, profile?.id]);

  if (!examContext) return null;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-destructive text-destructive-foreground';
      case 'medium':
        return 'bg-warning text-warning-foreground';
      case 'low':
        return 'bg-muted text-muted-foreground';
      default:
        return 'bg-secondary text-secondary-foreground';
    }
  };

  // Filter syllabus topics by selected units
  const filteredSyllabus = DEMO_SYLLABUS.filter((item) => {
    if (examContext.units.length === 0) return true;
    return examContext.units.some((unit) => unit.includes(`Unit ${item.unit}`));
  });

  return (
    <Card className="border-2 border-primary/20">
      <Tabs defaultValue="syllabus" className="w-full">
        <TabsList className="w-full grid grid-cols-3 bg-secondary/50">
          <TabsTrigger value="syllabus" className="gap-2">
            <BookOpen className="w-4 h-4" />
            <span className="hidden sm:inline">Syllabus</span>
          </TabsTrigger>
          <TabsTrigger value="materials" className="gap-2">
            <FileText className="w-4 h-4" />
            <span className="hidden sm:inline">Materials</span>
          </TabsTrigger>
          <TabsTrigger value="notes" className="gap-2">
            <StickyNote className="w-4 h-4" />
            <span className="hidden sm:inline">My Notes</span>
          </TabsTrigger>
        </TabsList>

        {/* Syllabus Tab */}
        <TabsContent value="syllabus" className="p-4">
          <div className="mb-3 flex items-center justify-between">
            <h4 className="font-medium text-sm">
              {examContext.subject_name} Syllabus
            </h4>
            <Badge variant="outline" className="text-xs">
              {filteredSyllabus.length} topics
            </Badge>
          </div>
          <ScrollArea className="h-48">
            <div className="space-y-2">
              {filteredSyllabus.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 rounded-lg border border-border bg-card"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{item.topic}</span>
                  </div>
                  <Badge className={`text-xs ${getPriorityColor(item.priority)}`}>
                    {item.priority}
                  </Badge>
                </div>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Faculty Materials Tab */}
        <TabsContent value="materials" className="p-4">
          <div className="mb-3 flex items-center justify-between">
            <h4 className="font-medium text-sm flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-success" />
              Faculty Verified
            </h4>
            <Badge variant="outline" className="text-xs">
              {facultyMaterials.length} files
            </Badge>
          </div>
          <ScrollArea className="h-48">
            {loading ? (
              <p className="text-center text-muted-foreground text-sm py-4">
                Loading materials...
              </p>
            ) : facultyMaterials.length === 0 ? (
              <div className="text-center py-6">
                <AlertCircle className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  No faculty materials found for this subject.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {facultyMaterials.map((material) => (
                  <div
                    key={material.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-border bg-card hover:bg-secondary/50 transition-colors"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium">{material.title}</p>
                      {material.description && (
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {material.description}
                        </p>
                      )}
                    </div>
                    {material.file_url && (
                      <a
                        href={material.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 hover:bg-primary/10 rounded-lg"
                      >
                        <Download className="w-4 h-4 text-primary" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </TabsContent>

        {/* Student Notes Tab */}
        <TabsContent value="notes" className="p-4">
          <div className="mb-3 flex items-center justify-between">
            <h4 className="font-medium text-sm flex items-center gap-2">
              <StickyNote className="w-4 h-4 text-muted-foreground" />
              Personal Notes
            </h4>
            <Badge variant="secondary" className="text-xs">
              Lower priority
            </Badge>
          </div>
          <ScrollArea className="h-48">
            {studentNotes.length === 0 ? (
              <div className="text-center py-6">
                <StickyNote className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  No personal notes for this subject.
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Upload notes in "My Notes" section.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {studentNotes.map((note) => (
                  <div
                    key={note.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-border bg-card"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium">{note.title}</p>
                      {note.description && (
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {note.description}
                        </p>
                      )}
                    </div>
                    {note.file_url && (
                      <a
                        href={note.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 hover:bg-primary/10 rounded-lg"
                      >
                        <Download className="w-4 h-4 text-primary" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </Card>
  );
}
