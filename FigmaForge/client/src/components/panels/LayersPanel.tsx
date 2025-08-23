
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useDesignStore } from '@/stores/designStore';
import { 
  Eye, 
  EyeOff, 
  Lock, 
  Unlock, 
  Trash2, 
  Copy,
  ChevronUp,
  ChevronDown,
  MoreHorizontal,
  Square,
  Circle,
  Type,
  Image,
  Minus,
  Triangle,
  Star,
  Edit3,
  Plus,
  Layers
} from 'lucide-react';
import { cn } from '@/lib/utils';

const getLayerIcon = (type: string) => {
  switch (type) {
    case 'rectangle': return Square;
    case 'circle': return Circle;
    case 'text': return Type;
    case 'image': return Image;
    case 'line': return Minus;
    case 'triangle': return Triangle;
    case 'star': return Star;
    default: return Square;
  }
};

export function LayersPanel() {
  const { 
    layers, 
    selectedLayerIds, 
    selectLayer, 
    updateLayer, 
    deleteLayer, 
    duplicateLayer,
    moveLayer,
    clearSelection,
    groupLayers,
    ungroupLayers
  } = useDesignStore();

  const [editingLayerId, setEditingLayerId] = useState<string>('');
  const [editingName, setEditingName] = useState('');

  const sortedLayers = [...layers].sort((a, b) => b.zIndex - a.zIndex);

  const handleLayerClick = (layerId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    selectLayer(layerId, e.ctrlKey || e.metaKey);
  };

  const handleVisibilityToggle = (layerId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const layer = layers.find(l => l.id === layerId);
    if (layer) {
      updateLayer(layerId, { visible: !layer.visible });
    }
  };

  const handleLockToggle = (layerId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const layer = layers.find(l => l.id === layerId);
    if (layer) {
      updateLayer(layerId, { locked: !layer.locked });
    }
  };

  const handleNameEditStart = (layerId: string, currentName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingLayerId(layerId);
    setEditingName(currentName);
  };

  const handleNameEditSave = () => {
    if (editingLayerId && editingName.trim()) {
      updateLayer(editingLayerId, { name: editingName.trim() });
    }
    setEditingLayerId('');
    setEditingName('');
  };

  const handleNameEditCancel = () => {
    setEditingLayerId('');
    setEditingName('');
  };

  const handleDeleteLayer = (layerId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteLayer(layerId);
  };

  const handleDuplicateLayer = (layerId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    duplicateLayer(layerId);
  };

  const handleMoveLayer = (layerId: string, direction: 'up' | 'down' | 'top' | 'bottom') => {
    moveLayer(layerId, direction);
  };

  const handleDragStart = (e: React.DragEvent, layerId: string) => {
    e.dataTransfer.setData('text/plain', layerId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetLayerId: string) => {
    e.preventDefault();
    const draggedLayerId = e.dataTransfer.getData('text/plain');
    
    if (draggedLayerId !== targetLayerId) {
      const draggedLayer = layers.find(l => l.id === draggedLayerId);
      const targetLayer = layers.find(l => l.id === targetLayerId);
      
      if (draggedLayer && targetLayer) {
        updateLayer(draggedLayerId, { zIndex: targetLayer.zIndex });
        updateLayer(targetLayerId, { zIndex: draggedLayer.zIndex });
      }
    }
  };

  return (
    <div className="w-80 bg-gradient-to-b from-card via-card to-card/95 border-l border-border/50 flex flex-col backdrop-blur-lg">
      {/* Header */}
      <div className="p-5 border-b border-border/30 bg-gradient-to-r from-accent/5 to-primary/5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-lg bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
            Layers
          </h2>
          <div className="flex items-center space-x-1">
            <Button 
              size="icon" 
              variant="ghost" 
              className="w-8 h-8 hover:bg-primary/10 hover:text-primary rounded-xl"
              onClick={groupLayers}
              disabled={selectedLayerIds.length < 2}
              title="Group Layers (Ctrl+G)"
            >
              <Layers className="w-4 h-4" />
            </Button>
            <Button 
              size="icon" 
              variant="ghost" 
              className="w-8 h-8 hover:bg-primary/10 hover:text-primary rounded-xl"
              title="Add Layer"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Layer Actions */}
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => selectedLayerIds.forEach(id => duplicateLayer(id))}
            disabled={selectedLayerIds.length === 0}
            className="flex-1 h-8 text-xs border-border/50 hover:bg-primary/10 hover:border-primary/30"
          >
            <Copy className="w-3 h-3 mr-1" />
            Duplicate
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => selectedLayerIds.forEach(id => deleteLayer(id))}
            disabled={selectedLayerIds.length === 0}
            className="flex-1 h-8 text-xs border-border/50 hover:bg-red-50 hover:border-red-300 hover:text-red-600"
          >
            <Trash2 className="w-3 h-3 mr-1" />
            Delete
          </Button>
        </div>
      </div>

      {/* Layer Count Info */}
      <div className="px-5 py-3 border-b border-border/30 bg-muted/20">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {layers.length} layer{layers.length !== 1 ? 's' : ''}
          </span>
          {selectedLayerIds.length > 0 && (
            <span className="text-primary font-medium">
              {selectedLayerIds.length} selected
            </span>
          )}
        </div>
      </div>

      {/* Layers List */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {sortedLayers.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Layers className="w-8 h-8 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No layers yet</p>
              <p className="text-xs">Add elements to see them here</p>
            </div>
          ) : (
            <div className="space-y-1">
              {sortedLayers.map((layer, index) => {
                const Icon = getLayerIcon(layer.type);
                const isSelected = selectedLayerIds.includes(layer.id);
                const isEditing = editingLayerId === layer.id;

                return (
                  <div
                    key={layer.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, layer.id)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, layer.id)}
                    onClick={(e) => handleLayerClick(layer.id, e)}
                    className={cn(
                      "group relative bg-background/30 rounded-lg p-3 border transition-all duration-200 cursor-pointer hover:bg-background/50",
                      isSelected 
                        ? "border-primary/50 bg-primary/10 shadow-md" 
                        : "border-border/30 hover:border-border/50",
                      layer.locked && "opacity-60"
                    )}
                  >
                    {/* Layer Content */}
                    <div className="flex items-center space-x-3">
                      {/* Layer Icon */}
                      <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                        isSelected 
                          ? "bg-primary/20 text-primary" 
                          : "bg-muted/50 text-muted-foreground group-hover:bg-muted/70"
                      )}>
                        <Icon className="w-4 h-4" />
                      </div>

                      {/* Layer Info */}
                      <div className="flex-1 min-w-0">
                        {isEditing ? (
                          <Input
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            onBlur={handleNameEditSave}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleNameEditSave();
                              if (e.key === 'Escape') handleNameEditCancel();
                            }}
                            className="h-6 text-sm px-2 py-0"
                            autoFocus
                          />
                        ) : (
                          <div>
                            <h4 className={cn(
                              "text-sm font-medium truncate transition-colors",
                              isSelected ? "text-primary" : "text-foreground"
                            )}>
                              {layer.name}
                            </h4>
                            <p className="text-xs text-muted-foreground">
                              {layer.width}×{layer.height}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Layer Controls */}
                      <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {/* Edit Name */}
                        <Button
                          size="icon"
                          variant="ghost"
                          className="w-6 h-6 hover:bg-primary/20 hover:text-primary"
                          onClick={(e) => handleNameEditStart(layer.id, layer.name, e)}
                        >
                          <Edit3 className="w-3 h-3" />
                        </Button>

                        {/* Visibility Toggle */}
                        <Button
                          size="icon"
                          variant="ghost"
                          className="w-6 h-6 hover:bg-primary/20 hover:text-primary"
                          onClick={(e) => handleVisibilityToggle(layer.id, e)}
                        >
                          {layer.visible ? (
                            <Eye className="w-3 h-3" />
                          ) : (
                            <EyeOff className="w-3 h-3 text-muted-foreground" />
                          )}
                        </Button>

                        {/* Lock Toggle */}
                        <Button
                          size="icon"
                          variant="ghost"
                          className="w-6 h-6 hover:bg-primary/20 hover:text-primary"
                          onClick={(e) => handleLockToggle(layer.id, e)}
                        >
                          {layer.locked ? (
                            <Lock className="w-3 h-3 text-orange-500" />
                          ) : (
                            <Unlock className="w-3 h-3" />
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* Layer Order Controls */}
                    {isSelected && (
                      <div className="absolute -right-2 top-1/2 transform -translate-y-1/2 flex flex-col bg-background border border-border/50 rounded-lg shadow-lg">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="w-6 h-6 rounded-b-none"
                          onClick={() => handleMoveLayer(layer.id, 'up')}
                          disabled={index === 0}
                        >
                          <ChevronUp className="w-3 h-3" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="w-6 h-6 rounded-t-none"
                          onClick={() => handleMoveLayer(layer.id, 'down')}
                          disabled={index === sortedLayers.length - 1}
                        >
                          <ChevronDown className="w-3 h-3" />
                        </Button>
                      </div>
                    )}

                    {/* Selection Indicator */}
                    {isSelected && (
                      <div className="absolute -left-1 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-accent rounded-r-full" />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Footer Actions */}
      <div className="p-4 border-t border-border/30 bg-gradient-to-r from-primary/5 to-accent/5">
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={clearSelection}
            className="flex-1 border-border/50 hover:bg-primary/10 hover:border-primary/30"
          >
            Clear Selection
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={ungroupLayers}
            disabled={!selectedLayerIds.some(id => layers.find(l => l.id === id)?.type === 'group')}
            className="flex-1 border-border/50 hover:bg-primary/10 hover:border-primary/30"
          >
            Ungroup
          </Button>
        </div>
      </div>
    </div>
  );
}
