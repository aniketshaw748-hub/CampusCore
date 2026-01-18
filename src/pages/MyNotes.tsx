"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  FileText,
  Plus,
  Loader2,
  Trash2,
  Upload,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import type { StudentUpload } from "@/types";

/* ---------------- helpers ---------------- */

const getStorageKey = (userId: string) => `my_notes_${userId}`;

const loadNotesForUser = (userId: string): StudentUpload[] => {
  try {
    const raw = localStorage.getItem(getStorageKey(userId));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveNotesForUser = (userId: string, notes: StudentUpload[]) => {
  localStorage.setItem(getStorageKey(userId), JSON.stringify(notes));
};

/* ---------------- component ---------------- */

export default function MyNotes() {
  const { profile } = useAuth();

  const [notes, setNotes] = useState<StudentUpload[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  // form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);

  /* load notes when user changes */
  useEffect(() => {
    if (!profile?.id) return;
    setNotes(loadNotesForUser(profile.id));
  }, [profile?.id]);

  /* upload note */
  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Please enter a title");
      return;
    }

    if (!profile?.id) {
      toast.error("User not authenticated");
      return;
    }

    setUploading(true);

    try {
      let fileUrl: string | null = null;

      if (file) {
        fileUrl = URL.createObjectURL(file); // opens instantly
      }

      const newNote: StudentUpload = {
        id: crypto.randomUUID(),
        user_id: profile.id,
        title,
        description: description || null,
        file_url: fileUrl,
        file_name: file?.name || null,
        subject_id: null,
        created_at: new Date().toISOString(),
      };

      const updatedNotes = [newNote, ...notes];
      setNotes(updatedNotes);
      saveNotesForUser(profile.id, updatedNotes);

      toast.success("Note uploaded successfully");
      setDialogOpen(false);
      setTitle("");
      setDescription("");
      setFile(null);
    } catch (err: any) {
      toast.error(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  /* delete note */
  const deleteNote = (id: string) => {
    if (!profile?.id) return;

    const updated = notes.filter((n) => n.id !== id);
    setNotes(updated);
    saveNotesForUser(profile.id, updated);

    toast.success("Note deleted");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <FileText className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold">My Notes</h1>
              <p className="text-sm text-muted-foreground">
                Your personal study materials
              </p>
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
                  <Label>Title *</Label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label>Description</Label>
                  <Textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div>
                  <Label>Attach File</Label>
                  <Input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) =>
                      setFile(e.target.files?.[0] || null)
                    }
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={uploading}>
                    {uploading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Uploading
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

        {/* Notes */}
        {notes.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-40" />
              <h3 className="text-lg font-medium mb-1">No notes yet</h3>
              <p className="text-muted-foreground mb-4">
                Upload your personal study materials
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
              <Card key={note.id} className="group">
                <CardHeader className="pb-2">
                  <div className="flex justify-between">
                    <FileText className="w-5 h-5 text-primary" />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteNote(note.id)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                  <CardTitle className="text-base mt-2">
                    {note.title}
                  </CardTitle>
                </CardHeader>

                <CardContent>
                  {note.description && (
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {note.description}
                    </p>
                  )}
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>
                      {format(
                        new Date(note.created_at),
                        "MMM d, yyyy"
                      )}
                    </span>
                    {note.file_url && (
                      <a
                        href={note.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-primary"
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

        {/* Info */}
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
