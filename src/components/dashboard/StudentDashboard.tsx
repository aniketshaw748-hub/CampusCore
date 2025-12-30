import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bell, BookOpen, MessageSquare, FileText, Loader2, CheckCircle, Building2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import type { Branch, FacultyUpload } from '@/types';
import { NoticeCard } from './NoticeCard';

// --- DEMO DATA FOR STUDENT FEED ---
const DEMO_NOTICES: FacultyUpload[] = [
  {
    id: 'demo-1',
    uploaded_by: 'admin',
    title: 'End-Semester Theory Exam Schedule',
    description: 'The official timetable for the Winter 2025 examinations has been released. Exams begin from Jan 15th.',
    content_type: 'notice',
    file_url: '#',
    file_name: 'exam_timetable_v1.pdf',
    branch_id: 'all',
    semester: null,
    subject_id: null,
    urgency: 'high',
    deadline: '2025-01-15T09:00:00Z',
    is_exam_related: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'demo-2',
    uploaded_by: 'faculty',
    title: 'Machine Learning Lab Manual',
    description: 'Updated lab manual for Semester 6 Computer Science. Includes new experiments on Neural Networks.',
    content_type: 'study_material',
    file_url: '#',
    file_name: 'ML_Lab_Manual.pdf',
    branch_id: 'CS',
    semester: 6,
    subject_id: 'CS601',
    urgency: 'low',
    deadline: null,
    is_exam_related: false,
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date(Date.now() - 86400000).toISOString(),
  }
];

export function StudentDashboard() {
  const { profile, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [notices, setNotices] = useState<FacultyUpload[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBranch, setSelectedBranch] = useState(profile?.branch || '');
  const [selectedSemester, setSelectedSemester] = useState(profile?.semester?.toString() || '');
  const [saving, setSaving] = useState(false);

  const needsSetup = !profile?.branch || !profile?.semester;

  useEffect(() => {
    fetchBranches();
    fetchNotices();
  }, [profile?.branch, profile?.semester]);

  const fetchBranches = async () => {
    const { data } = await supabase.from('branches').select('*').order('name');
    if (data) setBranches(data as Branch[]);
    setLoading(false);
  };

  const fetchNotices = async () => {
    try {
      const { data, error } = await supabase
        .from('faculty_uploads')
        .select('*')
        .order('urgency', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (error) throw error;
      
      // Combine Real Data with Demo Data
      const combined = data && data.length > 0 ? [...data, ...DEMO_NOTICES] : DEMO_NOTICES;
      setNotices(combined as FacultyUpload[]);
    } catch (err) {
      setNotices(DEMO_NOTICES); // Fallback if network fails
    }
  };

  const handleSavePreferences = async () => {
    if (!selectedBranch || !selectedSemester) {
      toast.error('Please select both branch and semester');
      return;
    }

    setSaving(true);
    try {
      await updateProfile({ 
        branch: selectedBranch, 
        semester: parseInt(selectedSemester) 
      });
      toast.success('Preferences saved!');
      // Notices will re-fetch automatically due to useEffect dependency
    } catch (error: any) {
      toast.error(error.message || 'Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (needsSetup) {
    return (
      <div className="max-w-xl mx-auto py-10">
        <Card className="border-primary/20 shadow-xl">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Personalize Your Feed</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-muted-foreground text-center">
              We need to know your course details to show you the right assignments and notices.
            </p>
            
            <div className="grid gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Your Branch</label>
                <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Select your branch" />
                  </SelectTrigger>
                  <SelectContent>
                    {branches.length > 0 ? (
                      branches.map((branch) => (
                        <SelectItem key={branch.id} value={branch.code}>
                          {branch.name} ({branch.code})
                        </SelectItem>
                      ))
                    ) : (
                      // Fallback if DB is empty
                      <>
                        <SelectItem value="CS">Computer Science (CS)</SelectItem>
                        <SelectItem value="EC">Electronics (EC)</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Current Semester</label>
                <Select value={selectedSemester} onValueChange={setSelectedSemester}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Select semester" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                      <SelectItem key={sem} value={sem.toString()}>
                        Semester {sem}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button onClick={handleSavePreferences} disabled={saving} className="w-full h-12 text-lg">
              {saving ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : 'Enter Dashboard'}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-display tracking-tight">
            Hello, {profile?.full_name?.split(' ')[0] || 'Student'}! 👋
          </h1>
          <div className="flex items-center gap-2 mt-1 text-muted-foreground">
            <span className="flex items-center gap-1.5 px-2 py-0.5 bg-secondary rounded-md text-xs font-semibold uppercase tracking-wider">
              {profile?.branch}
            </span>
            <span>•</span>
            <span className="text-sm">Semester {profile?.semester}</span>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => navigate('/dashboard/settings')} className="rounded-full shadow-sm">
          Update Course Details
        </Button>
      </div>

      {/* Grid of Tools */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Bell, label: 'Notices', href: '/dashboard/notices', color: 'from-blue-500 to-indigo-600' },
          { icon: MessageSquare, label: 'CampusGPT', href: '/dashboard/chat', color: 'from-emerald-500 to-teal-600' },
          { icon: BookOpen, label: 'Exam Mode', href: '/dashboard/exam', color: 'from-amber-500 to-orange-600' },
          { icon: FileText, label: 'My Notes', href: '/dashboard/notes', color: 'from-purple-500 to-pink-600' },
        ].map((action) => (
          <button
            key={action.label}
            onClick={() => navigate(action.href)}
            className="p-5 rounded-2xl bg-card border border-border hover:border-primary/50 hover:shadow-lg transition-all duration-300 text-left group relative overflow-hidden"
          >
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-md`}>
              <action.icon className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-bold text-card-foreground">{action.label}</h3>
            <p className="text-xs text-muted-foreground mt-1">Open tool</p>
          </button>
        ))}
      </div>

      {/* Priority Notices Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <h2 className="text-xl font-bold font-display italic">Priority Feed</h2>
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard/notices')} className="text-primary hover:bg-primary/5">
            See all notices →
          </Button>
        </div>
        
        <div className="space-y-3">
          {notices.map((notice) => (
            <NoticeCard key={notice.id} notice={notice} />
          ))}
        </div>
      </div>
    </div>
  );
}