import { useEffect, useState } from 'react';
import { Toolbar } from '@/components/toolbar/Toolbar';
import { Canvas } from '@/components/canvas/Canvas';
import { LayersPanel } from '@/components/panels/LayersPanel';
import { PropertiesPanel } from '@/components/panels/PropertiesPanel';
import { ComponentLibrary } from '@/components/panels/ComponentLibrary';
import { useDesignStore } from '@/stores/designStore';
import { Button } from '@/components/ui/button';
import { Layers, Package, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Editor() {
  const { setCanvasSize } = useDesignStore();
  const [leftPanel, setLeftPanel] = useState<'layers' | 'components'>('layers');

  useEffect(() => {
    const handleResize = () => {
      // Update canvas size when window resizes
      setCanvasSize({
        width: Math.max(1200, window.innerWidth - 640),
        height: Math.max(800, window.innerHeight - 60),
      });
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [setCanvasSize]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Delete selected layers
      if (e.key === 'Delete' || e.key === 'Backspace') {
        const { selectedLayerIds, deleteLayer } = useDesignStore.getState();
        selectedLayerIds.forEach(id => deleteLayer(id));
      }
      
      // Select all
      if (e.key === 'a' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        const { layers, selectLayer } = useDesignStore.getState();
        layers.forEach(layer => selectLayer(layer.id, true));
      }
      
      // Tool shortcuts
      if (!e.ctrlKey && !e.metaKey && !e.altKey) {
        const { setTool } = useDesignStore.getState();
        switch (e.key.toLowerCase()) {
          case 'v':
            setTool('select');
            break;
          case 'r':
            setTool('rectangle');
            break;
          case 'o':
            setTool('circle');
            break;
          case 't':
            setTool('text');
            break;
          case ' ':
            e.preventDefault();
            setTool('pan');
            break;
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      // Stop panning when spacebar is released
      if (e.key === ' ') {
        const { tool, setTool } = useDesignStore.getState();
        if (tool === 'pan') {
          setTool('select');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-background via-background to-primary/5">
      <Toolbar />
      
      <div className="flex-1 flex">
        {/* Left Panel with Tabs */}
        <div className="flex">
          {/* Panel Tabs */}
          <div className="w-16 bg-gradient-to-b from-card to-card/90 border-r border-border/50 flex flex-col items-center py-4 space-y-3">
            <Button
              variant={leftPanel === 'layers' ? 'default' : 'ghost'}
              size="icon"
              onClick={() => setLeftPanel('layers')}
              className={cn(
                'w-10 h-10 rounded-xl transition-all duration-200',
                leftPanel === 'layers'
                  ? 'bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-lg'
                  : 'hover:bg-primary/10 hover:text-primary'
              )}
              title="Layers"
            >
              <Layers className="w-5 h-5" />
            </Button>
            
            <Button
              variant={leftPanel === 'components' ? 'default' : 'ghost'}
              size="icon"
              onClick={() => setLeftPanel('components')}
              className={cn(
                'w-10 h-10 rounded-xl transition-all duration-200',
                leftPanel === 'components'
                  ? 'bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-lg'
                  : 'hover:bg-primary/10 hover:text-primary'
              )}
              title="Components"
            >
              <Package className="w-5 h-5" />
            </Button>
          </div>
          
          {/* Panel Content */}
          {leftPanel === 'layers' ? <LayersPanel /> : <ComponentLibrary />}
        </div>
        
        <Canvas />
        <PropertiesPanel />
      </div>
    </div>
  );
}