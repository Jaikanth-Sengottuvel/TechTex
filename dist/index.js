// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";
import { WebSocketServer, WebSocket } from "ws";

// server/storage.ts
import { randomUUID } from "crypto";
var MemStorage = class {
  users;
  teams;
  projects;
  files;
  constructor() {
    this.users = /* @__PURE__ */ new Map();
    this.teams = /* @__PURE__ */ new Map();
    this.projects = /* @__PURE__ */ new Map();
    this.files = /* @__PURE__ */ new Map();
  }
  // User operations
  async getUser(id) {
    return this.users.get(id);
  }
  async getUserByEmail(email) {
    return Array.from(this.users.values()).find((user) => user.email === email);
  }
  async getUserByUsername(username) {
    return Array.from(this.users.values()).find((user) => user.username === username);
  }
  async createUser(insertUser) {
    const id = randomUUID();
    const user = {
      ...insertUser,
      id,
      figmaAccessToken: insertUser.figmaAccessToken ?? null,
      figmaRefreshToken: insertUser.figmaRefreshToken ?? null,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.users.set(id, user);
    return user;
  }
  async updateUser(id, updates) {
    const user = this.users.get(id);
    if (!user) return void 0;
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  // Team operations
  async getTeam(id) {
    return this.teams.get(id);
  }
  async getTeamsByIds(ids) {
    return ids.map((id) => this.teams.get(id)).filter(Boolean);
  }
  async createTeam(insertTeam) {
    const team = {
      ...insertTeam,
      description: insertTeam.description ?? null,
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    };
    this.teams.set(team.id, team);
    return team;
  }
  async updateTeam(id, updates) {
    const team = this.teams.get(id);
    if (!team) return void 0;
    const updatedTeam = { ...team, ...updates, updatedAt: /* @__PURE__ */ new Date() };
    this.teams.set(id, updatedTeam);
    return updatedTeam;
  }
  // Project operations
  async getProject(id) {
    return this.projects.get(id);
  }
  async getProjectsByTeamId(teamId) {
    return Array.from(this.projects.values()).filter((project) => project.teamId === teamId);
  }
  async createProject(insertProject) {
    const project = {
      ...insertProject,
      description: insertProject.description ?? null,
      fileCount: insertProject.fileCount ?? null,
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    };
    this.projects.set(project.id, project);
    return project;
  }
  async updateProject(id, updates) {
    const project = this.projects.get(id);
    if (!project) return void 0;
    const updatedProject = { ...project, ...updates, updatedAt: /* @__PURE__ */ new Date() };
    this.projects.set(id, updatedProject);
    return updatedProject;
  }
  // File operations
  async getFile(id) {
    return this.files.get(id);
  }
  async getFilesByProjectId(projectId) {
    return Array.from(this.files.values()).filter((file) => file.projectId === projectId);
  }
  async getFilesByTeamId(teamId) {
    return Array.from(this.files.values()).filter((file) => file.teamId === teamId);
  }
  async getRecentFilesByTeamId(teamId, limit = 10) {
    return Array.from(this.files.values()).filter((file) => file.teamId === teamId).sort((a, b) => {
      const aTime = a.lastModified || a.updatedAt || /* @__PURE__ */ new Date(0);
      const bTime = b.lastModified || b.updatedAt || /* @__PURE__ */ new Date(0);
      return bTime.getTime() - aTime.getTime();
    }).slice(0, limit);
  }
  async createFile(insertFile) {
    const file = {
      ...insertFile,
      description: insertFile.description ?? null,
      thumbnailUrl: insertFile.thumbnailUrl ?? null,
      lastModified: insertFile.lastModified ?? null,
      version: insertFile.version ?? null,
      editorType: insertFile.editorType ?? null,
      projectId: insertFile.projectId ?? null,
      author: insertFile.author ?? null,
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    };
    this.files.set(file.id, file);
    return file;
  }
  async updateFile(id, updates) {
    const file = this.files.get(id);
    if (!file) return void 0;
    const updatedFile = { ...file, ...updates, updatedAt: /* @__PURE__ */ new Date() };
    this.files.set(id, updatedFile);
    return updatedFile;
  }
  async deleteFile(id) {
    return this.files.delete(id);
  }
};
var storage = new MemStorage();

// server/routes.ts
import { z } from "zod";
var FIGMA_API_BASE = "https://api.figma.com/v1";
async function figmaApiRequest(endpoint, accessToken) {
  try {
    const response = await fetch(`${FIGMA_API_BASE}${endpoint}`, {
      headers: {
        "X-Figma-Token": accessToken
      }
    });
    if (!response.ok) {
      throw new Error(`Figma API error: ${response.status} ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Figma API request failed:", error);
    throw error;
  }
}
var rooms = /* @__PURE__ */ new Map();
var userSessions = /* @__PURE__ */ new Map();
async function registerRoutes(app2) {
  app2.put("/api/users/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const { name, username } = z.object({
        name: z.string().min(1, "Name is required"),
        username: z.string().min(3, "Username must be at least 3 characters").max(20, "Username must be at most 20 characters").regex(/^[a-zA-Z0-9_-]+$/, "Username can only contain letters, numbers, hyphens, and underscores")
      }).parse(req.body);
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser && existingUser.id !== userId) {
        return res.status(400).json({ message: "Username is already taken" });
      }
      const updatedUser = await storage.updateUser(userId, { name, username });
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      const { figmaAccessToken, figmaRefreshToken, ...userResponse } = updatedUser;
      res.json(userResponse);
    } catch (error) {
      console.error("Update user error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(400).json({ message: error instanceof Error ? error.message : "Failed to update user" });
    }
  });
  app2.post("/api/auth/login", async (req, res) => {
    try {
      const { email, figmaAccessToken } = z.object({
        email: z.string().email(),
        figmaAccessToken: z.string()
      }).parse(req.body);
      let user = await storage.getUserByEmail(email);
      if (!user) {
        user = await storage.createUser({
          email,
          username: email.split("@")[0],
          name: email.split("@")[0],
          figmaAccessToken
        });
      } else {
        user = await storage.updateUser(user.id, { figmaAccessToken });
      }
      res.json({ user: { ...user, figmaAccessToken: void 0 } });
    } catch (error) {
      console.error("Login error:", error);
      res.status(400).json({ message: error instanceof Error ? error.message : "Login failed" });
    }
  });
  app2.get("/api/teams/:teamId", async (req, res) => {
    try {
      const { teamId } = req.params;
      const { userId } = z.object({
        userId: z.string()
      }).parse(req.query);
      const user = await storage.getUser(userId);
      if (!user || !user.figmaAccessToken) {
        return res.status(401).json({ message: "User not authenticated with Figma" });
      }
      let team = await storage.getTeam(teamId);
      if (!team) {
        team = await storage.createTeam({
          id: teamId,
          name: `Team ${teamId.slice(-8)}`,
          description: "Figma team"
        });
      }
      res.json(team);
    } catch (error) {
      console.error("Get team error:", error);
      res.status(400).json({ message: error instanceof Error ? error.message : "Failed to get team" });
    }
  });
  app2.get("/api/teams/:teamId/projects", async (req, res) => {
    try {
      const { teamId } = req.params;
      const { userId } = z.object({
        userId: z.string()
      }).parse(req.query);
      const user = await storage.getUser(userId);
      if (!user || !user.figmaAccessToken) {
        return res.status(401).json({ message: "User not authenticated with Figma" });
      }
      let projects = await storage.getProjectsByTeamId(teamId);
      if (projects.length === 0) {
        try {
          const figmaResponse = await figmaApiRequest(
            `/teams/${teamId}/projects`,
            user.figmaAccessToken
          );
          for (const figmaProject of figmaResponse.projects) {
            const project = await storage.createProject({
              id: figmaProject.id,
              teamId,
              name: figmaProject.name,
              description: "",
              fileCount: 0
            });
            projects.push(project);
          }
        } catch (figmaError) {
          console.error("Figma API error:", figmaError);
          projects = [];
        }
      }
      res.json(projects);
    } catch (error) {
      console.error("Get projects error:", error);
      res.status(400).json({ message: error instanceof Error ? error.message : "Failed to get projects" });
    }
  });
  app2.get("/api/projects/:projectId/files", async (req, res) => {
    try {
      const { projectId } = req.params;
      const { userId } = z.object({
        userId: z.string()
      }).parse(req.query);
      const user = await storage.getUser(userId);
      if (!user || !user.figmaAccessToken) {
        return res.status(401).json({ message: "User not authenticated with Figma" });
      }
      const project = await storage.getProject(projectId);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      let files = await storage.getFilesByProjectId(projectId);
      if (files.length === 0) {
        try {
          const figmaResponse = await figmaApiRequest(
            `/projects/${projectId}/files`,
            user.figmaAccessToken
          );
          for (const figmaFile of figmaResponse.files) {
            const file = await storage.createFile({
              id: figmaFile.key,
              projectId,
              teamId: project.teamId,
              name: figmaFile.name,
              description: "",
              thumbnailUrl: figmaFile.thumbnail_url,
              lastModified: new Date(figmaFile.last_modified),
              version: "1.0",
              editorType: "figma",
              author: { name: "Unknown", email: "" }
            });
            files.push(file);
          }
          await storage.updateProject(projectId, { fileCount: files.length });
        } catch (figmaError) {
          console.error("Figma API error:", figmaError);
          files = [];
        }
      }
      res.json(files);
    } catch (error) {
      console.error("Get files error:", error);
      res.status(400).json({ message: error instanceof Error ? error.message : "Failed to get files" });
    }
  });
  app2.get("/api/teams/:teamId/files", async (req, res) => {
    try {
      const { teamId } = req.params;
      const { userId, recent } = z.object({
        userId: z.string(),
        recent: z.string().optional()
      }).parse(req.query);
      const user = await storage.getUser(userId);
      if (!user || !user.figmaAccessToken) {
        return res.status(401).json({ message: "User not authenticated with Figma" });
      }
      let files;
      if (recent === "true") {
        files = await storage.getRecentFilesByTeamId(teamId, 8);
      } else {
        files = await storage.getFilesByTeamId(teamId);
      }
      res.json(files);
    } catch (error) {
      console.error("Get team files error:", error);
      res.status(400).json({ message: error instanceof Error ? error.message : "Failed to get team files" });
    }
  });
  app2.get("/api/auth/figma", (req, res) => {
    const clientId = process.env.FIGMA_CLIENT_ID || process.env.VITE_FIGMA_CLIENT_ID;
    const redirectUri = process.env.FIGMA_REDIRECT_URI || process.env.VITE_FIGMA_REDIRECT_URI || "http://localhost:5000/auth/callback";
    if (!clientId) {
      return res.status(500).json({ message: "Figma client ID not configured" });
    }
    const authUrl = `https://www.figma.com/oauth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=file_read&response_type=code`;
    res.json({ authUrl });
  });
  app2.post("/api/auth/figma/callback", async (req, res) => {
    try {
      const { code, email } = z.object({
        code: z.string(),
        email: z.string().email()
      }).parse(req.body);
      const clientId = process.env.FIGMA_CLIENT_ID || process.env.VITE_FIGMA_CLIENT_ID;
      const clientSecret = process.env.FIGMA_CLIENT_SECRET || process.env.VITE_FIGMA_CLIENT_SECRET;
      const redirectUri = process.env.FIGMA_REDIRECT_URI || process.env.VITE_FIGMA_REDIRECT_URI || "http://localhost:5000/auth/callback";
      if (!clientId || !clientSecret) {
        return res.status(500).json({ message: "Figma OAuth not configured" });
      }
      const tokenResponse = await fetch("https://www.figma.com/api/oauth/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
          code,
          grant_type: "authorization_code"
        })
      });
      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text().catch(() => "Unknown error");
        throw new Error(`Failed to exchange code for token: ${tokenResponse.status} ${errorText}`);
      }
      const tokenData = await tokenResponse.json();
      let user = await storage.getUserByEmail(email);
      if (!user) {
        user = await storage.createUser({
          email,
          username: email.split("@")[0],
          name: email.split("@")[0],
          figmaAccessToken: tokenData.access_token,
          figmaRefreshToken: tokenData.refresh_token
        });
      } else {
        user = await storage.updateUser(user.id, {
          figmaAccessToken: tokenData.access_token,
          figmaRefreshToken: tokenData.refresh_token
        });
      }
      res.json({ user: { ...user, figmaAccessToken: void 0, figmaRefreshToken: void 0 } });
    } catch (error) {
      console.error("OAuth callback error:", error);
      res.status(400).json({ message: error instanceof Error ? error.message : "OAuth callback failed" });
    }
  });
  const httpServer = createServer(app2);
  const wss = new WebSocketServer({ server: httpServer, path: "/ws" });
  wss.on("connection", (ws, req) => {
    console.log("New WebSocket connection");
    ws.on("message", (data) => {
      try {
        const message = JSON.parse(data.toString());
        handleWebSocketMessage(ws, message);
      } catch (error) {
        console.error("WebSocket message error:", error);
      }
    });
    ws.on("close", () => {
      handleUserDisconnect(ws);
    });
    ws.on("error", (error) => {
      console.error("WebSocket error:", error);
    });
  });
  return httpServer;
}
function handleWebSocketMessage(ws, message) {
  const { type, data } = message;
  switch (type) {
    case "join-room":
      handleJoinRoom(ws, data);
      break;
    case "cursor-move":
      handleCursorMove(ws, data);
      break;
    case "layer-update":
      handleLayerUpdate(ws, data);
      break;
    case "layer-add":
      handleLayerAdd(ws, data);
      break;
    case "layer-delete":
      handleLayerDelete(ws, data);
      break;
    default:
      console.log("Unknown message type:", type);
  }
}
function handleJoinRoom(ws, data) {
  const { roomId, user } = data;
  if (!rooms.has(roomId)) {
    rooms.set(roomId, {
      id: roomId,
      users: /* @__PURE__ */ new Map(),
      layers: []
    });
  }
  const room = rooms.get(roomId);
  const sessionId = Math.random().toString(36).substr(2, 9);
  const colors = ["#ff6b6b", "#4ecdc4", "#45b7d1", "#f39c12", "#e74c3c", "#9b59b6", "#2ecc71"];
  const userColor = colors[room.users.size % colors.length];
  const collaborationUser = {
    ...user,
    sessionId,
    color: userColor
  };
  room.users.set(sessionId, collaborationUser);
  userSessions.set(sessionId, ws);
  ws.sessionId = sessionId;
  ws.roomId = roomId;
  ws.send(JSON.stringify({
    type: "room-joined",
    data: {
      sessionId,
      users: Array.from(room.users.values()),
      layers: room.layers
    }
  }));
  broadcastToRoom(roomId, {
    type: "user-joined",
    data: collaborationUser
  }, sessionId);
}
function handleCursorMove(ws, data) {
  const sessionId = ws.sessionId;
  const roomId = ws.roomId;
  if (!sessionId || !roomId) return;
  const room = rooms.get(roomId);
  if (!room) return;
  const user = room.users.get(sessionId);
  if (!user) return;
  user.cursor = data.cursor;
  broadcastToRoom(roomId, {
    type: "cursor-update",
    data: {
      sessionId,
      cursor: data.cursor
    }
  }, sessionId);
}
function handleLayerUpdate(ws, data) {
  const roomId = ws.roomId;
  const sessionId = ws.sessionId;
  if (!roomId) return;
  const room = rooms.get(roomId);
  if (!room) return;
  const layerIndex = room.layers.findIndex((l) => l.id === data.layer.id);
  if (layerIndex !== -1) {
    room.layers[layerIndex] = { ...room.layers[layerIndex], ...data.layer };
  }
  broadcastToRoom(roomId, {
    type: "layer-updated",
    data: {
      layer: data.layer,
      updatedBy: sessionId
    }
  }, sessionId);
}
function handleLayerAdd(ws, data) {
  const roomId = ws.roomId;
  const sessionId = ws.sessionId;
  if (!roomId) return;
  const room = rooms.get(roomId);
  if (!room) return;
  room.layers.push(data.layer);
  broadcastToRoom(roomId, {
    type: "layer-added",
    data: {
      layer: data.layer,
      addedBy: sessionId
    }
  }, sessionId);
}
function handleLayerDelete(ws, data) {
  const roomId = ws.roomId;
  const sessionId = ws.sessionId;
  if (!roomId) return;
  const room = rooms.get(roomId);
  if (!room) return;
  room.layers = room.layers.filter((l) => l.id !== data.layerId);
  broadcastToRoom(roomId, {
    type: "layer-deleted",
    data: {
      layerId: data.layerId,
      deletedBy: sessionId
    }
  }, sessionId);
}
function handleUserDisconnect(ws) {
  const sessionId = ws.sessionId;
  const roomId = ws.roomId;
  if (!sessionId || !roomId) return;
  const room = rooms.get(roomId);
  if (room) {
    room.users.delete(sessionId);
    broadcastToRoom(roomId, {
      type: "user-left",
      data: { sessionId }
    }, sessionId);
    if (room.users.size === 0) {
      rooms.delete(roomId);
    }
  }
  userSessions.delete(sessionId);
}
function broadcastToRoom(roomId, message, excludeSessionId) {
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

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
