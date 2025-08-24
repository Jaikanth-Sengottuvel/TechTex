import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Textarea } from '../../ui/textarea';
import { useDesignStore } from '../../../store/useDesignStore';
import { MessageCircle, Send, Sparkles, X } from 'lucide-react';

interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  text: string;
}

const AIAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [question, setQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const { elements, selectedElement } = useDesignStore();

  const handleSend = async () => {
    if (!question.trim()) return;
    
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      text: question
    };
    
    setQuestion('');
    setChatHistory(prev => [...prev, userMessage]);
    setIsLoading(true);
    
    try {
      const designContext = {
        elements: elements,
        selectedElement: selectedElement,
        elementCount: elements.length
      };

      const response = await fetch('http://localhost:5000/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: question, designContext })
      });
      
      const data = await response.json();
      if (data.success && data.response) {
        const aiMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          type: 'ai',
          text: data.response
        };
        setChatHistory(prev => [...prev, aiMessage]);
      } else {
        setChatHistory(prev => [...prev, { 
          id: (Date.now() + 1).toString(),
          type: 'ai', 
          text: 'Error: ' + (data.error || 'Unknown error') 
        }]);
      }
    } catch (error) {
      setChatHistory(prev => [...prev, { 
        id: (Date.now() + 1).toString(),
        type: 'ai', 
        text: 'Error: ' + (error instanceof Error ? error.message : 'Unknown error') 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg bg-gradient-to-r from-purple-500 to-blue-500"
        size="icon"
      >
        <Sparkles className="w-6 h-6" />
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-6 right-6 w-96 h-[500px] shadow-2xl">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-purple-500" />
            AI Assistant
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(false)}
            className="h-8 w-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="flex flex-col h-full pb-4">
        <div className="flex-1 overflow-y-auto mb-4 space-y-3 max-h-[300px]">
          {chatHistory.length === 0 ? (
            <div className="text-center text-gray-500 mt-8">
              <p className="text-sm">Ask me about design or code!</p>
            </div>
          ) : (
            chatHistory.map((message) => (
              <div 
                key={message.id} 
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[80%] p-3 rounded-lg text-sm ${
                    message.type === 'user' 
                      ? 'bg-purple-500 text-white rounded-br-none' 
                      : 'bg-gray-100 text-gray-800 rounded-bl-none'
                  }`}
                >
                  {message.text}
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 p-3 rounded-lg rounded-bl-none">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex gap-2">
          <Textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
            placeholder="Ask about design or code..."
            className="flex-1 resize-none text-sm"
            rows={2}
          />
          <Button
            onClick={handleSend}
            disabled={isLoading || !question.trim()}
            size="sm"
            className="h-8 px-3 bg-purple-500 hover:bg-purple-600"
          >
            <Send className="w-3 h-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AIAssistant;
