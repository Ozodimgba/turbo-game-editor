use crate::scene::{Scene, NodeType, PropertyValue};

pub fn generate_turbo_code(scene: &Scene) -> String {
    let mut code = String::from("turbo::go! {\n");
    
    // Process the scene starting from the root
    process_node(scene, &scene.root_id, 1, &mut code);
    
    code.push_str("}\n");
    code
}

fn process_node(scene: &Scene, node_id: &str, indent: usize, code: &mut String) {
    let indent_str = "    ".repeat(indent);
    
    if let Some(node) = scene.nodes.get(node_id) {
        match node.node_type {
            NodeType::Container => {
                // Just process children for containers
                for child_id in &node.children {
                    process_node(scene, child_id, indent, code);
                }
            },
            NodeType::Sprite => {
                let x = get_number_property(node, "x", 0.0);
                let y = get_number_property(node, "y", 0.0);
                let width = get_number_property(node, "width", 100.0);
                let height = get_number_property(node, "height", 100.0);
                let path = get_string_property(node, "path", "default");
                
                code.push_str(&format!(
                    "{}sprite!(\"{}\", x = {}, y = {}, w = {}, h = {});\n",
                    indent_str, path, x, y, width, height
                ));
            },
            NodeType::Rectangle => {
                let x = get_number_property(node, "x", 0.0);
                let y = get_number_property(node, "y", 0.0);
                let width = get_number_property(node, "width", 100.0);
                let height = get_number_property(node, "height", 100.0);
                let color = get_color_property(node, "color", 0xFFFFFFFF);
                let border_radius = get_number_property(node, "border_radius", 0.0);
                
                code.push_str(&format!(
                    "{}rect!(x = {}, y = {}, w = {}, h = {}, color = 0x{:08X}, border_radius = {});\n",
                    indent_str, x, y, width, height, color, border_radius
                ));
            },
            // Add other node types
            _ => {
                // Placeholder for unimplemented node types
                code.push_str(&format!("{}// Unimplemented node type: {:?}\n", indent_str, node.node_type));
            }
        }
        
        // Process children for non-container nodes too
        if node.node_type != NodeType::Container {
            for child_id in &node.children {
                process_node(scene, child_id, indent + 1, code);
            }
        }
    }
}

// Helper functions to extract property values
fn get_number_property(node: &crate::scene::EditorNode, key: &str, default: f64) -> f64 {
    match node.properties.get(key) {
        Some(PropertyValue::Number(val)) => *val,
        _ => default,
    }
}

fn get_string_property(node: &crate::scene::EditorNode, key: &str, default: &str) -> String {
    match node.properties.get(key) {
        Some(PropertyValue::String(val)) => val.clone(),
        _ => default.to_string(),
    }
}

fn get_color_property(node: &crate::scene::EditorNode, key: &str, default: u32) -> u32 {
    match node.properties.get(key) {
        Some(PropertyValue::Color(val)) => *val,
        _ => default,
    }
}