// /client/src/components/ConvertButton.jsx
import React, { useState } from "react";
// Optional: syntax highlighting
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

export default function ConvertButton() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [activeTab, setActiveTab] = useState("react_tailwind");
  const [error, setError] = useState(null);
  const [exportLoading, setExportLoading] = useState(false);

  const sampleDesign = {
    type: "Button",
    props: { text: "Login", variant: "primary", size: "md" },
  };

  const handleConvert = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/convert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sampleDesign),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        setResult(data.output);
      } else {
        setError(data.error || "Conversion failed");
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Error calling API");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (!result) return;
    
    setExportLoading(true);
    
    // Create a link to download the ZIP file
    const link = document.createElement('a');
    link.href = '/api/export';
    link.download = 'generated-code.zip';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setTimeout(() => {
      setExportLoading(false);
    }, 1000);
  };

  const frameworks = {
    react_tailwind: 'React + Tailwind',
    vue: 'Vue',
    svelte: 'Svelte',
    angular: 'Angular',
    flutter: 'Flutter'
  };

  if (!result) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-bold mb-6">Design to Code Converter</h2>
        <p className="mb-8 text-gray-600">
          Convert design specifications into code for multiple frameworks
        </p>
        <button
          onClick={handleConvert}
          disabled={loading}
          className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-6 rounded-md transition-colors disabled:bg-blue-300"
        >
          {loading ? 'Converting...' : 'Convert Sample Button Design'}
        </button>
        {error && (
          <p className="mt-4 text-red-500">{error}</p>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Generated Code</h2>
        <div className="flex space-x-2">
          <button
            onClick={handleConvert}
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md transition-colors disabled:bg-blue-300"
          >
            {loading ? 'Converting...' : 'Regenerate'}
          </button>
          <button
            onClick={handleExport}
            disabled={exportLoading}
            className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-md transition-colors disabled:bg-green-300"
          >
            {exportLoading ? 'Exporting...' : 'Export as ZIP'}
          </button>
        </div>
      </div>
      
      <div className="flex border-b">
        {Object.entries(frameworks).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`py-2 px-4 ${activeTab === key 
              ? 'border-b-2 border-blue-500 text-blue-500' 
              : 'text-gray-500'}`}
          >
            {label}
          </button>
        ))}
      </div>
      
      <div className="mt-4 bg-gray-100 rounded-md overflow-hidden">
        <SyntaxHighlighter 
          language={
            activeTab === 'react_tailwind' ? 'jsx' : 
            activeTab === 'vue' ? 'html' : 
            activeTab === 'svelte' ? 'html' : 
            activeTab === 'angular' ? 'typescript' : 
            'dart'
          } 
          style={oneDark}
          customStyle={{ padding: '1rem', borderRadius: '0.375rem' }}
        >
          {result[activeTab] || 'No code generated for this framework'}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}
