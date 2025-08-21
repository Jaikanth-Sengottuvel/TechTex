import { apiRequest } from "./queryClient";

export interface FigmaUser {
  id: string;
  email: string;
  name: string;
}

export interface FigmaAuthResponse {
  user: FigmaUser;
}

export interface FigmaTeam {
  id: string;
  name: string;
  description?: string;
}

export interface FigmaProject {
  id: string;
  teamId: string;
  name: string;
  description?: string;
  fileCount: number;
}

export interface FigmaFile {
  id: string;
  projectId?: string;
  teamId: string;
  name: string;
  description?: string;
  thumbnailUrl?: string;
  lastModified?: string;
  version?: string;
  editorType?: string;
  author?: {
    name: string;
    email: string;
  };
}

export class FigmaApiClient {
  private userId: string | null = null;

  constructor() {
    this.userId = localStorage.getItem('figma_user_id');
  }

  setUserId(userId: string) {
    this.userId = userId;
    localStorage.setItem('figma_user_id', userId);
  }

  clearAuth() {
    this.userId = null;
    localStorage.removeItem('figma_user_id');
  }

  async login(email: string, figmaAccessToken: string): Promise<FigmaUser> {
    const response = await apiRequest('POST', '/api/auth/login', {
      email,
      figmaAccessToken,
    });
    
    const data: FigmaAuthResponse = await response.json();
    this.setUserId(data.user.id);
    return data.user;
  }

  async getAuthUrl(): Promise<string> {
    const response = await apiRequest('GET', '/api/auth/figma');
    const data = await response.json();
    return data.authUrl;
  }

  async handleOAuthCallback(code: string, email: string): Promise<FigmaUser> {
    const response = await apiRequest('POST', '/api/auth/figma/callback', {
      code,
      email,
    });
    
    const data: FigmaAuthResponse = await response.json();
    this.setUserId(data.user.id);
    return data.user;
  }

  async getTeam(teamId: string): Promise<FigmaTeam> {
    if (!this.userId) throw new Error('Not authenticated');
    
    const response = await apiRequest('GET', `/api/teams/${teamId}?userId=${this.userId}`);
    return response.json();
  }

  async getTeamProjects(teamId: string): Promise<FigmaProject[]> {
    if (!this.userId) throw new Error('Not authenticated');
    
    const response = await apiRequest('GET', `/api/teams/${teamId}/projects?userId=${this.userId}`);
    return response.json();
  }

  async getProjectFiles(projectId: string): Promise<FigmaFile[]> {
    if (!this.userId) throw new Error('Not authenticated');
    
    const response = await apiRequest('GET', `/api/projects/${projectId}/files?userId=${this.userId}`);
    return response.json();
  }

  async getTeamFiles(teamId: string, recent = false): Promise<FigmaFile[]> {
    if (!this.userId) throw new Error('Not authenticated');
    
    const params = new URLSearchParams({ userId: this.userId });
    if (recent) params.append('recent', 'true');
    
    const response = await apiRequest('GET', `/api/teams/${teamId}/files?${params}`);
    return response.json();
  }

  isAuthenticated(): boolean {
    return this.userId !== null;
  }
}

export const figmaApi = new FigmaApiClient();
