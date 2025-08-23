import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

export type Tool =
  | 'move' | 'hand' | 'rectangle' | 'circle' | 'triangle' | 'star'
  | 'polygon' | 'line' | 'pencil' | 'pen' | 'eraser' | 'text' | 'eyedropper';

export interface Point {
  x: number;
  y: number;
}

export interface Transform {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  scaleX: number;
  scaleY: number;
}

export interface Style {
  fill: string;
  stroke: string;
  strokeWidth: number;
  opacity: number;
  borderRadius?: number;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string;
  textAlign?: 'left' | 'center' | 'right';
  lineHeight?: number;
}

export interface Layer {
  id: string;
  type: 'rectangle' | 'circle' | 'triangle' | 'star' | 'polygon' | 'line' | 'path' | 'text' | 'image' | 'group';
  name: string;
  transform: Transform;
  style: Style;
  visible: boolean;
  locked: boolean;
  zIndex: number;
  parentId?: string;
  children?: string[];
  // Type-specific properties
  text?: string;
  points?: Point[];
  sides?: number;
  cornerRadius?: number;
  src?: string;
  pathData?: string;
  closed?: boolean;
}

export interface CanvasState {
  zoom: number;
  pan: { x: number; y: number };
  size: { width: number; height: number };
  snapToGrid: boolean;
  showGrid: boolean;
  gridSize: number;
}

export interface SelectionBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface History {
  past: Layer[][];
  present: Layer[];
  future: Layer[][];
}

interface DesignState {
  // Tools
  currentTool: Tool;
  setCurrentTool: (tool: Tool) => void;

  // Layers
  layers: Layer[];
  selectedLayerIds: string[];
  hoveredLayerId: string | null;
  clipboard: Layer[];
  history: History;

  // Canvas
  canvas: CanvasState;

  // Drawing states
  isDrawing: boolean;
  drawingPath: Point[];
  currentBezierPath: Point[];
  isEditingPath: boolean;
  editingPathId: string | null;

  // Selection
  selectionBox: SelectionBox | null;
  isMarqueeSelecting: boolean;

  // UI States
  showHandles: boolean;
  eraserSize: number;

  // Actions
  addLayer: (layer: Omit<Layer, 'id' | 'zIndex'>) => void;
  updateLayer: (id: string, updates: Partial<Layer>) => void;
  deleteLayer: (id: string) => void;
  duplicateLayer: (id: string) => void;
  selectLayer: (id: string, multiSelect?: boolean) => void;
  selectLayers: (ids: string[]) => void;
  clearSelection: () => void;
  moveLayer: (id: string, direction: 'up' | 'down' | 'top' | 'bottom') => void;
  reorderLayer: (dragId: string, hoverId: string) => void;
  groupLayers: (layerIds: string[]) => void;
  ungroupLayers: (groupId: string) => void;

  // Canvas actions
  setCanvasSize: (size: { width: number; height: number }) => void;
  setZoom: (zoom: number) => void;
  setPan: (pan: { x: number; y: number }) => void;
  resetView: () => void;
  fitToSelection: () => void;

  // History
  undo: () => void;
  redo: () => void;
  saveHistory: () => void;

  // Drawing
  startDrawing: (point: Point) => void;
  continueDrawing: (point: Point) => void;
  finishDrawing: () => void;
  cancelDrawing: () => void;

  // Clipboard
  copyLayers: (layerIds: string[]) => void;
  pasteLayers: () => void;

  // Utility
  setHoveredLayer: (id: string | null) => void;
  setSelectionBox: (box: SelectionBox | null) => void;
  setIsMarqueeSelecting: (selecting: boolean) => void;
  setEraserSize: (size: number) => void;
  nudgeLayers: (direction: 'up' | 'down' | 'left' | 'right', distance: number) => void;
  alignLayers: (alignment: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => void;
  distributeLayers: (direction: 'horizontal' | 'vertical') => void;
}

const generateId = () => Math.random().toString(36).substr(2, 9);

export const useDesignStore = create<DesignState>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    currentTool: 'move',
    layers: [],
    selectedLayerIds: [],
    hoveredLayerId: null,
    clipboard: [],
    history: {
      past: [],
      present: [],
      future: []
    },
    canvas: {
      zoom: 1,
      pan: { x: 0, y: 0 },
      size: { width: 1200, height: 800 },
      snapToGrid: false,
      showGrid: true,
      gridSize: 20
    },
    isDrawing: false,
    drawingPath: [],
    currentBezierPath: [],
    isEditingPath: false,
    editingPathId: null,
    selectionBox: null,
    isMarqueeSelecting: false,
    showHandles: true,
    eraserSize: 20,

