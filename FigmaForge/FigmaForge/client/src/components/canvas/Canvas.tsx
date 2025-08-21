import { useRef, useState, useEffect } from 'react';
import { Stage, Layer, Rect, Circle, Text, Transformer } from 'react-konva';
import { useDesignStore } from '@/stores/designStore';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useCollaborationStore } from '@/stores/collaborationStore';
import { LiveCursors } from '@/components/collaboration/LiveCursors';
import type { Layer as LayerType } from '@/stores/designStore';
import Konva from 'konva';

export function Canvas() {
  const stageRef = useRef<Konva.Stage>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const [stagePos, setStagePos] = useState({ x: 0, y: 0 });
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  
  const {
    layers,
    selectedLayerIds,
    tool,
    zoom,
    canvasSize,
    addLayer,
    updateLayer,
    deleteLayer,
    updateLayerFromRemote,
    addLayerFromRemote,
    deleteLayerFromRemote,
    selectLayer,
    clearSelection,
    setTool,
  } = useDesignStore();

  const { isCollaborating, currentUser } = useCollaborationStore();
  
  const { 
    isConnected, 
    sendCursorMove, 
    sendLayerUpdate, 
    sendLayerAdd, 
    sendLayerDelete 
  } = useWebSocket((message) => {
    // Handle real-time updates from other users
    switch (message.type) {
      case 'layer-added':
        if (message.data.addedBy !== currentUser?.sessionId) {
          addLayerFromRemote(message.data.layer);
        }
        break;
      case 'layer-updated':
        if (message.data.updatedBy !== currentUser?.sessionId) {
          updateLayerFromRemote(message.data.layer.id, message.data.layer);
        }
        break;
      case 'layer-deleted':
        if (message.data.deletedBy !== currentUser?.sessionId) {
          deleteLayerFromRemote(message.data.layerId);
        }
        break;
    }
  });

  // Send cursor position to other users
  useEffect(() => {
    if (isCollaborating && isConnected) {
      const throttledCursorUpdate = setTimeout(() => {
        sendCursorMove(mousePos);
      }, 50); // Throttle cursor updates
      
      return () => clearTimeout(throttledCursorUpdate);
    }
  }, [mousePos, isCollaborating, isConnected, sendCursorMove]);

  const handleStageClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    const clickedOnEmpty = e.target === e.target.getStage();
    
    if (clickedOnEmpty) {
      if (tool === 'select') {
        clearSelection();
      } else if (tool !== 'pan') {
        // Create new shape
        const pos = e.target.getStage()!.getPointerPosition()!;
        const relativePos = {
          x: (pos.x - stagePos.x) / zoom,
          y: (pos.y - stagePos.y) / zoom,
        };
        
        let newLayer;
        if (tool === 'rectangle') {
          newLayer = {
            type: 'rectangle' as const,
            name: 'Rectangle',
            x: relativePos.x,
            y: relativePos.y,
            width: 100,
            height: 100,
            fill: '#6366f1',
            visible: true,
            locked: false,
          };
        } else if (tool === 'circle') {
          newLayer = {
            type: 'circle' as const,
            name: 'Circle',
            x: relativePos.x,
            y: relativePos.y,
            width: 100,
            height: 100,
            fill: '#8b5cf6',
            visible: true,
            locked: false,
          };
        } else if (tool === 'text') {
          newLayer = {
            type: 'text' as const,
            name: 'Text',
            x: relativePos.x,
            y: relativePos.y,
            width: 200,
            height: 40,
            text: 'Type here...',
            fontSize: 16,
            fill: '#1f2937',
            visible: true,
            locked: false,
          };
        }
        
        if (newLayer) {
          addLayer(newLayer);
          // Send to other users if collaborating
          if (isCollaborating && isConnected) {
            sendLayerAdd({ ...newLayer, id: `layer-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` });
          }
        }
        
        setTool('select');
      }
    }
  };

  const handleShapeClick = (id: string) => (e: Konva.KonvaEventObject<MouseEvent>) => {
    e.cancelBubble = true;
    selectLayer(id, e.evt.ctrlKey || e.evt.metaKey);
  };

  const handleDragEnd = (id: string) => (e: Konva.KonvaEventObject<DragEvent>) => {
    const updates = {
      x: e.target.x(),
      y: e.target.y(),
    };
    updateLayer(id, updates);
    
    // Send update to other users if collaborating
    if (isCollaborating && isConnected) {
      const layer = layers.find(l => l.id === id);
      if (layer) {
        sendLayerUpdate({ ...layer, ...updates });
      }
    }
  };

  const handleTransformEnd = (id: string) => (e: Konva.KonvaEventObject<Event>) => {
    const node = e.target;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    
    const updates = {
      x: node.x(),
      y: node.y(),
      width: node.width() * scaleX,
      height: node.height() * scaleY,
    };
    
    updateLayer(id, updates);
    
    // Reset scale
    node.scaleX(1);
    node.scaleY(1);
    
    // Send update to other users if collaborating
    if (isCollaborating && isConnected) {
      const layer = layers.find(l => l.id === id);
      if (layer) {
        sendLayerUpdate({ ...layer, ...updates });
      }
    }
  };

  const renderLayer = (layer: LayerType) => {
    const isSelected = selectedLayerIds.includes(layer.id);
    
    const commonProps = {
      key: layer.id,
      id: layer.id,
      x: layer.x,
      y: layer.y,
      draggable: !layer.locked && tool === 'select',
      onClick: handleShapeClick(layer.id),
      onDragEnd: handleDragEnd(layer.id),
      onTransformEnd: handleTransformEnd(layer.id),
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
            strokeWidth={layer.strokeWidth || 0}
          />
        );
      
      case 'circle':
        return (
          <Circle
            {...commonProps}
            radius={Math.min(layer.width, layer.height) / 2}
            fill={layer.fill}
            stroke={layer.stroke}
            strokeWidth={layer.strokeWidth || 0}
          />
        );
      
      case 'text':
        return (
          <Text
            {...commonProps}
            text={layer.text || ''}
            fontSize={layer.fontSize || 16}
            fill={layer.fill}
            width={layer.width}
            height={layer.height}
          />
        );
      
      default:
        return null;
    }
  };

  // Update transformer when selection changes
  const selectedNodes = layers.filter(layer => selectedLayerIds.includes(layer.id));
  
  return (
    <div className="flex-1 overflow-hidden bg-gradient-to-br from-background via-background to-primary/5 relative">
      {/* Animated grid pattern */}
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: `
          linear-gradient(hsl(var(--primary)) 1px, transparent 1px),
          linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)
        `,
        backgroundSize: '20px 20px'
      }} />
      
      <Stage
        ref={stageRef}
        width={window.innerWidth - 320}
        height={window.innerHeight - 64}
        scaleX={zoom}
        scaleY={zoom}
        x={stagePos.x}
        y={stagePos.y}
        draggable={tool === 'pan'}
        onClick={handleStageClick}
        onMouseMove={(e) => {
          const pos = e.target.getStage()!.getPointerPosition()!;
          const relativePos = {
            x: (pos.x - stagePos.x) / zoom,
            y: (pos.y - stagePos.y) / zoom,
          };
          setMousePos(relativePos);
        }}
        onDragEnd={(e) => {
          setStagePos({ x: e.target.x(), y: e.target.y() });
        }}
      >
        <Layer>
          {/* Canvas background with gradient */}
          <Rect
            x={0}
            y={0}
            width={canvasSize.width}
            height={canvasSize.height}
            fill="white"
            stroke="#00bcd4"
            strokeWidth={2}
            shadowColor="rgba(0, 188, 212, 0.3)"
            shadowBlur={20}
            shadowOffsetX={0}
            shadowOffsetY={0}
          />
          
          {/* Render all layers */}
          {layers
            .filter(layer => layer.visible)
            .sort((a, b) => a.zIndex - b.zIndex)
            .map(renderLayer)}
        </Layer>
        
        <Layer>
          <Transformer
            ref={transformerRef}
            nodes={selectedNodes.map(layer => 
              stageRef.current?.findOne(`#${layer.id}`)
            ).filter(Boolean)}
            boundBoxFunc={(oldBox, newBox) => {
              // Limit resize
              if (newBox.width < 5 || newBox.height < 5) {
                return oldBox;
              }
              return newBox;
            }}
          />
        </Layer>
      </Stage>
      
      {/* Zoom controls - Unique floating style */}
      <div className="absolute bottom-6 left-6 flex items-center space-x-3 bg-card/90 backdrop-blur-lg rounded-2xl shadow-2xl border border-border/30 p-3">
        <button
          onClick={() => useDesignStore.getState().setZoom(zoom - 0.1)}
          className="w-8 h-8 flex items-center justify-center bg-gradient-to-br from-primary to-accent text-primary-foreground rounded-xl hover:scale-110 transition-transform duration-200 shadow-lg font-bold"
        >
          −
        </button>
        <span className="text-sm font-bold min-w-[3rem] text-center bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          {Math.round(zoom * 100)}%
        </span>
        <button
          onClick={() => useDesignStore.getState().setZoom(zoom + 0.1)}
          className="w-8 h-8 flex items-center justify-center bg-gradient-to-br from-primary to-accent text-primary-foreground rounded-xl hover:scale-110 transition-transform duration-200 shadow-lg font-bold"
        >
          +
        </button>
      </div>
      
      {/* Live Cursors */}
      {isCollaborating && <LiveCursors stageRef={stageRef} zoom={zoom} stagePos={stagePos} />}
    </div>
  );
}