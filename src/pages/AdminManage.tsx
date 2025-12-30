import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import Logo from '@/assets/CampusCoreLogo.svg';
import { 
  Users, 
  FileText, 
  BookOpen, 
  Loader2, 
  Search, 
  Trash2, 
  Eye,
  Plus,
  Edit,
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import type { Branch, Subject, FacultyUpload } from '@/types';

export default function AdminManage() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [uploads, setUploads] = useState<FacultyUpload[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBranch, setFilterBranch] = useState<string>('all');
  
  // Add branch dialog
  const [addBranchOpen, setAddBranchOpen] = useState(false);
  const [newBranchName, setNewBranchName] = useState('');
  const [newBranchCode, setNewBranchCode] = useState('');
  const [addingBranch, setAddingBranch] = useState(false);

  // Add subject dialog
  const [addSubjectOpen, setAddSubjectOpen] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [newSubjectCode, setNewSubjectCode] = useState('');
  const [newSubjectBranch, setNewSubjectBranch] = useState('');
  const [newSubjectSemester, setNewSubjectSemester] = useState('');
  const [addingSubject, setAddingSubject] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [branchesRes, subjectsRes, uploadsRes] = await Promise.all([
        supabase.from('branches').select('*').order('name'),
        supabase.from('subjects').select('*').order('name'),
        supabase.from('faculty_uploads').select('*').order('created_at', { ascending: false }).limit(100),
      ]);

      if (branchesRes.data) setBranches(branchesRes.data as Branch[]);
      if (subjectsRes.data) setSubjects(subjectsRes.data as Subject[]);
      if (uploadsRes.data) setUploads(uploadsRes.data as FacultyUpload[]);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddBranch = async () => {
    if (!newBranchName || !newBranchCode) {
      toast.error('Please fill all fields');
      return;
    }

    setAddingBranch(true);
    try {
      const { error } = await supabase.from('branches').insert({
        name: newBranchName,
        code: newBranchCode.toUpperCase(),
      });

      if (error) throw error;

      toast.success('Branch added successfully');
      setAddBranchOpen(false);
      setNewBranchName('');
      setNewBranchCode('');
      fetchData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to add branch');
    } finally {
      setAddingBranch(false);
    }
  };

  const handleAddSubject = async () => {
    if (!newSubjectName || !newSubjectCode || !newSubjectBranch || !newSubjectSemester) {
      toast.error('Please fill all fields');
      return;
    }

    setAddingSubject(true);
    try {
      const { error } = await supabase.from('subjects').insert({
        name: newSubjectName,
        code: newSubjectCode.toUpperCase(),
        branch_id: newSubjectBranch,
        semester: parseInt(newSubjectSemester),
      });

      if (error) throw error;

      toast.success('Subject added successfully');
      setAddSubjectOpen(false);
      setNewSubjectName('');
      setNewSubjectCode('');
      setNewSubjectBranch('');
      setNewSubjectSemester('');
      fetchData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to add subject');
    } finally {
      setAddingSubject(false);
    }
  };

  const handleDeleteUpload = async (id: string) => {
    if (!confirm('Are you sure you want to delete this upload?')) return;

    try {
      const { error } = await supabase.from('faculty_uploads').delete().eq('id', id);
      if (error) throw error;

      toast.success('Upload deleted');
      setUploads(uploads.filter(u => u.id !== id));
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete');
    }
  };

  const handleDeleteBranch = async (id: string) => {
    if (!confirm('Are you sure? This will affect all related subjects and uploads.')) return;

    try {
      const { error } = await supabase.from('branches').delete().eq('id', id);
      if (error) throw error;

      toast.success('Branch deleted');
      fetchData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete');
    }
  };

  const handleDeleteSubject = async (id: string) => {
    if (!confirm('Are you sure you want to delete this subject?')) return;

    try {
      const { error } = await supabase.from('subjects').delete().eq('id', id);
      if (error) throw error;

      toast.success('Subject deleted');
      setSubjects(subjects.filter(s => s.id !== id));
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete');
    }
  };

  const filteredUploads = uploads.filter(upload => {
    const matchesSearch = upload.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBranch = filterBranch === 'all' || upload.branch_id === filterBranch;
    return matchesSearch && matchesBranch;
  });

  const getContentTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      notice: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
      syllabus: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
      study_material: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
      assignment: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
    };
    return colors[type] || 'bg-muted text-muted-foreground';
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <img
              src={Logo}
              alt="CampusCore logo"
              className="w-10 h-10 rounded-lg"
            />
          <div>
            <h1 className="text-2xl font-bold font-display">Admin Management</h1>
            <p className="text-muted-foreground">Manage branches, subjects, and content</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{branches.length}</p>
                  <p className="text-sm text-muted-foreground">Branches</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{subjects.length}</p>
                  <p className="text-sm text-muted-foreground">Subjects</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{uploads.length}</p>
                  <p className="text-sm text-muted-foreground">Uploads</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">Demo</p>
                  <p className="text-sm text-muted-foreground">Users</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="uploads" className="space-y-4">
          <TabsList>
            <TabsTrigger value="uploads">Uploads</TabsTrigger>
            <TabsTrigger value="branches">Branches</TabsTrigger>
            <TabsTrigger value="subjects">Subjects</TabsTrigger>
          </TabsList>

          {/* Uploads Tab */}
          <TabsContent value="uploads" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <CardTitle>Faculty Uploads</CardTitle>
                    <CardDescription>Manage all uploaded content</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input 
                        placeholder="Search..." 
                        className="pl-9 w-48"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <Select value={filterBranch} onValueChange={setFilterBranch}>
                      <SelectTrigger className="w-36">
                        <SelectValue placeholder="Filter branch" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Branches</SelectItem>
                        {branches.map(b => (
                          <SelectItem key={b.id} value={b.id}>{b.code}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Branch</TableHead>
                      <TableHead>Semester</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUploads.slice(0, 20).map((upload) => (
                      <TableRow key={upload.id}>
                        <TableCell className="font-medium max-w-[200px] truncate">{upload.title}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getContentTypeBadge(upload.content_type)}>
                            {upload.content_type.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {branches.find(b => b.id === upload.branch_id)?.code || '-'}
                        </TableCell>
                        <TableCell>{upload.semester || '-'}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {format(new Date(upload.created_at), 'MMM d, yyyy')}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleDeleteUpload(upload.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {filteredUploads.length === 0 && (
                  <p className="text-center py-8 text-muted-foreground">No uploads found</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Branches Tab */}
          <TabsContent value="branches" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Branches</CardTitle>
                    <CardDescription>Manage academic branches/courses</CardDescription>
                  </div>
                  <Dialog open={addBranchOpen} onOpenChange={setAddBranchOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Branch
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New Branch</DialogTitle>
                        <DialogDescription>Create a new academic branch</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label>Branch Name</Label>
                          <Input 
                            placeholder="e.g., Computer Science Engineering"
                            value={newBranchName}
                            onChange={(e) => setNewBranchName(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Branch Code</Label>
                          <Input 
                            placeholder="e.g., CSE"
                            value={newBranchCode}
                            onChange={(e) => setNewBranchCode(e.target.value)}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setAddBranchOpen(false)}>Cancel</Button>
                        <Button onClick={handleAddBranch} disabled={addingBranch}>
                          {addingBranch ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Add Branch'}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Code</TableHead>
                      <TableHead>Subjects</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {branches.map((branch) => (
                      <TableRow key={branch.id}>
                        <TableCell className="font-medium">{branch.name}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{branch.code}</Badge>
                        </TableCell>
                        <TableCell>
                          {subjects.filter(s => s.branch_id === branch.id).length}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleDeleteBranch(branch.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Subjects Tab */}
          <TabsContent value="subjects" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Subjects</CardTitle>
                    <CardDescription>Manage subjects for each branch</CardDescription>
                  </div>
                  <Dialog open={addSubjectOpen} onOpenChange={setAddSubjectOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Subject
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New Subject</DialogTitle>
                        <DialogDescription>Create a new subject for a branch</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label>Subject Name</Label>
                          <Input 
                            placeholder="e.g., Data Structures"
                            value={newSubjectName}
                            onChange={(e) => setNewSubjectName(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Subject Code</Label>
                          <Input 
                            placeholder="e.g., CS201"
                            value={newSubjectCode}
                            onChange={(e) => setNewSubjectCode(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Branch</Label>
                          <Select value={newSubjectBranch} onValueChange={setNewSubjectBranch}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select branch" />
                            </SelectTrigger>
                            <SelectContent>
                              {branches.map(b => (
                                <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Semester</Label>
                          <Select value={newSubjectSemester} onValueChange={setNewSubjectSemester}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select semester" />
                            </SelectTrigger>
                            <SelectContent>
                              {[1,2,3,4,5,6,7,8].map(sem => (
                                <SelectItem key={sem} value={sem.toString()}>Semester {sem}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setAddSubjectOpen(false)}>Cancel</Button>
                        <Button onClick={handleAddSubject} disabled={addingSubject}>
                          {addingSubject ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Add Subject'}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Code</TableHead>
                      <TableHead>Branch</TableHead>
                      <TableHead>Semester</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subjects.map((subject) => (
                      <TableRow key={subject.id}>
                        <TableCell className="font-medium">{subject.name}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{subject.code}</Badge>
                        </TableCell>
                        <TableCell>
                          {branches.find(b => b.id === subject.branch_id)?.code || '-'}
                        </TableCell>
                        <TableCell>Sem {subject.semester}</TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleDeleteSubject(subject.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
