
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Stage, Layer, Rect, Circle, Text as KonvaText, Transformer, Line, RegularPolygon, Image as KonvaImage } from 'react-konva';
import { useDesignStore } from '@/stores/designStore';
import Konva from 'konva';
import { KonvaEventObject } from 'konva/lib/Node';

export function Canvas() {
  const {
    layers,
    selectedLayerIds,
    tool,
    canvasSize,
    zoom,
    pan,
    selectLayer,
    updateLayer,
    addLayer,
    deleteLayer,
    setZoom,
    setPan,
    setTool,
    clearSelection,
  } = useDesignStore();

  const stageRef = useRef<Konva.Stage>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const textInputRef = useRef<HTMLTextAreaElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [currentPath, setCurrentPath] = useState<{ x: number; y: number }[]>([]);
  const [isTextEditing, setIsTextEditing] = useState(false);
  const [textPosition, setTextPosition] = useState({ x: 0, y: 0 });
  const [editingTextId, setEditingTextId] = useState<string>('');
  const [isPanning, setIsPanning] = useState(false);

  // Fixed canvas dimensions
  const CANVAS_WIDTH = 1200;
  const CANVAS_HEIGHT = 800;

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setTool('select');
        clearSelection();
        setIsTextEditing(false);
        setEditingTextId('');
      }
      
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'z':
            e.preventDefault();
            if (e.shiftKey) {
              // Redo
            } else {
              // Undo
            }
            break;
          case 'c':
            e.preventDefault();
            // Copy
            break;
          case 'v':
            e.preventDefault();
            // Paste
            break;
          case 'd':
            e.preventDefault();
            // Duplicate
            break;
          case 'g':
            e.preventDefault();
            // Group/Ungroup
            break;
        }
      }
      
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (!isTextEditing) {
          selectedLayerIds.forEach(id => deleteLayer(id));
        }
      }

      // Tool shortcuts
      if (!isTextEditing && !e.ctrlKey && !e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 'v': setTool('select'); break;
          case 'r': setTool('rectangle'); break;
          case 'o': setTool('circle'); break;
          case 't': setTool('text'); break;
          case 'l': setTool('line'); break;
          case 'p': setTool('pen'); break;
          case 'b': setTool('pencil'); break;
          case 'e': setTool('eraser'); break;
          case ' ': 
            e.preventDefault();
            setTool('pan'); 
            break;
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === ' ' && tool === 'pan') {
        setTool('select');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [tool, selectedLayerIds, isTextEditing, setTool, clearSelection, deleteLayer]);

  useEffect(() => {
    if (transformerRef.current && selectedLayerIds.length > 0) {
      const nodes = selectedLayerIds.map(id => 
        stageRef.current?.findOne(`#${id}`)
      ).filter((node): node is Konva.Node => Boolean(node));
      
      transformerRef.current.nodes(nodes);
      transformerRef.current.getLayer()?.batchDraw();
    }
  }, [selectedLayerIds]);

  const getRelativePointerPosition = (stage: Konva.Stage) => {
    const pos = stage.getPointerPosition();
    if (!pos) return null;
    
    return {
      x: (pos.x - stage.x()) / stage.scaleX(),
      y: (pos.y - stage.y()) / stage.scaleY()
    };
  };

  const handleStageClick = useCallback((e: KonvaEventObject<MouseEvent>) => {
    // Deselect tool and selection when clicking on empty canvas
    if (e.target === e.target.getStage()) {
      if (tool !== 'select' && tool !== 'pan') {
        setTool('select');
      }
      clearSelection();
      setIsTextEditing(false);
      setEditingTextId('');
      return;
    }

    const clickedLayer = layers.find(layer => layer.id === e.target.id());
    if (clickedLayer && !clickedLayer.locked) {
      selectLayer(clickedLayer.id, e.evt.ctrlKey || e.evt.metaKey);
      
      // Handle text editing
      if (clickedLayer.type === 'text' && tool === 'select') {
        const node = e.target;
        const stage = node.getStage();
        if (stage) {
          const transform = node.getAbsoluteTransform();
          const pos = transform.point({ x: 0, y: 0 });
          setTextPosition({
            x: pos.x * stage.scaleX() + stage.x(),
            y: pos.y * stage.scaleY() + stage.y()
          });
          setEditingTextId(clickedLayer.id);
          setIsTextEditing(true);
        }
      }
    }
  }, [layers, selectLayer, tool, clearSelection, setTool]);

  const handleMouseDown = useCallback((e: KonvaEventObject<MouseEvent>) => {
    const stage = e.target.getStage();
    if (!stage) return;

    const pos = getRelativePointerPosition(stage);
    if (!pos) return;

    if (tool === 'pan') {
      setIsPanning(true);
      return;
    }

    if (tool === 'select') return;

    setIsDrawing(true);
    setStartPos(pos);

    if (tool === 'text') {
      const newLayer = {
        id: `text-${Date.now()}`,
        type: 'text' as const,
        name: 'Text',
        x: pos.x,
        y: pos.y,
        width: 200,
        height: 30,
        fill: '#000000',
        text: 'Double click to edit',
        fontSize: 16,
        fontFamily: 'Arial',
        fontWeight: 'normal',
        textAlign: 'left' as const,
        visible: true,
        locked: false,
        zIndex: layers.length,
        isEditing: false,
      };
      addLayer(newLayer);
      selectLayer(newLayer.id, false);
      setIsDrawing(false);
      
      // Start editing immediately
      setTimeout(() => {
        setTextPosition({
          x: pos.x * stage.scaleX() + stage.x(),
          y: pos.y * stage.scaleY() + stage.y()
        });
        setEditingTextId(newLayer.id);
        setIsTextEditing(true);
      }, 50);
      
    } else if (tool === 'pen' || tool === 'pencil') {
      setCurrentPath([pos]);
    } else if (tool === 'eraser') {
      setCurrentPath([pos]);
      // Start erasing immediately
      layers.forEach(layer => {
        if (layer.type !== 'eraser' && isPointInLayer(pos, layer)) {
          deleteLayer(layer.id);
        }
      });
    } else if (tool === 'line') {
      const newLayer = {
        id: `line-${Date.now()}`,
        type: 'line' as const,
        name: 'Line',
        x: 0,
        y: 0,
        width: 1,
        height: 1,
        points: [pos.x, pos.y, pos.x, pos.y],
        stroke: '#000000',
        strokeWidth: 2,
        visible: true,
        locked: false,
        zIndex: layers.length,
      };
      addLayer(newLayer);
      selectLayer(newLayer.id, false);
    } else if (tool === 'triangle') {
      const newLayer = {
        id: `triangle-${Date.now()}`,
        type: 'triangle' as const,
        name: 'Triangle',
        x: pos.x,
        y: pos.y,
        width: 60,
        height: 60,
        fill: '#ff6b6b',
        stroke: '#ff5252',
        strokeWidth: 2,
        visible: true,
        locked: false,
        zIndex: layers.length,
      };
      addLayer(newLayer);
      selectLayer(newLayer.id, false);
      setIsDrawing(false);
    } else if (tool === 'star') {
      const newLayer = {
        id: `star-${Date.now()}`,
        type: 'star' as const,
        name: 'Star',
        x: pos.x,
        y: pos.y,
        width: 60,
        height: 60,
        fill: '#ffd700',
        stroke: '#ffb300',
        strokeWidth: 2,
        visible: true,
        locked: false,
        zIndex: layers.length,
      };
      addLayer(newLayer);
      selectLayer(newLayer.id, false);
      setIsDrawing(false);
    }
  }, [tool, addLayer, selectLayer, layers, deleteLayer]);

  const isPointInLayer = (point: { x: number; y: number }, layer: any) => {
    return point.x >= layer.x && 
           point.x <= layer.x + layer.width &&
           point.y >= layer.y && 
           point.y <= layer.y + layer.height;
  };

  const handleMouseMove = useCallback((e: KonvaEventObject<MouseEvent>) => {
    const stage = e.target.getStage();
    if (!stage) return;

    if (isPanning && tool === 'pan') {
      const pos = stage.getPointerPosition();
      if (pos) {
        setPan({
          x: pos.x - startPos.x,
          y: pos.y - startPos.y
        });
      }
      return;
    }

    if (!isDrawing) return;

    const pos = getRelativePointerPosition(stage);
    if (!pos) return;

    if (tool === 'pen' || tool === 'pencil') {
      setCurrentPath(prev => [...prev, pos]);
    } else if (tool === 'eraser') {
      setCurrentPath(prev => [...prev, pos]);
      // Continue erasing
      layers.forEach(layer => {
        if (layer.type !== 'eraser' && isPointInLayer(pos, layer)) {
          deleteLayer(layer.id);
        }
      });
    } else if (tool === 'line') {
      const lineLayer = layers.find(l => selectedLayerIds.includes(l.id) && l.type === 'line');
      if (lineLayer) {
        updateLayer(lineLayer.id, {
          points: [startPos.x, startPos.y, pos.x, pos.y]
        });
      }
    } else if (tool === 'rectangle' || tool === 'circle') {
      const width = pos.x - startPos.x;
      const height = pos.y - startPos.y;

      if (Math.abs(width) < 5 && Math.abs(height) < 5) return;

      const existingLayer = layers.find(l => l.id === `temp-${tool}`);
      
      if (existingLayer) {
        updateLayer(existingLayer.id, {
          width: Math.abs(width),
          height: Math.abs(height),
          x: width < 0 ? pos.x : startPos.x,
          y: height < 0 ? pos.y : startPos.y,
        });
      } else {
        const newLayer = {
          id: `temp-${tool}`,
          type: tool as 'rectangle' | 'circle',
          name: tool === 'rectangle' ? 'Rectangle' : 'Circle',
          x: width < 0 ? pos.x : startPos.x,
          y: height < 0 ? pos.y : startPos.y,
          width: Math.abs(width),
          height: Math.abs(height),
          fill: tool === 'rectangle' ? '#3f51b5' : '#9c27b0',
          stroke: tool === 'rectangle' ? '#303f9f' : '#7b1fa2',
          strokeWidth: 2,
          visible: true,
          locked: false,
          zIndex: layers.length,
        };
        addLayer(newLayer);
      }
    }
  }, [isDrawing, isPanning, tool, startPos, layers, updateLayer, addLayer, selectedLayerIds, deleteLayer, setPan]);

  const handleMouseUp = useCallback(() => {
    if (isPanning) {
      setIsPanning(false);
      return;
    }

    if (isDrawing) {
      if (tool === 'rectangle' || tool === 'circle') {
        const tempLayer = layers.find(l => l.id === `temp-${tool}`);
        if (tempLayer) {
          const finalId = `${tool}-${Date.now()}`;
          updateLayer(tempLayer.id, { id: finalId });
          selectLayer(finalId, false);
        }
      } else if (tool === 'pen' || tool === 'pencil') {
        if (currentPath.length > 1) {
          const points = currentPath.flatMap(p => [p.x, p.y]);
          const newLayer = {
            id: `path-${Date.now()}`,
            type: 'path' as const,
            name: tool === 'pen' ? 'Pen Path' : 'Pencil Path',
            x: 0,
            y: 0,
            width: 1,
            height: 1,
            points,
            stroke: tool === 'pen' ? '#000000' : '#666666',
            strokeWidth: tool === 'pen' ? 2 : 1,
            visible: true,
            locked: false,
            zIndex: layers.length,
          };
          addLayer(newLayer);
          selectLayer(newLayer.id, false);
        }
        setCurrentPath([]);
      }
    }
    setIsDrawing(false);
  }, [isDrawing, isPanning, tool, layers, updateLayer, selectLayer, currentPath, addLayer]);

  const handleDragEnd = useCallback((e: KonvaEventObject<DragEvent>) => {
    const id = e.target.id();
    const node = e.target;
    updateLayer(id, {
      x: node.x(),
      y: node.y(),
    });
  }, [updateLayer]);

  const handleTransformEnd = useCallback((e: KonvaEventObject<Event>) => {
    const node = e.target;
    const id = node.id();
    
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    
    updateLayer(id, {
      x: node.x(),
      y: node.y(),
      width: Math.max(5, node.width() * scaleX),
      height: Math.max(5, node.height() * scaleY),
      rotation: node.rotation(),
    });
    
    node.scaleX(1);
    node.scaleY(1);
  }, [updateLayer]);

  const handleWheel = useCallback((e: KonvaEventObject<WheelEvent>) => {
    if (!e.evt.ctrlKey && !e.evt.metaKey) {
      return;
    }
    
    e.evt.preventDefault();
    
    const stage = stageRef.current;
    if (!stage) return;

    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    const scaleBy = 1.05;
    const oldScale = zoom;
    const newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;
    
    setZoom(Math.max(0.1, Math.min(5, newScale)));
    
    const mousePointTo = {
      x: (pointer.x - pan.x) / oldScale,
      y: (pointer.y - pan.y) / oldScale,
    };
    
    const newPos = {
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    };
    
    setPan(newPos);
  }, [zoom, pan, setZoom, setPan]);

  const handleTextEdit = useCallback((value: string) => {
    if (editingTextId) {
      updateLayer(editingTextId, { text: value });
    }
  }, [editingTextId, updateLayer]);

  const handleTextEditEnd = useCallback(() => {
    setIsTextEditing(false);
    setEditingTextId('');
  }, []);

  // Handle image upload
  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const newLayer = {
            id: `image-${Date.now()}`,
            type: 'image' as const,
            name: file.name,
            x: 100,
            y: 100,
            width: Math.min(img.width, 300),
            height: Math.min(img.height, 300),
            src: event.target?.result as string,
            visible: true,
            locked: false,
            zIndex: layers.length,
          };
          addLayer(newLayer);
          selectLayer(newLayer.id, false);
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }, [addLayer, selectLayer, layers.length]);

  const renderLayer = (layer: any) => {
    const commonProps = {
      key: layer.id,
      id: layer.id,
      x: layer.x,
      y: layer.y,
      draggable: !layer.locked && tool === 'select',
      onClick: handleStageClick,
      onDragEnd: handleDragEnd,
      onTransformEnd: handleTransformEnd,
    };

    switch (layer.type) {
      case 'rectangle':
        return (
          <Rect
            {...commonProps}
            width={layer.width}
            height={layer.height}
            fill={layer.fill}
            stroke={layer.stroke}
            strokeWidth={layer.strokeWidth}
            cornerRadius={layer.borderRadius || 0}
            opacity={layer.opacity || 1}
            rotation={layer.rotation || 0}
          />
        );
      case 'circle':
        return (
          <Circle
            {...commonProps}
            radius={Math.min(layer.width, layer.height) / 2}
            fill={layer.fill}
            stroke={layer.stroke}
            strokeWidth={layer.strokeWidth}
            opacity={layer.opacity || 1}
            rotation={layer.rotation || 0}
          />
        );
      case 'text':
        if (isTextEditing && editingTextId === layer.id) {
          return null; // Hide Konva text when editing
        }
        return (
          <KonvaText
            {...commonProps}
            text={layer.text}
            fontSize={layer.fontSize}
            fontFamily={layer.fontFamily}
            fontStyle={layer.fontWeight}
            fill={layer.fill}
            width={layer.width}
            align={layer.textAlign || 'left'}
            opacity={layer.opacity || 1}
            rotation={layer.rotation || 0}
          />
        );
      case 'line':
      case 'path':
        return (
          <Line
            {...commonProps}
            points={layer.points || []}
            stroke={layer.stroke || '#000000'}
            strokeWidth={layer.strokeWidth || 2}
            opacity={layer.opacity || 1}
            lineCap="round"
            lineJoin="round"
          />
        );
      case 'triangle':
        return (
          <RegularPolygon
            {...commonProps}
            sides={3}
            radius={layer.width / 2}
            fill={layer.fill}
            stroke={layer.stroke}
            strokeWidth={layer.strokeWidth}
            opacity={layer.opacity || 1}
            rotation={layer.rotation || 0}
          />
        );
      case 'star':
        return (
          <RegularPolygon
            {...commonProps}
            sides={5}
            radius={layer.width / 2}
            innerRadius={layer.width / 4}
            fill={layer.fill}
            stroke={layer.stroke}
            strokeWidth={layer.strokeWidth}
            opacity={layer.opacity || 1}
            rotation={layer.rotation || 0}
          />
        );
      default:
        return null;
    }
  };

  const getCursor = () => {
    switch (tool) {
      case 'pan': return isPanning ? 'grabbing' : 'grab';
      case 'pencil':
      case 'pen':
      case 'eraser': return 'crosshair';
      case 'text': return 'text';
      default: return 'default';
    }
  };

  return (
    <div 
      ref={containerRef}
      className="flex-1 bg-gray-50 relative overflow-auto"
      style={{ 
        cursor: getCursor(),
        width: '100%', 
        height: 'calc(100vh - 120px)',
      }}
    >
      {/* Hidden file input for image upload */}
      <input
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        style={{ display: 'none' }}
        id="image-upload"
      />

      <div 
        className="absolute inset-0"
        style={{
          width: Math.max(CANVAS_WIDTH * zoom + 200, window.innerWidth),
          height: Math.max(CANVAS_HEIGHT * zoom + 200, window.innerHeight),
        }}
      >
        <Stage
          ref={stageRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          scaleX={zoom}
          scaleY={zoom}
          x={pan.x + 100}
          y={pan.y + 100}
          onMouseDown={handleMouseDown}
          onMousemove={handleMouseMove}
          onMouseup={handleMouseUp}
          onWheel={handleWheel}
          className="border-2 border-gray-300 bg-white shadow-lg"
        >
          <Layer>
            {/* Grid background */}
            {Array.from({ length: Math.ceil(CANVAS_WIDTH / 20) }, (_, i) => (
              <Rect
                key={`grid-v-${i}`}
                x={i * 20}
                y={0}
                width={1}
                height={CANVAS_HEIGHT}
                fill="#f0f0f0"
              />
            ))}
            {Array.from({ length: Math.ceil(CANVAS_HEIGHT / 20) }, (_, i) => (
              <Rect
                key={`grid-h-${i}`}
                x={0}
                y={i * 20}
                width={CANVAS_WIDTH}
                height={1}
                fill="#f0f0f0"
              />
            ))}
            
            {/* Render layers */}
            {layers
              .filter(layer => layer.visible)
              .sort((a, b) => a.zIndex - b.zIndex)
              .map(renderLayer)}
            
            {/* Render current drawing path */}
            {(tool === 'pen' || tool === 'pencil') && currentPath.length > 1 && (
              <Line
                points={currentPath.flatMap(p => [p.x, p.y])}
                stroke={tool === 'pen' ? '#000000' : '#333333'}
                strokeWidth={tool === 'pen' ? 2 : 3}
                lineCap="round"
                lineJoin="round"
              />
            )}
            
            {/* Eraser preview */}
            {tool === 'eraser' && currentPath.length > 0 && (
              <Line
                points={currentPath.flatMap(p => [p.x, p.y])}
                stroke="#ff4444"
                strokeWidth={8}
                lineCap="round"
                lineJoin="round"
                opacity={0.5}
                dash={[5, 5]}
              />
            )}
            
            {/* Transformer for selected layers */}
            <Transformer
              ref={transformerRef}
              boundBoxFunc={(oldBox, newBox) => {
                if (newBox.width < 5 || newBox.height < 5) {
                  return oldBox;
                }
                return newBox;
              }}
            />
          </Layer>
        </Stage>
      </div>

      {/* Text editing overlay */}
      {isTextEditing && editingTextId && (
        <textarea
          ref={textInputRef}
          className="absolute bg-transparent border-2 border-blue-500 resize-none outline-none p-1"
          style={{
            left: textPosition.x,
            top: textPosition.y,
            fontSize: '16px',
            fontFamily: 'Arial',
            color: '#000000',
            background: 'rgba(255, 255, 255, 0.9)',
            minWidth: '100px',
            minHeight: '20px',
          }}
          value={layers.find(l => l.id === editingTextId)?.text || ''}
          onChange={(e) => handleTextEdit(e.target.value)}
          onBlur={handleTextEditEnd}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              handleTextEditEnd();
            }
          }}
          autoFocus
        />
      )}
      
      {/* Zoom controls */}
      <div className="absolute top-4 right-4 flex flex-col space-y-2 bg-white rounded-lg shadow-lg p-2">
        <button
          onClick={() => setZoom(Math.min(5, zoom * 1.2))}
          className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm"
        >
          +
        </button>
        <span className="text-xs text-center">{Math.round(zoom * 100)}%</span>
        <button
          onClick={() => setZoom(Math.max(0.1, zoom / 1.2))}
          className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm"
        >
          -
        </button>
        <button
          onClick={() => setZoom(1)}
          className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-xs"
        >
          100%
        </button>
      </div>
    </div>
  );
}