    // Tool management
    setCurrentTool: (tool) => set({ currentTool: tool }),

    // Layer management
    addLayer: (layerData) => {
      const layer: Layer = {
        ...layerData,
        id: generateId(),
        zIndex: get().layers.length,
      };

      set((state) => ({
        layers: [...state.layers, layer],
        selectedLayerIds: [layer.id],
      }));

      get().saveHistory();
    },

    updateLayer: (id, updates) => {
      set((state) => ({
        layers: state.layers.map((layer) =>
          layer.id === id ? { ...layer, ...updates } : layer
        ),
      }));
    },

    deleteLayer: (id) => {
      set((state) => ({
        layers: state.layers.filter((layer) => layer.id !== id),
        selectedLayerIds: state.selectedLayerIds.filter((selectedId) => selectedId !== id),
      }));
      get().saveHistory();
    },

    duplicateLayer: (id) => {
      const layer = get().layers.find((l) => l.id === id);
      if (!layer) return;

      const duplicated: Layer = {
        ...layer,
        id: generateId(),
        name: `${layer.name} Copy`,
        transform: {
          ...layer.transform,
          x: layer.transform.x + 20,
          y: layer.transform.y + 20,
        },
        zIndex: get().layers.length,
      };

      set((state) => ({
        layers: [...state.layers, duplicated],
        selectedLayerIds: [duplicated.id],
      }));

      get().saveHistory();
    },

    selectLayer: (id, multiSelect = false) => {
      set((state) => {
        if (multiSelect) {
          const isSelected = state.selectedLayerIds.includes(id);
          return {
            selectedLayerIds: isSelected
              ? state.selectedLayerIds.filter((selectedId) => selectedId !== id)
              : [...state.selectedLayerIds, id],
          };
        }
        return { selectedLayerIds: [id] };
      });
    },

    selectLayers: (ids) => set({ selectedLayerIds: ids }),

    clearSelection: () => set({
      selectedLayerIds: [],
      isEditingPath: false,
      editingPathId: null,
      selectionBox: null,
      isMarqueeSelecting: false
    }),

    moveLayer: (id, direction) => {
      const layers = get().layers;
      const layer = layers.find((l) => l.id === id);
      if (!layer) return;

      let newZIndex = layer.zIndex;
      switch (direction) {
        case 'up':
          newZIndex = Math.min(layer.zIndex + 1, layers.length - 1);
          break;
        case 'down':
          newZIndex = Math.max(layer.zIndex - 1, 0);
          break;
        case 'top':
          newZIndex = layers.length - 1;
          break;
        case 'bottom':
          newZIndex = 0;
          break;
      }

      set((state) => ({
        layers: state.layers.map((l) =>
          l.id === id ? { ...l, zIndex: newZIndex } : l
        ),
      }));

      get().saveHistory();
    },

    reorderLayer: (dragId, hoverId) => {
      const layers = get().layers;
      const dragIndex = layers.findIndex((l) => l.id === dragId);
      const hoverIndex = layers.findIndex((l) => l.id === hoverId);

      if (dragIndex === -1 || hoverIndex === -1) return;

      const newLayers = [...layers];
      const [draggedLayer] = newLayers.splice(dragIndex, 1);
      newLayers.splice(hoverIndex, 0, draggedLayer);

      // Update z-indices
      const updatedLayers = newLayers.map((layer, index) => ({
        ...layer,
        zIndex: index
      }));

      set({ layers: updatedLayers });
      get().saveHistory();
    },

