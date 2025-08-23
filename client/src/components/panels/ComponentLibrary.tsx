
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useDesignStore } from '@/stores/designStore';
import { 
  Circle, 
  Square, 
  Type, 
  Image, 
  Plus, 
  Triangle, 
  Star, 
  Minus,
  Zap,
  Search,
  Download,
  Upload,
  Heart,
  Diamond,
  Hexagon
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ComponentTemplate {
  id: string;
  name: string;
  category: 'shapes' | 'icons' | 'ui' | 'custom' | 'text' | 'lines' | 'graphics';
  icon: React.ComponentType<{ className?: string }>;
  template: {
    type: 'rectangle' | 'circle' | 'text' | 'triangle' | 'star' | 'line' | 'image';
    width: number;
    height: number;
    fill: string;
    stroke?: string;
    strokeWidth?: number;
    text?: string;
    fontSize?: number;
    fontWeight?: string;
    borderRadius?: number;
    points?: number[];
  };
}

const COMPONENT_TEMPLATES: ComponentTemplate[] = [
  // Basic Shapes
  {
    id: 'shape-circle',
    name: 'Circle',
    category: 'shapes',
    icon: Circle,
    template: {
      type: 'circle',
      width: 80,
      height: 80,
      fill: '#9c27b0',
      stroke: '#7b1fa2',
      strokeWidth: 2,
    }
  },
  {
    id: 'shape-rect',
    name: 'Rectangle',
    category: 'shapes',
    icon: Square,
    template: {
      type: 'rectangle',
      width: 100,
      height: 60,
      fill: '#3f51b5',
      stroke: '#303f9f',
      strokeWidth: 2,
    }
  },
  {
    id: 'shape-triangle',
    name: 'Triangle',
    category: 'shapes',
    icon: Triangle,
    template: {
      type: 'triangle',
      width: 80,
      height: 80,
      fill: '#ff6b6b',
      stroke: '#ff5252',
      strokeWidth: 2,
    }
  },
  {
    id: 'shape-star',
    name: 'Star',
    category: 'shapes',
    icon: Star,
    template: {
      type: 'star',
      width: 80,
      height: 80,
      fill: '#ffd700',
      stroke: '#ffb300',
      strokeWidth: 2,
    }
  },
  {
    id: 'shape-rounded-rect',
    name: 'Rounded Rectangle',
    category: 'shapes',
    icon: Square,
    template: {
      type: 'rectangle',
      width: 100,
      height: 60,
      fill: '#4caf50',
      stroke: '#388e3c',
      strokeWidth: 2,
      borderRadius: 16,
    }
  },
  // UI Elements
  {
    id: 'ui-button',
    name: 'Button',
    category: 'ui',
    icon: Square,
    template: {
      type: 'rectangle',
      width: 120,
      height: 40,
      fill: '#2196f3',
      stroke: '#1976d2',
      strokeWidth: 1,
      borderRadius: 8,
    }
  },
  {
    id: 'ui-input',
    name: 'Input Field',
    category: 'ui',
    icon: Square,
    template: {
      type: 'rectangle',
      width: 200,
      height: 36,
      fill: '#ffffff',
      stroke: '#e0e0e0',
      strokeWidth: 1,
      borderRadius: 4,
    }
  },
  {
    id: 'ui-card',
    name: 'Card',
    category: 'ui',
    icon: Square,
    template: {
      type: 'rectangle',
      width: 280,
      height: 180,
      fill: '#ffffff',
      stroke: '#e0e0e0',
      strokeWidth: 1,
      borderRadius: 12,
    }
  },
  {
    id: 'ui-navbar',
    name: 'Navigation Bar',
    category: 'ui',
    icon: Square,
    template: {
      type: 'rectangle',
      width: 800,
      height: 64,
      fill: '#ffffff',
      stroke: '#e0e0e0',
      strokeWidth: 1,
    }
  },
  {
    id: 'ui-sidebar',
    name: 'Sidebar',
    category: 'ui',
    icon: Square,
    template: {
      type: 'rectangle',
      width: 240,
      height: 600,
      fill: '#f8f9fa',
      stroke: '#e0e0e0',
      strokeWidth: 1,
    }
  },
  {
    id: 'ui-modal',
    name: 'Modal',
    category: 'ui',
    icon: Square,
    template: {
      type: 'rectangle',
      width: 400,
      height: 300,
      fill: '#ffffff',
      stroke: '#333333',
      strokeWidth: 2,
      borderRadius: 16,
    }
  },
  // Text Elements
  {
    id: 'text-heading',
    name: 'Heading',
    category: 'text',
    icon: Type,
    template: {
      type: 'text',
      width: 200,
      height: 40,
      fill: '#212121',
      text: 'Your Heading',
      fontSize: 24,
      fontWeight: 'bold',
    }
  },
  {
    id: 'text-paragraph',
    name: 'Paragraph',
    category: 'text',
    icon: Type,
    template: {
      type: 'text',
      width: 280,
      height: 60,
      fill: '#424242',
      text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      fontSize: 14,
    }
  },
  {
    id: 'text-label',
    name: 'Label',
    category: 'text',
    icon: Type,
    template: {
      type: 'text',
      width: 100,
      height: 20,
      fill: '#757575',
      text: 'Label',
      fontSize: 12,
    }
  },
  // Lines and Arrows
  {
    id: 'line-horizontal',
    name: 'Horizontal Line',
    category: 'lines',
    icon: Minus,
    template: {
      type: 'line',
      width: 1,
      height: 1,
      points: [0, 0, 120, 0],
      stroke: '#424242',
      strokeWidth: 2,
      fill: 'transparent',
    }
  },
  {
    id: 'line-vertical',
    name: 'Vertical Line',
    category: 'lines',
    icon: Minus,
    template: {
      type: 'line',
      width: 1,
      height: 1,
      points: [0, 0, 0, 120],
      stroke: '#424242',
      strokeWidth: 2,
      fill: 'transparent',
    }
  },
  // Icons and Graphics
  {
    id: 'icon-placeholder',
    name: 'Icon Placeholder',
    category: 'graphics',
    icon: Image,
    template: {
      type: 'circle',
      width: 48,
      height: 48,
      fill: '#f5f5f5',
      stroke: '#e0e0e0',
      strokeWidth: 1,
    }
  },
  {
    id: 'image-placeholder',
    name: 'Image Placeholder',
    category: 'graphics',
    icon: Image,
    template: {
      type: 'rectangle',
      width: 200,
      height: 150,
      fill: '#f5f5f5',
      stroke: '#e0e0e0',
      strokeWidth: 1,
      borderRadius: 8,
    }
  },
];

export function ComponentLibrary() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const { addLayer, layers } = useDesignStore();

  const categories = [
    { id: 'all', name: 'All', count: COMPONENT_TEMPLATES.length },
    { id: 'shapes', name: 'Shapes', count: COMPONENT_TEMPLATES.filter(t => t.category === 'shapes').length },
    { id: 'ui', name: 'UI Elements', count: COMPONENT_TEMPLATES.filter(t => t.category === 'ui').length },
    { id: 'text', name: 'Text', count: COMPONENT_TEMPLATES.filter(t => t.category === 'text').length },
    { id: 'lines', name: 'Lines', count: COMPONENT_TEMPLATES.filter(t => t.category === 'lines').length },
    { id: 'graphics', name: 'Graphics', count: COMPONENT_TEMPLATES.filter(t => t.category === 'graphics').length },
  ];

  const filteredComponents = COMPONENT_TEMPLATES.filter(component => {
    const matchesSearch = component.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || component.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddComponent = (template: ComponentTemplate) => {
    const centerX = 600;
    const centerY = 400;

    const newLayer = {
      id: `${template.template.type}-${Date.now()}`,
      ...template.template,
      name: template.name,
      x: centerX - (template.template.width || 100) / 2,
      y: centerY - (template.template.height || 100) / 2,
      visible: true,
      locked: false,
      zIndex: layers.length,
    };

    addLayer(newLayer);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const newLayer = {
            type: 'image' as const,
            name: file.name,
            x: 500,
            y: 300,
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

  return (
    <div className="w-80 bg-gradient-to-b from-card via-card to-card/95 border-r border-border/50 flex flex-col backdrop-blur-lg">
      {/* Header */}
      <div className="p-5 border-b border-border/30 bg-gradient-to-r from-accent/5 to-primary/5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-lg bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
            Components
          </h2>
          <div className="flex items-center space-x-1">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              id="component-image-upload"
            />
            <Button 
              size="icon" 
              variant="ghost" 
              className="w-8 h-8 hover:bg-primary/10 hover:text-primary rounded-xl"
              onClick={() => document.getElementById('component-image-upload')?.click()}
              title="Upload Image"
            >
              <Upload className="w-4 h-4" />
            </Button>
            <Button 
              size="icon" 
              variant="ghost" 
              className="w-8 h-8 hover:bg-primary/10 hover:text-primary rounded-xl"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search components..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10 pl-10 bg-muted/50 border-border/30 rounded-xl"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="p-4 border-b border-border/30">
        <div className="grid grid-cols-2 gap-2">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(category.id)}
              className={cn(
                'justify-between h-9 rounded-xl transition-all duration-200',
                selectedCategory === category.id
                  ? 'bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-lg'
                  : 'hover:bg-primary/10 hover:text-primary border-border/50'
              )}
            >
              <span className="text-xs font-medium">{category.name}</span>
              <Badge variant="secondary" className="ml-1 text-xs h-5 px-1.5 bg-primary/20 text-primary-foreground">
                {category.count}
              </Badge>
            </Button>
          ))}
        </div>
      </div>

      {/* Components List */}
      <ScrollArea className="flex-1">
        <div className="p-4">
          {filteredComponents.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Zap className="w-8 h-8 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No components found</p>
              <p className="text-xs">Try a different search term</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {filteredComponents.map((component) => {
                const Icon = component.icon;
                return (
                  <div
                    key={component.id}
                    onClick={() => handleAddComponent(component)}
                    className="group relative bg-gradient-to-br from-muted/30 to-muted/50 rounded-xl p-4 border border-border/30 hover:border-primary/30 cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-lg"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-accent/0 group-hover:from-primary/5 group-hover:to-accent/5 rounded-xl transition-all duration-200" />

                    <div className="relative">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg flex items-center justify-center mb-3 group-hover:from-primary/20 group-hover:to-accent/20 transition-all duration-200">
                        <Icon className="w-6 h-6 text-primary group-hover:text-accent transition-colors duration-200" />
                      </div>

                      <h3 className="text-sm font-semibold mb-1 group-hover:text-primary transition-colors duration-200">
                        {component.name}
                      </h3>

                      <Badge variant="outline" className="text-xs h-5 px-2 border-border/50 bg-transparent">
                        {component.category}
                      </Badge>
                    </div>

                    <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-transparent to-accent/0 group-hover:from-primary/10 group-hover:to-accent/10 rounded-xl transition-all duration-300 opacity-0 group-hover:opacity-100" />

                    <div className="absolute top-2 right-2 w-6 h-6 bg-gradient-to-br from-primary to-accent text-primary-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 scale-75 group-hover:scale-100">
                      <Plus className="w-3 h-3" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t border-border/30 bg-gradient-to-r from-primary/5 to-accent/5">
        <Button variant="outline" className="w-full rounded-xl border-border/50 hover:bg-primary/10 hover:border-primary/30">
          <Download className="w-4 h-4 mr-2" />
          Import Library
        </Button>
      </div>
    </div>
  );
}
