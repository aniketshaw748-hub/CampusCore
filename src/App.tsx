import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/components/theme-provider";
import Index from "./pages/Index";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import UploadContent from "./pages/UploadContent";
import Notices from "./pages/Notices";
import CampusGPT from "./pages/CampusGPT";
import ExamMode from "./pages/ExamMode";
import MyNotes from "./pages/MyNotes";
import Settings from "./pages/Settings";
import AdminManage from "./pages/AdminManage";
import NotFound from "./pages/NotFound";

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
              <Route path="/landing" element={<Landing />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/dashboard/upload" element={<UploadContent />} />
              <Route path="/dashboard/notices" element={<Notices />} />
              <Route path="/dashboard/chat" element={<CampusGPT />} />
              <Route path="/dashboard/exam" element={<ExamMode />} />
              <Route path="/dashboard/notes" element={<MyNotes />} />
              <Route path="/dashboard/settings" element={<Settings />} />
              <Route path="/dashboard/manage" element={<AdminManage />} />
              <Route path="/dashboard/my-uploads" element={<Notices />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
