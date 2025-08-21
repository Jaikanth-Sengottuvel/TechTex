import { create } from 'zustand';

export interface Layer {
  id: string;
  type: 'rectangle' | 'circle' | 'text' | 'image';
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  text?: string;
  fontSize?: number;
  visible: boolean;
  locked: boolean;
  zIndex: number;
}

export interface CanvasState {
  layers: Layer[];
  selectedLayerIds: string[];
  tool: 'select' | 'rectangle' | 'circle' | 'text' | 'pan';
  zoom: number;
  canvasSize: { width: number; height: number };
}

interface DesignStore extends CanvasState {
  // Layer actions
  addLayer: (layer: Omit<Layer, 'id' | 'zIndex'>) => void;
  updateLayer: (id: string, updates: Partial<Layer>) => void;
  deleteLayer: (id: string) => void;
  selectLayer: (id: string, addToSelection?: boolean) => void;
  clearSelection: () => void;
  
  // Collaboration actions
  updateLayerFromRemote: (id: string, updates: Partial<Layer>) => void;
  addLayerFromRemote: (layer: Layer) => void;
  deleteLayerFromRemote: (id: string) => void;
  
  // Tool actions
  setTool: (tool: CanvasState['tool']) => void;
  setZoom: (zoom: number) => void;
  
  // Canvas actions
  setCanvasSize: (size: { width: number; height: number }) => void;
}

export const useDesignStore = create<DesignStore>((set, get) => ({
  // Initial state
  layers: [],
  selectedLayerIds: [],
  tool: 'select',
  zoom: 1,
  canvasSize: { width: 1200, height: 800 },
  
  // Layer actions
  addLayer: (layerData) => set((state) => {
    const newLayer: Layer = {
      ...layerData,
      id: `layer-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      zIndex: state.layers.length,
    };
    return { layers: [...state.layers, newLayer] };
  }),
  
  updateLayer: (id, updates) => set((state) => ({
    layers: state.layers.map(layer => 
      layer.id === id ? { ...layer, ...updates } : layer
    )
  })),
  
  deleteLayer: (id) => set((state) => ({
    layers: state.layers.filter(layer => layer.id !== id),
    selectedLayerIds: state.selectedLayerIds.filter(selectedId => selectedId !== id)
  })),
  
  selectLayer: (id, addToSelection = false) => set((state) => ({
    selectedLayerIds: addToSelection 
      ? state.selectedLayerIds.includes(id)
        ? state.selectedLayerIds.filter(selectedId => selectedId !== id)
        : [...state.selectedLayerIds, id]
      : [id]
  })),
  
  clearSelection: () => set({ selectedLayerIds: [] }),
  
  // Tool actions
  setTool: (tool) => set({ tool }),
  setZoom: (zoom) => set({ zoom: Math.max(0.1, Math.min(3, zoom)) }),
  
  // Canvas actions
  setCanvasSize: (canvasSize) => set({ canvasSize }),
  
  // Collaboration actions - these don't trigger websocket sends
  updateLayerFromRemote: (id, updates) => set((state) => ({
    layers: state.layers.map(layer => 
      layer.id === id ? { ...layer, ...updates } : layer
    )
  })),
  
  addLayerFromRemote: (layer) => set((state) => ({
    layers: [...state.layers, layer]
  })),
  
  deleteLayerFromRemote: (id) => set((state) => ({
    layers: state.layers.filter(layer => layer.id !== id),
    selectedLayerIds: state.selectedLayerIds.filter(selectedId => selectedId !== id)
  })),
}));