    groupLayers: (layerIds) => {
      if (layerIds.length < 2) return;

      const layers = get().layers;
      const layersToGroup = layers.filter((l) => layerIds.includes(l.id));

      // Calculate bounding box
      const bounds = layersToGroup.reduce((acc, layer) => ({
        minX: Math.min(acc.minX, layer.transform.x),
        minY: Math.min(acc.minY, layer.transform.y),
        maxX: Math.max(acc.maxX, layer.transform.x + layer.transform.width),
        maxY: Math.max(acc.maxY, layer.transform.y + layer.transform.height),
      }), {
        minX: Infinity,
        minY: Infinity,
        maxX: -Infinity,
        maxY: -Infinity,
      });

      const group: Layer = {
        id: generateId(),
        type: 'group',
        name: 'Group',
        transform: {
          x: bounds.minX,
          y: bounds.minY,
          width: bounds.maxX - bounds.minX,
          height: bounds.maxY - bounds.minY,
          rotation: 0,
          scaleX: 1,
          scaleY: 1,
        },
        style: {
          fill: 'transparent',
          stroke: 'transparent',
          strokeWidth: 0,
          opacity: 1,
        },
        visible: true,
        locked: false,
        zIndex: Math.max(...layersToGroup.map((l) => l.zIndex)),
        children: layerIds,
      };

      set((state) => ({
        layers: [
          ...state.layers.filter((l) => !layerIds.includes(l.id)),
          group,
          ...layersToGroup.map((l) => ({ ...l, parentId: group.id }))
        ],
        selectedLayerIds: [group.id],
      }));

      get().saveHistory();
    },

    ungroupLayers: (groupId) => {
      const group = get().layers.find((l) => l.id === groupId && l.type === 'group');
      if (!group || !group.children) return;

      set((state) => ({
        layers: state.layers
          .filter((l) => l.id !== groupId)
          .map((l) => l.parentId === groupId ? { ...l, parentId: undefined } : l),
        selectedLayerIds: group.children || [],
      }));

      get().saveHistory();
    },

    // Canvas actions
    setCanvasSize: (size) =>
      set((state) => ({
        canvas: { ...state.canvas, size },
      })),

    setZoom: (zoom) =>
      set((state) => ({
        canvas: { ...state.canvas, zoom: Math.max(0.1, Math.min(5, zoom)) },
      })),

    setPan: (pan) =>
      set((state) => ({
        canvas: { ...state.canvas, pan },
      })),

    resetView: () =>
      set((state) => ({
        canvas: { ...state.canvas, zoom: 1, pan: { x: 0, y: 0 } },
      })),

    fitToSelection: () => {
      const { selectedLayerIds, layers, canvas } = get();
      if (selectedLayerIds.length === 0) return;

      const selectedLayers = layers.filter((l) => selectedLayerIds.includes(l.id));
      const bounds = selectedLayers.reduce((acc, layer) => ({
        minX: Math.min(acc.minX, layer.transform.x),
        minY: Math.min(acc.minY, layer.transform.y),
        maxX: Math.max(acc.maxX, layer.transform.x + layer.transform.width),
        maxY: Math.max(acc.maxY, layer.transform.y + layer.transform.height),
      }), {
        minX: Infinity,
        minY: Infinity,
        maxX: -Infinity,
        maxY: -Infinity,
      });

      const padding = 50;
      const boundingWidth = bounds.maxX - bounds.minX + padding * 2;
      const boundingHeight = bounds.maxY - bounds.minY + padding * 2;

      const zoomX = canvas.size.width / boundingWidth;
      const zoomY = canvas.size.height / boundingHeight;
      const zoom = Math.min(zoomX, zoomY, 2);

      const centerX = (bounds.minX + bounds.maxX) / 2;
      const centerY = (bounds.minY + bounds.maxY) / 2;

      const pan = {
        x: canvas.size.width / 2 - centerX * zoom,
        y: canvas.size.height / 2 - centerY * zoom,
      };

      set((state) => ({
        canvas: { ...state.canvas, zoom, pan },
      }));
    },

    // History
    saveHistory: () => {
      const currentLayers = get().layers;
      set((state) => ({
        history: {
          past: [...state.history.past, state.history.present],
          present: currentLayers,
          future: [],
        },
      }));
    },

