import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase'; 
import { collection, query, getDocs, orderBy } from 'firebase/firestore';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { NoticeCard } from '@/components/dashboard/NoticeCard';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bell, Search, Loader2, BookOpen, Building2 } from 'lucide-react';
import type { FacultyUpload } from '@/types';
import { Button } from '@/components/ui/button';
import { DEMO_NOTICES } from "@/data/demoNotices";




export default function Notices() {
  const { profile } = useAuth();
  const [notices, setNotices] = useState<FacultyUpload[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Search and Existing Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterUrgency, setFilterUrgency] = useState<string>('all');
  
  // New Filters
  const [filterBranch, setFilterBranch] = useState<string>('all');
  const [filterSemester, setFilterSemester] = useState<string>('all');

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    try {
      // const q = query(collection(db, 'faculty_uploads'), orderBy('created_at', 'desc'));
      // const querySnapshot = await getDocs(q);
      // const dbNotices = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as FacultyUpload[];
      setNotices([...dbNotices, ...DEMO_NOTICES]);
    } catch (error) {
      setNotices(DEMO_NOTICES);
    } finally {
      setLoading(false);
    }
  };

  const filteredNotices = notices.filter((notice) => {
    const matchesSearch = notice.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notice.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = filterType === 'all' || notice.content_type === filterType;
    const matchesUrgency = filterUrgency === 'all' || notice.urgency === filterUrgency;
    
    // Branch Filter Logic (Include 'all' branch notices in any branch selection)
    const matchesBranch = filterBranch === 'all' || 
                          notice.branch_id === 'all' || 
                          notice.branch_id === filterBranch;
    
    // Semester Filter Logic
    const matchesSemester = filterSemester === 'all' || 
                             notice.semester === null || 
                             notice.semester?.toString() === filterSemester;
    
    return matchesSearch && matchesType && matchesUrgency && matchesBranch && matchesSemester;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold font-display flex items-center gap-2">
              <Bell className="w-6 h-6 text-primary" />
              Notices & Updates
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Keep track of important announcements and syllabus updates.
            </p>
          </div>
          
          {/* Active Profile Info (Quick Visual Feedback) */}
          {profile?.branch && (
             <div className="flex gap-2 items-center px-3 py-1 bg-primary/5 border border-primary/20 rounded-full text-xs font-medium text-primary">
                <Building2 className="w-3 h-3" /> {profile.branch} | Sem {profile.semester}
             </div>
          )}
        </div>

        {/* Filter Bar */}
        <div className="grid grid-cols-1 gap-4">
          {/* Search Row */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by title or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-11"
            />
          </div>

          {/* Selector Row */}
          <div className="flex flex-wrap gap-2">
            <Select value={filterBranch} onValueChange={setFilterBranch}>
              <SelectTrigger className="w-[140px] bg-card">
                <SelectValue placeholder="Branch" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Branches</SelectItem>
                <SelectItem value="CS">Computer Sci</SelectItem>
                <SelectItem value="EC">Electronics</SelectItem>
                <SelectItem value="ME">Mechanical</SelectItem>
                <SelectItem value="CE">Civil</SelectItem>
                <SelectItem value="EE">Electrical</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterSemester} onValueChange={setFilterSemester}>
              <SelectTrigger className="w-[130px] bg-card">
                <SelectValue placeholder="Semester" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Semesters</SelectItem>
                {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                  <SelectItem key={sem} value={sem.toString()}>Semester {sem}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[140px] bg-card">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="notice">Notice</SelectItem>
                <SelectItem value="syllabus">Syllabus</SelectItem>
                <SelectItem value="assignment">Assignment</SelectItem>
              </SelectContent>
            </Select>

            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => {
                setFilterBranch('all');
                setFilterSemester('all');
                setFilterType('all');
                setSearchQuery('');
              }}
              className="text-xs text-muted-foreground hover:text-primary"
            >
              Reset Filters
            </Button>
          </div>
        </div>

        {/* Notices List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Updating notice board...</p>
          </div>
        ) : filteredNotices.length === 0 ? (
          <div className="py-20 text-center bg-card rounded-2xl border-2 border-dashed">
            <Bell className="w-12 h-12 mx-auto mb-4 text-muted-foreground/20" />
            <h3 className="text-lg font-medium">Nothing found here</h3>
            <p className="text-muted-foreground text-sm max-w-[250px] mx-auto mt-1">
              No notices match your current filter criteria.
            </p>
          </div>
        ) : (
          <div className="grid gap-3">
            {filteredNotices.map((notice) => (
              <NoticeCard key={notice.id} notice={notice} />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}