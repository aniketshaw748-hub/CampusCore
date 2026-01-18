import { Bell, Brain, FileText, Upload, Calendar, Shield } from 'lucide-react';

const features = [
  {
    icon: Bell,
    title: 'Priority Notices',
    description: 'Smart ranking based on deadlines, exam relevance, and your branch/semester.',
  },
  {
    icon: Brain,
    title: 'CampusGPT',
    description: 'AI assistant that answers from your college material only. No hallucinations.',
  },
  {
    icon: FileText,
    title: 'Exam Mode',
    description: 'Generate MCQs and practice tests from faculty-uploaded content.',
  },
  {
    icon: Upload,
    title: 'Easy Uploads',
    description: 'Faculty can upload PDFs, notices, and materials with proper tagging.',
  },
  {
    icon: Calendar,
    title: 'Calendar Sync',
    description: 'Add exam deadlines directly to your Google Calendar.',
  },
  {
    icon: Shield,
    title: 'Context-Locked',
    description: 'AI uses only verified college material. No web search, no noise.',
  },
];

export function Features() {
  return (
    <section  id="features" className="py-24 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold font-display mb-4">
            Everything You Need to <span className="gradient-text">Excel</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            CampusCore brings together all your academic resources with AI-powered tools to help you succeed.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group p-6 rounded-xl bg-card shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 animate-fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <feature.icon className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold font-display mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
