import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Loader2, Plus, Search, Settings, FolderOpen, Users, Clock, Star, Eye, MessageSquare, Share2, MoreHorizontal, FileText, Image, Figma, Calendar } from "lucide-react";
import { FileGrid } from "@/components/file-grid";
import { EditProfileModal } from "@/components/EditProfileModal";
import { figmaApi } from "@/lib/figma-api";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const [teamId, setTeamId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<{
    id: string;
    name: string;
    email: string;
    username: string;
    joinedDate: string;
    figmaAccessToken: string;
  } | null>(null);
  const [projects, setProjects] = useState([]);
  const [recentFiles, setRecentFiles] = useState([]);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const { toast } = useToast();

  const mockUser = {
    id: '1',
    name: 'Alex Johnson',
    email: 'alex@techtex.com',
    username: 'alexj',
    joinedDate: 'January 2024',
    figmaAccessToken: 'mock-token',
  };

  const handleUserUpdate = (updatedUser: { name: string; username: string }) => {
    setUser(prev => prev ? { ...prev, ...updatedUser } : null);
  };

  useEffect(() => {
    // Mock user data - in a real app, you'd fetch this from your API
    setUser(mockUser);

    // Listen for edit profile events from navbar
    const handleEditProfile = () => setIsEditProfileOpen(true);
    window.addEventListener('openEditProfile', handleEditProfile);

    return () => window.removeEventListener('openEditProfile', handleEditProfile);
  }, []);

  const recentProjects = [
    {
      id: 1,
      name: 'Mobile App Redesign',
      description: 'UI/UX improvements for mobile application',
      lastModified: '2 hours ago',
      collaborators: 3,
      status: 'In Progress'
    },
    {
      id: 2,
      name: 'Brand Identity System',
      description: 'Complete brand guidelines and assets',
      lastModified: '1 day ago',
      collaborators: 2,
      status: 'Review'
    },
    {
      id: 3,
      name: 'Website Landing Page',
      description: 'Modern landing page for SaaS platform',
      lastModified: '3 days ago',
      collaborators: 1,
      status: 'Completed'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In Progress': return 'text-primary';
      case 'Review': return 'text-yellow-500';
      case 'Completed': return 'text-green-500';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1c1c] via-[#0f2727] to-[#0a1c1c] p-6">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Manage your projects and profile</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* User Profile Card */}
          <Card className="lg:col-span-1 bg-card/50 tech-border backdrop-blur-sm">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <Avatar className="h-20 w-20 tech-border tech-glow">
                  <AvatarFallback className="bg-card tech-gradient-text text-2xl font-bold">
                    {user?.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
              </div>
              <CardTitle className="text-foreground">{user?.name}</CardTitle>
              <CardDescription>{user?.email}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center text-sm text-muted-foreground">
                <p>Joined {user?.joinedDate}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="p-3 rounded-lg bg-secondary/50">
                  <div className="text-2xl font-bold tech-gradient-text">12</div>
                  <div className="text-xs text-muted-foreground">Projects</div>
                </div>
                <div className="p-3 rounded-lg bg-secondary/50">
                  <div className="text-2xl font-bold tech-gradient-text">8</div>
                  <div className="text-xs text-muted-foreground">Collaborators</div>
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full tech-border hover:bg-primary/10 hover:text-primary"
                onClick={() => setIsEditProfileOpen(true)}
              >
                <Settings className="mr-2 h-4 w-4" />
                Edit Profile
              </Button>
            </CardContent>
          </Card>

          {/* Projects Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Create New Project */}
            <Card className="bg-card/50 tech-border backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      Start a new project
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      Create a new design project and start collaborating
                    </p>
                  </div>
                  <Link to="/editor">
                    <Button className="tech-gradient hover:opacity-90 transition-opacity">
                      <Plus className="mr-2 h-4 w-4" />
                      Create Project
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Recent Projects */}
            <Card className="bg-card/50 tech-border backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-foreground">Recent Projects</CardTitle>
                <CardDescription>Your latest design work</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentProjects.map((project) => (
                    <div
                      key={project.id}
                      className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-lg tech-gradient flex items-center justify-center">
                          <FileText className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h4 className="font-medium text-foreground group-hover:tech-gradient-text transition-colors">
                            {project.name}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {project.description}
                          </p>
                          <div className="flex items-center space-x-4 text-xs text-muted-foreground mt-1">
                            <span className="flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {project.lastModified}
                            </span>
                            <span className="flex items-center">
                              <Users className="h-3 w-3 mr-1" />
                              {project.collaborators} collaborators
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className={`text-sm font-medium ${getStatusColor(project.status)}`}>
                        {project.status}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      {user && (
        <EditProfileModal
          isOpen={isEditProfileOpen}
          onClose={() => setIsEditProfileOpen(false)}
          user={user}
          onUpdate={handleUserUpdate}
        />
      )}
    </div>
  );
}

