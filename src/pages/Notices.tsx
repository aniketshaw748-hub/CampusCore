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

// --- EXPANDED DEMO DATA ---
const DEMO_NOTICES: FacultyUpload[] = [
  {
    id: 'demo-1',
    uploaded_by: 'admin',
    title: 'End-Semester Theory Exam Schedule',
    description: 'The official timetable for the Winter 2025 examinations has been released. Exams begin from Jan 15th.',
    content_type: 'notice',
    file_url: '#',
    file_name: 'exam_timetable_v1.pdf',
    branch_id: 'all', // Special case for all branches
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
  },
  {
    id: 'demo-3',
    uploaded_by: 'faculty',
    title: 'Microprocessor Assignment #3',
    description: 'Submit the 8085 assembly language programs via the portal. Late submission will result in mark deduction.',
    content_type: 'assignment',
    file_url: '#',
    file_name: 'assignment_3.docx',
    branch_id: 'EC',
    semester: 4,
    subject_id: 'EC402',
    urgency: 'medium',
    deadline: new Date(Date.now() + 172800000).toISOString(),
    is_exam_related: false,
    created_at: new Date(Date.now() - 43200000).toISOString(),
    updated_at: new Date(Date.now() - 43200000).toISOString(),
  },
  {
    id: 'demo-4',
    uploaded_by: 'admin',
    title: 'Mechanical Workshop Safety Protocols',
    description: 'Mandatory reading for Sem 2 students before entering the workshop for the first time.',
    content_type: 'notice',
    file_url: '#',
    file_name: 'safety_first.pdf',
    branch_id: 'ME',
    semester: 2,
    subject_id: null,
    urgency: 'high',
    deadline: null,
    is_exam_related: false,
    created_at: new Date(Date.now() - 259200000).toISOString(),
    updated_at: new Date(Date.now() - 259200000).toISOString(),
  },
  {
    id: 'demo-5',
    uploaded_by: 'faculty',
    title: 'Civil Engineering: Surveying Field Book',
    description: 'Sample field book entries for the upcoming site visit to the city bypass project.',
    content_type: 'study_material',
    file_url: '#',
    file_name: 'survey_samples.pdf',
    branch_id: 'CE',
    semester: 4,
    subject_id: 'CE403',
    urgency: 'low',
    deadline: null,
    is_exam_related: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'demo-6',
    uploaded_by: 'admin',
    title: 'Campus Recruitment Drive: Google',
    description: 'Final year students (Sem 8) from CS and EC branches are eligible. Register on the placement portal.',
    content_type: 'notice',
    file_url: '#',
    file_name: 'job_description_google.pdf',
    branch_id: 'CS',
    semester: 8,
    subject_id: null,
    urgency: 'high',
    deadline: new Date(Date.now() + 432000000).toISOString(),
    is_exam_related: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'demo-7',
    uploaded_by: 'faculty',
    title: 'Electrical Machines - Important Questions',
    description: 'A list of 50 expected questions for the upcoming remedial exams.',
    content_type: 'study_material',
    file_url: '#',
    file_name: 'EE_Imp_Questions.pdf',
    branch_id: 'EE',
    semester: 5,
    subject_id: 'EE501',
    urgency: 'medium',
    deadline: null,
    is_exam_related: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'demo-8',
    uploaded_by: 'admin',
    title: 'Cultural Festival Volunteer List',
    description: 'Students from any branch and any semester can apply to be a volunteer for "CampusFest 2025".',
    content_type: 'notice',
    file_url: '#',
    file_name: null,
    branch_id: 'all',
    semester: null,
    subject_id: null,
    urgency: 'low',
    deadline: new Date(Date.now() + 864000000).toISOString(),
    is_exam_related: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
];

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
      const q = query(collection(db, 'faculty_uploads'), orderBy('created_at', 'desc'));
      const querySnapshot = await getDocs(q);
      const dbNotices = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as FacultyUpload[];
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