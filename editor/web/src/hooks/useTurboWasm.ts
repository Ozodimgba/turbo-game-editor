// editor/web/src/hooks/useTurboWasm.ts
import { useEffect, useState } from 'react';
import { WasmModule } from '../types/wasm';

export function useTurboWasm() {
  const [wasmModule, setWasmModule] = useState<WasmModule | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function loadWasm() {
      try {
        // for now we're mocking the actual wasm modules
        const mockModule: WasmModule = {
          Editor: class Editor {
            constructor() {
              console.log('Editor initialized');
            }
            
            get_text_nodes() {
              return JSON.stringify([
                { content: "Hello Turbo!", x: 100, y: 100, color: "#FFFFFF", font_size: 24 }
              ]);
            }
            
            add_text_node(content: string, x: number, y: number) {
              console.log(`Adding text node: ${content} at (${x}, ${y})`);
            }
            
            generate_turbo_code() {
              return `turbo::go! {
    text!("Hello Turbo!", x = 100, y = 100, color = 0xFFFFFFFF);
}`;
            }
          },
          
          TurboRenderer: class TurboRenderer {
            constructor(canvasId: string) {
              console.log(`TurboRenderer initialized with canvas: ${canvasId}`);
              const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
              if (!canvas) {
                throw new Error('Canvas not found');
              }
              
              this.ctx = canvas.getContext('2d')!;
            }
            
            ctx: CanvasRenderingContext2D;
            
            clear() {
              const canvas = this.ctx.canvas;
              this.ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
            
            render_text(content: string, x: number, y: number, color: number) {
              const cssColor = `#${(color & 0xFFFFFF).toString(16).padStart(6, '0')}`;
              this.ctx.fillStyle = cssColor;
              this.ctx.font = '16px sans-serif';
              this.ctx.fillText(content, x, y);
            }
            
            render_rect(x: number, y: number, w: number, h: number, color: number) {
              const cssColor = `#${(color & 0xFFFFFF).toString(16).padStart(6, '0')}`;
              this.ctx.fillStyle = cssColor;
              this.ctx.fillRect(x, y, w, h);
            }
          }
        };
        
        setWasmModule(mockModule);
        setLoading(false);
      } catch (e) {
        setError(e instanceof Error ? e : new Error('Failed to load WASM'));
        setLoading(false);
      }
    }
    
    loadWasm();
  }, []);
  
  return { wasmModule, loading, error };
}