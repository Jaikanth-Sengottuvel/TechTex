import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useDesignStore } from '@/stores/designStore';
import { 
  Search, 
  Square, 
  Circle, 
  Triangle, 
  Star,
  Heart,
  Zap,
  Plus,
  Download
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ComponentTemplate {
  id: string;
  name: string;
  category: 'shapes' | 'icons' | 'ui' | 'custom';
  icon: React.ComponentType<{ className?: string }>;
  template: {
    type: 'rectangle' | 'circle' | 'text';
    width: number;
    height: number;
    fill: string;
    stroke?: string;
    strokeWidth?: number;
    text?: string;
    fontSize?: number;
  };
}

const componentTemplates: ComponentTemplate[] = [
  {
    id: 'btn-primary',
    name: 'Primary Button',
    category: 'ui',
    icon: Square,
    template: {
      type: 'rectangle',
      width: 120,
      height: 40,
      fill: '#00bcd4',
      stroke: '#0097a7',
      strokeWidth: 2,
    }
  },
  {
    id: 'btn-secondary',
    name: 'Secondary Button',
    category: 'ui',
    icon: Square,
    template: {
      type: 'rectangle',
      width: 120,
      height: 40,
      fill: 'transparent',
      stroke: '#00bcd4',
      strokeWidth: 2,
    }
  },
  {
    id: 'card-modern',
    name: 'Modern Card',
    category: 'ui',
    icon: Square,
    template: {
      type: 'rectangle',
      width: 200,
      height: 150,
      fill: '#1a1a2e',
      stroke: '#00bcd4',
      strokeWidth: 1,
    }
  },
  {
    id: 'icon-star',
    name: 'Star',
    category: 'icons',
    icon: Star,
    template: {
      type: 'circle',
      width: 60,
      height: 60,
      fill: '#ff6b6b',
      stroke: '#ff5252',
      strokeWidth: 2,
    }
  },
  {
    id: 'icon-heart',
    name: 'Heart',
    category: 'icons',
    icon: Heart,
    template: {
      type: 'circle',
      width: 50,
      height: 50,
      fill: '#e91e63',
      stroke: '#c2185b',
      strokeWidth: 2,
    }
  },
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
    id: 'text-heading',
    name: 'Heading',
    category: 'ui',
    icon: Square,
    template: {
      type: 'text',
      width: 200,
      height: 40,
      fill: '#00bcd4',
      text: 'Your Heading',
      fontSize: 24,
    }
  }
];

export function ComponentLibrary() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const { addLayer } = useDesignStore();

  const categories = [
    { id: 'all', name: 'All', count: componentTemplates.length },
    { id: 'ui', name: 'UI Elements', count: componentTemplates.filter(c => c.category === 'ui').length },
    { id: 'shapes', name: 'Shapes', count: componentTemplates.filter(c => c.category === 'shapes').length },
    { id: 'icons', name: 'Icons', count: componentTemplates.filter(c => c.category === 'icons').length },
  ];

  const filteredComponents = componentTemplates.filter(component => {
    const matchesSearch = component.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || component.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddComponent = (template: ComponentTemplate) => {
    addLayer({
      ...template.template,
      name: template.name,
      visible: true,
      locked: false,
      x: Math.random() * 200 + 100,
      y: Math.random() * 200 + 100,
    });
  };

  return (
    <div className="w-80 bg-gradient-to-b from-card via-card to-card/95 border-r border-border/50 flex flex-col backdrop-blur-lg">
      {/* Header */}
      <div className="p-5 border-b border-border/30 bg-gradient-to-r from-accent/5 to-primary/5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-lg bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">Components</h2>
          <Button size="icon" variant="ghost" className="w-8 h-8 hover:bg-primary/10 hover:text-primary rounded-xl">
            <Plus className="w-5 h-5" />
          </Button>
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
                    {/* Gradient overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-accent/0 group-hover:from-primary/5 group-hover:to-accent/5 rounded-xl transition-all duration-200" />
                    
                    <div className="relative">
                      {/* Icon */}
                      <div className="w-12 h-12 bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg flex items-center justify-center mb-3 group-hover:from-primary/20 group-hover:to-accent/20 transition-all duration-200">
                        <Icon className="w-6 h-6 text-primary group-hover:text-accent transition-colors duration-200" />
                      </div>
                      
                      {/* Name */}
                      <h3 className="text-sm font-semibold mb-1 group-hover:text-primary transition-colors duration-200">
                        {component.name}
                      </h3>
                      
                      {/* Category */}
                      <Badge variant="outline" className="text-xs h-5 px-2 border-border/50 bg-transparent">
                        {component.category}
                      </Badge>
                    </div>

                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-transparent to-accent/0 group-hover:from-primary/10 group-hover:to-accent/10 rounded-xl transition-all duration-300 opacity-0 group-hover:opacity-100" />
                    
                    {/* Plus icon on hover */}
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