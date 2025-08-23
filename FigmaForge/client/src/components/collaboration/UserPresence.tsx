import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useCollaborationStore } from '@/stores/collaborationStore';
import { Users, Wifi, WifiOff, Crown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface UserPresenceProps {
  isConnected: boolean;
}

export function UserPresence({ isConnected }: UserPresenceProps) {
  const { collaborators, currentUser, isCollaborating } = useCollaborationStore();
  const [showUserList, setShowUserList] = useState(false);

  const totalUsers = collaborators.length + (currentUser ? 1 : 0);

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (!isCollaborating) {
    return null;
  }

  return (
    <div className="flex items-center space-x-3">
      {/* Connection Status */}
      <div className="flex items-center space-x-2">
        <motion.div
          animate={{ 
            scale: isConnected ? [1, 1.2, 1] : 1,
            rotate: isConnected ? 0 : [0, -5, 5, 0]
          }}
          transition={{ 
            duration: isConnected ? 2 : 0.5, 
            repeat: isConnected ? Infinity : 0 
          }}
        >
          {isConnected ? (
            <Wifi className="w-4 h-4 text-green-500" />
          ) : (
            <WifiOff className="w-4 h-4 text-red-500" />
          )}
        </motion.div>
        <span className="text-xs font-medium text-muted-foreground">
          {isConnected ? 'Live' : 'Offline'}
        </span>
      </div>

      {/* Users Count & List */}
      <Popover open={showUserList} onOpenChange={setShowUserList}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="h-8 px-3 rounded-xl border-border/50 bg-card/50 backdrop-blur-sm hover:bg-primary/10 hover:border-primary/30"
          >
            <Users className="w-4 h-4 mr-2" />
            <span className="font-medium">{totalUsers}</span>
            {totalUsers > 1 && (
              <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-xs bg-primary/20 text-primary-foreground">
                Live
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        
        <PopoverContent 
          align="end" 
          className="w-64 p-0 bg-card/95 backdrop-blur-lg border-border/50"
        >
          <div className="p-4 border-b border-border/30">
            <h3 className="font-semibold text-sm">Active Users</h3>
            <p className="text-xs text-muted-foreground mt-1">
              {totalUsers} {totalUsers === 1 ? 'person' : 'people'} in this session
            </p>
          </div>
          
          <div className="p-2 max-h-48 overflow-auto">
            <AnimatePresence>
              {/* Current User */}
              {currentUser && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex items-center space-x-3 p-2 rounded-lg bg-primary/5"
                >
                  <Avatar className="w-8 h-8">
                    <AvatarFallback 
                      className="text-xs font-bold text-white"
                      style={{ backgroundColor: currentUser.color }}
                    >
                      {getInitials(currentUser.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-medium truncate">{currentUser.name}</p>
                      <Crown className="w-3 h-3 text-yellow-500" />
                    </div>
                    <p className="text-xs text-muted-foreground">You</p>
                  </div>
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: currentUser.color }}
                  />
                </motion.div>
              )}
              
              {/* Other Users */}
              {collaborators.map((user, index) => (
                <motion.div
                  key={user.sessionId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50"
                >
                  <Avatar className="w-8 h-8">
                    <AvatarFallback 
                      className="text-xs font-bold text-white"
                      style={{ backgroundColor: user.color }}
                    >
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{user.name}</p>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      <p className="text-xs text-muted-foreground">Online</p>
                    </div>
                  </div>
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: user.color }}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
            
            {totalUsers === 1 && (
              <div className="text-center py-6 text-muted-foreground">
                <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No other users online</p>
                <p className="text-xs mt-1">Share this session to collaborate</p>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}