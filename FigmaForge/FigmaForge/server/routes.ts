import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from 'ws';
import { storage } from "./storage";
import { insertUserSchema, insertTeamSchema, insertProjectSchema, insertFileSchema } from "@shared/schema";
import { z } from "zod";

const FIGMA_API_BASE = "https://api.figma.com/v1";

interface FigmaTeamProject {
  id: string;
  name: string;
}

interface FigmaFile {
  key: string;
  name: string;
  thumbnail_url: string;
  last_modified: string;
}

interface FigmaTeamProjectsResponse {
  projects: FigmaTeamProject[];
}

interface FigmaProjectFilesResponse {
  files: FigmaFile[];
}

async function figmaApiRequest(endpoint: string, accessToken: string) {
  const response = await fetch(`${FIGMA_API_BASE}${endpoint}`, {
    headers: {
      'X-Figma-Token': accessToken,
    },
  });

  if (!response.ok) {
    throw new Error(`Figma API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

// WebSocket connection tracking
interface CollaborationUser {
  id: string;
  name: string;
  color: string;
  cursor?: { x: number; y: number };
  sessionId: string;
}

interface Room {
  id: string;
  users: Map<string, CollaborationUser>;
  layers: any[];
}

const rooms = new Map<string, Room>();
const userSessions = new Map<string, WebSocket>();

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, figmaAccessToken } = z.object({
        email: z.string().email(),
        figmaAccessToken: z.string(),
      }).parse(req.body);

      let user = await storage.getUserByEmail(email);
      
      if (!user) {
        // Create new user
        user = await storage.createUser({
          email,
          username: email.split('@')[0],
          name: email.split('@')[0],
          figmaAccessToken,
        });
      } else {
        // Update access token
        user = await storage.updateUser(user.id, { figmaAccessToken });
      }

      res.json({ user: { ...user, figmaAccessToken: undefined } });
    } catch (error) {
      console.error('Login error:', error);
      res.status(400).json({ message: error instanceof Error ? error.message : 'Login failed' });
    }
  });

  // Teams routes
  app.get("/api/teams/:teamId", async (req, res) => {
    try {
      const { teamId } = req.params;
      const { userId } = z.object({
        userId: z.string(),
      }).parse(req.query);

      const user = await storage.getUser(userId);
      if (!user || !user.figmaAccessToken) {
        return res.status(401).json({ message: 'User not authenticated with Figma' });
      }

      let team = await storage.getTeam(teamId);
      
      if (!team) {
        // Create team record (Figma API doesn't provide team details endpoint)
        team = await storage.createTeam({
          id: teamId,
          name: `Team ${teamId.slice(-8)}`,
          description: 'Figma team',
        });
      }

      res.json(team);
    } catch (error) {
      console.error('Get team error:', error);
      res.status(400).json({ message: error instanceof Error ? error.message : 'Failed to get team' });
    }
  });

  // Projects routes
  app.get("/api/teams/:teamId/projects", async (req, res) => {
    try {
      const { teamId } = req.params;
      const { userId } = z.object({
        userId: z.string(),
      }).parse(req.query);

      const user = await storage.getUser(userId);
      if (!user || !user.figmaAccessToken) {
        return res.status(401).json({ message: 'User not authenticated with Figma' });
      }

      // Try to get cached projects first
      let projects = await storage.getProjectsByTeamId(teamId);

      // If no cached projects, fetch from Figma API
      if (projects.length === 0) {
        try {
          const figmaResponse: FigmaTeamProjectsResponse = await figmaApiRequest(
            `/teams/${teamId}/projects`,
            user.figmaAccessToken
          );

          // Cache the projects
          for (const figmaProject of figmaResponse.projects) {
            const project = await storage.createProject({
              id: figmaProject.id,
              teamId,
              name: figmaProject.name,
              description: '',
              fileCount: 0,
            });
            projects.push(project);
          }
        } catch (figmaError) {
          console.error('Figma API error:', figmaError);
          // Return empty array if Figma API fails
          projects = [];
        }
      }

      res.json(projects);
    } catch (error) {
      console.error('Get projects error:', error);
      res.status(400).json({ message: error instanceof Error ? error.message : 'Failed to get projects' });
    }
  });

  // Files routes
  app.get("/api/projects/:projectId/files", async (req, res) => {
    try {
      const { projectId } = req.params;
      const { userId } = z.object({
        userId: z.string(),
      }).parse(req.query);

      const user = await storage.getUser(userId);
      if (!user || !user.figmaAccessToken) {
        return res.status(401).json({ message: 'User not authenticated with Figma' });
      }

      const project = await storage.getProject(projectId);
      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }

      // Try to get cached files first
      let files = await storage.getFilesByProjectId(projectId);

      // If no cached files, fetch from Figma API
      if (files.length === 0) {
        try {
          const figmaResponse: FigmaProjectFilesResponse = await figmaApiRequest(
            `/projects/${projectId}/files`,
            user.figmaAccessToken
          );

          // Cache the files
          for (const figmaFile of figmaResponse.files) {
            const file = await storage.createFile({
              id: figmaFile.key,
              projectId,
              teamId: project.teamId,
              name: figmaFile.name,
              description: '',
              thumbnailUrl: figmaFile.thumbnail_url,
              lastModified: new Date(figmaFile.last_modified),
              version: '1.0',
              editorType: 'figma',
              author: { name: 'Unknown', email: '' },
            });
            files.push(file);
          }

          // Update project file count
          await storage.updateProject(projectId, { fileCount: files.length });
        } catch (figmaError) {
          console.error('Figma API error:', figmaError);
          // Return empty array if Figma API fails
          files = [];
        }
      }

      res.json(files);
    } catch (error) {
      console.error('Get files error:', error);
      res.status(400).json({ message: error instanceof Error ? error.message : 'Failed to get files' });
    }
  });

  app.get("/api/teams/:teamId/files", async (req, res) => {
    try {
      const { teamId } = req.params;
      const { userId, recent } = z.object({
        userId: z.string(),
        recent: z.string().optional(),
      }).parse(req.query);

      const user = await storage.getUser(userId);
      if (!user || !user.figmaAccessToken) {
        return res.status(401).json({ message: 'User not authenticated with Figma' });
      }

      let files;
      if (recent === 'true') {
        files = await storage.getRecentFilesByTeamId(teamId, 8);
      } else {
        files = await storage.getFilesByTeamId(teamId);
      }

      res.json(files);
    } catch (error) {
      console.error('Get team files error:', error);
      res.status(400).json({ message: error instanceof Error ? error.message : 'Failed to get team files' });
    }
  });

  // OAuth routes
  app.get("/api/auth/figma", (req, res) => {
    const clientId = process.env.FIGMA_CLIENT_ID || process.env.VITE_FIGMA_CLIENT_ID;
    const redirectUri = process.env.FIGMA_REDIRECT_URI || process.env.VITE_FIGMA_REDIRECT_URI || 'http://localhost:5000/auth/callback';
    
    if (!clientId) {
      return res.status(500).json({ message: 'Figma client ID not configured' });
    }

    const authUrl = `https://www.figma.com/oauth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=file_read&response_type=code`;
    res.json({ authUrl });
  });

  app.post("/api/auth/figma/callback", async (req, res) => {
    try {
      const { code, email } = z.object({
        code: z.string(),
        email: z.string().email(),
      }).parse(req.body);

      const clientId = process.env.FIGMA_CLIENT_ID || process.env.VITE_FIGMA_CLIENT_ID;
      const clientSecret = process.env.FIGMA_CLIENT_SECRET || process.env.VITE_FIGMA_CLIENT_SECRET;
      const redirectUri = process.env.FIGMA_REDIRECT_URI || process.env.VITE_FIGMA_REDIRECT_URI || 'http://localhost:5000/auth/callback';

      if (!clientId || !clientSecret) {
        return res.status(500).json({ message: 'Figma OAuth not configured' });
      }

      // Exchange code for access token
      const tokenResponse = await fetch('https://www.figma.com/api/oauth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
          code,
          grant_type: 'authorization_code',
        }),
      });

      if (!tokenResponse.ok) {
        throw new Error('Failed to exchange code for token');
      }

      const tokenData = await tokenResponse.json();

      let user = await storage.getUserByEmail(email);
      
      if (!user) {
        user = await storage.createUser({
          email,
          username: email.split('@')[0],
          name: email.split('@')[0],
          figmaAccessToken: tokenData.access_token,
          figmaRefreshToken: tokenData.refresh_token,
        });
      } else {
        user = await storage.updateUser(user.id, { 
          figmaAccessToken: tokenData.access_token,
          figmaRefreshToken: tokenData.refresh_token,
        });
      }

      res.json({ user: { ...user, figmaAccessToken: undefined, figmaRefreshToken: undefined } });
    } catch (error) {
      console.error('OAuth callback error:', error);
      res.status(400).json({ message: error instanceof Error ? error.message : 'OAuth callback failed' });
    }
  });

  const httpServer = createServer(app);
  
  // WebSocket server for real-time collaboration
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  wss.on('connection', (ws, req) => {
    console.log('New WebSocket connection');
    
    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString());
        handleWebSocketMessage(ws, message);
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });
    
    ws.on('close', () => {
      handleUserDisconnect(ws);
    });
    
    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  });
  
  return httpServer;
}

