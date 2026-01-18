"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Trash2, Building2, UserPlus } from "lucide-react";
import { toast } from "sonner";

/* ---------- storage keys ---------- */
const COLLEGE_KEY = "admin_college_name";
const FACULTY_KEY = "admin_faculty";
const STUDENT_KEY = "admin_students";

/* ---------- types ---------- */
interface Faculty {
  id: string;
  email: string;
  branch: string;
  subject: string;
}

interface Student {
  id: string;
  email: string;
  branch: string;
  semester: string;
}

export default function AdminCampus() {
  /* ---------- college ---------- */
  const [collegeName, setCollegeName] = useState(
    "St Thomas College of Engineering and Technology"
  );

  /* ---------- faculty ---------- */
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [fEmail, setFEmail] = useState("");
  const [fBranch, setFBranch] = useState("");
  const [fSubject, setFSubject] = useState("");

  /* ---------- students ---------- */
  const [students, setStudents] = useState<Student[]>([]);
  const [sEmail, setSEmail] = useState("");
  const [sBranch, setSBranch] = useState("");
  const [sSemester, setSSemester] = useState("");

  /* ---------- load ---------- */
  useEffect(() => {
    setCollegeName(
      localStorage.getItem(COLLEGE_KEY) ||
        "St Thomas College of Engineering and Technology"
    );
    setFaculty(JSON.parse(localStorage.getItem(FACULTY_KEY) || "[]"));
    setStudents(JSON.parse(localStorage.getItem(STUDENT_KEY) || "[]"));
  }, []);

  /* ---------- save college ---------- */
  const saveCollege = () => {
    localStorage.setItem(COLLEGE_KEY, collegeName);
    toast.success("College name saved");
  };

  /* ---------- faculty ---------- */
  const addFaculty = () => {
    if (!fEmail || !fBranch || !fSubject) {
      toast.error("Fill all faculty fields");
      return;
    }

    const newFaculty: Faculty = {
      id: crypto.randomUUID(),
      email: fEmail,
      branch: fBranch,
      subject: fSubject,
    };

    const updated = [newFaculty, ...faculty];
    setFaculty(updated);
    localStorage.setItem(FACULTY_KEY, JSON.stringify(updated));

    setFEmail("");
    setFBranch("");
    setFSubject("");
    toast.success("Faculty added");
  };

  const deleteFaculty = (id: string) => {
    const updated = faculty.filter((f) => f.id !== id);
    setFaculty(updated);
    localStorage.setItem(FACULTY_KEY, JSON.stringify(updated));
    toast.success("Faculty removed");
  };

  /* ---------- students ---------- */
  const addStudent = () => {
    if (!sEmail || !sBranch || !sSemester) {
      toast.error("Fill all student fields");
      return;
    }

    const newStudent: Student = {
      id: crypto.randomUUID(),
      email: sEmail,
      branch: sBranch,
      semester: sSemester,
    };

    const updated = [newStudent, ...students];
    setStudents(updated);
    localStorage.setItem(STUDENT_KEY, JSON.stringify(updated));

    setSEmail("");
    setSBranch("");
    setSSemester("");
    toast.success("Student added");
  };

  const deleteStudent = (id: string) => {
    const updated = students.filter((s) => s.id !== id);
    setStudents(updated);
    localStorage.setItem(STUDENT_KEY, JSON.stringify(updated));
    toast.success("Student removed");
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-4xl mx-auto">

        {/* College */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              College Information
            </CardTitle>
          </CardHeader>
          <CardContent className="flex gap-2">
            <Input
              value={collegeName}
              onChange={(e) => setCollegeName(e.target.value)}
            />
            <Button onClick={saveCollege}>Save</Button>
          </CardContent>
        </Card>

        {/* Faculty */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5" />
              Faculty Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-2">
              <Input placeholder="Faculty Gmail" value={fEmail} onChange={(e) => setFEmail(e.target.value)} />
              <Input placeholder="Branch" value={fBranch} onChange={(e) => setFBranch(e.target.value)} />
              <Input placeholder="Subject" value={fSubject} onChange={(e) => setFSubject(e.target.value)} />
            </div>
            <Button onClick={addFaculty}>Add Faculty</Button>

            {faculty.map((f) => (
              <div key={f.id} className="flex justify-between border p-2 rounded">
                <div>
                  <p className="font-medium">{f.email}</p>
                  <p className="text-sm text-muted-foreground">
                    {f.branch} • {f.subject}
                  </p>
                </div>
                <Button variant="ghost" onClick={() => deleteFaculty(f.id)}>
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Students */}
        <Card>
          <CardHeader>
            <CardTitle>Student Management</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-2">
              <Input placeholder="Student Gmail" value={sEmail} onChange={(e) => setSEmail(e.target.value)} />
              <Input placeholder="Branch" value={sBranch} onChange={(e) => setSBranch(e.target.value)} />
              <Input placeholder="Semester" value={sSemester} onChange={(e) => setSSemester(e.target.value)} />
            </div>
            <Button onClick={addStudent}>Add Student</Button>

            {students.map((s) => (
              <div key={s.id} className="flex justify-between border p-2 rounded">
                <div>
                  <p className="font-medium">{s.email}</p>
                  <p className="text-sm text-muted-foreground">
                    {s.branch} • Sem {s.semester}
                  </p>
                </div>
                <Button variant="ghost" onClick={() => deleteStudent(s.id)}>
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
