import { GraduationCap, Users, Shield } from 'lucide-react';

const roles = [
  {
    icon: GraduationCap,
    title: 'Students',
    description: 'Access prioritized notices, chat with CampusGPT, and practice with AI-generated exams.',
    color: 'from-blue-500 to-indigo-600',
  },
  {
    icon: Users,
    title: 'Faculty',
    description: 'Upload and manage course materials, notices, and syllabus with smart tagging.',
    color: 'from-emerald-500 to-teal-600',
  },
  {
    icon: Shield,
    title: 'Admins',
    description: 'Manage branches, subjects, and oversee all content on the platform.',
    color: 'from-amber-500 to-orange-600',
  },
];

export function RoleCards() {
  return (
    <section   id="about" className="py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold font-display mb-4">
            Built for <span className="gradient-text">Everyone</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Different roles, tailored experiences. CampusCore adapts to your needs.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {roles.map((role, index) => (
            <div
              key={role.title}
              className="relative group animate-fade-in-up"
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${role.color} rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
              <div className="relative p-8 rounded-2xl bg-card border border-border hover:border-primary/30 transition-colors duration-300">
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${role.color} flex items-center justify-center mb-6`}>
                  <role.icon className="w-8 h-8 text-primary-foreground" />
                </div>
                <h3 className="text-2xl font-bold font-display mb-3">{role.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{role.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
