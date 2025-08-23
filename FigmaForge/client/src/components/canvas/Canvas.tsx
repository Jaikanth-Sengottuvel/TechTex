import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useDesignStore, Layer, Point } from '@/stores/designStore';
import { cn } from '@/lib/utils';

interface CanvasProps {
  className?: string;
}

export function Canvas({ className }: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<Point | null>(null);
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const [textInput, setTextInput] = useState<{
    x: number;
    y: number;
    visible: boolean;
    value: string;
    layerId?: string;
  }>({ x: 0, y: 0, visible: false, value: '' });

  const {
    currentTool,
    layers,
    selectedLayerIds,
    canvas,
    selectionBox,
    isMarqueeSelecting,
    drawingPath,
    isDrawing,
    eraserSize,
    selectLayer,
    clearSelection,
    addLayer,
    updateLayer,
    deleteLayer,
    setCanvasSize,
    setZoom,
    setPan,
    startDrawing,
    continueDrawing,
    finishDrawing,
    cancelDrawing,
    setSelectionBox,
    setIsMarqueeSelecting,
    nudgeLayers,
    copyLayers,
    pasteLayers,
    undo,
    redo,
    setCurrentTool,
  } = useDesignStore();

  // Canvas to screen coordinate conversion
  const canvasToScreen = useCallback((point: Point): Point => {
    return {
      x: point.x * canvas.zoom + canvas.pan.x,
      y: point.y * canvas.zoom + canvas.pan.y,
    };
  }, [canvas.zoom, canvas.pan]);

  // Screen to canvas coordinate conversion
  const screenToCanvas = useCallback((point: Point): Point => {
    return {
      x: (point.x - canvas.pan.x) / canvas.zoom,
      y: (point.y - canvas.pan.y) / canvas.zoom,
    };
  }, [canvas.zoom, canvas.pan]);

  // Get mouse position relative to canvas
  const getMousePos = useCallback((e: React.MouseEvent): Point => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };

    return screenToCanvas({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  }, [screenToCanvas]);

  // Hit testing - check if point intersects with layer
  const hitTest = useCallback((point: Point, layer: Layer): boolean => {
    const { transform } = layer;

    switch (layer.type) {
      case 'rectangle':
      case 'text':
      case 'image':
        return point.x >= transform.x &&
               point.x <= transform.x + transform.width &&
               point.y >= transform.y &&
               point.y <= transform.y + transform.height;

      case 'circle':
        const centerX = transform.x + transform.width / 2;
        const centerY = transform.y + transform.height / 2;
        const radiusX = transform.width / 2;
        const radiusY = transform.height / 2;
        const dx = (point.x - centerX) / radiusX;
        const dy = (point.y - centerY) / radiusY;
        return dx * dx + dy * dy <= 1;

      case 'triangle':
        // Simple triangle hit test - within bounding box for now
        return point.x >= transform.x &&
               point.x <= transform.x + transform.width &&
               point.y >= transform.y &&
               point.y <= transform.y + transform.height;

      case 'star':
        // Simple star hit test - within bounding box for now
        const starCenterX = transform.x + transform.width / 2;
        const starCenterY = transform.y + transform.height / 2;
        const distance = Math.sqrt(
          Math.pow(point.x - starCenterX, 2) + Math.pow(point.y - starCenterY, 2)
        );
        return distance <= Math.min(transform.width, transform.height) / 2;

      case 'line':
        if (!layer.points || layer.points.length < 2) return false;
        // Simple line hit test - check distance to line segment
        const strokeWidth = layer.style.strokeWidth || 1;
        const p1 = layer.points[0];
        const p2 = layer.points[1];
        const dist = distanceToLine(point, p1, p2);
        return dist <= strokeWidth / 2 + 3; // 3px tolerance

      case 'path':
        if (!layer.points || layer.points.length < 2) return false;
        const pathStrokeWidth = layer.style.strokeWidth || 1;
        // Check distance to any path segment
        for (let i = 0; i < layer.points.length - 1; i++) {
          const dist = distanceToLine(point, layer.points[i], layer.points[i + 1]);
          if (dist <= pathStrokeWidth / 2 + 3) return true;
        }
        return false;

      default:
        return false;
    }
  }, []);

  // Distance from point to line segment
  const distanceToLine = (point: Point, lineStart: Point, lineEnd: Point): number => {
    const A = point.x - lineStart.x;
    const B = point.y - lineStart.y;
    const C = lineEnd.x - lineStart.x;
    const D = lineEnd.y - lineStart.y;

    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    let param = -1;
    if (lenSq !== 0) param = dot / lenSq;

    let xx, yy;
    if (param < 0) {
      xx = lineStart.x;
      yy = lineStart.y;
    } else if (param > 1) {
      xx = lineEnd.x;
      yy = lineEnd.y;
    } else {
      xx = lineStart.x + param * C;
      yy = lineStart.y + param * D;
    }

    const dx = point.x - xx;
    const dy = point.y - yy;
    return Math.sqrt(dx * dx + dy * dy);
  };

  // Get layer at point
  const getLayerAtPoint = useCallback((point: Point): Layer | null => {
    // Check layers in reverse order (top to bottom)
    const sortedLayers = [...layers]
      .filter(layer => layer.visible && !layer.locked)
      .sort((a, b) => b.zIndex - a.zIndex);

    for (const layer of sortedLayers) {
      if (hitTest(point, layer)) {
        return layer;
      }
    }
    return null;
  }, [layers, hitTest]);

  // Handle mouse down
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!e) return;

    const coords = getMousePos(e);
    if (!coords || typeof coords.x !== 'number' || typeof coords.y !== 'number') {
      console.warn('Invalid coordinates in handleMouseDown');
      return;
    }

    setDragStart(coords);
    setIsDragging(true);

    // Handle different tools
    switch (currentTool) {
      case 'move':
        if (isSpacePressed) {
          // Pan mode
          return;
        }

        const hitLayer = getLayerAtPoint(coords);

        if (hitLayer) {
          if (!selectedLayerIds.includes(hitLayer.id)) {
            selectLayer(hitLayer.id, e.ctrlKey || e.metaKey);
          }
        } else {
          // Start marquee selection
          clearSelection();
          setSelectionBox({ x: coords.x, y: coords.y, width: 0, height: 0 });
          setIsMarqueeSelecting(true);
        }
        break;

      case 'hand':
        // Pan mode - handled in mouse move
        break;

      case 'rectangle':
      case 'circle':
      case 'triangle':
      case 'star':
        // Start drawing shape
        break;

      case 'line':
        // Start drawing line
        startDrawing(coords);
        break;

      case 'pencil':
        // Start drawing freehand path
        startDrawing(coords);
        break;

      case 'pen':
        // Bezier path tool - handle differently
        break;

      case 'text':
        // Create text layer or start editing
        const existingTextLayer = getLayerAtPoint(coords);
        if (existingTextLayer && existingTextLayer.type === 'text') {
          // Edit existing text
          setTextInput({
            x: coords.x,
            y: coords.y,
            visible: true,
            value: existingTextLayer.text || '',
            layerId: existingTextLayer.id,
          });
        } else {
          // Create new text
          setTextInput({
            x: coords.x,
            y: coords.y,
            visible: true,
            value: '',
          });
        }
        break;

      case 'eraser':
        // Delete objects under eraser
        const layersToDelete = layers.filter(layer => {
          const distance = Math.sqrt(
            Math.pow(coords.x - (layer.transform.x + layer.transform.width / 2), 2) +
            Math.pow(coords.y - (layer.transform.y + layer.transform.height / 2), 2)
          );
          return distance <= eraserSize / 2;
        });

        layersToDelete.forEach(layer => deleteLayer(layer.id));
        break;

      case 'eyedropper':
        // Sample color from layer
        const targetLayer = getLayerAtPoint(coords);
        if (targetLayer) {
          // Color sampling would be implemented here
          console.log('Sampled color from:', targetLayer.style.fill);
        }
        break;
    }
  }, [currentTool, getMousePos, getLayerAtPoint, selectedLayerIds, selectLayer, clearSelection, setSelectionBox, setIsMarqueeSelecting, startDrawing, layers, eraserSize, deleteLayer, isSpacePressed]);

  // Handle mouse move
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !dragStart) return;

    const currentPoint = getMousePos(e);

    switch (currentTool) {
      case 'move':
        if (isSpacePressed || currentTool === 'hand') {
          // Pan canvas
          const deltaX = (currentPoint.x - dragStart.x) * canvas.zoom;
          const deltaY = (currentPoint.y - dragStart.y) * canvas.zoom;
          setPan({
            x: canvas.pan.x + deltaX,
            y: canvas.pan.y + deltaY,
          });
          setDragStart(currentPoint);
        } else if (isMarqueeSelecting) {
          // Update marquee selection
          setSelectionBox({
            x: Math.min(dragStart.x, currentPoint.x),
            y: Math.min(dragStart.y, currentPoint.y),
            width: Math.abs(currentPoint.x - dragStart.x),
            height: Math.abs(currentPoint.y - dragStart.y),
          });
        } else if (selectedLayerIds.length > 0) {
          // Move selected objects
          const deltaX = currentPoint.x - dragStart.x;
          const deltaY = currentPoint.y - dragStart.y;

          selectedLayerIds.forEach(id => {
            const layer = layers.find(l => l.id === id);
            if (layer && !layer.locked) {
              updateLayer(id, {
                transform: {
                  ...layer.transform,
                  x: layer.transform.x + deltaX,
                  y: layer.transform.y + deltaY,
                },
              });
            }
          });
          setDragStart(currentPoint);
        }
        break;

      case 'hand':
        // Pan canvas
        const deltaX = (currentPoint.x - dragStart.x) * canvas.zoom;
        const deltaY = (currentPoint.y - dragStart.y) * canvas.zoom;
        setPan({
          x: canvas.pan.x + deltaX,
          y: canvas.pan.y + deltaY,
        });
        setDragStart(currentPoint);
        break;

      case 'rectangle':
      case 'circle':
      case 'triangle':
      case 'star':
        // Update shape preview
        break;

      case 'pencil':
        if (isDrawing) {
          continueDrawing(currentPoint);
        }
        break;

      case 'eraser':
        // Continue erasing
        const layersToDelete = layers.filter(layer => {
          const distance = Math.sqrt(
            Math.pow(currentPoint.x - (layer.transform.x + layer.transform.width / 2), 2) +
            Math.pow(currentPoint.y - (layer.transform.y + layer.transform.height / 2), 2)
          );
          return distance <= eraserSize / 2;
        });

        layersToDelete.forEach(layer => deleteLayer(layer.id));
        break;
    }
  }, [isDragging, dragStart, currentTool, getMousePos, isSpacePressed, canvas, setPan, isMarqueeSelecting, setSelectionBox, selectedLayerIds, layers, updateLayer, isDrawing, continueDrawing, eraserSize, deleteLayer]);

  // Handle mouse up
  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !dragStart) return;

    const currentPoint = getMousePos(e);
    setIsDragging(false);
    setDragStart(null);

    switch (currentTool) {
      case 'move':
        if (isMarqueeSelecting && selectionBox) {
          // Select layers within marquee
          const selectedIds = layers
            .filter(layer => {
              const layerCenter = {
                x: layer.transform.x + layer.transform.width / 2,
                y: layer.transform.y + layer.transform.height / 2,
              };
              return layerCenter.x >= selectionBox.x &&
                     layerCenter.x <= selectionBox.x + selectionBox.width &&
                     layerCenter.y >= selectionBox.y &&
                     layerCenter.y <= selectionBox.y + selectionBox.height;
            })
            .map(layer => layer.id);

          if (selectedIds.length > 0) {
            selectedIds.forEach(id => selectLayer(id, true));
          }

          setSelectionBox(null);
          setIsMarqueeSelecting(false);
        }
        break;

      case 'rectangle':
      case 'circle':
      case 'triangle':
      case 'star':
        // Create shape
        const width = Math.abs(currentPoint.x - dragStart.x);
        const height = Math.abs(currentPoint.y - dragStart.y);

        if (width > 5 && height > 5) {
          const shapeLayer = {
            type: currentTool as 'rectangle' | 'circle' | 'triangle' | 'star',
            name: currentTool.charAt(0).toUpperCase() + currentTool.slice(1),
            transform: {
              x: Math.min(dragStart.x, currentPoint.x),
              y: Math.min(dragStart.y, currentPoint.y),
              width: e.shiftKey ? Math.min(width, height) : width,
              height: e.shiftKey ? Math.min(width, height) : height,
              rotation: 0,
              scaleX: 1,
              scaleY: 1,
            },
            style: {
              fill: currentTool === 'rectangle' ? '#3f51b5' : 
                    currentTool === 'circle' ? '#9c27b0' :
                    currentTool === 'triangle' ? '#ff6b6b' : '#ffd700',
              stroke: currentTool === 'rectangle' ? '#303f9f' :
                     currentTool === 'circle' ? '#7b1fa2' :
                     currentTool === 'triangle' ? '#ff5252' : '#ffb300',
              strokeWidth: 2,
              opacity: 1,
            },
            visible: true,
            locked: false,
          };

          addLayer(shapeLayer);
        }
        break;

      case 'line':
        // Create line
        const lineLayer = {
          type: 'line' as const,
          name: 'Line',
          transform: {
            x: Math.min(dragStart.x, currentPoint.x),
            y: Math.min(dragStart.y, currentPoint.y),
            width: Math.abs(currentPoint.x - dragStart.x),
            height: Math.abs(currentPoint.y - dragStart.y),
            rotation: 0,
            scaleX: 1,
            scaleY: 1,
          },
          style: {
            fill: 'transparent',
            stroke: '#424242',
            strokeWidth: 2,
            opacity: 1,
          },
          visible: true,
          locked: false,
          points: [dragStart, currentPoint],
        };

        addLayer(lineLayer);
        finishDrawing();
        break;

      case 'pencil':
        finishDrawing();
        break;
    }
  }, [isDragging, dragStart, currentTool, getMousePos, isMarqueeSelecting, selectionBox, layers, selectLayer, setSelectionBox, setIsMarqueeSelecting, addLayer, finishDrawing]);

  // Handle wheel event for zooming
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();

    if (e.ctrlKey || e.metaKey) {
      // Zoom
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
      const newZoom = canvas.zoom * zoomFactor;

      // Zoom towards mouse position
      const newPan = {
        x: mouseX - (mouseX - canvas.pan.x) * (newZoom / canvas.zoom),
        y: mouseY - (mouseY - canvas.pan.y) * (newZoom / canvas.zoom),
      };

      setZoom(newZoom);
      setPan(newPan);
    } else {
      // Pan
      setPan({
        x: canvas.pan.x - e.deltaX,
        y: canvas.pan.y - e.deltaY,
      });
    }
  }, [canvas, setZoom, setPan]);

  // Handle text input
  const handleTextInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTextInput(prev => ({ ...prev, value: e.target.value }));
  };

  const handleTextInputBlur = () => {
    if (textInput.layerId) {
      // Update existing text layer
      updateLayer(textInput.layerId, { text: textInput.value });
    } else if (textInput.value.trim()) {
      // Create new text layer
      const textLayer = {
        type: 'text' as const,
        name: 'Text',
        transform: {
          x: textInput.x,
          y: textInput.y,
          width: Math.max(100, textInput.value.length * 8),
          height: 24,
          rotation: 0,
          scaleX: 1,
          scaleY: 1,
        },
        style: {
          fill: '#000000',
          stroke: 'transparent',
          strokeWidth: 0,
          opacity: 1,
          fontSize: 16,
          fontFamily: 'Inter, sans-serif',
          fontWeight: 'normal',
          textAlign: 'left' as const,
        },
        visible: true,
        locked: false,
        text: textInput.value,
      };

      addLayer(textLayer);
    }

    setTextInput({ x: 0, y: 0, visible: false, value: '' });
  };

  const handleTextInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleTextInputBlur();
    } else if (e.key === 'Escape') {
      setTextInput({ x: 0, y: 0, visible: false, value: '' });
    }
  };

  // Keyboard event handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent default for our shortcuts
      if (e.key === 'Escape' || 
          (e.ctrlKey && ['z', 'y', 'c', 'v', 'd', 'g'].includes(e.key.toLowerCase())) ||
          e.key === 'Delete' ||
          ['v', 'h', 'r', 'o', 'l', 'b', 'p', 'e', 't', 'i'].includes(e.key.toLowerCase())) {
        e.preventDefault();
      }

      // Handle space for hand tool
      if (e.key === ' ' && !isSpacePressed) {
        setIsSpacePressed(true);
        return;
      }

      // Tool shortcuts
      switch (e.key.toLowerCase()) {
        case 'v': setCurrentTool('move'); break;
        case 'h': setCurrentTool('hand'); break;
        case 'r': setCurrentTool('rectangle'); break;
        case 'o': setCurrentTool('circle'); break;
        case 'l': setCurrentTool('line'); break;
        case 'b': setCurrentTool('pencil'); break;
        case 'p': setCurrentTool('pen'); break;
        case 'e': setCurrentTool('eraser'); break;
        case 't': setCurrentTool('text'); break;
        case 'i': setCurrentTool('eyedropper'); break;
        case 'escape':
          clearSelection();
          cancelDrawing();
          setTextInput({ x: 0, y: 0, visible: false, value: '' });
          break;
        case 'delete':
          selectedLayerIds.forEach(id => deleteLayer(id));
          break;
        case 'arrowleft':
          nudgeLayers('left', e.shiftKey ? 10 : 1);
          break;
        case 'arrowright':
          nudgeLayers('right', e.shiftKey ? 10 : 1);
          break;
        case 'arrowup':
          nudgeLayers('up', e.shiftKey ? 10 : 1);
          break;
        case 'arrowdown':
          nudgeLayers('down', e.shiftKey ? 10 : 1);
          break;
      }

      // Ctrl shortcuts
      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 'z':
            if (e.shiftKey) {
              redo();
            } else {
              undo();
            }
            break;
          case 'y':
            redo();
            break;
          case 'c':
            copyLayers(selectedLayerIds);
            break;
          case 'v':
            if (!['v', 'h', 'r', 'o', 'l', 'b', 'p', 'e', 't', 'i'].includes(e.key)) {
              pasteLayers();
            }
            break;
          case 'd':
            selectedLayerIds.forEach(id => {
              const layer = layers.find(l => l.id === id);
              if (layer) {
                addLayer({
                  ...layer,
                  name: `${layer.name} Copy`,
                  transform: {
                    ...layer.transform,
                    x: layer.transform.x + 20,
                    y: layer.transform.y + 20,
                  },
                });
              }
            });
            break;
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === ' ') {
        setIsSpacePressed(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [selectedLayerIds, layers, clearSelection, cancelDrawing, deleteLayer, nudgeLayers, undo, redo, copyLayers, pasteLayers, addLayer, setCurrentTool, isSpacePressed]);

  // Drawing function
  const drawLayer = useCallback((ctx: CanvasRenderingContext2D, layer: Layer) => {
    if (!layer.visible) return;

    ctx.save();

    // Apply transform
    const { transform, style } = layer;
    ctx.globalAlpha = style.opacity;

    // Apply fill and stroke
    ctx.fillStyle = style.fill;
    ctx.strokeStyle = style.stroke || 'transparent';
    ctx.lineWidth = style.strokeWidth || 0;

    switch (layer.type) {
      case 'rectangle':
        if (layer.cornerRadius) {
          // Rounded rectangle
          const radius = Math.min(layer.cornerRadius, transform.width / 2, transform.height / 2);
          ctx.beginPath();
          ctx.roundRect(transform.x, transform.y, transform.width, transform.height, radius);
        } else {
          ctx.beginPath();
          ctx.rect(transform.x, transform.y, transform.width, transform.height);
        }

        if (style.fill !== 'transparent') ctx.fill();
        if (style.stroke !== 'transparent' && style.strokeWidth! > 0) ctx.stroke();
        break;

      case 'circle':
        const centerX = transform.x + transform.width / 2;
        const centerY = transform.y + transform.height / 2;
        const radiusX = transform.width / 2;
        const radiusY = transform.height / 2;

        ctx.beginPath();
        ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);

        if (style.fill !== 'transparent') ctx.fill();
        if (style.stroke !== 'transparent' && style.strokeWidth! > 0) ctx.stroke();
        break;

      case 'triangle':
        const triangleCenterX = transform.x + transform.width / 2;
        const triangleTop = transform.y;
        const triangleBottom = transform.y + transform.height;
        const triangleLeft = transform.x;
        const triangleRight = transform.x + transform.width;

        ctx.beginPath();
        ctx.moveTo(triangleCenterX, triangleTop);
        ctx.lineTo(triangleRight, triangleBottom);
        ctx.lineTo(triangleLeft, triangleBottom);
        ctx.closePath();

        if (style.fill !== 'transparent') ctx.fill();
        if (style.stroke !== 'transparent' && style.strokeWidth! > 0) ctx.stroke();
        break;

      case 'star':
        const starCenterX = transform.x + transform.width / 2;
        const starCenterY = transform.y + transform.height / 2;
        const outerRadius = Math.min(transform.width, transform.height) / 2;
        const innerRadius = outerRadius * 0.4;
        const spikes = 5;

        ctx.beginPath();
        for (let i = 0; i < spikes * 2; i++) {
          const radius = i % 2 === 0 ? outerRadius : innerRadius;
          const angle = (i * Math.PI) / spikes;
          const x = starCenterX + Math.cos(angle - Math.PI / 2) * radius;
          const y = starCenterY + Math.sin(angle - Math.PI / 2) * radius;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.closePath();

        if (style.fill !== 'transparent') ctx.fill();
        if (style.stroke !== 'transparent' && style.strokeWidth! > 0) ctx.stroke();
        break;

      case 'line':
        if (layer.points && layer.points.length >= 2) {
          ctx.beginPath();
          ctx.moveTo(layer.points[0].x, layer.points[0].y);
          ctx.lineTo(layer.points[1].x, layer.points[1].y);
          ctx.stroke();
        }
        break;

      case 'path':
        if (layer.points && layer.points.length > 1) {
          ctx.beginPath();
          ctx.moveTo(layer.points[0].x, layer.points[0].y);
          for (let i = 1; i < layer.points.length; i++) {
            ctx.lineTo(layer.points[i].x, layer.points[i].y);
          }
          if (layer.closed) {
            ctx.closePath();
          }
          ctx.stroke();
        }
        break;

      case 'text':
        if (layer.text) {
          ctx.font = `${style.fontWeight || 'normal'} ${style.fontSize || 16}px ${style.fontFamily || 'Inter, sans-serif'}`;
          ctx.textAlign = style.textAlign || 'left';
          ctx.textBaseline = 'top';
          ctx.fillText(layer.text, transform.x, transform.y);
        }
        break;

      case 'image':
        // Image rendering would be implemented here
        ctx.fillStyle = '#f0f0f0';
        ctx.fillRect(transform.x, transform.y, transform.width, transform.height);
        ctx.strokeStyle = '#ccc';
        ctx.strokeRect(transform.x, transform.y, transform.width, transform.height);

        // Draw placeholder
        ctx.fillStyle = '#999';
        ctx.font = '14px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('Image', transform.x + transform.width / 2, transform.y + transform.height / 2);
        break;
    }

    ctx.restore();
  }, []);

  // Draw selection handles
  const drawSelectionHandles = useCallback((ctx: CanvasRenderingContext2D, layer: Layer) => {
    const { transform } = layer;
    const handleSize = 8 / canvas.zoom;
    const handleColor = '#007acc';
    const handleStroke = '#ffffff';

    // Selection bounds
    ctx.strokeStyle = handleColor;
    ctx.setLineDash([5 / canvas.zoom, 5 / canvas.zoom]);
    ctx.lineWidth = 1 / canvas.zoom;
    ctx.strokeRect(transform.x, transform.y, transform.width, transform.height);
    ctx.setLineDash([]);

    // Corner handles
    const handles = [
      { x: transform.x, y: transform.y }, // Top-left
      { x: transform.x + transform.width, y: transform.y }, // Top-right
      { x: transform.x + transform.width, y: transform.y + transform.height }, // Bottom-right
      { x: transform.x, y: transform.y + transform.height }, // Bottom-left
      // Edge handles
      { x: transform.x + transform.width / 2, y: transform.y }, // Top-center
      { x: transform.x + transform.width, y: transform.y + transform.height / 2 }, // Right-center
      { x: transform.x + transform.width / 2, y: transform.y + transform.height }, // Bottom-center
      { x: transform.x, y: transform.y + transform.height / 2 }, // Left-center
    ];

    handles.forEach(handle => {
      ctx.fillStyle = handleColor;
      ctx.strokeStyle = handleStroke;
      ctx.lineWidth = 1 / canvas.zoom;
      ctx.fillRect(handle.x - handleSize / 2, handle.y - handleSize / 2, handleSize, handleSize);
      ctx.strokeRect(handle.x - handleSize / 2, handle.y - handleSize / 2, handleSize, handleSize);
    });

    // Rotation handle
    const rotationHandle = {
      x: transform.x + transform.width / 2,
      y: transform.y - 20 / canvas.zoom,
    };

    ctx.beginPath();
    ctx.arc(rotationHandle.x, rotationHandle.y, handleSize / 2, 0, 2 * Math.PI);
    ctx.fillStyle = handleColor;
    ctx.fill();
    ctx.strokeStyle = handleStroke;
    ctx.stroke();

    // Line to rotation handle
    ctx.beginPath();
    ctx.moveTo(transform.x + transform.width / 2, transform.y);
    ctx.lineTo(rotationHandle.x, rotationHandle.y);
    ctx.strokeStyle = handleColor;
    ctx.stroke();
  }, [canvas.zoom]);

  // Main draw function
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Apply transformations with safety checks
    ctx.save();
    const safePanX = canvas.pan?.x || 0;
    const safePanY = canvas.pan?.y || 0;
    const safeZoom = canvas.zoom || 1;

    ctx.translate(safePanX, safePanY);
    ctx.scale(safeZoom, safeZoom);

    // Draw grid
    if (canvas.showGrid) {
      const gridSize = canvas.gridSize;
      ctx.strokeStyle = '#e0e0e0';
      ctx.lineWidth = 1 / safeZoom;

      // Calculate grid boundaries considering pan and zoom
      const gridStartX = Math.floor(-safePanX / safeZoom / gridSize) * gridSize;
      const gridStartY = Math.floor(-safePanY / safeZoom / gridSize) * gridSize;
      const gridEndX = gridStartX + (canvas.size.width / safeZoom) + gridSize;
      const gridEndY = gridStartY + (canvas.size.height / safeZoom) + gridSize;

      for (let x = gridStartX; x <= gridEndX; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, gridStartY);
        ctx.lineTo(x, gridEndY);
        ctx.stroke();
      }

      for (let y = gridStartY; y <= gridEndY; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(gridStartX, y);
        ctx.lineTo(gridEndX, y);
        ctx.stroke();
      }
    }

    // Draw layers in order
    const sortedLayers = [...layers].sort((a, b) => a.zIndex - b.zIndex);
    sortedLayers.forEach(layer => drawLayer(ctx, layer));

    // Draw current drawing path
    if (isDrawing && drawingPath.length > 0) {
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2 / safeZoom;
      ctx.beginPath();
      ctx.moveTo(drawingPath[0].x, drawingPath[0].y);
      for (let i = 1; i < drawingPath.length; i++) {
        ctx.lineTo(drawingPath[i].x, drawingPath[i].y);
      }
      ctx.stroke();
    }

    // Draw selection handles for selected layers
    selectedLayerIds.forEach(id => {
      const layer = layers.find(l => l.id === id);
      if (layer) {
        drawSelectionHandles(ctx, layer);
      }
    });

    // Draw marquee selection
    if (selectionBox && isMarqueeSelecting) {
      ctx.strokeStyle = '#007acc';
      ctx.fillStyle = 'rgba(0, 122, 204, 0.1)';
      ctx.setLineDash([5 / safeZoom, 5 / safeZoom]);
      ctx.lineWidth = 1 / safeZoom;
      ctx.fillRect(selectionBox.x, selectionBox.y, selectionBox.width, selectionBox.height);
      ctx.strokeRect(selectionBox.x, selectionBox.y, selectionBox.width, selectionBox.height);
      ctx.setLineDash([]);
    }

    // Draw eraser preview
    if (currentTool === 'eraser' && dragStart) {
      ctx.strokeStyle = '#ff0000';
      ctx.fillStyle = 'rgba(255, 0, 0, 0.1)';
      ctx.lineWidth = 2 / safeZoom;
      ctx.beginPath();
      ctx.arc(dragStart.x, dragStart.y, eraserSize / 2, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();
    }

    ctx.restore();
  }, [layers, selectedLayerIds, canvas, drawLayer, drawSelectionHandles, selectionBox, isMarqueeSelecting, isDrawing, drawingPath, currentTool, dragStart, eraserSize]);


  // Render canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      console.warn('Canvas not available for drawing');
      return;
    }

    try {
      draw();
    } catch (error) {
      console.error('Error drawing canvas:', error);
    }
  }, [draw]);

  // Update canvas size
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const resizeCanvas = () => {
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      setCanvasSize({ width: rect.width, height: rect.height });
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [setCanvasSize]);

  // Add fallback if canvasSize is not available
  const safeCanvasSize = canvasSize || { width: 800, height: 600 };

  return (
    <div 
      ref={containerRef}
      className={cn('relative w-full h-full bg-gray-100 overflow-hidden', className)}
    >
      <canvas
        ref={canvasRef}
        width={safeCanvasSize.width}
        height={safeCanvasSize.height}
        className="absolute inset-0 cursor-crosshair"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
        style={{
          cursor: currentTool === 'hand' || isSpacePressed ? 'grab' : 
                 currentTool === 'move' ? 'default' :
                 currentTool === 'text' ? 'text' :
                 currentTool === 'eyedropper' ? 'crosshair' :
                 currentTool === 'eraser' ? 'crosshair' : 'crosshair'
        }}
      />

      {/* Text Input Overlay */}
      {textInput.visible && (
        <textarea
          className="absolute bg-transparent border-none outline-none resize-none font-inherit text-black z-50"
          style={{
            left: canvasToScreen({ x: textInput.x, y: textInput.y }).x,
            top: canvasToScreen({ x: textInput.x, y: textInput.y }).y,
            fontSize: '16px',
            fontFamily: 'Inter, sans-serif',
            minWidth: '100px',
            minHeight: '24px',
          }}
          value={textInput.value}
          onChange={handleTextInputChange}
          onBlur={handleTextInputBlur}
          onKeyDown={handleTextInputKeyDown}
          autoFocus
        />
      )}
    </div>
  );
}