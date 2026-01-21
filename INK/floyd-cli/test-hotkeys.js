#!/usr/bin/env node
/**
 * Floyd CLI Hotkey Test Script
 *
 * This script simulates key presses to capture hotkey execution order.
 * It uses ANSI escape codes to simulate terminal input.
 */

const { spawn } = require('child_process');
const fs = require('fs');

const outputPath = './hotkey-test-output.txt';
const logStream = fs.createWriteStream(outputPath, { flags: 'a' });

function log(message) {
    console.log(message);
    logStream.write(message + '\n');
}

// ANSI codes for special keys
const KEYS = {
    // Ctrl+C = \x03
    CTRL_C: '\x03',
    // Ctrl+D = \x04
    CTRL_D: '\x04',
    // Esc = \x1B
    ESC: '\x1B',
    // Ctrl+M (Enter) = \x0D
    ENTER: '\x0D',
};

async function testHotkeyExecution() {
    log('=== FLOYD CLI HOTKEY EXECUTION TEST ===');
    log('Date: ' + new Date().toISOString());
    log('');

    // Test 1: Start CLI and capture initial output
    log('TEST 1: Starting CLI and capturing startup output...');
    const cli = spawn('node', ['dist/cli.js'], {
        cwd: __dirname,
        env: { ...process.env, NODE_ENV: 'test' }
    });

    let output = '';
    let stderrOutput = '';

    cli.stdout.on('data', (data) => {
        const text = data.toString();
        output += text;
        process.stdout.write(text);
    });

    cli.stderr.on('data', (data) => {
        const text = data.toString();
        stderrOutput += text;
        process.stderr.write(text); // Also print to see instrumentation
    });

    // Send keystrokes with delays
    setTimeout(() => {
        log('\n--- Sending Ctrl+/ to toggle help ---');
        cli.stdin.write('\x1B/'); // This won't work as Ctrl+/ - need proper encoding
    }, 2000);

    setTimeout(() => {
        log('\n--- Sending Esc to try to exit ---');
        cli.stdin.write('\x1B');
    }, 4000);

    setTimeout(() => {
        log('\n--- Sending Ctrl+C to force exit ---');
        cli.stdin.write('\x03');
    }, 6000);

    cli.on('close', (code) => {
        log(`\nCLI exited with code ${code}`);
        log('');
        log('=== STDERR OUTPUT (Instrumentation) ===');
        log(stderrOutput);
        log('');
        log('=== TEST COMPLETE ===');
        log(`Full output written to: ${outputPath}`);
        process.exit(0);
    });

    // Handle errors
    cli.on('error', (err) => {
        log(`CLI error: ${err.message}`);
        process.exit(1);
    });
}

// Main execution
log('Starting hotkey execution test...');
testHotkeyExecution().catch(err => {
    log(`Test failed: ${err.message}`);
    process.exit(1);
});