    undo: () => {
      set((state) => {
        if (state.history.past.length === 0) return state;

        const previous = state.history.past[state.history.past.length - 1];
        const newPast = state.history.past.slice(0, -1);

        return {
          history: {
            past: newPast,
            present: previous,
            future: [state.history.present, ...state.history.future],
          },
          layers: previous,
          selectedLayerIds: [],
        };
      });
    },

    redo: () => {
      set((state) => {
        if (state.history.future.length === 0) return state;

        const next = state.history.future[0];
        const newFuture = state.history.future.slice(1);

        return {
          history: {
            past: [...state.history.past, state.history.present],
            present: next,
            future: newFuture,
          },
          layers: next,
          selectedLayerIds: [],
        };
      });
    },

    // Drawing
    startDrawing: (point) => set({
      isDrawing: true,
      drawingPath: [point]
    }),

    continueDrawing: (point) => {
      const state = get();
      if (!state.isDrawing) return;

      set({ drawingPath: [...state.drawingPath, point] });
    },

    finishDrawing: () => {
      const { drawingPath, currentTool } = get();

      if (drawingPath.length < 2) {
        set({ isDrawing: false, drawingPath: [] });
        return;
      }

      if (currentTool === 'pencil') {
        // Create path layer
        const layer: Omit<Layer, 'id' | 'zIndex'> = {
          type: 'path',
          name: 'Path',
          transform: {
            x: Math.min(...drawingPath.map(p => p.x)),
            y: Math.min(...drawingPath.map(p => p.y)),
            width: Math.max(...drawingPath.map(p => p.x)) - Math.min(...drawingPath.map(p => p.x)),
            height: Math.max(...drawingPath.map(p => p.y)) - Math.min(...drawingPath.map(p => p.y)),
            rotation: 0,
            scaleX: 1,
            scaleY: 1,
          },
          style: {
            fill: 'transparent',
            stroke: '#000000',
            strokeWidth: 2,
            opacity: 1,
          },
          visible: true,
          locked: false,
          points: drawingPath,
        };

        get().addLayer(layer);
      }

      set({ isDrawing: false, drawingPath: [] });
    },

    cancelDrawing: () => set({
      isDrawing: false,
      drawingPath: [],
      currentBezierPath: [],
      isEditingPath: false,
      editingPathId: null
    }),

    // Clipboard
    copyLayers: (layerIds) => {
      const layers = get().layers.filter((l) => layerIds.includes(l.id));
      set({ clipboard: layers });
    },

    pasteLayers: () => {
      const { clipboard } = get();
      if (clipboard.length === 0) return;

      const newLayers = clipboard.map((layer) => ({
        ...layer,
        id: generateId(),
        name: `${layer.name} Copy`,
        transform: {
          ...layer.transform,
          x: layer.transform.x + 20,
          y: layer.transform.y + 20,
        },
        zIndex: get().layers.length,
      }));

      set((state) => ({
        layers: [...state.layers, ...newLayers],
        selectedLayerIds: newLayers.map((l) => l.id),
      }));

      get().saveHistory();
    },

    // Utility methods
    setHoveredLayer: (id) => set({ hoveredLayerId: id }),
    setSelectionBox: (box) => set({ selectionBox: box }),
    setIsMarqueeSelecting: (selecting) => set({ isMarqueeSelecting: selecting }),
    setEraserSize: (size) => set({ eraserSize: size }),

    nudgeLayers: (direction, distance) => {
      const { selectedLayerIds } = get();

      selectedLayerIds.forEach((id) => {
        const layer = get().layers.find((l) => l.id === id);
        if (!layer || layer.locked) return;

        let deltaX = 0;
        let deltaY = 0;

        switch (direction) {
          case 'left': deltaX = -distance; break;
          case 'right': deltaX = distance; break;
          case 'up': deltaY = -distance; break;
          case 'down': deltaY = distance; break;
        }

        get().updateLayer(id, {
          transform: {
            ...layer.transform,
            x: layer.transform.x + deltaX,
            y: layer.transform.y + deltaY,
          },
        });
      });

      if (selectedLayerIds.length > 0) {
        get().saveHistory();
      }
    },

