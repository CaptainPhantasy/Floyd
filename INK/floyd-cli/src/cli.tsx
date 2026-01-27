#!/usr/bin/env node
import React from 'react';
import { render } from 'ink';
import meow from 'meow';
import App from './app.js';

// Terminal size requirements
const MIN_ROWS = 20;
const MIN_COLS = 80;

// Check terminal size before starting (allow bypass for CI/tests)
const terminalHeight = process.stdout.rows || 24;
const terminalWidth = process.stdout.columns || 80;
const ignoreSizeCheck = process.env.FLOYD_CLI_IGNORE_MIN_TERMINAL === '1';

if (!ignoreSizeCheck && (terminalHeight < MIN_ROWS || terminalWidth < MIN_COLS)) {
	console.error(`\n⚠️  Terminal too small: ${terminalWidth}x${terminalHeight}`);
	console.error(`   Minimum required: ${MIN_COLS}x${MIN_ROWS}`);
	console.error(`\n   Please resize your terminal and try again.\n`);
	process.exit(1);
}

const cli = meow(
	`
	Usage
	  $ floyd-cli

	Options
		--name  Your name

	Examples
	  $ floyd-cli --name=Jane
	  Hello, Jane
	`,
	{
		importMeta: import.meta,
		flags: {
			name: {
				type: 'string',
			},
			chrome: {
				type: 'boolean',
			},
		},
	},
);

render(<App name={cli.flags.name} chrome={cli.flags.chrome} />);

// HARD EXIT: Ctrl+Q (SIGQUIT) immediately terminates the process
// This is the DEFINITIVE quit key for floyd-cli
process.on('SIGQUIT', () => {
	process.exit(0);
});

// FALLBACK: Ctrl+C (SIGINT) also terminates as failsafe
process.on('SIGINT', () => {
	process.exit(0);
});
