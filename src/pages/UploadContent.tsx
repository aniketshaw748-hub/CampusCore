import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Upload, Loader2, FileText, Check } from 'lucide-react';
import { toast } from 'sonner';
import type { Branch, Subject, ContentType, UrgencyLevel } from '@/types';
import {
  loadFacultyUploads,
  saveFacultyUploads,
} from "@/utils/facultyUploadsStorage";


export default function UploadContent() {
  const { profile, userRole, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  const [branches, setBranches] = useState<Branch[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [contentType, setContentType] = useState<ContentType>('notice');
  const [selectedBranch, setSelectedBranch] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [urgency, setUrgency] = useState<UrgencyLevel>('low');
  const [deadline, setDeadline] = useState('');
  const [isExamRelated, setIsExamRelated] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    if (!authLoading && (userRole !== 'faculty' && userRole !== 'admin')) {
      navigate('/dashboard');
      return;
    }
    fetchData();
  }, [userRole, authLoading]);

  const fetchData = async () => {
    const { data: branchData } = await supabase.from('branches').select('*').order('name');
    if (branchData) setBranches(branchData as Branch[]);
  };

  useEffect(() => {
    if (selectedBranch && selectedSemester) {
      fetchSubjects();
    }
  }, [selectedBranch, selectedSemester]);

  const fetchSubjects = async () => {
    const branch = branches.find(b => b.code === selectedBranch);
    if (!branch) return;
    
    const { data } = await supabase
      .from('subjects')
      .select('*')
      .eq('branch_id', branch.id)
      .eq('semester', parseInt(selectedSemester));
    
    if (data) setSubjects(data as Subject[]);
  };
  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!title.trim()) {
    toast.error("Please enter a title");
    return;
  }

  if (!profile?.id) {
    toast.error("User not authenticated");
    return;
  }

  setLoading(true);

  try {
    let fileUrl: string | null = null;

    if (file) {
      fileUrl = URL.createObjectURL(file); // same as My Notes
    }

    const newUpload = {
      id: crypto.randomUUID(),
      title,
      description: description || null,
      content_type: contentType,
      file_name: file?.name || null,
      file_url: fileUrl,
      urgency,
      created_at: new Date().toISOString(),
    };

    const existing = loadFacultyUploads(profile.id);
    saveFacultyUploads(profile.id, [newUpload, ...existing]);

    setSuccess(true);
    toast.success("Content uploaded successfully!");

    setTimeout(() => {
      setSuccess(false);
      setTitle("");
      setDescription("");
      setContentType("notice");
      setSelectedBranch("");
      setSelectedSemester("");
      setSelectedSubject("");
      setUrgency("low");
      setDeadline("");
      setIsExamRelated(false);
      setFile(null);
    }, 1500);
  } catch (err: any) {
    toast.error(err.message || "Upload failed");
  } finally {
    setLoading(false);
  }
};


  // const handleSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();
    
  //   if (!title.trim()) {
  //     toast.error('Please enter a title');
  //     return;
  //   }

  //   setLoading(true);
    
  //   try {
  //     let fileUrl = null;
  //     let fileName = null;

  //     if (file) {
  //       fileUrl = `https://example.com/files/${file.name}`;
  //       fileName = file.name;
  //     }

  //     const branch = branches.find(b => b.code === selectedBranch);

  //     const { error } = await supabase.from('faculty_uploads').insert({
  //       uploaded_by: profile.id,
  //       title,
  //       description: description || null,
  //       content_type: contentType,
  //       file_url: fileUrl,
  //       file_name: fileName,
  //       branch_id: branch?.id || null,
  //       semester: selectedSemester ? parseInt(selectedSemester) : null,
  //       subject_id: selectedSubject || null,
  //       urgency,
  //       deadline: deadline || null,
  //       is_exam_related: isExamRelated,
  //     });

  //     if (error) throw error;

  //     // store locally per faculty
  //     if (profile?.id) {
  //       const existing = loadFacultyUploads(profile.id);

  //       const localUpload = {
  //         id: crypto.randomUUID(),
  //         title,
  //         description: description || null,
  //         content_type: contentType,
  //         file_name: file?.name || null,
  //         urgency,
  //         created_at: new Date().toISOString(),
  //       };

  //       saveFacultyUploads(profile.id, [localUpload, ...existing]);
  //     }

  //     setSuccess(true);
  //     toast.success("Content uploaded successfully!");

      
  //     // Reset form after delay
  //     setTimeout(() => {
  //       setSuccess(false);
  //       setTitle('');
  //       setDescription('');
  //       setContentType('notice');
  //       setSelectedBranch('');
  //       setSelectedSemester('');
  //       setSelectedSubject('');
  //       setUrgency('low');
  //       setDeadline('');
  //       setIsExamRelated(false);
  //       setFile(null);
  //     }, 2000);
  //   } catch (error: any) {
  //     toast.error(error.message || 'Failed to upload content');
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  if (authLoading) {
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
      <div className=" mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5 text-primary" />
              Upload Content
            </CardTitle>
            <CardDescription>
              Upload notices, syllabus, or study materials for students
            </CardDescription>
          </CardHeader>
          <CardContent>
            {success ? (
              <div className="py-12 text-center animate-scale-in">
                <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-success" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Upload Successful!</h3>
                <p className="text-muted-foreground">Your content is now available to students.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter title"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Add a description..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Content Type</Label>
                    <Select value={contentType} onValueChange={(v) => setContentType(v as ContentType)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="notice">Notice</SelectItem>
                        <SelectItem value="syllabus">Syllabus</SelectItem>
                        <SelectItem value="study_material">Study Material</SelectItem>
                        <SelectItem value="assignment">Assignment</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Urgency</Label>
                    <Select value={urgency} onValueChange={(v) => setUrgency(v as UrgencyLevel)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Branch</Label>
                    <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select branch" />
                      </SelectTrigger>
                      <SelectContent>
                        {branches.map((branch) => (
                          <SelectItem key={branch.id} value={branch.code}>
                            {branch.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Semester</Label>
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

                {subjects.length > 0 && (
                  <div>
                    <Label>Subject</Label>
                    <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select subject" />
                      </SelectTrigger>
                      <SelectContent>
                        {subjects.map((subject) => (
                          <SelectItem key={subject.id} value={subject.id}>
                            {subject.name} ({subject.code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div>
                  <Label htmlFor="deadline">Deadline (optional)</Label>
                  <Input
                    id="deadline"
                    type="datetime-local"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="file">Attach File (optional)</Label>
                  <Input
                    id="file"
                    type="file"
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.jpg,.jpeg,.png"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                  />
                  {file && (
                    <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                      <FileText className="w-4 h-4" />
                      {file.name}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    id="exam-related"
                    checked={isExamRelated}
                    onCheckedChange={setIsExamRelated}
                  />
                  <Label htmlFor="exam-related" className="cursor-pointer">
                    This is exam-related content
                  </Label>
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      Upload Content
                    </>
                  )}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
