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
  const [isLeftPanelCollapsed, setIsLeftPanelCollapsed] = useState(false);
  const [isRightPanelCollapsed, setIsRightPanelCollapsed] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      // Update canvas size when window resizes
      const leftPanelWidth = isLeftPanelCollapsed ? 0 : 256;
      const rightPanelWidth = isRightPanelCollapsed ? 0 : 320;
      setCanvasSize({
        width: Math.max(800, window.innerWidth - leftPanelWidth - rightPanelWidth),
        height: Math.max(600, window.innerHeight - 60),
      });
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [setCanvasSize, isLeftPanelCollapsed, isRightPanelCollapsed]);

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
      <div className={cn(
        'flex-shrink-0 bg-white border-r border-gray-200 transition-all duration-300 ease-in-out',
        isLeftPanelCollapsed ? 'w-0 overflow-hidden opacity-0' : 'w-64 opacity-100'
      )}>
        <div className={cn(
          'h-full flex flex-col transition-opacity duration-300',
          isLeftPanelCollapsed ? 'opacity-0 pointer-events-none' : 'opacity-100'
        )}>
          {/* Panel Header */}
          <div className="flex items-center justify-between p-3 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <Button
                variant={leftPanel === 'layers' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setLeftPanel('layers')}
                className="flex items-center gap-2 transition-all duration-200 hover:scale-105"
              >
                <Layers className="w-4 h-4" />
                <span className={cn(
                  'transition-opacity duration-200',
                  isLeftPanelCollapsed ? 'opacity-0' : 'opacity-100'
                )}>
                  Layers
                </span>
              </Button>
              <Button
                variant={leftPanel === 'components' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setLeftPanel('components')}
                className="flex items-center gap-2 transition-all duration-200 hover:scale-105"
              >
                <Package className="w-4 h-4" />
                <span className={cn(
                  'transition-opacity duration-200',
                  isLeftPanelCollapsed ? 'opacity-0' : 'opacity-100'
                )}>
                  Components
                </span>
              </Button>
            </div>
          </div>

          {/* Panel Content */}
          <div className="flex-1 overflow-hidden">
            <div className={cn(
              'transition-all duration-300 ease-in-out',
              leftPanel === 'layers' ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2'
            )}>
              {leftPanel === 'layers' && <LayersPanel />}
            </div>
            <div className={cn(
              'transition-all duration-300 ease-in-out',
              leftPanel === 'components' ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2'
            )}>
              {leftPanel === 'components' && <ComponentLibrary />}
            </div>
          </div>
        </div>
      </div>

      {/* Collapse/Expand Left Panel Button (when collapsed) */}
      {isLeftPanelCollapsed && (
        <div className="flex flex-col justify-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsLeftPanelCollapsed(false)}
            className="w-8 h-16 rounded-none rounded-r-md bg-white border border-l-0 shadow-sm hover:shadow-md transition-all duration-200 animate-in slide-in-from-left"
          >
            <Layers className="w-4 h-4 rotate-90" />
          </Button>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <Toolbar />
        <div className="flex-1 relative overflow-hidden bg-gradient-to-br from-gray-100 to-gray-50">
          <Canvas />
        </div>
      </div>

      {/* Right Panel */}
      <div className={cn(
        "transition-all duration-300 ease-in-out",
        isRightPanelCollapsed ? "w-0 translate-x-full opacity-0" : "w-80 translate-x-0 opacity-100"
      )}>
        <PropertiesPanel />

        {/* Collapse Button */}
        <div className="absolute top-4 -left-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsRightPanelCollapsed(!isRightPanelCollapsed)}
            className="w-8 h-8 rounded-full bg-white border shadow-sm hover:shadow-md transition-all duration-200"
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Collapse/Expand Right Panel Button (when collapsed) */}
      {isRightPanelCollapsed && (
        <div className="flex flex-col justify-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsRightPanelCollapsed(false)}
            className="w-8 h-16 rounded-none rounded-l-md bg-white border border-r-0 shadow-sm hover:shadow-md transition-all duration-200 animate-in slide-in-from-right"
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}