# Floyd IDE

A modern IDE for Floyd CLI built with Tauri v2, React, and TypeScript.

## Features

- **Split Pane Layout**: Resizable panels for file explorer and editor
- **Monaco Editor**: Full-featured code editor with TypeScript support
- **Integrated Terminal**: xterm-based terminal for Floyd CLI
- **Floyd CLI Integration**: Execute Floyd CLI commands directly from the IDE

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run tauri dev

# Build for production
npm run tauri build
```

## Project Structure

```
floyd-ide/
├── src/                    # React frontend source
│   ├── App.tsx            # Main application component
│   ├── App.css            # Application styles
│   └── main.tsx           # React entry point
├── src-tauri/             # Tauri backend (Rust)
│   ├── src/
│   │   └── lib.rs         # Rust backend code
│   ├── Cargo.toml         # Rust dependencies
│   └── tauri.conf.json    # Tauri configuration
└── package.json           # Node.js dependencies
```

## Available Scripts

- `npm run dev` - Start Vite development server
- `npm run tauri dev` - Start Tauri development mode
- `npm run build` - Build React frontend
- `npm run tauri build` - Build complete application
- `npm run preview` - Preview production build

## Dependencies

### Frontend
- React - UI framework
- @monaco-editor/react - Code editor
- xterm - Terminal emulator
- react-resizable-panels - Split panes
- @tauri-apps/plugin-shell - Shell integration

### Backend
- Tauri - Desktop framework
- tauri-plugin-shell - Shell commands

## Usage

1. Start the app: `npm run tauri dev`
2. Use the left pane for file navigation (coming soon)
3. Use the "Code" tab for editing files
4. Use the "Floyd CLI" tab to execute Floyd CLI commands

## Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)
