import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { FileText, Plus, Loader2, Trash2, Upload, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import type { StudentUpload } from '@/types';

export default function MyNotes() {
  const { profile } = useAuth();
  const [notes, setNotes] = useState<StudentUpload[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Please enter a title');
      return;
    }

    setUploading(true);

    try {
      const newNote: StudentUpload = {
        id: crypto.randomUUID(),
        user_id: 'demo-user',
        title,
        description: description || null,
        file_url: file ? `https://example.com/notes/${file.name}` : null,
        file_name: file?.name || null,
        subject_id: null,
        created_at: new Date().toISOString(),
      };

      setNotes((prev) => [newNote, ...prev]);
      toast.success('Note uploaded successfully!');
      setDialogOpen(false);
      setTitle('');
      setDescription('');
      setFile(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload note');
    } finally {
      setUploading(false);
    }
  };

  const deleteNote = async (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    toast.success('Note deleted');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
              <FileText className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold font-display">My Notes</h1>
              <p className="text-sm text-muted-foreground">Your personal study materials</p>
            </div>
          </div>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4" />
                Add Note
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload Personal Note</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleUpload} className="space-y-4">
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Note title"
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
                <div>
                  <Label htmlFor="file">Attach File (optional)</Label>
                  <Input
                    id="file"
                    type="file"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={uploading}>
                    {uploading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        Upload
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Notes Grid */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : notes.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="text-lg font-medium mb-1">No notes yet</h3>
              <p className="text-muted-foreground mb-4">
                Upload your personal study materials to practice with CampusGPT
              </p>
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="w-4 h-4" />
                Add Your First Note
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {notes.map((note) => (
              <Card key={note.id} className="group hover:shadow-card-hover transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                      onClick={() => deleteNote(note.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <CardTitle className="text-base mt-2">{note.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  {note.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {note.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{format(new Date(note.created_at), 'MMM d, yyyy')}</span>
                    {note.file_url && (
                      <a
                        href={note.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-primary hover:underline"
                      >
                        View file <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Info Card */}
        <Card className="bg-secondary/50">
          <CardContent className="py-4">
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">Note:</strong> Your personal notes are private and only visible to you. They can be used with CampusGPT for personalized learning, but faculty material always takes priority.
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
