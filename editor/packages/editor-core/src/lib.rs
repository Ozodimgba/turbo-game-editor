use wasm_bindgen::prelude::*;
use serde::{Serialize, Deserialize};

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);
}

#[derive(Serialize, Deserialize)]
pub struct TextNode {
    content: String,
    x: i32,
    y: i32,
    color: String,
    font_size: i32,
}

#[wasm_bindgen]
pub struct Editor {
    text_nodes: Vec<TextNode>,
}

#[wasm_bindgen]
impl Editor {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Self {
        log("Turbo Editor initialized");
        Self {
            text_nodes: vec![
                TextNode {
                    content: "Hello Turbo!".to_string(),
                    x: 100,
                    y: 100,
                    color: "#FFFFFF".to_string(),
                    font_size: 24,
                }
            ],
        }
    }

    pub fn get_text_nodes(&self) -> JsValue {
        serde_wasm_bindgen::to_value(&self.text_nodes).unwrap()
    }

    pub fn add_text_node(&mut self, content: &str, x: i32, y: i32) {
        self.text_nodes.push(TextNode {
            content: content.to_string(),
            x,
            y,
            color: "#FFFFFF".to_string(),
            font_size: 16,
        });
        log(&format!("Added text node: {}", content));
    }

    pub fn generate_turbo_code(&self) -> String {
        let mut code = String::from("turbo::go! {\n");
        
        for node in &self.text_nodes {
            code.push_str(&format!(
                "    text!(\"{}\", x = {}, y = {}, color = 0xFFFFFFFF);\n",
                node.content, node.x, node.y
            ));
        }
        
        code.push_str("}\n");
        code
    }
}