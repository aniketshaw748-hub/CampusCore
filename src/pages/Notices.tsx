import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { NoticeCard } from '@/components/dashboard/NoticeCard';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bell, Search, Loader2, Filter } from 'lucide-react';
import type { FacultyUpload, ContentType, UrgencyLevel } from '@/types';

export default function Notices() {
  const { profile } = useAuth();
  const [notices, setNotices] = useState<FacultyUpload[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterUrgency, setFilterUrgency] = useState<string>('all');

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    const { data } = await supabase
      .from('faculty_uploads')
      .select('*')
      .order('deadline', { ascending: true, nullsFirst: false })
      .order('urgency', { ascending: false })
      .order('created_at', { ascending: false });
    
    if (data) setNotices(data as FacultyUpload[]);
    setLoading(false);
  };

  const filteredNotices = notices.filter((notice) => {
    const matchesSearch = notice.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notice.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || notice.content_type === filterType;
    const matchesUrgency = filterUrgency === 'all' || notice.urgency === filterUrgency;
    
    return matchesSearch && matchesType && matchesUrgency;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold font-display flex items-center gap-2">
            <Bell className="w-6 h-6 text-primary" />
            Notices & Updates
          </h1>
          <p className="text-muted-foreground mt-1">
            {profile?.branch ? `Showing notices for ${profile.branch} - Semester ${profile.semester}` : 'All notices'}
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search notices..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex gap-2">
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Content type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="notice">Notice</SelectItem>
                <SelectItem value="syllabus">Syllabus</SelectItem>
                <SelectItem value="study_material">Study Material</SelectItem>
                <SelectItem value="assignment">Assignment</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterUrgency} onValueChange={setFilterUrgency}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Urgency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Notices List */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filteredNotices.length === 0 ? (
          <div className="py-16 text-center">
            <Bell className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-lg font-medium mb-1">No notices found</h3>
            <p className="text-muted-foreground">
              {searchQuery || filterType !== 'all' || filterUrgency !== 'all' 
                ? 'Try adjusting your filters' 
                : 'Check back later for updates'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredNotices.map((notice) => (
              <NoticeCard key={notice.id} notice={notice} />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
