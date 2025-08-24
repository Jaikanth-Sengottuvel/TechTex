import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { useDesignStore } from '../../../store/useDesignStore';
import { Code, Download, FileCode, Copy, Check } from 'lucide-react';

const D2CTool: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('react_tailwind');
  const [copied, setCopied] = useState<string | null>(null);
  const { elements } = useDesignStore();

  const frameworks = {
    react_tailwind: { name: 'React + Tailwind', ext: 'jsx', lang: 'jsx' },
    vue: { name: 'Vue 3', ext: 'vue', lang: 'html' },
    svelte: { name: 'Svelte', ext: 'svelte', lang: 'html' },
    angular: { name: 'Angular', ext: 'ts', lang: 'typescript' },
    flutter: { name: 'Flutter', ext: 'dart', lang: 'dart' }
  };

  const convertDesignToCode = async () => {
    if (elements.length === 0) {
      alert('No elements on canvas to convert!');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/convert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(elements)
      });

      const data = await response.json();
      if (data.success) {
        setGeneratedCode(data.output);
      } else {
        alert('Conversion failed: ' + data.error);
      }
    } catch (error) {
      alert('Error: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text: string, framework: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(framework);
      setTimeout(() => setCopied(null), 2000);
    } catch (error) {
      alert('Failed to copy to clipboard');
    }
  };

  const downloadCode = (code: string, framework: string) => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `component.${frameworks[framework as keyof typeof frameworks].ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportAllAsZip = () => {
    if (!generatedCode) return;
    
    const link = document.createElement('a');
    link.href = 'http://localhost:5000/api/export';
    link.download = 'tachtex-generated-code.zip';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-24 w-14 h-14 rounded-full shadow-lg bg-gradient-to-r from-green-500 to-blue-500"
        size="icon"
      >
        <FileCode className="w-6 h-6" />
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-6 right-6 w-[600px] h-[600px] shadow-2xl">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Code className="w-5 h-5 text-green-500" />
            Design to Code
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              onClick={convertDesignToCode}
              disabled={isLoading || elements.length === 0}
              size="sm"
              className="bg-green-500 hover:bg-green-600"
            >
              {isLoading ? 'Converting...' : 'Convert'}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="h-8 w-8 p-0"
            >
              ×
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex flex-col h-full pb-4">
        {!generatedCode ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-500">
            <FileCode className="w-16 h-16 mb-4 text-gray-300" />
            <h3 className="text-lg font-medium mb-2">Convert Your Design</h3>
            <p className="text-sm mb-4 max-w-xs">
              Transform your canvas elements into production-ready code for multiple frameworks
            </p>
            <div className="text-xs space-y-1">
              <p>• {elements.length} elements on canvas</p>
              <p>• Supports React, Vue, Svelte, Angular, Flutter</p>
              <p>• Export as individual files or ZIP</p>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium">Generated Code</h3>
              <Button
                onClick={exportAllAsZip}
                size="sm"
                className="bg-blue-500 hover:bg-blue-600"
              >
                <Download className="w-4 h-4 mr-2" />
                Export All
              </Button>
            </div>
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 mt-4">
              <TabsList className="grid w-full grid-cols-5">
                {Object.entries(frameworks).map(([key, framework]) => (
                  <TabsTrigger key={key} value={key} className="text-xs">
                    {framework.name}
                  </TabsTrigger>
                ))}
              </TabsList>
              
              {Object.entries(frameworks).map(([key, framework]) => (
                <TabsContent key={key} value={key} className="flex-1 mt-4">
                  <div className="relative">
                    <div className="absolute top-2 right-2 flex gap-2">
                      <Button
                        onClick={() => copyToClipboard(generatedCode[key] || '', key)}
                        size="sm"
                        variant="outline"
                        className="h-7 px-2"
                      >
                        {copied === key ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      </Button>
                      <Button
                        onClick={() => downloadCode(generatedCode[key] || '', key)}
                        size="sm"
                        variant="outline"
                        className="h-7 px-2"
                      >
                        <Download className="w-3 h-3" />
                      </Button>
                    </div>
                    <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-xs overflow-auto max-h-[400px] font-mono">
                      <code>{generatedCode[key] || 'No code generated for this framework'}</code>
                    </pre>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default D2CTool;
