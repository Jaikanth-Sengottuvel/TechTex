
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
  Layers,
  Group,
  Hexagon
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
    case 'polygon': return Hexagon;
    case 'path': return Edit3;
    case 'group': return Group;
    default: return Square;
  }
};

interface LayerItemProps {
  layer: any;
  isSelected: boolean;
  isHovered: boolean;
  isEditing: boolean;
  editingName: string;
  onSelect: (e: React.MouseEvent) => void;
  onHover: () => void;
  onHoverEnd: () => void;
  onToggleVisibility: (e: React.MouseEvent) => void;
  onToggleLock: (e: React.MouseEvent) => void;
  onStartEditing: () => void;
  onEndEditing: () => void;
  onNameChange: (value: string) => void;
  onDelete: (e: React.MouseEvent) => void;
  onDuplicate: (e: React.MouseEvent) => void;
  onMoveUp: (e: React.MouseEvent) => void;
  onMoveDown: (e: React.MouseEvent) => void;
  depth?: number;
}

function LayerItem({ 
  layer, 
  isSelected, 
  isHovered, 
  isEditing, 
  editingName, 
  onSelect, 
  onHover, 
  onHoverEnd,
  onToggleVisibility, 
  onToggleLock, 
  onStartEditing, 
  onEndEditing, 
  onNameChange, 
  onDelete, 
  onDuplicate, 
  onMoveUp, 
  onMoveDown,
  depth = 0 
}: LayerItemProps) {
  const IconComponent = getLayerIcon(layer.type);
  
  return (
    <div
      className={cn(
        'group flex items-center px-2 py-1.5 hover:bg-gray-50 transition-all duration-200 ease-in-out',
        isSelected && 'bg-blue-50 border-r-2 border-blue-500',
        isHovered && !isSelected && 'bg-gray-50',
        'animate-in fade-in duration-200'
      )}
      style={{ paddingLeft: `${8 + depth * 16}px` }}
      onMouseEnter={onHover}
      onMouseLeave={onHoverEnd}
      onClick={onSelect}
    >
      {/* Layer Icon */}
      <div className="flex items-center justify-center w-4 h-4 mr-2">
        <IconComponent 
          className={cn(
            'w-3 h-3 transition-colors duration-200',
            layer.visible ? 'text-gray-700' : 'text-gray-400',
            isSelected && 'text-blue-600'
          )} 
        />
      </div>

      {/* Layer Name */}
      <div className="flex-1 min-w-0">
        {isEditing ? (
          <Input
            value={editingName}
            onChange={(e) => onNameChange(e.target.value)}
            onBlur={onEndEditing}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                onEndEditing();
              } else if (e.key === 'Escape') {
                onEndEditing();
              }
            }}
            className="h-6 px-1 text-xs border-blue-500 focus:ring-1 focus:ring-blue-500"
            autoFocus
          />
        ) : (
          <span 
            className={cn(
              'text-xs truncate cursor-pointer transition-colors duration-200',
              layer.visible ? 'text-gray-900' : 'text-gray-400',
              isSelected && 'text-blue-900 font-medium'
            )}
            onDoubleClick={onStartEditing}
          >
            {layer.name}
          </span>
        )}
      </div>

      {/* Layer Controls */}
      <div className={cn(
        'flex items-center space-x-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200',
        isSelected && 'opacity-100'
      )}>
        {/* Visibility Toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleVisibility}
          className={cn(
            'w-6 h-6 p-0 hover:bg-gray-200 transition-all duration-200',
            !layer.visible && 'text-gray-400'
          )}
        >
          {layer.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
        </Button>

        {/* Lock Toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleLock}
          className={cn(
            'w-6 h-6 p-0 hover:bg-gray-200 transition-all duration-200',
            layer.locked && 'text-orange-500'
          )}
        >
          {layer.locked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
        </Button>

        {/* More Actions */}
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={onMoveUp}
            className="w-6 h-6 p-0 hover:bg-gray-200 transition-all duration-200"
            title="Move Up"
          >
            <ChevronUp className="w-3 h-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onMoveDown}
            className="w-6 h-6 p-0 hover:bg-gray-200 transition-all duration-200"
            title="Move Down"
          >
            <ChevronDown className="w-3 h-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDuplicate}
            className="w-6 h-6 p-0 hover:bg-gray-200 transition-all duration-200"
            title="Duplicate"
          >
            <Copy className="w-3 h-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            className="w-6 h-6 p-0 hover:bg-red-100 hover:text-red-600 transition-all duration-200"
            title="Delete"
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export function LayersPanel() {
  const { 
    layers, 
    selectedLayerIds, 
    hoveredLayerId,
    selectLayer, 
    updateLayer, 
    deleteLayer, 
    duplicateLayer,
    moveLayer,
    clearSelection,
    groupLayers,
    ungroupLayers,
    setHoveredLayer
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

  const startEditing = (layerId: string, currentName: string) => {
    setEditingLayerId(layerId);
    setEditingName(currentName);
  };

  const endEditing = () => {
    if (editingLayerId && editingName.trim()) {
      updateLayer(editingLayerId, { name: editingName.trim() });
    }
    setEditingLayerId('');
    setEditingName('');
  };

  const handleDelete = (layerId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteLayer(layerId);
  };

  const handleDuplicate = (layerId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    duplicateLayer(layerId);
  };

  const handleMoveUp = (layerId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    moveLayer(layerId, 'up');
  };

  const handleMoveDown = (layerId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    moveLayer(layerId, 'down');
  };

  const handleAddLayer = () => {
    // Add a default rectangle layer
    const newLayer = {
      type: 'rectangle' as const,
      name: 'Rectangle',
      transform: {
        x: 100,
        y: 100,
        width: 120,
        height: 80,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
      },
      style: {
        fill: '#3f51b5',
        stroke: '#303f9f',
        strokeWidth: 2,
        opacity: 1,
      },
      visible: true,
      locked: false,
    };

    // This would need to be implemented in the store
    // addLayer(newLayer);
  };

  const handleGroupSelected = () => {
    if (selectedLayerIds.length > 1) {
      groupLayers(selectedLayerIds);
    }
  };

  const handleUngroupSelected = () => {
    selectedLayerIds.forEach(id => {
      const layer = layers.find(l => l.id === id);
      if (layer && layer.type === 'group') {
        ungroupLayers(id);
      }
    });
  };

  return (
    <div className="flex flex-col h-full w-64 bg-white border-r border-gray-200 animate-in slide-in-from-left duration-300">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center space-x-2">
          <Layers className="w-4 h-4 text-gray-600" />
          <h3 className="text-sm font-semibold text-gray-900">Layers</h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleAddLayer}
          className="w-7 h-7 p-0 hover:bg-gray-200 transition-colors duration-200"
          title="Add Layer"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {/* Layer Actions */}
      <div className="p-3 space-y-2 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleGroupSelected}
            disabled={selectedLayerIds.length < 2}
            className="flex-1 h-8 text-xs border-gray-300 hover:bg-blue-50 hover:border-blue-300 disabled:opacity-50 transition-all duration-200"
          >
            <Group className="w-3 h-3 mr-1" />
            Group
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleUngroupSelected}
            disabled={selectedLayerIds.length === 0 || !selectedLayerIds.some(id => layers.find(l => l.id === id)?.type === 'group')}
            className="flex-1 h-8 text-xs border-gray-300 hover:bg-blue-50 hover:border-blue-300 disabled:opacity-50 transition-all duration-200"
          >
            <Group className="w-3 h-3 mr-1" />
            Ungroup
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => selectedLayerIds.forEach(id => duplicateLayer(id))}
            disabled={selectedLayerIds.length === 0}
            className="flex-1 h-8 text-xs border-gray-300 hover:bg-green-50 hover:border-green-300 disabled:opacity-50 transition-all duration-200"
          >
            <Copy className="w-3 h-3 mr-1" />
            Duplicate
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => selectedLayerIds.forEach(id => deleteLayer(id))}
            disabled={selectedLayerIds.length === 0}
            className="flex-1 h-8 text-xs border-gray-300 hover:bg-red-50 hover:border-red-300 hover:text-red-600 disabled:opacity-50 transition-all duration-200"
          >
            <Trash2 className="w-3 h-3 mr-1" />
            Delete
          </Button>
        </div>
      </div>

      {/* Layer Count Info */}
      <div className="px-3 py-2 border-b border-gray-200 bg-gray-25">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">
            {layers.length} layer{layers.length !== 1 ? 's' : ''}
          </span>
          {selectedLayerIds.length > 0 && (
            <span className="text-blue-600 font-medium animate-in fade-in duration-300">
              {selectedLayerIds.length} selected
            </span>
          )}
        </div>
      </div>

      {/* Layers List */}
      <ScrollArea className="flex-1">
        <div className="p-1 space-y-0.5">
          {sortedLayers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center animate-in fade-in duration-500">
              <Layers className="w-8 h-8 text-gray-300 mb-2" />
              <p className="text-sm text-gray-500 mb-1">No layers yet</p>
              <p className="text-xs text-gray-400">Start drawing to create layers</p>
            </div>
          ) : (
            sortedLayers.map((layer, index) => (
              <LayerItem
                key={layer.id}
                layer={layer}
                isSelected={selectedLayerIds.includes(layer.id)}
                isHovered={hoveredLayerId === layer.id}
                isEditing={editingLayerId === layer.id}
                editingName={editingName}
                onSelect={(e) => handleLayerClick(layer.id, e)}
                onHover={() => setHoveredLayer(layer.id)}
                onHoverEnd={() => setHoveredLayer(null)}
                onToggleVisibility={(e) => handleVisibilityToggle(layer.id, e)}
                onToggleLock={(e) => handleLockToggle(layer.id, e)}
                onStartEditing={() => startEditing(layer.id, layer.name)}
                onEndEditing={endEditing}
                onNameChange={setEditingName}
                onDelete={(e) => handleDelete(layer.id, e)}
                onDuplicate={(e) => handleDuplicate(layer.id, e)}
                onMoveUp={(e) => handleMoveUp(layer.id, e)}
                onMoveDown={(e) => handleMoveDown(layer.id, e)}
              />
            ))
          )}
        </div>
      </ScrollArea>

      {/* Footer with shortcuts */}
      <div className="p-3 border-t border-gray-200 bg-gray-50">
        <div className="text-xs text-gray-500 space-y-1">
          <p>Double-click to rename</p>
          <p>Ctrl+click for multi-select</p>
        </div>
      </div>
    </div>
  );
}
