import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Search, 
  Grid3X3, 
  List, 
  Plus, 
  UserPlus, 
  Heart, 
  MoreHorizontal,
  Filter,
} from "lucide-react";
import { figmaApi, type FigmaFile } from "@/lib/figma-api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface FileGridProps {
  teamId: string;
  teamName: string;
}

export function FileGrid({ teamId, teamName }: FileGridProps) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("modified");

  const { data: recentFiles, isLoading: recentLoading } = useQuery({
    queryKey: ['/api/teams', teamId, 'files', 'recent'],
    enabled: !!teamId && figmaApi.isAuthenticated(),
  });

  const { data: allFiles, isLoading: allLoading } = useQuery({
    queryKey: ['/api/teams', teamId, 'files'],
    enabled: !!teamId && figmaApi.isAuthenticated(),
  });

  const filteredFiles = (Array.isArray(allFiles) ? allFiles.filter((file: FigmaFile) =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    file.description?.toLowerCase().includes(searchQuery.toLowerCase())
  ) : []);

  const getTimeAgo = (date: string | Date | undefined) => {
    if (!date) return "Unknown";
    const now = new Date();
    const fileDate = new Date(date);
    const diffInHours = Math.floor((now.getTime() - fileDate.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return `${Math.floor(diffInDays / 7)}w ago`;
  };

  const FileCard = ({ file, compact = false }: { file: FigmaFile; compact?: boolean }) => (
    <Card className="group hover:shadow-lg hover:scale-[1.02] transition-all duration-200 cursor-pointer">
      <div className="relative">
        <div className={cn(
          "bg-gradient-to-br from-primary/10 to-purple-500/10 flex items-center justify-center text-primary/40",
          compact ? "h-32" : "h-48"
        )}>
          {file.thumbnailUrl ? (
            <img 
              src={file.thumbnailUrl} 
              alt={file.name}
              className="w-full h-full object-cover rounded-t-lg"
            />
          ) : (
            <div className="text-6xl">📄</div>
          )}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-t-lg"></div>
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button size="icon" variant="secondary" className="w-8 h-8 bg-white/90 hover:bg-white">
            <Heart className="w-4 h-4" />
          </Button>
        </div>
        <div className="absolute bottom-3 left-3 flex items-center space-x-2">
          <Badge variant="secondary" className="bg-white/90 text-gray-900">
            Figma
          </Badge>
          <Badge variant="default" className="bg-primary/90">
            {getTimeAgo(file.lastModified)}
          </Badge>
        </div>
      </div>
      <CardContent className={compact ? "p-3" : "p-4"}>
        <h4 className={cn(
          "font-semibold text-foreground mb-1 truncate",
          compact ? "text-sm" : "text-base"
        )}>
          {file.name}
        </h4>
        {!compact && file.description && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {file.description}
          </p>
        )}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Avatar className="w-6 h-6">
              <AvatarImage src="https://images.unsplash.com/photo-1494790108755-2616b169b400?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=32&h=32" />
              <AvatarFallback className="text-xs">
                {file.author?.name?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm text-muted-foreground truncate">
              {file.author?.name || "Unknown"}
            </span>
          </div>
          <Button
            size="icon"
            variant="ghost"
            className="opacity-0 group-hover:opacity-100 w-6 h-6"
          >
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const FileSkeleton = ({ compact = false }: { compact?: boolean }) => (
    <Card>
      <Skeleton className={compact ? "h-32" : "h-48"} />
      <CardContent className={compact ? "p-3" : "p-4"}>
        <Skeleton className="h-4 w-3/4 mb-2" />
        {!compact && <Skeleton className="h-3 w-full mb-3" />}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Skeleton className="w-6 h-6 rounded-full" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <header className="bg-card border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h2 className="text-2xl font-bold text-foreground">{teamName}</h2>
            <Badge variant="secondary" className="text-primary">
              {Array.isArray(allFiles) ? allFiles.length : 0} files
            </Badge>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search files..."
                className="w-80 pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* View Toggle */}
            <div className="flex items-center bg-muted rounded-lg p-1">
              <Button
                size="icon"
                variant={viewMode === "grid" ? "default" : "ghost"}
                onClick={() => setViewMode("grid")}
                className="w-8 h-8"
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button
                size="icon"
                variant={viewMode === "list" ? "default" : "ghost"}
                onClick={() => setViewMode("list")}
                className="w-8 h-8"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>

            {/* Actions */}
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New File
            </Button>
            
            <Button variant="outline" size="icon">
              <UserPlus className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-auto p-6">
        {/* Recent Files Section */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-foreground">Recent Files</h3>
            <Button variant="link" className="text-primary">
              View all
            </Button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {recentLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <FileSkeleton key={i} />
              ))
            ) : recentFiles && Array.isArray(recentFiles) && recentFiles.length > 0 ? (
              recentFiles.slice(0, 4).map((file: FigmaFile) => (
                <FileCard key={file.id} file={file} />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-muted-foreground">No recent files found</p>
              </div>
            )}
          </div>
        </section>

        {/* All Files Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-foreground">All Files</h3>
            <div className="flex items-center space-x-4">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="modified">Sort by: Modified</SelectItem>
                  <SelectItem value="name">Sort by: Name</SelectItem>
                  <SelectItem value="created">Sort by: Created</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon">
                <Filter className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className={cn(
            "grid gap-4",
            viewMode === "grid" 
              ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
              : "grid-cols-1"
          )}>
            {allLoading ? (
              Array.from({ length: 10 }).map((_, i) => (
                <FileSkeleton key={i} compact={viewMode === "grid"} />
              ))
            ) : filteredFiles.length > 0 ? (
              filteredFiles.map((file: FigmaFile) => (
                <FileCard key={file.id} file={file} compact={viewMode === "grid"} />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-muted-foreground">
                  {searchQuery ? "No files match your search" : "No files found"}
                </p>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
