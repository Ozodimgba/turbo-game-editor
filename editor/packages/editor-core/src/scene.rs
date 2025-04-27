use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use wasm_bindgen::prelude::*;
use uuid::Uuid;

// Node type representing different Turbo primitives
#[wasm_bindgen]
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum NodeType {
    Container,
    Sprite,
    Rectangle,
    Circle,
    Path,
    Text,
}

// Property value that can be serialized/deserialized
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum PropertyValue {
    String(String),
    Number(f64),
    Boolean(bool),
    Color(u32),
}

// A node in our editor scene graph
#[wasm_bindgen]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EditorNode {
    pub id: String,
    pub name: String,
    pub node_type: NodeType,
    pub parent_id: Option<String>,
    pub children: Vec<String>,
    // Node properties (position, size, color, etc.)
    #[wasm_bindgen(skip)]
    pub properties: HashMap<String, PropertyValue>,
}

#[wasm_bindgen]
impl EditorNode {
    #[wasm_bindgen(constructor)]
    pub fn new(name: &str, node_type: NodeType) -> Self {
        let mut properties = HashMap::new();
        
        // Set default properties based on node type
        match node_type {
            NodeType::Container => {
                properties.insert("x".to_string(), PropertyValue::Number(0.0));
                properties.insert("y".to_string(), PropertyValue::Number(0.0));
                properties.insert("width".to_string(), PropertyValue::Number(100.0));
                properties.insert("height".to_string(), PropertyValue::Number(100.0));
            },
            NodeType::Sprite => {
                properties.insert("x".to_string(), PropertyValue::Number(0.0));
                properties.insert("y".to_string(), PropertyValue::Number(0.0));
                properties.insert("width".to_string(), PropertyValue::Number(100.0));
                properties.insert("height".to_string(), PropertyValue::Number(100.0));
                properties.insert("path".to_string(), PropertyValue::String("default".to_string()));
            },
            NodeType::Rectangle => {
                properties.insert("x".to_string(), PropertyValue::Number(0.0));
                properties.insert("y".to_string(), PropertyValue::Number(0.0));
                properties.insert("width".to_string(), PropertyValue::Number(100.0));
                properties.insert("height".to_string(), PropertyValue::Number(100.0));
                properties.insert("color".to_string(), PropertyValue::Color(0xFFFFFFFF));
                properties.insert("border_radius".to_string(), PropertyValue::Number(0.0));
            },
            // Add other node types with their default properties
            _ => {
                properties.insert("x".to_string(), PropertyValue::Number(0.0));
                properties.insert("y".to_string(), PropertyValue::Number(0.0));
            }
        }
        
        Self {
            id: Uuid::new_v4().to_string(),
            name: name.to_string(),
            node_type,
            parent_id: None,
            children: Vec::new(),
            properties,
        }
    }
    
    // Get property as a JS value
    pub fn get_property_js(&self, key: &str) -> JsValue {
        match self.properties.get(key) {
            Some(value) => serde_wasm_bindgen::to_value(value).unwrap_or(JsValue::NULL),
            None => JsValue::NULL,
        }
    }
    
    // Set property from JS
    pub fn set_property(&mut self, key: &str, value: JsValue) -> bool {
        match serde_wasm_bindgen::from_value(value) {
            Ok(prop_value) => {
                self.properties.insert(key.to_string(), prop_value);
                true
            },
            Err(_) => false,
        }
    }
}

// Scene representing the entire project
#[wasm_bindgen]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Scene {
    pub name: String,
    pub root_id: String,
    #[wasm_bindgen(skip)]
    pub nodes: HashMap<String, EditorNode>,
}

#[wasm_bindgen]
impl Scene {
    #[wasm_bindgen(constructor)]
    pub fn new(name: &str) -> Self {
        let mut root_node = EditorNode::new("Root", NodeType::Container);
        let root_id = root_node.id.clone();
        
        let mut nodes = HashMap::new();
        nodes.insert(root_id.clone(), root_node);
        
        Self {
            name: name.to_string(),
            root_id,
            nodes,
        }
    }
    
    pub fn add_node(&mut self, parent_id: &str, name: &str, node_type: NodeType) -> Option<String> {
        if !self.nodes.contains_key(parent_id) {
            return None;
        }
        
        let mut node = EditorNode::new(name, node_type);
        node.parent_id = Some(parent_id.to_string());
        let node_id = node.id.clone();
        
        // Add to parent's children
        if let Some(parent) = self.nodes.get_mut(parent_id) {
            parent.children.push(node_id.clone());
        }
        
        self.nodes.insert(node_id.clone(), node);
        Some(node_id)
    }
    
    pub fn remove_node(&mut self, node_id: &str) -> bool {
        if node_id == self.root_id {
            return false; // Can't remove root
        }
        
        if let Some(node) = self.nodes.get(node_id) {
            // Remove from parent's children
            if let Some(parent_id) = &node.parent_id {
                if let Some(parent) = self.nodes.get_mut(parent_id) {
                    parent.children.retain(|id| id != node_id);
                }
            }
            
            // Get children to remove recursively
            let children = node.children.clone();
            for child_id in children {
                self.remove_node(&child_id);
            }
            
            // Remove the node itself
            self.nodes.remove(node_id);
            return true;
        }
        
        false
    }
    
    pub fn get_node_js(&self, node_id: &str) -> JsValue {
        match self.nodes.get(node_id) {
            Some(node) => serde_wasm_bindgen::to_value(node).unwrap_or(JsValue::NULL),
            None => JsValue::NULL,
        }
    }
    
    pub fn get_all_nodes_js(&self) -> JsValue {
        serde_wasm_bindgen::to_value(&self.nodes).unwrap_or(JsValue::NULL)
    }
}