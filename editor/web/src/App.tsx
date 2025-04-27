import { useEffect, useState } from 'react'
import './App.css'

interface Editor {
  get_text_nodes: () => string;
  add_text_node: (content: string, x: number, y: number) => void;
  generate_turbo_code: () => string;
}

interface TextNode {
  content: string;
  x: number;
  y: number;
  color: string;
  font_size: number;
}

function App() {
  const [editor, setEditor] = useState<Editor | null>(null);
  const [textNodes, setTextNodes] = useState<TextNode[]>([]);
  const [generatedCode, setGeneratedCode] = useState('');
  const [newText, setNewText] = useState('');

  useEffect(() => {
    async function initEditor() {
      try {
        // This would be replaced with actual WASM import in a real app
        // const { Editor } = await import('../../editor-core/pkg');
        // const editor = new Editor();
        
        // For now, we'll mock it
        const editor = {
          get_text_nodes: () => JSON.stringify([
            { content: "Hello Turbo!", x: 100, y: 100, color: "#FFFFFF", font_size: 24 }
          ]),
          add_text_node: (content: string, x: number, y: number) => {
            console.log(`Adding text node: ${content} at (${x}, ${y})`);
          },
          generate_turbo_code: () => `turbo::go! {
    text!("Hello Turbo!", x = 100, y = 100, color = 0xFFFFFFFF);
}`
        };
        
        setEditor(editor);
        setTextNodes(JSON.parse(editor.get_text_nodes()));
        setGeneratedCode(editor.generate_turbo_code());
      } catch (error) {
        console.error('Failed to initialize editor:', error);
      }
    }
    
    initEditor();
  }, []);

  const handleAddText = () => {
    if (!editor || !newText) return;
    
    const x = Math.floor(Math.random() * 300) + 50;
    const y = Math.floor(Math.random() * 200) + 50;
    
    editor.add_text_node(newText, x, y);
    setTextNodes(JSON.parse(editor.get_text_nodes()));
    setGeneratedCode(editor.generate_turbo_code());
    setNewText('');
  };

  return (
    <div className="app">
      <header>
        <h1>Turbo Editor PoC</h1>
      </header>
      
      <div className="editor-layout">
        <div className="canvas">
          <h2>Canvas Preview</h2>
          <div className="canvas-container" style={{ position: 'relative', width: '100%', height: '400px', backgroundColor: '#222', border: '1px solid #444' }}>
            {textNodes.map((node, index) => (
              <div 
                key={index}
                style={{
                  position: 'absolute',
                  left: `${node.x}px`,
                  top: `${node.y}px`,
                  color: node.color,
                  fontSize: `${node.font_size}px`,
                }}
              >
                {node.content}
              </div>
            ))}
          </div>
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