import { Button } from '@/components/ui/button';
import { GraduationCap, BookOpen, Brain, Sparkles } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export function Hero() {
  const { userRole } = useAuth();
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/landing');
  };

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 gradient-hero opacity-5" />
      
      {/* Floating shapes */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '-3s' }} />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8 animate-fade-in">
            <Sparkles className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium text-muted-foreground">AI-Powered Academic Assistant</span>
          </div>
          
          {/* Heading */}
          <h1 className="text-5xl md:text-7xl font-bold font-display mb-6 animate-slide-up">
            Your Academic Hub,{' '}
            <span className="gradient-text">Simplified</span>
          </h1>
          
          {/* Subheading */}
          <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: '0.1s' }}>
            Centralize notices, syllabus & study material. Get AI-powered exam prep from your college's official content.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <Button 
              variant="hero" 
              size="xl" 
              onClick={handleGetStarted}
            >
              <GraduationCap className="w-5 h-5" />
              {userRole ? 'Go to Dashboard' : 'Get Started'}
            </Button>
            <Button variant="outline" size="xl">
              <BookOpen className="w-5 h-5" />
              Learn More
            </Button>
          </div>
          
          {/* Feature pills */}
          <div className="flex flex-wrap justify-center gap-3 animate-slide-up" style={{ animationDelay: '0.3s' }}>
            {[
              { icon: BookOpen, label: 'Smart Notices' },
              { icon: Brain, label: 'CampusGPT' },
              { icon: GraduationCap, label: 'Exam Mode' },
            ].map((feature, index) => (
              <div
                key={feature.label}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card shadow-card hover:shadow-card-hover transition-shadow"
              >
                <feature.icon className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">{feature.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