    alignLayers: (alignment) => {
      const { selectedLayerIds, layers } = get();
      if (selectedLayerIds.length < 2) return;

      const selectedLayers = layers.filter((l) => selectedLayerIds.includes(l.id));

      let referenceValue: number;

      switch (alignment) {
        case 'left':
          referenceValue = Math.min(...selectedLayers.map((l) => l.transform.x));
          selectedLayers.forEach((layer) => {
            get().updateLayer(layer.id, {
              transform: { ...layer.transform, x: referenceValue },
            });
          });
          break;
        case 'right':
          referenceValue = Math.max(...selectedLayers.map((l) => l.transform.x + l.transform.width));
          selectedLayers.forEach((layer) => {
            get().updateLayer(layer.id, {
              transform: { ...layer.transform, x: referenceValue - layer.transform.width },
            });
          });
          break;
        case 'center':
          const centerX = selectedLayers.reduce((sum, l) => sum + l.transform.x + l.transform.width / 2, 0) / selectedLayers.length;
          selectedLayers.forEach((layer) => {
            get().updateLayer(layer.id, {
              transform: { ...layer.transform, x: centerX - layer.transform.width / 2 },
            });
          });
          break;
        case 'top':
          referenceValue = Math.min(...selectedLayers.map((l) => l.transform.y));
          selectedLayers.forEach((layer) => {
            get().updateLayer(layer.id, {
              transform: { ...layer.transform, y: referenceValue },
            });
          });
          break;
        case 'bottom':
          referenceValue = Math.max(...selectedLayers.map((l) => l.transform.y + l.transform.height));
          selectedLayers.forEach((layer) => {
            get().updateLayer(layer.id, {
              transform: { ...layer.transform, y: referenceValue - layer.transform.height },
            });
          });
          break;
        case 'middle':
          const centerY = selectedLayers.reduce((sum, l) => sum + l.transform.y + l.transform.height / 2, 0) / selectedLayers.length;
          selectedLayers.forEach((layer) => {
            get().updateLayer(layer.id, {
              transform: { ...layer.transform, y: centerY - layer.transform.height / 2 },
            });
          });
          break;
      }

      get().saveHistory();
    },

    distributeLayers: (direction) => {
      const { selectedLayerIds, layers } = get();
      if (selectedLayerIds.length < 3) return;

      const selectedLayers = layers.filter((l) => selectedLayerIds.includes(l.id))
        .sort((a, b) => direction === 'horizontal' ? a.transform.x - b.transform.x : a.transform.y - b.transform.y);

      if (direction === 'horizontal') {
        const totalWidth = selectedLayers[selectedLayers.length - 1].transform.x + selectedLayers[selectedLayers.length - 1].transform.width - selectedLayers[0].transform.x;
        const objectsWidth = selectedLayers.reduce((sum, layer) => sum + layer.transform.width, 0);
        const spacing = (totalWidth - objectsWidth) / (selectedLayers.length - 1);

        let currentX = selectedLayers[0].transform.x + selectedLayers[0].transform.width;
        for (let i = 1; i < selectedLayers.length - 1; i++) {
          get().updateLayer(selectedLayers[i].id, {
            transform: { ...selectedLayers[i].transform, x: currentX },
          });
          currentX += selectedLayers[i].transform.width + spacing;
        }
      } else {
        const totalHeight = selectedLayers[selectedLayers.length - 1].transform.y + selectedLayers[selectedLayers.length - 1].transform.height - selectedLayers[0].transform.y;
        const objectsHeight = selectedLayers.reduce((sum, layer) => sum + layer.transform.height, 0);
        const spacing = (totalHeight - objectsHeight) / (selectedLayers.length - 1);

        let currentY = selectedLayers[0].transform.y + selectedLayers[0].transform.height;
        for (let i = 1; i < selectedLayers.length - 1; i++) {
          get().updateLayer(selectedLayers[i].id, {
            transform: { ...selectedLayers[i].transform, y: currentY },
          });
          currentY += selectedLayers[i].transform.height + spacing;
        }
      }

      get().saveHistory();
    },
  }))
);