// WebSocket message handlers
function handleWebSocketMessage(ws: WebSocket, message: any) {
  const { type, data } = message;
  
  switch (type) {
    case 'join-room':
      handleJoinRoom(ws, data);
      break;
    case 'cursor-move':
      handleCursorMove(ws, data);
      break;
    case 'layer-update':
      handleLayerUpdate(ws, data);
      break;
    case 'layer-add':
      handleLayerAdd(ws, data);
      break;
    case 'layer-delete':
      handleLayerDelete(ws, data);
      break;
    default:
      console.log('Unknown message type:', type);
  }
}

function handleJoinRoom(ws: WebSocket, data: any) {
  const { roomId, user } = data;
  
  // Create room if it doesn't exist
  if (!rooms.has(roomId)) {
    rooms.set(roomId, {
      id: roomId,
      users: new Map(),
      layers: []
    });
  }
  
  const room = rooms.get(roomId)!;
  
  // Generate session ID and color for user
  const sessionId = Math.random().toString(36).substr(2, 9);
  const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f39c12', '#e74c3c', '#9b59b6', '#2ecc71'];
  const userColor = colors[room.users.size % colors.length];
  
  const collaborationUser: CollaborationUser = {
    ...user,
    sessionId,
    color: userColor
  };
  
  room.users.set(sessionId, collaborationUser);
  userSessions.set(sessionId, ws);
  
  // Store session ID on WebSocket for cleanup
  (ws as any).sessionId = sessionId;
  (ws as any).roomId = roomId;
  
  // Send current room state to new user
  ws.send(JSON.stringify({
    type: 'room-joined',
    data: {
      sessionId,
      users: Array.from(room.users.values()),
      layers: room.layers
    }
  }));
  
  // Notify other users
  broadcastToRoom(roomId, {
    type: 'user-joined',
    data: collaborationUser
  }, sessionId);
}

