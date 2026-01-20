# Floyd IDE

A modern IDE for Floyd CLI built with Tauri v2, React, and TypeScript.

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
├── package.json           # Node.js dependencies
├── tsconfig.json          # TypeScript configuration
└── vite.config.ts         # Vite build configuration

```

## Features

- **Split Pane Layout**: Resizable panels for file explorer and editor
- **Monaco Editor**: Full-featured code editor with TypeScript support
- **Integrated Terminal**: xterm-based terminal for Floyd CLI
- **Floyd CLI Integration**: Execute Floyd CLI commands directly from the IDE

## Available Scripts

### Development
```bash
npm run dev          # Start Vite development server (http://localhost:1420)
npm run tauri dev    # Start Tauri development mode (full app)
```

### Build
```bash
npm run build        # Build React frontend for production
npm run tauri build  # Build complete Tauri application
```

### Preview
```bash
npm run preview      # Preview production build
```

## Dependencies

### Frontend
- `react` - UI framework
- `@monaco-editor/react` - Code editor component
- `xterm` & `xterm-addon-fit` - Terminal emulator
- `react-resizable-panels` - Resizable split panes
- `@tauri-apps/api` - Tauri API
- `@tauri-apps/plugin-shell` - Shell integration for CLI commands

### Backend (Rust)
- `tauri` - Desktop framework
- `tauri-plugin-shell` - Shell command execution
- `serde` & `serde_json` - Serialization

## Usage

1. **Start Development Server**:
   ```bash
   npm run tauri dev
   ```

2. **Using the IDE**:
   - Left pane: File Explorer (placeholder for now)
   - Right pane: Tab system with Code and Floyd CLI
   - Switch between Code and Floyd CLI tabs
   - In the Floyd CLI tab, type commands and press Enter to execute

3. **Floyd CLI Integration**:
   - The terminal integrates with the `floyd-cli` command
   - Commands are executed through Tauri's shell plugin
   - Output is displayed directly in the integrated terminal

## Configuration

### App Settings
- Window size: 1200x800 (minimum 800x600)
- App name: Floyd IDE
- Identifier: com.floyd.ide

### Customization
Edit `src-tauri/tauri.conf.json` to modify:
- Window dimensions
- App metadata
- Security settings
- Build targets

## Development Notes

- The app uses Vite for fast hot-reloading during development
- Tauri v2 provides the desktop application shell
- Monaco Editor provides VS Code-like editing experience
- xterm provides a full-featured terminal emulator
