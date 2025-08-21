import { useState } from "react";
import { useLocation } from "wouter";
import { Sidebar } from "@/components/sidebar";
import { FileGrid } from "@/components/file-grid";
import { figmaApi } from "@/lib/figma-api";
import { useQuery } from "@tanstack/react-query";
import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const [currentTeamId, setCurrentTeamId] = useState("1473915427902886766");
  const { theme, setTheme } = useTheme();

  // Check authentication
  if (!figmaApi.isAuthenticated()) {
    setLocation("/auth");
    return null;
  }

  const { data: currentTeam } = useQuery({
    queryKey: ['/api/teams', currentTeamId],
    enabled: !!currentTeamId,
  });

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Theme Toggle */}
      <Button
        variant="outline"
        size="icon"
        onClick={toggleTheme}
        className="fixed top-4 right-4 z-50 shadow-lg"
      >
        {theme === "light" ? (
          <Moon className="h-4 w-4" />
        ) : (
          <Sun className="h-4 w-4" />
        )}
      </Button>

      <Sidebar 
        currentTeamId={currentTeamId}
        onTeamChange={setCurrentTeamId}
      />
      
      <FileGrid 
        teamId={currentTeamId}
        teamName={(currentTeam && typeof currentTeam === 'object' && 'name' in currentTeam) ? String(currentTeam.name) : "Design Team"}
      />
    </div>
  );
}
