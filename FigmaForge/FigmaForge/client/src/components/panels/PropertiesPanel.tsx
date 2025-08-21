import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { useDesignStore } from '@/stores/designStore';
import { AlignLeft, AlignCenter, AlignRight, Bold, Italic, Underline } from 'lucide-react';

export function PropertiesPanel() {
  const { layers, selectedLayerIds, updateLayer } = useDesignStore();
  
  const selectedLayers = layers.filter(layer => selectedLayerIds.includes(layer.id));
  const selectedLayer = selectedLayers.length === 1 ? selectedLayers[0] : null;

  if (!selectedLayer) {
    return (
      <div className="w-80 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="font-semibold">Properties</h2>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-gray-500 dark:text-gray-400">
            <div className="w-12 h-12 mx-auto mb-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center">
              <div className="w-4 h-4 bg-gray-300 dark:bg-gray-600 rounded" />
            </div>
            <p className="text-sm">Select a layer to edit</p>
          </div>
        </div>
      </div>
    );
  }

  const handlePropertyChange = (property: string, value: any) => {
    updateLayer(selectedLayer.id, { [property]: value });
  };

  return (
    <div className="w-80 bg-gradient-to-b from-card via-card to-card/95 border-l border-border/50 flex flex-col backdrop-blur-lg">
      {/* Header */}
      <div className="p-5 border-b border-border/30 bg-gradient-to-r from-accent/5 to-primary/5">
        <h2 className="font-bold text-lg bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">Properties</h2>
        <p className="text-sm text-muted-foreground mt-1 font-medium">{selectedLayer.name}</p>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* Transform */}
          <div>
            <Label className="text-sm font-medium mb-3 block">Transform</Label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="x" className="text-xs text-gray-500 dark:text-gray-400">X</Label>
                <Input
                  id="x"
                  type="number"
                  value={Math.round(selectedLayer.x)}
                  onChange={(e) => handlePropertyChange('x', parseFloat(e.target.value) || 0)}
                  className="h-8"
                />
              </div>
              <div>
                <Label htmlFor="y" className="text-xs text-gray-500 dark:text-gray-400">Y</Label>
                <Input
                  id="y"
                  type="number"
                  value={Math.round(selectedLayer.y)}
                  onChange={(e) => handlePropertyChange('y', parseFloat(e.target.value) || 0)}
                  className="h-8"
                />
              </div>
              <div>
                <Label htmlFor="width" className="text-xs text-gray-500 dark:text-gray-400">W</Label>
                <Input
                  id="width"
                  type="number"
                  value={Math.round(selectedLayer.width)}
                  onChange={(e) => handlePropertyChange('width', parseFloat(e.target.value) || 1)}
                  className="h-8"
                />
              </div>
              <div>
                <Label htmlFor="height" className="text-xs text-gray-500 dark:text-gray-400">H</Label>
                <Input
                  id="height"
                  type="number"
                  value={Math.round(selectedLayer.height)}
                  onChange={(e) => handlePropertyChange('height', parseFloat(e.target.value) || 1)}
                  className="h-8"
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Fill */}
          <div>
            <Label className="text-sm font-medium mb-3 block">Fill</Label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={selectedLayer.fill || '#000000'}
                onChange={(e) => handlePropertyChange('fill', e.target.value)}
                className="w-8 h-8 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
              />
              <Input
                value={selectedLayer.fill || '#000000'}
                onChange={(e) => handlePropertyChange('fill', e.target.value)}
                className="h-8 flex-1"
              />
            </div>
          </div>

          {/* Stroke */}
          <div>
            <Label className="text-sm font-medium mb-3 block">Stroke</Label>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  value={selectedLayer.stroke || '#000000'}
                  onChange={(e) => handlePropertyChange('stroke', e.target.value)}
                  className="w-8 h-8 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
                />
                <Input
                  value={selectedLayer.stroke || '#000000'}
                  onChange={(e) => handlePropertyChange('stroke', e.target.value)}
                  className="h-8 flex-1"
                />
              </div>
              <div>
                <Label htmlFor="strokeWidth" className="text-xs text-gray-500 dark:text-gray-400 block mb-1">
                  Width: {selectedLayer.strokeWidth || 0}px
                </Label>
                <Slider
                  value={[selectedLayer.strokeWidth || 0]}
                  onValueChange={([value]) => handlePropertyChange('strokeWidth', value)}
                  max={20}
                  step={1}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Text properties */}
          {selectedLayer.type === 'text' && (
            <>
              <Separator />
              <div>
                <Label className="text-sm font-medium mb-3 block">Text</Label>
                <div className="space-y-3">
                  <Input
                    value={selectedLayer.text || ''}
                    onChange={(e) => handlePropertyChange('text', e.target.value)}
                    placeholder="Enter text..."
                    className="h-8"
                  />
                  
                  <div>
                    <Label htmlFor="fontSize" className="text-xs text-gray-500 dark:text-gray-400 block mb-1">
                      Size: {selectedLayer.fontSize || 16}px
                    </Label>
                    <Slider
                      value={[selectedLayer.fontSize || 16]}
                      onValueChange={([value]) => handlePropertyChange('fontSize', value)}
                      min={8}
                      max={72}
                      step={1}
                      className="w-full"
                    />
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <Button size="icon" variant="outline" className="w-8 h-8">
                      <Bold className="w-4 h-4" />
                    </Button>
                    <Button size="icon" variant="outline" className="w-8 h-8">
                      <Italic className="w-4 h-4" />
                    </Button>
                    <Button size="icon" variant="outline" className="w-8 h-8">
                      <Underline className="w-4 h-4" />
                    </Button>
                    
                    <Separator orientation="vertical" className="h-8 mx-2" />
                    
                    <Button size="icon" variant="outline" className="w-8 h-8">
                      <AlignLeft className="w-4 h-4" />
                    </Button>
                    <Button size="icon" variant="outline" className="w-8 h-8">
                      <AlignCenter className="w-4 h-4" />
                    </Button>
                    <Button size="icon" variant="outline" className="w-8 h-8">
                      <AlignRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}

          <Separator />

          {/* Layer Settings */}
          <div>
            <Label className="text-sm font-medium mb-3 block">Layer</Label>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="visible" className="text-xs">Visible</Label>
                <input
                  id="visible"
                  type="checkbox"
                  checked={selectedLayer.visible}
                  onChange={(e) => handlePropertyChange('visible', e.target.checked)}
                  className="rounded"
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="locked" className="text-xs">Locked</Label>
                <input
                  id="locked"
                  type="checkbox"
                  checked={selectedLayer.locked}
                  onChange={(e) => handlePropertyChange('locked', e.target.checked)}
                  className="rounded"
                />
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}