function handleCursorMove(ws: WebSocket, data: any) {
  const sessionId = (ws as any).sessionId;
  const roomId = (ws as any).roomId;
  
  if (!sessionId || !roomId) return;
  
  const room = rooms.get(roomId);
  if (!room) return;
  
  const user = room.users.get(sessionId);
  if (!user) return;
  
  user.cursor = data.cursor;
  
  // Broadcast cursor position to other users
  broadcastToRoom(roomId, {
    type: 'cursor-update',
    data: {
      sessionId,
      cursor: data.cursor
    }
  }, sessionId);
}

function handleLayerUpdate(ws: WebSocket, data: any) {
  const roomId = (ws as any).roomId;
  const sessionId = (ws as any).sessionId;
  
  if (!roomId) return;
  
  const room = rooms.get(roomId);
  if (!room) return;
  
  // Update layer in room state
  const layerIndex = room.layers.findIndex(l => l.id === data.layer.id);
  if (layerIndex !== -1) {
    room.layers[layerIndex] = { ...room.layers[layerIndex], ...data.layer };
  }
  
  // Broadcast update to other users
  broadcastToRoom(roomId, {
    type: 'layer-updated',
    data: {
      layer: data.layer,
      updatedBy: sessionId
    }
  }, sessionId);
}

function handleLayerAdd(ws: WebSocket, data: any) {
  const roomId = (ws as any).roomId;
  const sessionId = (ws as any).sessionId;
  
  if (!roomId) return;
  
  const room = rooms.get(roomId);
  if (!room) return;
  
  room.layers.push(data.layer);
  
  // Broadcast new layer to other users
  broadcastToRoom(roomId, {
    type: 'layer-added',
    data: {
      layer: data.layer,
      addedBy: sessionId
    }
  }, sessionId);
}

function handleLayerDelete(ws: WebSocket, data: any) {
  const roomId = (ws as any).roomId;
  const sessionId = (ws as any).sessionId;
  
  if (!roomId) return;
  
  const room = rooms.get(roomId);
  if (!room) return;
  
  room.layers = room.layers.filter(l => l.id !== data.layerId);
  
  // Broadcast deletion to other users
  broadcastToRoom(roomId, {
    type: 'layer-deleted',
    data: {
      layerId: data.layerId,
      deletedBy: sessionId
    }
  }, sessionId);
}

function handleUserDisconnect(ws: WebSocket) {
  const sessionId = (ws as any).sessionId;
  const roomId = (ws as any).roomId;
  
  if (!sessionId || !roomId) return;
  
  const room = rooms.get(roomId);
  if (room) {
    room.users.delete(sessionId);
    
    // Notify other users
    broadcastToRoom(roomId, {
      type: 'user-left',
      data: { sessionId }
    }, sessionId);
    
    // Clean up empty rooms
    if (room.users.size === 0) {
      rooms.delete(roomId);
    }
  }
  
  userSessions.delete(sessionId);
}

function broadcastToRoom(roomId: string, message: any, excludeSessionId?: string) {
  const room = rooms.get(roomId);
  if (!room) return;
  
  const messageStr = JSON.stringify(message);
  
  for (const [sessionId, user] of Array.from(room.users.entries())) {
    if (sessionId === excludeSessionId) continue;
    
    const userWs = userSessions.get(sessionId);
    if (userWs && userWs.readyState === WebSocket.OPEN) {
      userWs.send(messageStr);
    }
  }
}
