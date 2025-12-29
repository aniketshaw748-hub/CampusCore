import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bell, BookOpen, MessageSquare, Calendar, FileText, Loader2, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import type { Branch, FacultyUpload } from '@/types';
import { NoticeCard } from './NoticeCard';

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
    if (!needsSetup) {
      fetchNotices();
    }
  }, [profile]);

  const fetchBranches = async () => {
    const { data } = await supabase.from('branches').select('*').order('name');
    if (data) setBranches(data as Branch[]);
    setLoading(false);
  };

  const fetchNotices = async () => {
    const { data } = await supabase
      .from('faculty_uploads')
      .select('*')
      .order('deadline', { ascending: true, nullsFirst: false })
      .order('urgency', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (data) setNotices(data as FacultyUpload[]);
  };

  const handleSavePreferences = async () => {
    if (!selectedBranch || !selectedSemester) {
      toast.error('Please select both branch and semester');
      return;
    }

    setSaving(true);
    try {
      updateProfile({ 
        branch: selectedBranch, 
        semester: parseInt(selectedSemester) 
      });
      toast.success('Preferences saved!');
      fetchNotices();
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
      <div className="max-w-xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-primary" />
              Setup Your Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Select your branch and semester to see personalized notices and content.
            </p>
            
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Branch</label>
                <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your branch" />
                  </SelectTrigger>
                  <SelectContent>
                    {branches.map((branch) => (
                      <SelectItem key={branch.id} value={branch.code}>
                        {branch.name} ({branch.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-1.5 block">Semester</label>
                <Select value={selectedSemester} onValueChange={setSelectedSemester}>
                  <SelectTrigger>
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

            <Button onClick={handleSavePreferences} disabled={saving} className="w-full">
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Preferences'
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display mb-1">
            Welcome back, {profile?.full_name?.split(' ')[0] || 'Student'}!
          </h1>
          <p className="text-muted-foreground">
            {profile?.branch} • Semester {profile?.semester}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => navigate('/dashboard/settings')}>
          Change Course
        </Button>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: Bell, label: 'Notices', href: '/dashboard/notices', color: 'from-blue-500 to-indigo-600' },
          { icon: MessageSquare, label: 'CampusGPT', href: '/dashboard/chat', color: 'from-emerald-500 to-teal-600' },
          { icon: BookOpen, label: 'Exam Mode', href: '/dashboard/exam', color: 'from-amber-500 to-orange-600' },
          { icon: FileText, label: 'My Notes', href: '/dashboard/notes', color: 'from-purple-500 to-pink-600' },
        ].map((action) => (
          <button
            key={action.label}
            onClick={() => navigate(action.href)}
            className="p-4 rounded-xl bg-card border border-border hover:border-primary/30 hover:shadow-card-hover transition-all duration-200 text-left group"
          >
            <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${action.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
              <action.icon className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-medium">{action.label}</span>
          </button>
        ))}
      </div>

      {/* Priority Notices */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold font-display">Priority Notices</h2>
          <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard/notices')}>
            View all
          </Button>
        </div>
        
        {notices.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Bell className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
              <p className="text-muted-foreground">No notices yet. Check back later!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {notices.slice(0, 5).map((notice) => (
              <NoticeCard key={notice.id} notice={notice} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
