// /client/src/components/AISupport.jsx
import React, { useState } from 'react';

const AISupport = () => {
  const [question, setQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);

  const handleSend = async () => {
    if (!question.trim()) return;
    
    const userMessage = question;
    setQuestion('');
    setChatHistory(prev => [...prev, { type: 'user', text: userMessage }]);
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/support', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: userMessage }),
      });
      
      const data = await response.json();
      if (data.success && data.response) {
        setChatHistory(prev => [...prev, { type: 'ai', text: data.response }]);
      } else {
        console.error('Error:', data.error);
        setChatHistory(prev => [...prev, { 
          type: 'ai', 
          text: 'Sorry, I encountered an error: ' + (data.error || 'Unknown error') 
        }]);
      }
    } catch (error) {
      console.error('Error:', error);
      setChatHistory(prev => [...prev, { 
        type: 'ai', 
        text: 'Sorry, I encountered an error: ' + error.message 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <h2 className="text-2xl font-bold mb-4">AI Support</h2>
      
      <div className="bg-gray-100 rounded-lg p-4 flex-grow overflow-y-auto mb-4">
        {chatHistory.length === 0 ? (
          <div className="text-gray-500 text-center mt-32">
            Ask me anything about design or code!
          </div>
        ) : (
          chatHistory.map((message, index) => (
            <div 
              key={index} 
              className={`mb-4 ${message.type === 'user' ? 'text-right' : ''}`}
            >
              <div 
                className={`inline-block p-3 rounded-lg max-w-xs md:max-w-md ${
                  message.type === 'user' 
                    ? 'bg-blue-500 text-white rounded-br-none' 
                    : 'bg-white text-gray-800 rounded-bl-none shadow'
                }`}
              >
                {message.text}
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="text-left mb-4">
            <div className="inline-block bg-white text-gray-800 p-3 rounded-lg rounded-bl-none shadow">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="flex mt-auto">
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask a question about design or code..."
          className="flex-1 border border-gray-300 rounded-l-md p-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
          rows="2"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
        />
        <button
          onClick={handleSend}
          disabled={isLoading || !question.trim()}
          className="bg-purple-500 hover:bg-purple-600 text-white px-4 rounded-r-md transition-colors disabled:bg-purple-300"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default AISupport;
