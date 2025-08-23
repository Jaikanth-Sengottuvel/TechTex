import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { ProfileMenu } from '@/components/ProfileMenu';
import logoPath from '@assets/WhatsApp Image 2025-08-21 at 19.25.19_48022aa7_1755785039674.jpg';

export function Navbar() {
  const [location] = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false); // This would be managed by auth context in real app

  const isActive = (path: string) => location === path;

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  return (
    <nav className="h-16 bg-card/50 backdrop-blur-lg border-b tech-border relative overflow-hidden">
      {/* Animated background glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent animate-pulse" />

      <div className="container mx-auto px-6 h-full flex items-center justify-between relative">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="w-10 h-10 rounded-lg overflow-hidden tech-glow transition-all duration-300 group-hover:scale-110">
            <img 
              src={logoPath} 
              alt="TechTex" 
              className="w-full h-full object-contain"
            />
          </div>
          <span className="text-2xl font-bold tech-gradient-text tracking-tight">
            TechTex
          </span>
        </Link>

        {/* Navigation Links */}
        <div className="flex items-center space-x-1">
          <Link to="/">
            <Button 
              variant={isActive('/') ? 'default' : 'ghost'} 
              size="sm"
              className={isActive('/') ? 'tech-gradient text-white' : 'hover:bg-primary/10 hover:text-primary'}
            >
              Home
            </Button>
          </Link>

          <Link to="/editor">
            <Button 
              variant={isActive('/editor') ? 'default' : 'ghost'} 
              size="sm"
              className={isActive('/editor') ? 'tech-gradient text-white' : 'hover:bg-primary/10 hover:text-primary'}
            >
              Editor
            </Button>
          </Link>

          <Link to="/dashboard">
            <Button 
              variant={isActive('/dashboard') ? 'default' : 'ghost'} 
              size="sm"
              className={isActive('/dashboard') ? 'tech-gradient text-white' : 'hover:bg-primary/10 hover:text-primary'}
            >
              Dashboard
            </Button>
          </Link>

          {/* Auth Section */}
          <div className="ml-4 pl-4 border-l border-border">
            {!isLoggedIn ? (
              <Button 
                onClick={() => setIsLoggedIn(true)}
                className="tech-gradient hover:opacity-90 transition-opacity"
                size="sm"
              >
                Login
              </Button>
            ) : (
              <ProfileMenu 
            onLogout={handleLogout} 
            onEditProfile={() => window.dispatchEvent(new CustomEvent('openEditProfile'))}
          />
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}