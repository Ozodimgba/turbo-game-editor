export interface TextNode {
    content: string;
    x: number;
    y: number;
    color: string;
    font_size: number;
  }
  
  export interface Editor {
    get_text_nodes: () => string;
    add_text_node: (content: string, x: number, y: number) => void;
    generate_turbo_code: () => string;
  }
  
  export interface TurboRenderer {
    clear: () => void;
    render_text: (content: string, x: number, y: number, color: number) => void;
    render_rect: (x: number, y: number, w: number, h: number, color: number) => void;
  }
  
  export interface WasmModule {
    Editor: new () => Editor;
    TurboRenderer: new (canvasId: string) => TurboRenderer;
  }