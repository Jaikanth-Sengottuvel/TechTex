
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { User, Mail, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    id: string;
    name: string;
    email: string;
    username: string;
  };
  onUpdate: (updatedUser: { name: string; username: string }) => void;
}

export function EditProfileModal({ isOpen, onClose, user, onUpdate }: EditProfileModalProps) {
  const [name, setName] = useState(user.name);
  const [username, setUsername] = useState(user.username);
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    if (!name.trim() || !username.trim()) {
      toast({
        title: "Validation Error",
        description: "Name and username are required.",
        variant: "destructive",
      });
      return;
    }

    // Basic username validation
    if (!/^[a-zA-Z0-9_-]{3,20}$/.test(username)) {
      toast({
        title: "Invalid Username",
        description: "Username must be 3-20 characters and contain only letters, numbers, hyphens, and underscores.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Import figmaApi here to avoid circular dependencies
      const { figmaApi } = await import('@/lib/figma-api');
      
      // Update user via API
      await figmaApi.updateUser(user.id, { 
        name: name.trim(), 
        username: username.trim() 
      });
      
      // Update local state
      onUpdate({ name: name.trim(), username: username.trim() });
      
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
      
      onClose();
    } catch (error) {
      console.error('Profile update error:', error);
      toast({
        title: "Update Failed",
        description: error instanceof Error ? error.message : "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-card tech-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">Edit Profile</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Update your profile information. Changes will be reflected across the platform.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-6 py-4">
          {/* Profile Picture Section */}
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 tech-border">
              <AvatarFallback className="bg-secondary tech-gradient-text text-lg font-bold">
                {name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">Profile Picture</p>
              <p className="text-xs text-muted-foreground">
                Your avatar is generated from your initials
              </p>
            </div>
          </div>

          {/* Name Field */}
          <div className="grid gap-2">
            <Label htmlFor="name" className="text-foreground">
              <User className="w-4 h-4 inline mr-2" />
              Full Name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
              className="tech-border"
              disabled={loading}
            />
          </div>

          {/* Username Field */}
          <div className="grid gap-2">
            <Label htmlFor="username" className="text-foreground">
              Username
            </Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-zA-Z0-9_-]/g, ''))}
              placeholder="Enter username"
              className="tech-border"
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground">
              Only letters, numbers, hyphens, and underscores allowed
            </p>
          </div>

          {/* Email Field (Read-only) */}
          <div className="grid gap-2">
            <Label htmlFor="email" className="text-foreground">
              <Mail className="w-4 h-4 inline mr-2" />
              Email Address
            </Label>
            <Input
              id="email"
              value={user.email}
              className="tech-border bg-muted"
              disabled
            />
            <p className="text-xs text-muted-foreground">
              Email cannot be changed for security reasons
            </p>
          </div>

          {/* Bio Field */}
          <div className="grid gap-2">
            <Label htmlFor="bio" className="text-foreground">
              Bio (Optional)
            </Label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself..."
              className="tech-border resize-none"
              rows={3}
              disabled={loading}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="tech-border"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={loading || !name.trim() || !username.trim()}
            className="tech-gradient"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
