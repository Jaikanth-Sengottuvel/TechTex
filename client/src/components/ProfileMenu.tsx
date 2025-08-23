import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { User, Settings, LogOut, LayoutDashboard } from 'lucide-react';

export function ProfileMenu({ onLogout, onEditProfile }) {
  const user = {
    name: 'John Doe',
    email: 'john@techtex.com',
    avatar: null
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full p-0 hover:bg-primary/10">
          <Avatar className="h-8 w-8 tech-border">
            <AvatarFallback className="bg-card tech-gradient-text font-semibold">
              {user.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        className="w-56 bg-card tech-border" 
        align="end" 
        forceMount
      >
        <div className="flex items-center justify-start gap-2 p-2">
          <Avatar className="h-8 w-8 tech-border">
            <AvatarFallback className="bg-secondary tech-gradient-text font-semibold">
              {user.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col space-y-1 leading-none">
            <p className="font-medium text-sm text-foreground">{user.name}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
        </div>
        
        <DropdownMenuSeparator className="bg-border" />
        
        <Link to="/dashboard">
          <DropdownMenuItem className="hover:bg-primary/10 hover:text-primary cursor-pointer">
            <LayoutDashboard className="mr-2 h-4 w-4" />
            <span>Dashboard</span>
          </DropdownMenuItem>
        </Link>
        
        <DropdownMenuItem 
          className="hover:bg-primary/10 hover:text-primary cursor-pointer"
          onClick={onEditProfile}
        >
          <User className="mr-2 h-4 w-4" />
          <span>Edit Profile</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem className="hover:bg-primary/10 hover:text-primary cursor-pointer">
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator className="bg-border" />
        
        <DropdownMenuItem 
          className="hover:bg-destructive/10 hover:text-destructive cursor-pointer"
          onClick={onLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}