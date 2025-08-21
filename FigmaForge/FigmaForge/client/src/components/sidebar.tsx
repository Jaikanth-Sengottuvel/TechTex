import { Link, useLocation } from "wouter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  Clock, 
  Star, 
  Share2, 
  Folder, 
  Settings,
  Layers,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { figmaApi, type FigmaProject } from "@/lib/figma-api";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface SidebarProps {
  currentTeamId?: string;
  onTeamChange?: (teamId: string) => void;
}

const mockTeams = [
  { id: "1473915427902886766", name: "Design Team", color: "from-blue-500 to-indigo-600", initials: "DT" },
  { id: "team2", name: "Marketing Team", color: "from-purple-500 to-pink-600", initials: "MT" },
  { id: "team3", name: "Product Team", color: "from-green-500 to-teal-600", initials: "PT" },
];

export function Sidebar({ currentTeamId = "1473915427902886766", onTeamChange }: SidebarProps) {
  const [location] = useLocation();
  
  const { data: projects, isLoading: projectsLoading } = useQuery({
    queryKey: ['/api/teams', currentTeamId, 'projects'],
    enabled: !!currentTeamId && figmaApi.isAuthenticated(),
  });

  const isActive = (path: string) => location === path;

  return (
    <div className="w-64 bg-card border-r border-border flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-primary via-purple-500 to-primary rounded-lg flex items-center justify-center">
            <Layers className="w-4 h-4 text-white" />
          </div>
          <h1 className="text-xl font-bold text-foreground">TECHTEX</h1>
        </div>
      </div>

      <ScrollArea className="flex-1">
        {/* Quick Access */}
        <div className="p-4">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Quick Access
          </h3>
          <nav className="space-y-1">
            <Link href="/dashboard">
              <Button
                variant={isActive("/dashboard") ? "secondary" : "ghost"}
                className="w-full justify-start"
                size="sm"
              >
                <Clock className="w-4 h-4 mr-3" />
                Recent
              </Button>
            </Link>
            <Button variant="ghost" className="w-full justify-start" size="sm">
              <Star className="w-4 h-4 mr-3" />
              Starred
            </Button>
            <Button variant="ghost" className="w-full justify-start" size="sm">
              <Share2 className="w-4 h-4 mr-3" />
              Shared with me
            </Button>
          </nav>
        </div>

        <Separator className="mx-4" />

        {/* Teams */}
        <div className="p-4">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Teams
          </h3>
          <nav className="space-y-1">
            {mockTeams.map((team) => (
              <Button
                key={team.id}
                variant={currentTeamId === team.id ? "secondary" : "ghost"}
                className="w-full justify-start"
                size="sm"
                onClick={() => onTeamChange?.(team.id)}
              >
                <div className={cn(
                  "w-6 h-6 bg-gradient-to-br rounded text-white text-xs flex items-center justify-center mr-3",
                  team.color
                )}>
                  {team.initials}
                </div>
                {team.name}
              </Button>
            ))}
          </nav>
        </div>

        <Separator className="mx-4" />

        {/* Projects */}
        <div className="p-4">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Projects
          </h3>
          <nav className="space-y-1">
            {projectsLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-3 px-3 py-2">
                  <Skeleton className="w-4 h-4" />
                  <Skeleton className="h-4 flex-1" />
                  <Skeleton className="w-6 h-4" />
                </div>
              ))
            ) : projects && Array.isArray(projects) && projects.length > 0 ? (
              projects.map((project: FigmaProject) => (
                <Button
                  key={project.id}
                  variant="ghost"
                  className="w-full justify-between px-3 py-2 h-auto"
                  size="sm"
                >
                  <div className="flex items-center space-x-3">
                    <Folder className="w-4 h-4 text-primary" />
                    <span className="truncate">{project.name}</span>
                  </div>
                  <span className="text-xs text-muted-foreground ml-2">
                    {project.fileCount}
                  </span>
                </Button>
              ))
            ) : (
              <div className="text-sm text-muted-foreground px-3 py-2">
                No projects found
              </div>
            )}
          </nav>
        </div>
      </ScrollArea>

      {/* User Profile */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center space-x-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=64&h=64" />
            <AvatarFallback>AJ</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              Alex Johnson
            </p>
            <p className="text-xs text-muted-foreground truncate">
              alex@company.com
            </p>
          </div>
          <Button variant="ghost" size="icon" className="text-muted-foreground">
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
