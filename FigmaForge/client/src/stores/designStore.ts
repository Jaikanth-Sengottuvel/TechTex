
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export interface Layer {
  id: string;
  type: 'rectangle' | 'circle' | 'text' | 'line' | 'path' | 'ellipse' | 'polygon' | 'frame' | 'triangle' | 'star' | 'eraser' | 'group' | 'image';
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
  fontFamily?: string;
  fontWeight?: string;
  textAlign?: 'left' | 'center' | 'right';
  opacity?: number;
  rotation?: number;
  borderRadius?: number;
  visible: boolean;
  locked: boolean;
  zIndex: number;
  isEditing?: boolean;
  points?: number[];
  children?: string[]; // For group layers
  src?: string; // For image layers
}

export interface CanvasState {
  width: number;
  height: number;
}

export interface DesignState {
  layers: Layer[];
  selectedLayerIds: string[];
  tool: string;
  canvasSize: CanvasState;
  zoom: number;
  pan: { x: number; y: number };
  history: Layer[][];
  historyIndex: number;
  clipboard: Layer[];

  // Actions
  addLayer: (layer: Omit<Layer, 'id'> | Layer) => void;
  updateLayer: (id: string, updates: Partial<Layer>) => void;
  deleteLayer: (id: string) => void;
  duplicateLayer: (id: string) => void;
  selectLayer: (id: string, multiSelect?: boolean) => void;
  moveLayer: (id: string, direction: 'up' | 'down' | 'top' | 'bottom') => void;
  setTool: (tool: string) => void;
  setCanvasSize: (size: CanvasState) => void;
  setZoom: (zoom: number) => void;
  setPan: (pan: { x: number; y: number }) => void;
  clearSelection: () => void;
  undo: () => void;
  redo: () => void;
  groupLayers: () => void;
  ungroupLayers: () => void;
  alignLayers: (alignment: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => void;
  addToHistory: () => void;
  copyLayers: () => void;
  pasteLayers: () => void;
  fitToSelection: () => void;
  resetZoom: () => void;
}

export const useDesignStore = create<DesignState>()(
  devtools(
    (set, get) => ({
      layers: [],
      selectedLayerIds: [],
      tool: 'select',
      canvasSize: { width: 1200, height: 800 },
      zoom: 1,
      pan: { x: 0, y: 0 },
      history: [[]],
      historyIndex: 0,
      clipboard: [],

      addToHistory: () => {
        try {
          const { layers, history, historyIndex } = get();
          const newHistory = history.slice(0, historyIndex + 1);
          newHistory.push(JSON.parse(JSON.stringify(layers)));
          set({
            history: newHistory.slice(-50), // Keep last 50 states
            historyIndex: Math.min(newHistory.length - 1, 49)
          });
        } catch (error) {
          console.error('Error adding to history:', error);
        }
      },

      addLayer: (layerData) => {
        const layer = 'id' in layerData
          ? layerData as Layer
          : {
              ...layerData,
              id: `${layerData.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              x: layerData.x ?? 100,
              y: layerData.y ?? 100,
              width: layerData.width ?? 100,
              height: layerData.height ?? 100,
              fill: layerData.fill ?? '#3f51b5',
              stroke: layerData.stroke ?? '#303f9f',
              strokeWidth: layerData.strokeWidth ?? 2,
              visible: layerData.visible ?? true,
              locked: layerData.locked ?? false,
              zIndex: layerData.zIndex ?? Math.max(0, ...get().layers.map(l => l.zIndex)) + 1,
              text: layerData.text ?? '',
              fontSize: layerData.fontSize ?? 16,
              fontFamily: layerData.fontFamily ?? 'Arial',
              fontWeight: layerData.fontWeight ?? 'normal',
              textAlign: layerData.textAlign ?? 'left',
              opacity: layerData.opacity ?? 1,
              rotation: layerData.rotation ?? 0,
              borderRadius: layerData.borderRadius ?? 0,
            } as Layer;

        set((state) => ({
          layers: [...state.layers, layer],
          selectedLayerIds: [layer.id]
        }));
        get().addToHistory();
      },

      updateLayer: (id, updates) => {
        set((state) => ({
          layers: state.layers.map((layer) =>
            layer.id === id ? { ...layer, ...updates } : layer
          )
        }));
      },

      deleteLayer: (id) => {
        set((state) => ({
          layers: state.layers.filter((layer) => layer.id !== id),
          selectedLayerIds: state.selectedLayerIds.filter((selectedId) => selectedId !== id),
        }));
        get().addToHistory();
      },

      duplicateLayer: (id) => {
        const state = get();
        const layer = state.layers.find((l) => l.id === id);
        if (layer) {
          const newLayer: Layer = {
            ...layer,
            id: `${layer.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: `${layer.name} Copy`,
            x: layer.x + 20,
            y: layer.y + 20,
            zIndex: Math.max(...state.layers.map(l => l.zIndex)) + 1,
          };

          set((state) => ({
            layers: [...state.layers, newLayer],
            selectedLayerIds: [newLayer.id]
          }));
          get().addToHistory();
        }
      },

      selectLayer: (id, multiSelect = false) => {
        set((state) => {
          if (!multiSelect) {
            return { selectedLayerIds: id ? [id] : [] };
          }

          const isSelected = state.selectedLayerIds.includes(id);
          if (isSelected) {
            return {
              selectedLayerIds: state.selectedLayerIds.filter((selectedId) => selectedId !== id),
            };
          } else {
            return {
              selectedLayerIds: [...state.selectedLayerIds, id],
            };
          }
        });
      },

      moveLayer: (id, direction) => {
        set((state) => {
          const layers = [...state.layers];
          const layer = layers.find((l) => l.id === id);
          if (!layer) return state;

          let newZIndex = layer.zIndex;
          const sortedLayers = layers.sort((a, b) => a.zIndex - b.zIndex);
          const currentIndex = sortedLayers.findIndex(l => l.id === id);

          switch (direction) {
            case 'up':
              if (currentIndex < sortedLayers.length - 1) {
                newZIndex = sortedLayers[currentIndex + 1].zIndex + 1;
              }
              break;
            case 'down':
              if (currentIndex > 0) {
                newZIndex = sortedLayers[currentIndex - 1].zIndex - 1;
              }
              break;
            case 'top':
              newZIndex = Math.max(...layers.map(l => l.zIndex)) + 1;
              break;
            case 'bottom':
              newZIndex = Math.min(...layers.map(l => l.zIndex)) - 1;
              break;
          }

          const updatedLayers = layers.map(l => l.id === id ? {...l, zIndex: newZIndex} : l);
          return { layers: updatedLayers };
        });
        get().addToHistory();
      },

      setTool: (tool) => {
        set({ tool });
      },

      setCanvasSize: (canvasSize) => {
        set({ canvasSize });
      },

      setZoom: (zoom) => {
        set({ zoom: Math.max(0.1, Math.min(5, zoom)) });
      },

      setPan: (pan) => {
        set({ pan });
      },

      clearSelection: () => {
        set({ selectedLayerIds: [] });
      },

      undo: () => {
        const { history, historyIndex } = get();
        if (historyIndex > 0) {
          const newIndex = historyIndex - 1;
          set({
            layers: JSON.parse(JSON.stringify(history[newIndex])),
            historyIndex: newIndex,
            selectedLayerIds: []
          });
        }
      },

      redo: () => {
        const { history, historyIndex } = get();
        if (historyIndex < history.length - 1) {
          const newIndex = historyIndex + 1;
          set({
            layers: JSON.parse(JSON.stringify(history[newIndex])),
            historyIndex: newIndex,
            selectedLayerIds: []
          });
        }
      },

      copyLayers: () => {
        const { selectedLayerIds, layers } = get();
        const selectedLayers = layers.filter(layer => selectedLayerIds.includes(layer.id));
        set({ clipboard: JSON.parse(JSON.stringify(selectedLayers)) });
      },

      pasteLayers: () => {
        const { clipboard } = get();
        if (clipboard.length > 0) {
          const newLayers = clipboard.map(layer => ({
            ...layer,
            id: `${layer.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            x: layer.x + 20,
            y: layer.y + 20,
            zIndex: Math.max(0, ...get().layers.map(l => l.zIndex)) + 1,
          }));

          set((state) => ({
            layers: [...state.layers, ...newLayers],
            selectedLayerIds: newLayers.map(l => l.id)
          }));
          get().addToHistory();
        }
      },

      fitToSelection: () => {
        const { selectedLayerIds, layers, setZoom, setPan, canvasSize } = get();
        if (selectedLayerIds.length === 0) return;

        const selectedLayers = layers.filter(l => selectedLayerIds.includes(l.id));
        const bounds = {
          left: Math.min(...selectedLayers.map(l => l.x)),
          top: Math.min(...selectedLayers.map(l => l.y)),
          right: Math.max(...selectedLayers.map(l => l.x + l.width)),
          bottom: Math.max(...selectedLayers.map(l => l.y + l.height)),
        };

        const selectionWidth = bounds.right - bounds.left;
        const selectionHeight = bounds.bottom - bounds.top;
        const centerX = bounds.left + selectionWidth / 2;
        const centerY = bounds.top + selectionHeight / 2;

        const zoomX = (canvasSize.width * 0.8) / selectionWidth;
        const zoomY = (canvasSize.height * 0.8) / selectionHeight;
        const newZoom = Math.min(zoomX, zoomY, 5);

        setZoom(newZoom);
        setPan({
          x: (canvasSize.width / 2) - (centerX * newZoom),
          y: (canvasSize.height / 2) - (centerY * newZoom)
        });
      },

      resetZoom: () => {
        set({ zoom: 1, pan: { x: 0, y: 0 } });
      },

      groupLayers: () => {
        const { selectedLayerIds, layers } = get();
        if (selectedLayerIds.length < 2) return;

        const selectedLayers = layers.filter(layer => selectedLayerIds.includes(layer.id));
        const bounds = {
          left: Math.min(...selectedLayers.map(l => l.x)),
          top: Math.min(...selectedLayers.map(l => l.y)),
          right: Math.max(...selectedLayers.map(l => l.x + l.width)),
          bottom: Math.max(...selectedLayers.map(l => l.y + l.height)),
        };

        const groupLayer: Layer = {
          id: `group-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type: 'group',
          name: 'Group',
          x: bounds.left,
          y: bounds.top,
          width: bounds.right - bounds.left,
          height: bounds.bottom - bounds.top,
          fill: 'transparent',
          visible: true,
          locked: false,
          zIndex: Math.max(...selectedLayers.map(l => l.zIndex)) + 1,
          children: selectedLayerIds,
        };

        set(state => ({
          layers: [...state.layers.filter(l => !selectedLayerIds.includes(l.id)), groupLayer],
          selectedLayerIds: [groupLayer.id]
        }));
        get().addToHistory();
      },

      ungroupLayers: () => {
        const { selectedLayerIds, layers } = get();
        const groupsToUngroup = layers.filter(l => selectedLayerIds.includes(l.id) && l.type === 'group' && l.children);

        if (groupsToUngroup.length === 0) return;

        let newLayers = layers.filter(l => !groupsToUngroup.some(group => group.id === l.id));
        const newlySelectedIds: string[] = [];

        groupsToUngroup.forEach(group => {
          group.children!.forEach(childId => {
            const childLayer = layers.find(l => l.id === childId);
            if (childLayer) {
              newLayers.push(childLayer);
              newlySelectedIds.push(childLayer.id);
            }
          });
        });

        set({ layers: newLayers, selectedLayerIds: newlySelectedIds });
        get().addToHistory();
      },

      alignLayers: (alignment) => {
        const { selectedLayerIds, layers, updateLayer } = get();
        if (selectedLayerIds.length < 2) return;

        const selectedLayers = layers.filter(layer => selectedLayerIds.includes(layer.id));
        const bounds = {
          left: Math.min(...selectedLayers.map(l => l.x)),
          top: Math.min(...selectedLayers.map(l => l.y)),
          right: Math.max(...selectedLayers.map(l => l.x + l.width)),
          bottom: Math.max(...selectedLayers.map(l => l.y + l.height)),
          centerX: 0,
          centerY: 0,
        };
        bounds.centerX = bounds.left + (bounds.right - bounds.left) / 2;
        bounds.centerY = bounds.top + (bounds.bottom - bounds.top) / 2;

        selectedLayers.forEach(layer => {
          let newX = layer.x;
          let newY = layer.y;

          switch (alignment) {
            case 'left':
              newX = bounds.left;
              break;
            case 'center':
              newX = bounds.centerX - layer.width / 2;
              break;
            case 'right':
              newX = bounds.right - layer.width;
              break;
            case 'top':
              newY = bounds.top;
              break;
            case 'middle':
              newY = bounds.centerY - layer.height / 2;
              break;
            case 'bottom':
              newY = bounds.bottom - layer.height;
              break;
          }
          updateLayer(layer.id, { x: newX, y: newY });
        });
        get().addToHistory();
      },
    }),
    { name: 'design-store' }
  )
);
