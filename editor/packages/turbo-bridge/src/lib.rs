use turbo::prelude::*;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct TurboRenderer {
    canvas_id: String,
    ctx: web_sys::CanvasRenderingContext2d,
}

#[wasm_bindgen]
impl TurboRenderer {
    #[wasm_bindgen(constructor)]
    pub fn new(canvas_id: &str) -> Result<TurboRenderer, JsValue> {
        let window = web_sys::window().unwrap();
        let document = window.document().unwrap();
        let canvas = document.get_element_by_id(canvas_id)
            .ok_or_else(|| JsValue::from_str("Canvas not found"))?;
        let canvas = canvas.dyn_into::<web_sys::HtmlCanvasElement>()?;
        
        let ctx = canvas
            .get_context("2d")?
            .unwrap()
            .dyn_into::<web_sys::CanvasRenderingContext2d>()?;
            
        Ok(TurboRenderer {
            canvas_id: canvas_id.to_string(),
            ctx,
        })
    }
    
    // Render Turbo text
    pub fn render_text(&self, content: &str, x: i32, y: i32, color: u32) {
        // Convert color to CSS format
        let css_color = format!("#{:06x}", color & 0xFFFFFF);
        
        self.ctx.set_fill_style(&JsValue::from_str(&css_color));
        self.ctx.set_font("16px sans-serif");
        let _ = self.ctx.fill_text(content, x as f64, y as f64);
    }
    
    // Render Turbo rectangle
    pub fn render_rect(&self, x: i32, y: i32, w: u32, h: u32, color: u32) {
        let css_color = format!("#{:06x}", color & 0xFFFFFF);
        
        self.ctx.set_fill_style(&JsValue::from_str(&css_color));
        self.ctx.fill_rect(x as f64, y as f64, w as f64, h as f64);
    }
    
    // Clear the canvas
    pub fn clear(&self) {
        let window = web_sys::window().unwrap();
        let document = window.document().unwrap();
        let canvas = document.get_element_by_id(&self.canvas_id).unwrap();
        let canvas = canvas.dyn_into::<web_sys::HtmlCanvasElement>().unwrap();
        
        self.ctx.clear_rect(0.0, 0.0, canvas.width() as f64, canvas.height() as f64);
    }
}