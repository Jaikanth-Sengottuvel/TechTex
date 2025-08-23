# TECHTEX - Figma Team Management Dashboard

## Overview

TECHTEX is a modern web application for managing Figma teams, projects, and design files. It provides a centralized dashboard to view and organize design assets across multiple teams and projects. The application features a clean, modern interface built with React and Tailwind CSS, offering both light and dark themes. Users can authenticate with their Figma accounts to access their teams, browse projects, and manage design files with rich metadata display including thumbnails, modification dates, and author information.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern component development
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack React Query for server state management and caching
- **UI Framework**: Radix UI components with shadcn/ui design system
- **Styling**: Tailwind CSS with CSS variables for theming support
- **Build Tool**: Vite for fast development and optimized production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API structure with modular route handlers
- **Storage Layer**: Abstracted storage interface supporting both in-memory and database implementations
- **Development**: Hot reload support with Vite middleware integration

### Data Storage Solutions
- **Database**: PostgreSQL configured through Drizzle ORM
- **Schema Management**: Drizzle Kit for migrations and schema generation
- **Connection**: Neon Database serverless PostgreSQL for cloud deployment
- **Fallback**: In-memory storage implementation for development and testing

### Authentication and Authorization
- **Provider**: Figma OAuth integration for secure user authentication
- **Token Management**: Figma access and refresh tokens stored securely
- **Session Handling**: Express session management with PostgreSQL session store
- **API Security**: Token-based authentication for Figma API requests

### External Dependencies
- **Primary Integration**: Figma API for teams, projects, and files data
- **Database**: Neon Database (PostgreSQL) for production data persistence
- **UI Components**: Radix UI primitives for accessible component foundation
- **Development Tools**: Replit-specific plugins for development environment integration
- **Build Dependencies**: ESBuild for server-side bundling and TypeScript compilation