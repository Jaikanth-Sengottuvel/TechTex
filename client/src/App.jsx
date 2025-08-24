// /client/src/App.jsx
import React, { useState } from "react";
import ConvertButton from "./components/ConvertButton";
import AISupport from "./components/AISupport";

function App() {
  const [activeComponent, setActiveComponent] = useState(null);

  const handleButtonClick = (component) => {
    setActiveComponent(component === activeComponent ? null : component);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-10 text-center">TechTex AI Tools</h1>
      
      {/* Main content area */}
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6 mb-10">
        {activeComponent === 'convert' && <ConvertButton />}
        {activeComponent === 'support' && <AISupport />}
        {!activeComponent && (
          <div className="text-center text-gray-500 py-20">
            Select a tool from the buttons below
          </div>
        )}
      </div>
      
      {/* Circular buttons at the bottom */}
      <div className="fixed bottom-10 left-0 right-0 flex justify-center space-x-8">
        <button
          onClick={() => handleButtonClick('convert')}
          className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-all ${
            activeComponent === 'convert' 
              ? 'bg-blue-600 text-white scale-110' 
              : 'bg-white text-blue-600 hover:bg-blue-50'
          }`}
          title="Design to Code Converter"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
        </button>
        
        <button
          onClick={() => handleButtonClick('support')}
          className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-all ${
            activeComponent === 'support' 
              ? 'bg-purple-600 text-white scale-110' 
              : 'bg-white text-purple-600 hover:bg-purple-50'
          }`}
          title="AI Support"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default App;

