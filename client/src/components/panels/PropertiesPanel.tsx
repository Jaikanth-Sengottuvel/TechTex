
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDesignStore } from '@/stores/designStore';
import { 
  Palette, 
  Type, 
  Move, 
  RotateCcw, 
  Eye, 
  Lock,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  Underline,
  Upload,
  Settings,
  Layers,
  Square,
  Circle
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function PropertiesPanel() {
  const { layers, selectedLayerIds, updateLayer } = useDesignStore();
  
  const selectedLayers = layers.filter(layer => selectedLayerIds.includes(layer.id));
  const selectedLayer = selectedLayers.length === 1 ? selectedLayers[0] : null;
  
  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const [activeColorType, setActiveColorType] = useState<'fill' | 'stroke'>('fill');

  const commonColors = [
    '#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff',
    '#ffff00', '#ff00ff', '#00ffff', '#ffa500', '#800080',
    '#008000', '#ffc0cb', '#a52a2a', '#808080', '#000080'
  ];

  const fontFamilies = [
    'Arial', 'Helvetica', 'Times New Roman', 'Georgia', 'Verdana',
    'Courier New', 'Impact', 'Comic Sans MS', 'Trebuchet MS', 'Lucida Console'
  ];

  const handlePropertyUpdate = (property: string, value: any) => {
    if (selectedLayer) {
      updateLayer(selectedLayer.id, { [property]: value });
    }
  };

  const handleBulkUpdate = (property: string, value: any) => {
    selectedLayerIds.forEach(id => {
      updateLayer(id, { [property]: value });
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && selectedLayer?.type === 'image') {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        updateLayer(selectedLayer.id, { src: result });
      };
      reader.readAsDataURL(file);
    }
  };

  if (selectedLayers.length === 0) {
    return (
      <div className="w-80 bg-gradient-to-b from-card via-card to-card/95 border-l border-border/50 flex flex-col backdrop-blur-lg">
        <div className="p-6 text-center">
          <Settings className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="font-semibold text-foreground mb-2">No Selection</h3>
          <p className="text-sm text-muted-foreground">
            Select an element to see its properties
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 bg-gradient-to-b from-card via-card to-card/95 border-l border-border/50 flex flex-col backdrop-blur-lg">
      {/* Header */}
      <div className="p-5 border-b border-border/30 bg-gradient-to-r from-accent/5 to-primary/5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-lg bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
            Properties
          </h2>
          <div className="flex items-center space-x-1">
            {selectedLayer?.type === 'rectangle' && <Square className="w-4 h-4 text-muted-foreground" />}
            {selectedLayer?.type === 'circle' && <Circle className="w-4 h-4 text-muted-foreground" />}
            {selectedLayer?.type === 'text' && <Type className="w-4 h-4 text-muted-foreground" />}
          </div>
        </div>

        {selectedLayers.length > 1 && (
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-3">
            <p className="text-sm text-primary font-medium">
              {selectedLayers.length} layers selected
            </p>
            <p className="text-xs text-primary/70">
              Changes will apply to all selected layers
            </p>
          </div>
        )}
      </div>

      <ScrollArea className="flex-1">
        <div className="p-5 space-y-6">
          {/* Position & Size */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Move className="w-4 h-4 text-primary" />
              <h3 className="font-semibold text-foreground">Position & Size</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-muted-foreground">X</Label>
                <Input
                  type="number"
                  value={selectedLayer?.x || 0}
                  onChange={(e) => handlePropertyUpdate('x', Number(e.target.value))}
                  className="h-8 text-sm"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Y</Label>
                <Input
                  type="number"
                  value={selectedLayer?.y || 0}
                  onChange={(e) => handlePropertyUpdate('y', Number(e.target.value))}
                  className="h-8 text-sm"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Width</Label>
                <Input
                  type="number"
                  value={selectedLayer?.width || 0}
                  onChange={(e) => handlePropertyUpdate('width', Number(e.target.value))}
                  className="h-8 text-sm"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Height</Label>
                <Input
                  type="number"
                  value={selectedLayer?.height || 0}
                  onChange={(e) => handlePropertyUpdate('height', Number(e.target.value))}
                  className="h-8 text-sm"
                />
              </div>
            </div>

            {/* Rotation */}
            <div>
              <Label className="text-xs text-muted-foreground mb-2 block">
                Rotation: {Math.round(selectedLayer?.rotation || 0)}°
              </Label>
              <Slider
                value={[selectedLayer?.rotation || 0]}
                onValueChange={([value]) => handlePropertyUpdate('rotation', value)}
                max={360}
                min={-360}
                step={1}
                className="w-full"
              />
            </div>
          </div>

          <Separator />

          {/* Appearance */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Palette className="w-4 h-4 text-primary" />
              <h3 className="font-semibold text-foreground">Appearance</h3>
            </div>

            {/* Fill Color */}
            {selectedLayer?.type !== 'line' && selectedLayer?.type !== 'path' && (
              <div>
                <Label className="text-xs text-muted-foreground mb-2 block">Fill Color</Label>
                <div className="flex items-center space-x-2">
                  <div
                    className="w-8 h-8 rounded border-2 border-border cursor-pointer"
                    style={{ backgroundColor: selectedLayer?.fill || '#000000' }}
                    onClick={() => {
                      setActiveColorType('fill');
                      setColorPickerOpen(!colorPickerOpen);
                    }}
                  />
                  <Input
                    type="text"
                    value={selectedLayer?.fill || '#000000'}
                    onChange={(e) => handlePropertyUpdate('fill', e.target.value)}
                    className="h-8 text-sm flex-1"
                    placeholder="#000000"
                  />
                </div>
              </div>
            )}

            {/* Stroke Color */}
            <div>
              <Label className="text-xs text-muted-foreground mb-2 block">Stroke Color</Label>
              <div className="flex items-center space-x-2">
                <div
                  className="w-8 h-8 rounded border-2 border-border cursor-pointer"
                  style={{ backgroundColor: selectedLayer?.stroke || '#000000' }}
                  onClick={() => {
                    setActiveColorType('stroke');
                    setColorPickerOpen(!colorPickerOpen);
                  }}
                />
                <Input
                  type="text"
                  value={selectedLayer?.stroke || '#000000'}
                  onChange={(e) => handlePropertyUpdate('stroke', e.target.value)}
                  className="h-8 text-sm flex-1"
                  placeholder="#000000"
                />
              </div>
            </div>

            {/* Stroke Width */}
            <div>
              <Label className="text-xs text-muted-foreground mb-2 block">
                Stroke Width: {selectedLayer?.strokeWidth || 1}px
              </Label>
              <Slider
                value={[selectedLayer?.strokeWidth || 1]}
                onValueChange={([value]) => handlePropertyUpdate('strokeWidth', value)}
                max={20}
                min={0}
                step={1}
                className="w-full"
              />
            </div>

            {/* Opacity */}
            <div>
              <Label className="text-xs text-muted-foreground mb-2 block">
                Opacity: {Math.round((selectedLayer?.opacity || 1) * 100)}%
              </Label>
              <Slider
                value={[selectedLayer?.opacity || 1]}
                onValueChange={([value]) => handlePropertyUpdate('opacity', value)}
                max={1}
                min={0}
                step={0.01}
                className="w-full"
              />
            </div>

            {/* Border Radius (for rectangles) */}
            {selectedLayer?.type === 'rectangle' && (
              <div>
                <Label className="text-xs text-muted-foreground mb-2 block">
                  Border Radius: {selectedLayer?.borderRadius || 0}px
                </Label>
                <Slider
                  value={[selectedLayer?.borderRadius || 0]}
                  onValueChange={([value]) => handlePropertyUpdate('borderRadius', value)}
                  max={50}
                  min={0}
                  step={1}
                  className="w-full"
                />
              </div>
            )}

            {/* Color Picker */}
            {colorPickerOpen && (
              <div className="p-3 bg-background border border-border rounded-lg">
                <div className="grid grid-cols-5 gap-2 mb-3">
                  {commonColors.map((color) => (
                    <div
                      key={color}
                      className="w-8 h-8 rounded cursor-pointer border-2 border-border hover:scale-110 transition-transform"
                      style={{ backgroundColor: color }}
                      onClick={() => {
                        handlePropertyUpdate(activeColorType, color);
                        setColorPickerOpen(false);
                      }}
                    />
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setColorPickerOpen(false)}
                  className="w-full"
                >
                  Close
                </Button>
              </div>
            )}
          </div>

          {/* Text Properties */}
          {selectedLayer?.type === 'text' && (
            <>
              <Separator />
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Type className="w-4 h-4 text-primary" />
                  <h3 className="font-semibold text-foreground">Typography</h3>
                </div>

                {/* Font Family */}
                <div>
                  <Label className="text-xs text-muted-foreground mb-2 block">Font Family</Label>
                  <Select
                    value={selectedLayer.fontFamily || 'Arial'}
                    onValueChange={(value) => handlePropertyUpdate('fontFamily', value)}
                  >
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {fontFamilies.map((font) => (
                        <SelectItem key={font} value={font}>
                          {font}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Font Size */}
                <div>
                  <Label className="text-xs text-muted-foreground mb-2 block">
                    Font Size: {selectedLayer.fontSize || 16}px
                  </Label>
                  <Slider
                    value={[selectedLayer.fontSize || 16]}
                    onValueChange={([value]) => handlePropertyUpdate('fontSize', value)}
                    max={100}
                    min={8}
                    step={1}
                    className="w-full"
                  />
                </div>

                {/* Font Weight */}
                <div>
                  <Label className="text-xs text-muted-foreground mb-2 block">Font Weight</Label>
                  <Select
                    value={selectedLayer.fontWeight || 'normal'}
                    onValueChange={(value) => handlePropertyUpdate('fontWeight', value)}
                  >
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="bold">Bold</SelectItem>
                      <SelectItem value="lighter">Light</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Text Align */}
                <div>
                  <Label className="text-xs text-muted-foreground mb-2 block">Text Alignment</Label>
                  <div className="flex items-center space-x-1">
                    <Button
                      variant={selectedLayer.textAlign === 'left' ? 'default' : 'outline'}
                      size="icon"
                      className="w-8 h-8"
                      onClick={() => handlePropertyUpdate('textAlign', 'left')}
                    >
                      <AlignLeft className="w-3 h-3" />
                    </Button>
                    <Button
                      variant={selectedLayer.textAlign === 'center' ? 'default' : 'outline'}
                      size="icon"
                      className="w-8 h-8"
                      onClick={() => handlePropertyUpdate('textAlign', 'center')}
                    >
                      <AlignCenter className="w-3 h-3" />
                    </Button>
                    <Button
                      variant={selectedLayer.textAlign === 'right' ? 'default' : 'outline'}
                      size="icon"
                      className="w-8 h-8"
                      onClick={() => handlePropertyUpdate('textAlign', 'right')}
                    >
                      <AlignRight className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Image Properties */}
          {selectedLayer?.type === 'image' && (
            <>
              <Separator />
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Upload className="w-4 h-4 text-primary" />
                  <h3 className="font-semibold text-foreground">Image</h3>
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground mb-2 block">Replace Image</Label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-replace"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById('image-replace')?.click()}
                    className="w-full"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload New Image
                  </Button>
                </div>
              </div>
            </>
          )}

          <Separator />

          {/* Layer Controls */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Layers className="w-4 h-4 text-primary" />
              <h3 className="font-semibold text-foreground">Layer</h3>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePropertyUpdate('visible', !selectedLayer?.visible)}
                className="flex items-center justify-center"
              >
                <Eye className="w-4 h-4 mr-1" />
                {selectedLayer?.visible ? 'Hide' : 'Show'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePropertyUpdate('locked', !selectedLayer?.locked)}
                className="flex items-center justify-center"
              >
                <Lock className="w-4 h-4 mr-1" />
                {selectedLayer?.locked ? 'Unlock' : 'Lock'}
              </Button>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
