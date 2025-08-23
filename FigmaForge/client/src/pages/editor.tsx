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
        "flex flex-col bg-white border-r shadow-sm transition-all duration-300 ease-in-out",
        isLeftPanelCollapsed ? "w-0 -translate-x-full opacity-0" : "w-64 translate-x-0 opacity-100"
      )}>
        {/* Panel Tabs with Animation */}
        <div className="flex border-b bg-gradient-to-r from-gray-50 to-gray-100 overflow-hidden">
          <Button
            variant={leftPanel === 'layers' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setLeftPanel('layers')}
            className={cn(
              "flex-1 rounded-none h-11 transition-all duration-300 ease-in-out relative",
              leftPanel === 'layers' 
                ? "bg-white shadow-sm border-b-2 border-blue-500 text-blue-700 transform scale-105" 
                : "hover:bg-white/80 hover:shadow-sm transform hover:scale-102"
            )}
          >
            <Layers className={cn(
              "w-4 h-4 mr-2 transition-all duration-300",
              leftPanel === 'layers' ? "text-blue-600" : "text-gray-600"
            )} />
            <span className="font-medium">Layers</span>
            {leftPanel === 'layers' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 animate-in slide-in-from-left duration-300" />
            )}
          </Button>
          <Button
            variant={leftPanel === 'components' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setLeftPanel('components')}
            className={cn(
              "flex-1 rounded-none h-11 transition-all duration-300 ease-in-out relative",
              leftPanel === 'components' 
                ? "bg-white shadow-sm border-b-2 border-green-500 text-green-700 transform scale-105" 
                : "hover:bg-white/80 hover:shadow-sm transform hover:scale-102"
            )}
          >
            <Package className={cn(
              "w-4 h-4 mr-2 transition-all duration-300",
              leftPanel === 'components' ? "text-green-600" : "text-gray-600"
            )} />
            <span className="font-medium">Components</span>
            {leftPanel === 'components' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-500 animate-in slide-in-from-left duration-300" />
            )}
          </Button>
        </div>

        {/* Panel Content with Smooth Transition */}
        <div className="flex-1 relative overflow-hidden">
          <div className={cn(
            "absolute inset-0 transition-all duration-300 ease-in-out",
            leftPanel === 'layers' ? "transform translate-x-0 opacity-100" : "transform -translate-x-full opacity-0"
          )}>
            <LayersPanel />
          </div>
          <div className={cn(
            "absolute inset-0 transition-all duration-300 ease-in-out",
            leftPanel === 'components' ? "transform translate-x-0 opacity-100" : "transform translate-x-full opacity-0"
          )}>
            <ComponentLibrary />
          </div>
        </div>

        {/* Collapse Button */}
        <div className="p-2 border-t bg-gray-50">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsLeftPanelCollapsed(!isLeftPanelCollapsed)}
            className="w-full h-8 text-xs hover:bg-gray-200 transition-all duration-200"
          >
            {isLeftPanelCollapsed ? 'Expand' : 'Collapse'}
          </Button>
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