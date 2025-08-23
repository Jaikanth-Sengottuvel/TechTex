import { type User, type InsertUser, type Team, type InsertTeam, type Project, type InsertProject, type File, type InsertFile } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;

  // Team operations
  getTeam(id: string): Promise<Team | undefined>;
  getTeamsByIds(ids: string[]): Promise<Team[]>;
  createTeam(team: InsertTeam): Promise<Team>;
  updateTeam(id: string, updates: Partial<Team>): Promise<Team | undefined>;

  // Project operations
  getProject(id: string): Promise<Project | undefined>;
  getProjectsByTeamId(teamId: string): Promise<Project[]>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: string, updates: Partial<Project>): Promise<Project | undefined>;

  // File operations
  getFile(id: string): Promise<File | undefined>;
  getFilesByProjectId(projectId: string): Promise<File[]>;
  getFilesByTeamId(teamId: string): Promise<File[]>;
  getRecentFilesByTeamId(teamId: string, limit?: number): Promise<File[]>;
  createFile(insertFile: InsertFile): Promise<File>;
  updateFile(id: string, updates: Partial<File>): Promise<File | undefined>;
  deleteFile(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private teams: Map<string, Team>;
  private projects: Map<string, Project>;
  private files: Map<string, File>;

  constructor() {
    this.users = new Map();
    this.teams = new Map();
    this.projects = new Map();
    this.files = new Map();
  }

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id, 
      figmaAccessToken: insertUser.figmaAccessToken ?? null,
      figmaRefreshToken: insertUser.figmaRefreshToken ?? null,
      createdAt: new Date() 
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;

    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Team operations
  async getTeam(id: string): Promise<Team | undefined> {
    return this.teams.get(id);
  }

  async getTeamsByIds(ids: string[]): Promise<Team[]> {
    return ids.map(id => this.teams.get(id)).filter(Boolean) as Team[];
  }

  async createTeam(insertTeam: InsertTeam): Promise<Team> {
    const team: Team = { 
      ...insertTeam, 
      description: insertTeam.description ?? null,
      createdAt: new Date(), 
      updatedAt: new Date() 
    };
    this.teams.set(team.id, team);
    return team;
  }

  async updateTeam(id: string, updates: Partial<Team>): Promise<Team | undefined> {
    const team = this.teams.get(id);
    if (!team) return undefined;

    const updatedTeam = { ...team, ...updates, updatedAt: new Date() };
    this.teams.set(id, updatedTeam);
    return updatedTeam;
  }

  // Project operations
  async getProject(id: string): Promise<Project | undefined> {
    return this.projects.get(id);
  }

  async getProjectsByTeamId(teamId: string): Promise<Project[]> {
    return Array.from(this.projects.values()).filter(project => project.teamId === teamId);
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const project: Project = { 
      ...insertProject, 
      description: insertProject.description ?? null,
      fileCount: insertProject.fileCount ?? null,
      createdAt: new Date(), 
      updatedAt: new Date() 
    };
    this.projects.set(project.id, project);
    return project;
  }

  async updateProject(id: string, updates: Partial<Project>): Promise<Project | undefined> {
    const project = this.projects.get(id);
    if (!project) return undefined;

    const updatedProject = { ...project, ...updates, updatedAt: new Date() };
    this.projects.set(id, updatedProject);
    return updatedProject;
  }

  // File operations
  async getFile(id: string): Promise<File | undefined> {
    return this.files.get(id);
  }

  async getFilesByProjectId(projectId: string): Promise<File[]> {
    return Array.from(this.files.values()).filter(file => file.projectId === projectId);
  }

  async getFilesByTeamId(teamId: string): Promise<File[]> {
    return Array.from(this.files.values()).filter(file => file.teamId === teamId);
  }

  async getRecentFilesByTeamId(teamId: string, limit = 10): Promise<File[]> {
    return Array.from(this.files.values())
      .filter(file => file.teamId === teamId)
      .sort((a, b) => {
        const aTime = a.lastModified || a.updatedAt || new Date(0);
        const bTime = b.lastModified || b.updatedAt || new Date(0);
        return bTime.getTime() - aTime.getTime();
      })
      .slice(0, limit);
  }

  async createFile(insertFile: InsertFile): Promise<File> {
    const file: File = { 
      ...insertFile, 
      description: insertFile.description ?? null,
      thumbnailUrl: insertFile.thumbnailUrl ?? null,
      lastModified: insertFile.lastModified ?? null,
      version: insertFile.version ?? null,
      editorType: insertFile.editorType ?? null,
      projectId: insertFile.projectId ?? null,
      author: insertFile.author ?? null,
      createdAt: new Date(), 
      updatedAt: new Date() 
    };
    this.files.set(file.id, file);
    return file;
  }

  async updateFile(id: string, updates: Partial<File>): Promise<File | undefined> {
    const file = this.files.get(id);
    if (!file) return undefined;

    const updatedFile = { ...file, ...updates, updatedAt: new Date() };
    this.files.set(id, updatedFile);
    return updatedFile;
  }

  async deleteFile(id: string): Promise<boolean> {
    return this.files.delete(id);
  }
}

export const storage = new MemStorage();