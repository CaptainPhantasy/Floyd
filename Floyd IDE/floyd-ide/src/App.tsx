import { useState, useEffect, useRef } from "react";
import Editor from "@monaco-editor/react";
import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import {
  Panel,
  PanelGroup,
  PanelResizeHandle,
} from "react-resizable-panels";
import "xterm/css/xterm.css";
import "./App.css";

function App() {
  const [activeTab, setActiveTab] = useState<"code" | "cli">("code");
  const terminalRef = useRef<Terminal | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const [terminalContainer, setTerminalContainer] =
    useState<HTMLDivElement | null>(null);

  // Initialize xterm when the terminal container is ready
  useEffect(() => {
    if (terminalContainer && !terminalRef.current) {
      const terminal = new Terminal({
        cursorBlink: true,
        fontSize: 14,
        fontFamily: 'Menlo, Monaco, "Courier New", monospace',
        theme: {
          background: "#1e1e1e",
          foreground: "#d4d4d4",
        },
      });

      const fitAddon = new FitAddon();
      terminal.loadAddon(fitAddon);
      terminal.open(terminalContainer);
      fitAddon.fit();

      // Welcome message
      terminal.writeln("\x1b[1;36mFloyd CLI Terminal\x1b[0m");
      terminal.writeln("Type your commands below. Press Enter to execute.");
      terminal.writeln("To run Floyd CLI commands, use the \x1b[1;33mfloyd-cli\x1b[0m command.");
      terminal.writeln("");
      terminal.write("\x1b[1;32mfloyd@floyd-ide:~$\x1b[0m ");

      terminalRef.current = terminal;
      fitAddonRef.current = fitAddon;

      // Handle user input
      let currentLine = "";
      terminal.onData((data) => {
        if (data === "\r") {
          // Enter key - execute command
          terminal.writeln("");

          if (currentLine.trim()) {
            // Execute the command through Tauri's shell
            if (window.__TAURI__) {
              import("@tauri-apps/plugin-shell")
                .then((shell) => {
                  return shell.Command.create("floyd-cli", currentLine.split(" "))
                    .execute()
                    .then((result) => {
                      if (result.stdout) {
                        terminal.writeln(result.stdout);
                      }
                      if (result.stderr) {
                        terminal.writeln(`\x1b[1;31m${result.stderr}\x1b[0m`);
                      }
                    })
                    .catch((error) => {
                      terminal.writeln(`\x1b[1;31mError: ${error}\x1b[0m`);
                    })
                    .finally(() => {
                      terminal.write("\x1b[1;32mfloyd@floyd-ide:~$\x1b[0m ");
                      currentLine = "";
                    });
                })
                .catch(() => {
                  terminal.writeln(
                    "\x1b[1;31mShell plugin not available. Running in web mode.\x1b[0m"
                  );
                  terminal.writeln(`Command: ${currentLine}`);
                  terminal.write("\x1b[1;32mfloyd@floyd-ide:~$\x1b[0m ");
                  currentLine = "";
                });
            } else {
              // Web mode - just echo the command
              terminal.writeln(`Would execute: floyd-cli ${currentLine}`);
              terminal.write("\x1b[1;32mfloyd@floyd-ide:~$\x1b[0m ");
              currentLine = "";
            }
          } else {
            terminal.write("\x1b[1;32mfloyd@floyd-ide:~$\x1b[0m ");
          }
        } else if (data === "\u007F") {
          // Backspace
          if (currentLine.length > 0) {
            currentLine = currentLine.slice(0, -1);
            terminal.write("\b \b");
          }
        } else if (data >= String.fromCharCode(0x20) && data <= String.fromCharCode(0x7e)) {
          // Printable characters
          currentLine += data;
          terminal.write(data);
        }
      });

      // Handle window resize
      const handleResize = () => {
        if (fitAddonRef.current) {
          fitAddonRef.current.fit();
        }
      };

      window.addEventListener("resize", handleResize);

      return () => {
        window.removeEventListener("resize", handleResize);
        terminal.dispose();
      };
    }
  }, [terminalContainer]);

  return (
    <div className="app-container">
      <PanelGroup direction="horizontal" className="panel-group">
        {/* Left Pane - File Explorer */}
        <Panel defaultSize={20} minSize={15} maxSize={40} className="panel">
          <div className="file-explorer">
            <div className="pane-header">File Explorer</div>
            <div className="file-tree-placeholder">
              <p>File Explorer</p>
              <p className="placeholder-text">Coming soon...</p>
            </div>
          </div>
        </Panel>

        <PanelResizeHandle className="resize-handle" />

        {/* Right Pane - Tab System */}
        <Panel defaultSize={80} minSize={60} className="panel">
          <div className="editor-container">
            {/* Tab Headers */}
            <div className="tab-header">
              <button
                className={`tab-button ${activeTab === "code" ? "active" : ""}`}
                onClick={() => setActiveTab("code")}
              >
                Code
              </button>
              <button
                className={`tab-button ${activeTab === "cli" ? "active" : ""}`}
                onClick={() => setActiveTab("cli")}
              >
                Floyd CLI
              </button>
            </div>

            {/* Tab Content */}
            <div className="tab-content">
              {activeTab === "code" && (
                <div className="monaco-container">
                  <Editor
                    height="100%"
                    defaultLanguage="typescript"
                    defaultValue="// Start coding in Floyd IDE\nfunction greet(name: string) {\n  console.log(`Hello, ${name}!`);\n}\n\ngreet('World');"
                    theme="vs-dark"
                    options={{
                      minimap: { enabled: true },
                      fontSize: 14,
                      lineNumbers: "on",
                      scrollBeyondLastLine: false,
                      automaticLayout: true,
                    }}
                  />
                </div>
              )}

              {activeTab === "cli" && (
                <div
                  className="terminal-container"
                  ref={(el) => {
                    if (el && el !== terminalContainer) {
                      setTerminalContainer(el);
                    }
                  }}
                />
              )}
            </div>
          </div>
        </Panel>
      </PanelGroup>
    </div>
  );
}

export default App;
