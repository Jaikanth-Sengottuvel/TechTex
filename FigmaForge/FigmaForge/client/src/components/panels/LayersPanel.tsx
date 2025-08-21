import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useDesignStore } from '@/stores/designStore';
import { 
  Eye, 
  EyeOff, 
  Lock, 
  Unlock,
  Square,
  Circle,
  Type,
  Image,
  Trash2,
  Plus
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function LayersPanel() {
  const {
    layers,
    selectedLayerIds,
    selectLayer,
    updateLayer,
    deleteLayer,
  } = useDesignStore();
  
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLayers = layers.filter(layer =>
    layer.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getLayerIcon = (type: string) => {
    switch (type) {
      case 'rectangle': return Square;
      case 'circle': return Circle;
      case 'text': return Type;
      case 'image': return Image;
      default: return Square;
    }
  };

  const handleLayerClick = (layerId: string, event: React.MouseEvent) => {
    selectLayer(layerId, event.ctrlKey || event.metaKey);
  };

  const toggleLayerVisibility = (layerId: string) => {
    const layer = layers.find(l => l.id === layerId);
    if (layer) {
      updateLayer(layerId, { visible: !layer.visible });
    }
  };

  const toggleLayerLock = (layerId: string) => {
    const layer = layers.find(l => l.id === layerId);
    if (layer) {
      updateLayer(layerId, { locked: !layer.locked });
    }
  };

  return (
    <div className="w-80 bg-gradient-to-b from-card via-card to-card/95 border-r border-border/50 flex flex-col backdrop-blur-lg">
      {/* Header */}
      <div className="p-5 border-b border-border/30 bg-gradient-to-r from-primary/5 to-accent/5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-lg bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Layers</h2>
          <Button size="icon" variant="ghost" className="w-8 h-8 hover:bg-primary/10 hover:text-primary rounded-xl">
            <Plus className="w-5 h-5" />
          </Button>
        </div>
        
        {/* Search */}
        <Input
          placeholder="Search layers..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-8"
        />
      </div>

      {/* Layers List */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {filteredLayers.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Square className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No layers yet</p>
              <p className="text-xs">Create shapes to see them here</p>
            </div>
          ) : (
            <div className="space-y-1">
              {filteredLayers
                .sort((a, b) => b.zIndex - a.zIndex) // Show top layers first
                .map((layer) => {
                  const Icon = getLayerIcon(layer.type);
                  const isSelected = selectedLayerIds.includes(layer.id);
                  
                  return (
                    <div
                      key={layer.id}
                      className={cn(
                        'flex items-center p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer group',
                        isSelected && 'bg-primary/10 hover:bg-primary/15'
                      )}
                      onClick={(e) => handleLayerClick(layer.id, e)}
                    >
                      {/* Layer Icon */}
                      <div className={cn(
                        'w-5 h-5 mr-3 flex-shrink-0',
                        layer.visible ? 'text-gray-600 dark:text-gray-400' : 'text-gray-400 dark:text-gray-600'
                      )}>
                        <Icon className="w-full h-full" />
                      </div>
                      
                      {/* Layer Name */}
                      <div className="flex-1 min-w-0">
                        <Input
                          value={layer.name}
                          onChange={(e) => updateLayer(layer.id, { name: e.target.value })}
                          className={cn(
                            'border-none bg-transparent p-0 h-auto text-sm font-medium',
                            !layer.visible && 'text-gray-400 dark:text-gray-600'
                          )}
                          onFocus={(e) => e.stopPropagation()}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                      
                      {/* Controls */}
                      <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="w-6 h-6 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleLayerVisibility(layer.id);
                          }}
                        >
                          {layer.visible ? (
                            <Eye className="w-3 h-3" />
                          ) : (
                            <EyeOff className="w-3 h-3 text-gray-400" />
                          )}
                        </Button>
                        
                        <Button
                          size="icon"
                          variant="ghost"
                          className="w-6 h-6 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleLayerLock(layer.id);
                          }}
                        >
                          {layer.locked ? (
                            <Lock className="w-3 h-3 text-amber-500" />
                          ) : (
                            <Unlock className="w-3 h-3" />
                          )}
                        </Button>
                        
                        <Button
                          size="icon"
                          variant="ghost"
                          className="w-6 h-6 p-0 hover:bg-red-100 hover:text-red-600"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteLayer(layer.id);
                          }}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}