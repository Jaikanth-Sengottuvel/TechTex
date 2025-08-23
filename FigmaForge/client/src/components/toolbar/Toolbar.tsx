
import React from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { useDesignStore, Tool } from '@/stores/designStore';
import { 
  MousePointer2,
  Hand,
  Square,
  Circle,
  Triangle,
  Star,
  Hexagon,
  Minus,
  Edit3,
  Pen,
  Eraser,
  Type,
  Pipette,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignTop,
  AlignMiddle,
  AlignBottom,
  DistributeHorizontally,
  DistributeVertically,
  MoveUp,
  MoveDown,
  Group,
  Ungroup,
  Copy,
  Clipboard,
  RotateCcw,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Maximize,
  Grid,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Palette
} from 'lucide-react';
import { cn } from '@/lib/utils';

const tools: { id: Tool; icon: React.ComponentType<any>; label: string; shortcut: string }[] = [
  { id: 'move', icon: MousePointer2, label: 'Move', shortcut: 'V' },
  { id: 'hand', icon: Hand, label: 'Hand', shortcut: 'H' },
  { id: 'rectangle', icon: Square, label: 'Rectangle', shortcut: 'R' },
  { id: 'circle', icon: Circle, label: 'Circle', shortcut: 'O' },
  { id: 'triangle', icon: Triangle, label: 'Triangle', shortcut: 'T' },
  { id: 'star', icon: Star, label: 'Star', shortcut: 'S' },
  { id: 'polygon', icon: Hexagon, label: 'Polygon', shortcut: 'P' },
  { id: 'line', icon: Minus, label: 'Line', shortcut: 'L' },
  { id: 'pencil', icon: Edit3, label: 'Pencil', shortcut: 'B' },
  { id: 'pen', icon: Pen, label: 'Pen', shortcut: 'P' },
  { id: 'eraser', icon: Eraser, label: 'Eraser', shortcut: 'E' },
  { id: 'text', icon: Type, label: 'Text', shortcut: 'T' },
  { id: 'eyedropper', icon: Pipette, label: 'Eyedropper', shortcut: 'I' },
];

