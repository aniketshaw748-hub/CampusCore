"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/components/theme-provider";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  Settings as SettingsIcon,
  Moon,
  Sun,
  User,
  BookOpen,
  GraduationCap,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import type { Branch } from "@/types";

/* demo subjects */
const DEMO_SUBJECTS = [
  "Data Structures",
  "Operating Systems",
  "DBMS",
  "Computer Networks",
  "Software Engineering",
];

export default function Settings() {
  const { profile, userRole, updateProfile } = useAuth();
  const { theme, setTheme } = useTheme();

  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // student
  const [selectedBranch, setSelectedBranch] = useState(profile?.branch || "");
  const [selectedSemester, setSelectedSemester] = useState(
    profile?.semester?.toString() || ""
  );

  // faculty
  const [facultyDept, setFacultyDept] = useState(
    (profile as any)?.department || ""
  );
  const [facultySubjects, setFacultySubjects] = useState<string[]>(
    (profile as any)?.teaching_subjects || []
  );

  /* demo branches (no supabase save) */
  useEffect(() => {
    setBranches([
      { id: "1", name: "Computer Science", code: "CS" },
      { id: "2", name: "Electronics", code: "EC" },
      { id: "3", name: "Mechanical", code: "ME" },
      { id: "4", name: "Civil", code: "CE" },
    ] as Branch[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!profile) return;
    setSelectedBranch(profile.branch || "");
    setSelectedSemester(profile.semester?.toString() || "");
    setFacultyDept((profile as any)?.department || "");
    setFacultySubjects((profile as any)?.teaching_subjects || []);
  }, [profile]);

  const isDarkMode =
    theme === "dark" ||
    (theme === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  /* save student prefs */
  const saveStudentPrefs = async () => {
    if (!selectedBranch || !selectedSemester) {
      toast.error("Select branch and semester");
      return;
    }

    setSaving(true);
    updateProfile({
      branch: selectedBranch,
      semester: parseInt(selectedSemester),
    });
    toast.success("Student preferences saved");
    setSaving(false);
  };

  /* save faculty prefs */
  const saveFacultyPrefs = async () => {
    if (!facultyDept || facultySubjects.length === 0) {
      toast.error("Select department and subjects");
      return;
    }

    setSaving(true);
    updateProfile({
      ...(profile || {}),
      department: facultyDept,
      teaching_subjects: facultySubjects,
    } as any);
    toast.success("Faculty preferences saved");
    setSaving(false);
  };

  const toggleSubject = (subject: string) => {
    setFacultySubjects((prev) =>
      prev.includes(subject)
        ? prev.filter((s) => s !== subject)
        : [...prev, subject]
    );
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
            <SettingsIcon className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Settings</h1>
            <p className="text-muted-foreground">
              Manage your preferences
            </p>
          </div>
        </div>

        {/* Profile */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={profile?.avatar_url || ""} />
              <AvatarFallback>
                {profile?.full_name?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-lg">
                {profile?.full_name}
              </p>
              <p className="text-sm text-muted-foreground">
                {profile?.email}
              </p>
              <p className="text-sm capitalize text-muted-foreground">
                Role: {userRole}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Appearance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {isDarkMode ? <Moon /> : <Sun />}
              Appearance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <Label>Dark Mode</Label>
              <Switch
                checked={isDarkMode}
                onCheckedChange={(v) =>
                  setTheme(v ? "dark" : "light")
                }
              />
            </div>
            <Separator />
            <Select
              value={theme}
              onValueChange={(v: any) => setTheme(v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* STUDENT */}
        {userRole === "student" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen />
                Academic Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select
                value={selectedBranch}
                onValueChange={setSelectedBranch}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select branch" />
                </SelectTrigger>
                <SelectContent>
                  {branches.map((b) => (
                    <SelectItem key={b.code} value={b.code}>
                      {b.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={selectedSemester}
                onValueChange={setSelectedSemester}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select semester" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                    <SelectItem key={s} value={s.toString()}>
                      Semester {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                onClick={saveStudentPrefs}
                disabled={saving}
                className="w-full"
              >
                {saving ? "Saving..." : "Save Preferences"}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* FACULTY */}
        {userRole === "faculty" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap />
                Faculty Preferences
              </CardTitle>
              <CardDescription>
                Set your department and subjects you teach
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select
                value={facultyDept}
                onValueChange={setFacultyDept}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {branches.map((b) => (
                    <SelectItem key={b.code} value={b.code}>
                      {b.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div>
                <Label>Subjects</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {DEMO_SUBJECTS.map((s) => (
                    <Button
                      key={s}
                      type="button"
                      variant={
                        facultySubjects.includes(s)
                          ? "default"
                          : "outline"
                      }
                      size="sm"
                      onClick={() => toggleSubject(s)}
                    >
                      {s}
                    </Button>
                  ))}
                </div>
              </div>

              <Button
                onClick={saveFacultyPrefs}
                disabled={saving}
                className="w-full"
              >
                {saving ? "Saving..." : "Save Preferences"}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
