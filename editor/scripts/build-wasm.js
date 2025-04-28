const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Get absolute paths
const rootDir = path.resolve(__dirname, '..');
const editorCorePath = path.join(rootDir, 'packages/editor-core');
const turboBridgePath = path.join(rootDir, 'packages/turbo-bridge');
const webPath = path.join(rootDir, 'web');
const wasmOutDir = path.join(webPath, 'public/wasm');

// check if dirs exist
console.log(`Checking if paths exist...`);
console.log(`Editor core path: ${editorCorePath} - ${fs.existsSync(editorCorePath) ? 'Exists' : 'Does not exist'}`);
console.log(`Turbo bridge path: ${turboBridgePath} - ${fs.existsSync(turboBridgePath) ? 'Exists' : 'Does not exist'}`);

// build the wasm modules
try {
  console.log('Building editor-core WASM...');
  execSync(`cd "${editorCorePath}" && cargo build --target wasm32-unknown-unknown --release`, {
    stdio: 'inherit'
  });

  console.log('Building turbo-bridge WASM...');
  execSync(`cd "${turboBridgePath}" && cargo build --target wasm32-unknown-unknown --release`, {
    stdio: 'inherit'
  });

  // create the output dir if it doesn't exist
  if (!fs.existsSync(wasmOutDir)) {
    fs.mkdirSync(wasmOutDir, { recursive: true });
  }

  // get target dir path
  const targetDir = path.join(rootDir, 'target/wasm32-unknown-unknown/release');
  
  console.log(`checking target directory: ${targetDir} - ${fs.existsSync(targetDir) ? 'Exists' : 'Does not exist'}`);
  
  if (fs.existsSync(targetDir)) {
    // list files in target dir to debug
    console.log('Files in target directory:');
    fs.readdirSync(targetDir).forEach(file => {
      console.log(`  ${file}`);
    });
    
    // copy the wasm files to the web project
    const editorCoreWasm = path.join(targetDir, 'editor_core.wasm');
    const turboBridgeWasm = path.join(targetDir, 'turbo_bridge.wasm');
    
    if (fs.existsSync(editorCoreWasm)) {
      fs.copyFileSync(editorCoreWasm, path.join(wasmOutDir, 'editor_core.wasm'));
      console.log('copied editor_core.wasm');
    } else {
      console.error('editor_core.wasm not found');
    }
    
    if (fs.existsSync(turboBridgeWasm)) {
      fs.copyFileSync(turboBridgeWasm, path.join(wasmOutDir, 'turbo_bridge.wasm'));
      console.log('Copied turbo_bridge.wasm');
    } else {
      console.error('turbo_bridge.wasm not found');
    }
  } else {
    console.error('target dir does not exist');
  }

  console.log('wasm build complete!');
} catch (error) {
  console.error('Build failed:', error.message);
  process.exit(1);
}