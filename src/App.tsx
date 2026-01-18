import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/components/theme-provider";
import Index from "./pages/Index";
// import Landing from "./pages/login";
import Dashboard from "./pages/Dashboard";
import UploadContent from "./pages/UploadContent";
import Notices from "./pages/Notices";
import CampusGPT from "./pages/CampusGPT";
import ExamMode from "./pages/ExamMode";
import MyNotes from "./pages/MyNotes";
import Settings from "./pages/Settings";
import AdminManage from "./pages/AdminManage";
import NotFound from "./pages/NotFound";
import Login from "./pages/login";
import Classes from "./pages/Classes";
import MyClasses from "./pages/MyClasses";
import MyUploads from "./pages/MyUploads";
import AdminCampus from "./pages/AdminCampus";
import CampusSetup from "./pages/CampusSetup";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="system" storageKey="campuscore-theme">
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/landing" element={<Login />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/dashboard/upload" element={<UploadContent />} />
              <Route path="/dashboard/notices" element={<Notices />} />
              <Route path="/dashboard/chat" element={<CampusGPT />} />
              <Route path="/dashboard/exam" element={<ExamMode />} />
              <Route path="/dashboard/notes" element={<MyNotes />} />
              <Route path="/dashboard/settings" element={<Settings />} />
              <Route path="/dashboard/manage" element={<AdminManage />} />
              <Route path="/dashboard/classes" element={<Classes />} />
              <Route path="/dashboard/my-classes" element={<MyClasses />} />
              <Route path="/dashboard/my-uploads" element={<MyUploads />} />
              <Route path="/dashboard/campus" element={<AdminCampus />} />
              <Route path="/campus-setup" element={<CampusSetup />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
