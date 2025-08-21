import { create } from 'zustand';
import type { CollaborationUser } from '@/hooks/useWebSocket';

interface CollaborationState {
  isCollaborating: boolean;
  currentUser: CollaborationUser | null;
  collaborators: CollaborationUser[];
  roomId: string | null;
  
  // Actions
  setCollaborating: (collaborating: boolean) => void;
  setCurrentUser: (user: CollaborationUser | null) => void;
  setCollaborators: (users: CollaborationUser[]) => void;
  addCollaborator: (user: CollaborationUser) => void;
  removeCollaborator: (sessionId: string) => void;
  updateCollaboratorCursor: (sessionId: string, cursor: { x: number; y: number }) => void;
  setRoomId: (roomId: string | null) => void;
  joinRoom: (roomId: string, user: Omit<CollaborationUser, 'sessionId' | 'color'>) => void;
  leaveRoom: () => void;
}

export const useCollaborationStore = create<CollaborationState>((set, get) => ({
  isCollaborating: false,
  currentUser: null,
  collaborators: [],
  roomId: null,
  
  setCollaborating: (collaborating) => set({ isCollaborating: collaborating }),
  
  setCurrentUser: (user) => set({ currentUser: user }),
  
  setCollaborators: (users) => set({ collaborators: users }),
  
  addCollaborator: (user) => set((state) => ({
    collaborators: [...state.collaborators.filter(c => c.sessionId !== user.sessionId), user]
  })),
  
  removeCollaborator: (sessionId) => set((state) => ({
    collaborators: state.collaborators.filter(c => c.sessionId !== sessionId)
  })),
  
  updateCollaboratorCursor: (sessionId, cursor) => set((state) => ({
    collaborators: state.collaborators.map(c => 
      c.sessionId === sessionId ? { ...c, cursor } : c
    )
  })),
  
  setRoomId: (roomId) => set({ roomId }),
  
  joinRoom: (roomId, user) => {
    set({ 
      roomId, 
      isCollaborating: true,
      currentUser: { ...user, sessionId: '', color: '' } // Will be set by server
    });
  },
  
  leaveRoom: () => set({ 
    roomId: null, 
    isCollaborating: false, 
    currentUser: null, 
    collaborators: [] 
  }),
}));