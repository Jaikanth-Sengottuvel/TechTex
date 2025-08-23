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
      try {
        // Delete selected layers
        if (e.key === 'Delete' || e.key === 'Backspace') {
          const { selectedLayerIds, deleteLayer } = useDesignStore.getState();
          selectedLayerIds.forEach(id => {
            try {
              deleteLayer(id);
            } catch (error) {
              console.error('Error deleting layer:', error);
            }
          });
        }

        // Select all
        if (e.key === 'a' && (e.ctrlKey || e.metaKey)) {
          e.preventDefault();
          const { layers, selectLayer } = useDesignStore.getState();
          layers.forEach(layer => {
            try {
              selectLayer(layer.id, true);
            } catch (error) {
              console.error('Error selecting layer:', error);
            }
          });
        }

        // Tool shortcuts
        if (!e.ctrlKey && !e.metaKey && !e.altKey) {
          const { setTool } = useDesignStore.getState();
          try {
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
          } catch (error) {
            console.error('Error setting tool:', error);
          }
        }
      } catch (error) {
        console.error('Error in keyboard handler:', error);
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
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Left Panel */}
      <div className="flex flex-col bg-white border-r shadow-sm">
        <div className="flex border-b bg-gray-50">
          <Button
            variant={leftPanel === 'layers' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setLeftPanel('layers')}
            className="flex-1 rounded-none h-10"
          >
            <Layers className="w-4 h-4 mr-2" />
            Layers
          </Button>
          <Button
            variant={leftPanel === 'components' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setLeftPanel('components')}
            className="flex-1 rounded-none h-10"
          >
            <Package className="w-4 h-4 mr-2" />
            Components
          </Button>
        </div>

        <div className="flex-1">
          {leftPanel === 'layers' ? <LayersPanel /> : <ComponentLibrary />}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <Toolbar />
        <div className="flex-1 relative overflow-hidden">
          <Canvas />
        </div>
      </div>

      {/* Right Panel */}
      <PropertiesPanel />
    </div>
  );
}