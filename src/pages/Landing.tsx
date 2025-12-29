import { Navbar } from '@/components/layout/Navbar';
import { Hero } from '@/components/landing/Hero';
import { Features } from '@/components/landing/Features';
import { RoleCards } from '@/components/landing/RoleCards';
import { GraduationCap } from 'lucide-react';

export default function Landing() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-16">
        <Hero />
        <Features />
        <RoleCards />
        
        {/* Footer */}
        <footer className="py-12 border-t border-border">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="font-bold font-display">CampusCore</span>
              </div>
              <p className="text-sm text-muted-foreground">
                © 2025 CampusCore. Built by students for students.
              </p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
