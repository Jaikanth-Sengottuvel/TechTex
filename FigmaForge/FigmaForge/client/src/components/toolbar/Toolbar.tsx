import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useDesignStore } from '@/stores/designStore';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useCollaborationStore } from '@/stores/collaborationStore';
import { UserPresence } from '@/components/collaboration/UserPresence';
import { 
  MousePointer2, 
  Square, 
  Circle, 
  Type, 
  Hand,
  Undo2,
  Redo2,
  Play,
  Download,
  Share2,
  User,
  Users
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function Toolbar() {
  const { tool, setTool } = useDesignStore();
  const { isConnected, joinRoom } = useWebSocket();
  const { isCollaborating, joinRoom: joinCollabRoom } = useCollaborationStore();

  const tools = [
    { id: 'select' as const, icon: MousePointer2, label: 'Select' },
    { id: 'rectangle' as const, icon: Square, label: 'Rectangle' },
    { id: 'circle' as const, icon: Circle, label: 'Circle' },
    { id: 'text' as const, icon: Type, label: 'Text' },
    { id: 'pan' as const, icon: Hand, label: 'Pan' },
  ];

  const handleStartCollaboration = () => {
    const roomId = 'demo-room'; // In real app, this would be dynamic
    const user = {
      id: 'user-' + Math.random().toString(36).substr(2, 9),
      name: 'Anonymous User',
    };
    
    joinCollabRoom(roomId, user);
    joinRoom(roomId, user);
  };

  return (
    <div className="h-16 bg-gradient-to-r from-card via-card to-card border-b border-border/50 backdrop-blur-lg flex items-center justify-between px-6 relative overflow-hidden">
      {/* Animated background glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 animate-pulse" />
      
      {/* Left section - Logo & Tools */}
      <div className="flex items-center space-x-6 relative z-10">
        {/* Logo */}
        <div className="flex items-center space-x-3">
          <div className="relative w-10 h-10 bg-gradient-to-br from-primary via-accent to-primary rounded-xl flex items-center justify-center shadow-lg">
            <div className="absolute inset-0 bg-gradient-to-br from-primary via-accent to-primary rounded-xl animate-pulse opacity-75" />
            <div className="relative w-5 h-5 bg-white/90 rounded-lg backdrop-blur-sm" />
          </div>
          <span className="font-bold text-xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">TECHTEX</span>
        </div>
        
        <Separator orientation="vertical" className="h-6" />
        
        {/* Tools */}
        <div className="flex items-center space-x-2 bg-muted/50 rounded-xl p-2 backdrop-blur-sm border border-border/30">
          {tools.map((toolItem) => (
            <Button
              key={toolItem.id}
              variant={tool === toolItem.id ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setTool(toolItem.id)}
              className={cn(
                'w-10 h-10 p-0 rounded-xl transition-all duration-200',
                tool === toolItem.id 
                  ? 'bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-lg scale-110 border-2 border-primary/20' 
                  : 'hover:bg-primary/10 hover:scale-105 hover:text-primary border border-transparent'
              )}
              title={toolItem.label}
            >
              <toolItem.icon className="w-5 h-5" />
            </Button>
          ))}
        </div>
        
        <Separator orientation="vertical" className="h-6" />
        
        {/* History */}
        <div className="flex items-center space-x-1">
          <Button variant="ghost" size="sm" className="w-9 h-9 p-0" title="Undo">
            <Undo2 className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" className="w-9 h-9 p-0" title="Redo">
            <Redo2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Center section - Project name */}
      <div className="flex-1 flex justify-center">
        <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
          Untitled Design
        </div>
      </div>

      {/* Right section - Actions */}
      <div className="flex items-center space-x-3">
        {/* Collaboration Controls */}
        {!isCollaborating ? (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleStartCollaboration}
            className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/30 hover:from-primary/20 hover:to-accent/20"
            title="Start Collaboration"
          >
            <Users className="w-4 h-4 mr-2" />
            Collaborate
          </Button>
        ) : (
          <UserPresence isConnected={isConnected} />
        )}
        
        <Separator orientation="vertical" className="h-6" />
        
        <Button variant="ghost" size="sm" title="Preview">
          <Play className="w-4 h-4 mr-2" />
          Preview
        </Button>
        
        <Button variant="ghost" size="sm" title="Export">
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
        
        <Button size="sm" title="Share">
          <Share2 className="w-4 h-4 mr-2" />
          Share
        </Button>
        
        <Separator orientation="vertical" className="h-6" />
        
        <Button variant="ghost" size="icon" className="rounded-full">
          <User className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}