export function Toolbar() {
  const {
    currentTool,
    setCurrentTool,
    selectedLayerIds,
    layers,
    canvas,
    eraserSize,
    setEraserSize,
    setZoom,
    setPan,
    resetView,
    fitToSelection,
    alignLayers,
    distributeLayers,
    moveLayer,
    groupLayers,
    ungroupLayers,
    copyLayers,
    pasteLayers,
    undo,
    redo,
    updateLayer,
  } = useDesignStore();

  const selectedLayers = layers.filter(layer => selectedLayerIds.includes(layer.id));
  const hasSelection = selectedLayerIds.length > 0;
  const canGroup = selectedLayerIds.length > 1;
  const canUngroup = selectedLayerIds.length === 1 && selectedLayers[0]?.type === 'group';

  const handleZoomIn = () => setZoom(canvas.zoom * 1.2);
  const handleZoomOut = () => setZoom(canvas.zoom / 1.2);
  
  // Get current fill/stroke from selected layer
  const currentFill = selectedLayers.length === 1 ? selectedLayers[0].style.fill : '#3f51b5';
  const currentStroke = selectedLayers.length === 1 ? selectedLayers[0].style.stroke : '#303f9f';
  const currentStrokeWidth = selectedLayers.length === 1 ? selectedLayers[0].style.strokeWidth : 2;
  const currentOpacity = selectedLayers.length === 1 ? selectedLayers[0].style.opacity : 1;

  const handleColorChange = (type: 'fill' | 'stroke', color: string) => {
    selectedLayerIds.forEach(id => {
      updateLayer(id, {
        style: {
          ...layers.find(l => l.id === id)?.style,
          [type]: color,
        },
      });
    });
  };

  const handleStrokeWidthChange = (width: number) => {
    selectedLayerIds.forEach(id => {
      updateLayer(id, {
        style: {
          ...layers.find(l => l.id === id)?.style,
          strokeWidth: width,
        },
      });
    });
  };

  const handleOpacityChange = (opacity: number) => {
    selectedLayerIds.forEach(id => {
      updateLayer(id, {
        style: {
          ...layers.find(l => l.id === id)?.style,
          opacity: opacity / 100,
        },
      });
    });
  };

  return (
    <div className="flex items-center gap-1 px-4 py-2 bg-white border-b border-gray-200 shadow-sm">
      {/* Main Tools */}
      <div className="flex items-center gap-1">
        {tools.map(tool => (
          <Button
            key={tool.id}
            variant={currentTool === tool.id ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setCurrentTool(tool.id)}
            className={cn(
              'w-8 h-8 p-1.5 relative group',
              currentTool === tool.id && 'bg-blue-100 border-blue-300 text-blue-700'
            )}
            title={`${tool.label} (${tool.shortcut})`}
          >
            <tool.icon className="w-4 h-4" />
            <Badge
              variant="secondary"
              className="absolute -top-1 -right-1 w-4 h-4 p-0 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
            >
              {tool.shortcut}
            </Badge>
          </Button>
        ))}
      </div>

      <Separator orientation="vertical" className="h-6" />

      {/* Color and Style Controls */}
      <div className="flex items-center gap-2">
        {/* Fill Color */}
        <div className="flex items-center gap-1">
          <label className="text-xs text-gray-600">Fill</label>
          <div className="relative">
            <input
              type="color"
              value={currentFill}
              onChange={(e) => handleColorChange('fill', e.target.value)}
              className="w-6 h-6 rounded border-2 border-gray-300 cursor-pointer"
              disabled={!hasSelection}
            />
            <Palette className="w-3 h-3 absolute -bottom-1 -right-1 bg-white rounded-full p-0.5" />
          </div>
        </div>

        {/* Stroke Color */}
        <div className="flex items-center gap-1">
          <label className="text-xs text-gray-600">Stroke</label>
          <input
            type="color"
            value={currentStroke}
            onChange={(e) => handleColorChange('stroke', e.target.value)}
            className="w-6 h-6 rounded border-2 border-gray-300 cursor-pointer"
            disabled={!hasSelection}
          />
        </div>

        {/* Stroke Width */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-600">Width</label>
          <Slider
            value={[currentStrokeWidth || 1]}
            onValueChange={([value]) => handleStrokeWidthChange(value)}
            max={20}
            min={0}
            step={1}
            className="w-16"
            disabled={!hasSelection}
          />
          <span className="text-xs text-gray-500 w-6">{currentStrokeWidth}px</span>
        </div>

        {/* Opacity */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-600">Opacity</label>
          <Slider
            value={[Math.round(currentOpacity * 100)]}
            onValueChange={([value]) => handleOpacityChange(value)}
            max={100}
            min={0}
            step={1}
            className="w-16"
            disabled={!hasSelection}
          />
          <span className="text-xs text-gray-500 w-8">{Math.round(currentOpacity * 100)}%</span>
        </div>
      </div>

      <Separator orientation="vertical" className="h-6" />

      {/* Eraser Size (shown only when eraser is active) */}
      {currentTool === 'eraser' && (
        <>
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-600">Size</label>
            <Slider
              value={[eraserSize]}
              onValueChange={([value]) => setEraserSize(value)}
              max={100}
              min={5}
              step={5}
              className="w-20"
            />
            <span className="text-xs text-gray-500 w-8">{eraserSize}px</span>
          </div>
          <Separator orientation="vertical" className="h-6" />
        </>
      )}

      {/* Alignment Tools */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => alignLayers('left')}
          disabled={selectedLayerIds.length < 2}
          className="w-8 h-8 p-1.5"
          title="Align Left"
        >
          <AlignLeft className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => alignLayers('center')}
          disabled={selectedLayerIds.length < 2}
          className="w-8 h-8 p-1.5"
          title="Align Center"
        >
          <AlignCenter className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => alignLayers('right')}
          disabled={selectedLayerIds.length < 2}
          className="w-8 h-8 p-1.5"
          title="Align Right"
        >
          <AlignRight className="w-4 h-4" />
        </Button>
        
        <Separator orientation="vertical" className="h-4 mx-1" />
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => alignLayers('top')}
          disabled={selectedLayerIds.length < 2}
          className="w-8 h-8 p-1.5"
          title="Align Top"
        >
          <AlignTop className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => alignLayers('middle')}
          disabled={selectedLayerIds.length < 2}
          className="w-8 h-8 p-1.5"
          title="Align Middle"
        >
          <AlignMiddle className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => alignLayers('bottom')}
          disabled={selectedLayerIds.length < 2}
          className="w-8 h-8 p-1.5"
          title="Align Bottom"
        >
          <AlignBottom className="w-4 h-4" />
        </Button>

        <Separator orientation="vertical" className="h-4 mx-1" />
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => distributeLayers('horizontal')}
          disabled={selectedLayerIds.length < 3}
          className="w-8 h-8 p-1.5"
          title="Distribute Horizontally"
        >
          <DistributeHorizontally className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => distributeLayers('vertical')}
          disabled={selectedLayerIds.length < 3}
          className="w-8 h-8 p-1.5"
          title="Distribute Vertically"
        >
          <DistributeVertically className="w-4 h-4" />
        </Button>
      </div>

      <Separator orientation="vertical" className="h-6" />

      {/* Arrange Tools */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => selectedLayerIds.forEach(id => moveLayer(id, 'up'))}
          disabled={!hasSelection}
          className="w-8 h-8 p-1.5"
          title="Bring Forward"
        >
          <MoveUp className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => selectedLayerIds.forEach(id => moveLayer(id, 'down'))}
          disabled={!hasSelection}
          className="w-8 h-8 p-1.5"
          title="Send Backward"
        >
          <MoveDown className="w-4 h-4" />
        </Button>

        <Separator orientation="vertical" className="h-4 mx-1" />
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => groupLayers(selectedLayerIds)}
          disabled={!canGroup}
          className="w-8 h-8 p-1.5"
          title="Group (Ctrl+G)"
        >
          <Group className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => canUngroup && ungroupLayers(selectedLayerIds[0])}
          disabled={!canUngroup}
          className="w-8 h-8 p-1.5"
          title="Ungroup (Ctrl+Shift+G)"
        >
          <Ungroup className="w-4 h-4" />
        </Button>
      </div>

      <Separator orientation="vertical" className="h-6" />

      {/* Edit Actions */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={undo}
          className="w-8 h-8 p-1.5"
          title="Undo (Ctrl+Z)"
        >
          <RotateCcw className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={redo}
          className="w-8 h-8 p-1.5"
          title="Redo (Ctrl+Shift+Z)"
        >
          <RotateCw className="w-4 h-4" />
        </Button>

        <Separator orientation="vertical" className="h-4 mx-1" />
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => copyLayers(selectedLayerIds)}
          disabled={!hasSelection}
          className="w-8 h-8 p-1.5"
          title="Copy (Ctrl+C)"
        >
          <Copy className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={pasteLayers}
          className="w-8 h-8 p-1.5"
          title="Paste (Ctrl+V)"
        >
          <Clipboard className="w-4 h-4" />
        </Button>
      </div>

      <Separator orientation="vertical" className="h-6" />

      {/* Zoom Controls */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleZoomOut}
          className="w-8 h-8 p-1.5"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setZoom(1)}
          className="px-2 h-8 text-xs font-medium"
          title="Reset Zoom (Ctrl+0)"
        >
          {Math.round(canvas.zoom * 100)}%
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleZoomIn}
          className="w-8 h-8 p-1.5"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={fitToSelection}
          disabled={!hasSelection}
          className="w-8 h-8 p-1.5"
          title="Fit to Selection (Ctrl+1)"
        >
          <Maximize className="w-4 h-4" />
        </Button>
      </div>

      <Separator orientation="vertical" className="h-6" />

      {/* View Controls */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            // Toggle grid visibility - implement in store
          }}
          className="w-8 h-8 p-1.5"
          title="Toggle Grid"
        >
          <Grid className="w-4 h-4" />
        </Button>
      </div>

      {/* Selection Info */}
      {hasSelection && (
        <>
          <Separator orientation="vertical" className="h-6 ml-auto" />
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <span>{selectedLayerIds.length} selected</span>
            {selectedLayers.length === 1 && (
              <Badge variant="outline" className="text-xs">
                {selectedLayers[0].name}
              </Badge>
            )}
          </div>
        </>
      )}
    </div>
  );
}
