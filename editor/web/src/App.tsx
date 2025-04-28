import { useEffect, useState, useRef } from 'react'
import './App.css'
import { useTurboWasm } from './hooks/useTurboWasm';
import { Editor, TextNode, TurboRenderer } from './types/wasm';

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { wasmModule, loading, error } = useTurboWasm();
  const [editor, setEditor] = useState<Editor | null>(null);
  const [renderer, setRenderer] = useState<TurboRenderer | null>(null);
  const [textNodes, setTextNodes] = useState<TextNode[]>([]);
  const [generatedCode, setGeneratedCode] = useState('');
  const [newText, setNewText] = useState('');

  // Initialize editor and renderer once WASM is loaded
  useEffect(() => {
    if (loading || error || !wasmModule) return;
    
    try {
      const editorInstance = new wasmModule.Editor();
      setEditor(editorInstance);
      
      if (canvasRef.current) {
        const rendererInstance = new wasmModule.TurboRenderer(canvasRef.current.id);
        setRenderer(rendererInstance);
      }
      
      // Initial data loading
      setTextNodes(JSON.parse(editorInstance.get_text_nodes()));
      setGeneratedCode(editorInstance.generate_turbo_code());
    } catch (e) {
      console.error('Error initializing editor:', e);
    }
  }, [wasmModule, loading, error]);

  // Render the canvas preview whenever textNodes change
  useEffect(() => {
    if (!renderer || !textNodes.length) return;
    
    renderer.clear();
    
    textNodes.forEach(node => {
      // Convert CSS color to number
      const colorStr = node.color.replace('#', '');
      const color = parseInt(colorStr, 16);
      
      renderer.render_text(node.content, node.x, node.y, color);
    });
  }, [renderer, textNodes]);

  const handleAddText = () => {
    if (!editor || !renderer || !newText) return;
    
    const x = Math.floor(Math.random() * 300) + 50;
    const y = Math.floor(Math.random() * 200) + 50;
    
    editor.add_text_node(newText, x, y);
    setTextNodes(JSON.parse(editor.get_text_nodes()));
    setGeneratedCode(editor.generate_turbo_code());
    setNewText('');
  };

  if (loading) {
    return <div>Loading Turbo Editor...</div>;
  }

  if (error) {
    return <div>Error loading Turbo Editor: {error.message}</div>;
  }

  return (
    <div className="app">
      <header>
        <h1>Turbo Editor</h1>
      </header>
      
      <div className="editor-layout">
        <div className="canvas">
          <h2>Canvas Preview</h2>
          <canvas 
            id="editor-canvas"
            ref={canvasRef}
            width={800}
            height={400}
            style={{ backgroundColor: '#222', border: '1px solid #444' }}
          />
        </div>
        
        <div className="sidebar">
          <div className="controls">
            <h2>Add Text</h2>
            <input 
              type="text" 
              value={newText} 
              onChange={(e) => setNewText(e.target.value)}
              placeholder="Enter text content"
            />
            <button onClick={handleAddText}>Add Text</button>
          </div>
          
          <div className="code-preview">
            <h2>Generated Turbo Code</h2>
            <pre>{generatedCode}</pre>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App