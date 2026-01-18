"use client";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Upload,
  FileText,
  Trash2,
  ExternalLink,
} from "lucide-react";
import {
  loadFacultyUploads,
  saveFacultyUploads,
  LocalFacultyUpload,
} from "@/utils/facultyUploadsStorage";
import { format } from "date-fns";
import { toast } from "sonner";

export default function MyUploads() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [uploads, setUploads] = useState<LocalFacultyUpload[]>([]);

  useEffect(() => {
    if (!profile?.id) return;
    setUploads(loadFacultyUploads(profile.id));
  }, [profile?.id]);

  const deleteUpload = (id: string) => {
    if (!profile?.id) return;

    const updated = uploads.filter((u) => u.id !== id);
    setUploads(updated);
    saveFacultyUploads(profile.id, updated);
    toast.success("Upload deleted");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Upload className="w-5 h-5 text-primary" />
            My Uploads
          </h1>
          <p className="text-sm text-muted-foreground">
            Content uploaded by you (demo)
          </p>
        </div>

        {/* Empty */}
        {uploads.length === 0 ? (
          <Card
            className="cursor-pointer hover:border-primary transition"
            onClick={() => navigate("/dashboard/upload")}
          >
            <CardContent className="py-20 text-center">
              <Upload className="w-12 h-12 mx-auto mb-4 opacity-40" />
              <h3 className="text-lg font-medium">
                No uploads yet
              </h3>
              <p className="text-muted-foreground text-sm">
                Click to upload your first content
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {uploads.map((item) => (
              <Card key={item.id} className="group">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-primary" />
                      <CardTitle className="text-base">
                        {item.title}
                      </CardTitle>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteUpload(item.id)}
                      className="opacity-0 group-hover:opacity-100 text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>

                <CardContent>
                  {item.description && (
                    <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                      {item.description}
                    </p>
                  )}

                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>
                      {format(
                        new Date(item.created_at),
                        "MMM d, yyyy"
                      )}
                    </span>
                    <span className="capitalize">
                      {item.content_type}
                    </span>
                  </div>

                  {item.file_url && (
                    <a
                      href={item.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 text-xs text-primary flex items-center gap-1 hover:underline"
                    >
                      View file <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
