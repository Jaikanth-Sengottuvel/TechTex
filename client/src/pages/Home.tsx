import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { ArrowRight, Zap, Layers, Users } from 'lucide-react';
import logoPath from '@assets/WhatsApp Image 2025-08-21 at 19.25.19_48022aa7_1755785039674.jpg';

export function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1c1c] via-[#0f2727] to-[#0a1c1c]">
      {/* Hero Section */}
      <section className="container mx-auto px-6 pt-20 pb-16">
        <div className="text-center max-w-4xl mx-auto">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="w-32 h-32 rounded-2xl overflow-hidden tech-glow animate-pulse">
              <img 
                src={logoPath} 
                alt="TechTex" 
                className="w-full h-full object-contain"
              />
            </div>
          </div>

          {/* Tagline */}
          <h1 className="text-6xl md:text-7xl font-bold mb-6 tracking-tight">
            <span className="text-white">Design</span>{' '}
            <span className="tech-gradient-text">Smarter</span>
            <br />
            <span className="text-white">Build</span>{' '}
            <span className="tech-gradient-text">Faster</span>
          </h1>

          <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
            The next-generation design platform that empowers teams to create, 
            collaborate, and iterate with unprecedented speed and precision.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Link to="/editor">
              <Button 
                size="lg" 
                className="tech-gradient hover:opacity-90 transition-all duration-300 text-lg px-8 py-3 tech-glow"
              >
                Start Creating
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            
            <Button 
              variant="outline" 
              size="lg"
              className="tech-border hover:bg-primary/10 hover:text-primary text-lg px-8 py-3"
            >
              Watch Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-6 pb-20">
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Feature 1 */}
          <div className="text-center p-8 rounded-2xl bg-card/50 tech-border backdrop-blur-sm hover:bg-card/70 transition-all duration-300">
            <div className="w-16 h-16 mx-auto mb-6 rounded-xl tech-gradient flex items-center justify-center">
              <Zap className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-4 text-foreground">Lightning Fast</h3>
            <p className="text-muted-foreground leading-relaxed">
              Built for speed with modern web technologies. Create and iterate 
              faster than ever before.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="text-center p-8 rounded-2xl bg-card/50 tech-border backdrop-blur-sm hover:bg-card/70 transition-all duration-300">
            <div className="w-16 h-16 mx-auto mb-6 rounded-xl tech-gradient flex items-center justify-center">
              <Layers className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-4 text-foreground">Advanced Tools</h3>
            <p className="text-muted-foreground leading-relaxed">
              Professional-grade design tools with intuitive interfaces 
              for designers of all skill levels.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="text-center p-8 rounded-2xl bg-card/50 tech-border backdrop-blur-sm hover:bg-card/70 transition-all duration-300">
            <div className="w-16 h-16 mx-auto mb-6 rounded-xl tech-gradient flex items-center justify-center">
              <Users className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-4 text-foreground">Real-time Collaboration</h3>
            <p className="text-muted-foreground leading-relaxed">
              Work together seamlessly with live cursors, comments, 
              and instant sync across your team.
            </p>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="container mx-auto px-6 pb-20">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold mb-6 text-foreground">
            Ready to transform your design workflow?
          </h2>
          <Link to="/editor">
            <Button 
              size="lg" 
              className="tech-gradient hover:opacity-90 transition-all duration-300 text-lg px-8 py-3"
            >
              Get Started Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}