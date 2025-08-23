
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useDesignStore } from '@/stores/designStore';
import { 
  MousePointer2, 
  Square, 
  Circle, 
  Type, 
  Image,
  Pen,
  Pencil,
  Eraser,
  Hand,
  Move,
  RotateCcw,
  RotateCw,
  Copy,
  Trash2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Layers,
  Eye,
  Lock,
  ZoomIn,
  ZoomOut,
  Download,
  Upload,
  Palette,
  Minus,
  Triangle,
  Star,
  Heart,
  Diamond,
  Hexagon,
  ChevronUp,
  ChevronDown,
  CornerUpLeft,
  CornerUpRight,
  Maximize
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function Toolbar() {
  const { 
    tool, 
    setTool, 
    selectedLayerIds, 
    deleteLayer, 
    duplicateLayer, 
    zoom, 
    setZoom, 
    undo, 
    redo, 
    groupLayers, 
    ungroupLayers, 
    alignLayers,
    copyLayers,
    pasteLayers,
    resetZoom,
    fitToSelection,
    addLayer,
    layers
  } = useDesignStore();

  const tools = [
    // Selection Tools
    { id: 'select', icon: MousePointer2, label: 'Select (V)', group: 'selection' },
    { id: 'pan', icon: Hand, label: 'Hand (Space)', group: 'selection' },

    // Shape Tools
    { id: 'rectangle', icon: Square, label: 'Rectangle (R)', group: 'shapes' },
    { id: 'circle', icon: Circle, label: 'Circle (O)', group: 'shapes' },
    { id: 'triangle', icon: Triangle, label: 'Triangle', group: 'shapes' },
    { id: 'star', icon: Star, label: 'Star', group: 'shapes' },
    { id: 'polygon', icon: Hexagon, label: 'Polygon', group: 'shapes' },
    { id: 'line', icon: Minus, label: 'Line (L)', group: 'shapes' },

    // Drawing Tools
    { id: 'pen', icon: Pen, label: 'Pen (P)', group: 'drawing' },
    { id: 'pencil', icon: Pencil, label: 'Pencil (B)', group: 'drawing' },
    { id: 'eraser', icon: Eraser, label: 'Eraser (E)', group: 'drawing' },

    // Text & Media
    { id: 'text', icon: Type, label: 'Text (T)', group: 'content' },
    { id: 'image', icon: Image, label: 'Image', group: 'content' },
  ];

  const handleToolClick = (toolId: string) => {
    if (toolId === 'image') {
      // Trigger file upload for image tool
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
              const newLayer = {
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
            };
            img.src = event.target?.result as string;
          };
          reader.readAsDataURL(file);
        }
      };
      input.click();
    } else {
      setTool(toolId);
    }
  };

  const handleDelete = () => {
    selectedLayerIds.forEach(id => deleteLayer(id));
  };

  const handleDuplicate = () => {
    selectedLayerIds.forEach(id => duplicateLayer(id));
  };

  const groupedTools = tools.reduce((acc, tool) => {
    if (!acc[tool.group]) acc[tool.group] = [];
    acc[tool.group].push(tool);
    return acc;
  }, {} as Record<string, typeof tools>);

  return (
    <div className="h-16 bg-white border-b border-gray-200 flex items-center px-4 space-x-4 shadow-sm">
      {/* Logo */}
      <div className="flex items-center space-x-2 mr-6">
        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
          <Layers className="w-4 h-4 text-white" />
        </div>
        <span className="font-bold text-lg">Designer</span>
      </div>

      {/* Tool Groups */}
      {Object.entries(groupedTools).map(([group, groupTools], groupIndex) => (
        <div key={group} className="flex items-center space-x-1">
          {groupIndex > 0 && <Separator orientation="vertical" className="h-8 mx-2" />}
          {groupTools.map((toolItem) => (
            <Button
              key={toolItem.id}
              variant={tool === toolItem.id ? 'default' : 'ghost'}
              size="icon"
              onClick={() => handleToolClick(toolItem.id)}
              className={cn(
                'w-10 h-10 transition-all duration-200 relative',
                tool === toolItem.id 
                  ? 'bg-blue-500 text-white shadow-md ring-2 ring-blue-200' 
                  : 'hover:bg-gray-100 text-gray-700',
                // Ensure drawing tools are always visible
                ['pen', 'pencil', 'eraser'].includes(toolItem.id) && 'text-gray-900 hover:text-gray-900'
              )}
              title={toolItem.label}
            >
              <toolItem.icon className="w-5 h-5" />
              {tool === toolItem.id && (
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-300 rounded-full" />
              )}
            </Button>
          ))}
        </div>
      ))}

      <Separator orientation="vertical" className="h-8" />

      {/* History Actions */}
      <div className="flex items-center space-x-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={undo}
          className="w-10 h-10 hover:bg-gray-100"
          title="Undo (Ctrl+Z)"
        >
          <RotateCcw className="w-5 h-5" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={redo}
          className="w-10 h-10 hover:bg-gray-100"
          title="Redo (Ctrl+Shift+Z)"
        >
          <RotateCw className="w-5 h-5" />
        </Button>
      </div>

      <Separator orientation="vertical" className="h-8" />

      {/* Layer Actions */}
      <div className="flex items-center space-x-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={copyLayers}
          disabled={selectedLayerIds.length === 0}
          className="w-10 h-10 hover:bg-gray-100"
          title="Copy (Ctrl+C)"
        >
          <Copy className="w-5 h-5" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={pasteLayers}
          className="w-10 h-10 hover:bg-gray-100"
          title="Paste (Ctrl+V)"
        >
          <CornerUpLeft className="w-5 h-5" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={handleDuplicate}
          disabled={selectedLayerIds.length === 0}
          className="w-10 h-10 hover:bg-gray-100"
          title="Duplicate (Ctrl+D)"
        >
          <Copy className="w-5 h-5" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={handleDelete}
          disabled={selectedLayerIds.length === 0}
          className="w-10 h-10 hover:bg-red-50 hover:text-red-600"
          title="Delete (Del)"
        >
          <Trash2 className="w-5 h-5" />
        </Button>
      </div>

      <Separator orientation="vertical" className="h-8" />

      {/* Alignment Tools */}
      <div className="flex items-center space-x-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => alignLayers('left')}
          disabled={selectedLayerIds.length < 2}
          className="w-10 h-10 hover:bg-gray-100"
          title="Align Left"
        >
          <AlignLeft className="w-5 h-5" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => alignLayers('center')}
          disabled={selectedLayerIds.length < 2}
          className="w-10 h-10 hover:bg-gray-100"
          title="Align Center"
        >
          <AlignCenter className="w-5 h-5" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => alignLayers('right')}
          disabled={selectedLayerIds.length < 2}
          className="w-10 h-10 hover:bg-gray-100"
          title="Align Right"
        >
          <AlignRight className="w-5 h-5" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={groupLayers}
          disabled={selectedLayerIds.length < 2}
          className="w-10 h-10 hover:bg-gray-100"
          title="Group (Ctrl+G)"
        >
          <Layers className="w-5 h-5" />
        </Button>
      </div>

      <Separator orientation="vertical" className="h-8" />

      {/* Zoom Controls */}
      <div className="flex items-center space-x-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setZoom(zoom / 1.2)}
          className="w-8 h-8 hover:bg-gray-100"
          title="Zoom Out (-)"
        >
          <ZoomOut className="w-4 h-4" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={resetZoom}
          className="min-w-[3rem] h-8 px-2 hover:bg-gray-100 text-xs"
          title="Reset Zoom (Ctrl+0)"
        >
          {Math.round(zoom * 100)}%
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setZoom(zoom * 1.2)}
          className="w-8 h-8 hover:bg-gray-100"
          title="Zoom In (+)"
        >
          <ZoomIn className="w-4 h-4" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={fitToSelection}
          disabled={selectedLayerIds.length === 0}
          className="w-8 h-8 hover:bg-gray-100"
          title="Fit to Selection (Ctrl+1)"
        >
          <Maximize className="w-4 h-4" />
        </Button>
      </div>

      {/* Right side actions */}
      <div className="flex-1" />

      <div className="flex items-center space-x-2">
        <Button variant="ghost" size="sm" className="hover:bg-gray-100">
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>

        <Button variant="default" size="sm" className="bg-blue-500 hover:bg-blue-600">
          <Upload className="w-4 h-4 mr-2" />
          Save
        </Button>
      </div>
    </div>
  );
}
