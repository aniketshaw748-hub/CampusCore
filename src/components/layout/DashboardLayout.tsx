import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Logo from '@/assets/CampusCoreLogo.svg';
import RedLogo from '@/assets/RedCampusCore.svg';
import {
  Bell,
  MessageSquare,
  BookOpen,
  Upload,
  Settings,
  LogOut,
  Menu,
  X,
  FileText,
  Users,
  Home,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  icon: React.ElementType;
  label: string;
  href: string;
  roles?: string[];
}

const studentNav: NavItem[] = [
  { icon: Home, label: 'Dashboard', href: '/dashboard' },
  { icon: Bell, label: 'Notices', href: '/dashboard/notices' },
  { icon: MessageSquare, label: 'CampusGPT', href: '/dashboard/chat' },
  { icon: BookOpen, label: 'Exam Mode', href: '/dashboard/exam' },
  { icon: FileText, label: 'My Notes', href: '/dashboard/notes' },
  { icon: Settings, label: 'Settings', href: '/dashboard/settings' },
];

const facultyNav: NavItem[] = [
  { icon: Home, label: 'Dashboard', href: '/dashboard' },
  { icon: Upload, label: 'Upload Content', href: '/dashboard/upload' },
  { icon: FileText, label: 'My Uploads', href: '/dashboard/my-uploads' },
  { icon: Bell, label: 'All Notices', href: '/dashboard/notices' },
  { icon: Settings, label: 'Settings', href: '/dashboard/settings' },
];

const adminNav: NavItem[] = [
  { icon: Home, label: 'Dashboard', href: '/dashboard' },
  { icon: Upload, label: 'Upload Content', href: '/dashboard/upload' },
  { icon: FileText, label: 'All Content', href: '/dashboard/my-uploads' },
  { icon: Users, label: 'Manage', href: '/dashboard/manage' },
  { icon: Bell, label: 'All Notices', href: '/dashboard/notices' },
  { icon: Settings, label: 'Settings', href: '/dashboard/settings' },
];

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { profile, isExam, userRole, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const currentLogo = isExam ? RedLogo : Logo;
  const navItems = userRole === 'admin' ? adminNav : userRole === 'faculty' ? facultyNav : studentNav;

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 glass z-50 flex items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <img src={currentLogo} alt="Logo" className="w-10 h-10 rounded-lg" />
          <span className={cn("font-bold", isExam && "text-destructive")}>CampusCore</span>
        </Link>
        <button onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 h-full w-64 bg-sidebar border-r border-sidebar-border z-40 transition-transform duration-300',
          'lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center gap-2 px-4 border-b border-sidebar-border">
          <img src={currentLogo} alt="Logo" className="w-10 h-10 rounded-lg transition-all duration-500" />
          <span className={cn("text-xl font-bold")}>
            CampusCore
          </span>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              onClick={() => setSidebarOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
                location.pathname === item.href
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          ))}
        </nav>

        {/* User Profile */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3 mb-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={profile?.avatar_url || ''} />
              <AvatarFallback className="gradient-primary text-primary-foreground">
                {profile?.full_name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{profile?.full_name || 'User'}</p>
              <p className="text-xs text-muted-foreground capitalize">{userRole || 'Student'}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" className="flex-1" onClick={() => navigate('/dashboard/settings')}>
              <Settings className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" className="flex-1 text-destructive" onClick={handleSignOut}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="lg:ml-64 pt-16 lg:pt-0 min-h-screen">
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
