import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, FileText, Bell, Users, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { FacultyUpload } from '@/types';

export function FacultyDashboard() {
  const { profile, userRole } = useAuth();
  const navigate = useNavigate();
  const [recentUploads, setRecentUploads] = useState<FacultyUpload[]>([]);
  const [stats, setStats] = useState({ notices: 0, materials: 0, syllabus: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    // Fetch recent uploads
    const { data: uploads } = await supabase
      .from('faculty_uploads')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (uploads) {
      setRecentUploads(uploads as FacultyUpload[]);
      
      // Calculate stats
      const noticeCount = uploads.filter(u => u.content_type === 'notice').length;
      const materialCount = uploads.filter(u => u.content_type === 'study_material').length;
      const syllabusCount = uploads.filter(u => u.content_type === 'syllabus').length;
      
      setStats({
        notices: noticeCount,
        materials: materialCount,
        syllabus: syllabusCount,
      });
    }
    
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display mb-1">
            Welcome, {profile?.full_name?.split(' ')[0] || 'Faculty'}!
          </h1>
          <p className="text-muted-foreground capitalize">{userRole} Dashboard</p>
        </div>
        <Button variant="hero" onClick={() => navigate('/dashboard/upload')}>
          <Upload className="w-4 h-4" />
          Upload Content
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { icon: Bell, label: 'Notices', value: stats.notices, color: 'from-blue-500 to-indigo-600' },
          { icon: FileText, label: 'Study Materials', value: stats.materials, color: 'from-emerald-500 to-teal-600' },
          { icon: FileText, label: 'Syllabus', value: stats.syllabus, color: 'from-amber-500 to-orange-600' },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                  <stat.icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: Upload, label: 'Upload Content', href: '/dashboard/upload', color: 'from-blue-500 to-indigo-600' },
          { icon: FileText, label: 'My Uploads', href: '/dashboard/my-uploads', color: 'from-emerald-500 to-teal-600' },
          { icon: Bell, label: 'All Notices', href: '/dashboard/notices', color: 'from-amber-500 to-orange-600' },
          ...(userRole === 'admin' ? [{ icon: Users, label: 'Manage', href: '/dashboard/manage', color: 'from-purple-500 to-pink-600' }] : []),
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

      {/* Recent Uploads */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Recent Uploads
            <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard/my-uploads')}>
              View all
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentUploads.length === 0 ? (
            <div className="py-8 text-center">
              <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
              <p className="text-muted-foreground">No uploads yet. Start by uploading content!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentUploads.map((upload) => (
                <div
                  key={upload.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{upload.title}</p>
                      <p className="text-sm text-muted-foreground capitalize">
                        {upload.content_type.replace('_', ' ')}
                      </p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    upload.urgency === 'high' 
                      ? 'bg-urgency-high/10 text-urgency-high' 
                      : upload.urgency === 'medium'
                      ? 'bg-urgency-medium/10 text-urgency-medium'
                      : 'bg-urgency-low/10 text-urgency-low'
                  }`}>
                    {upload.urgency}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
