import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load test environment variables
try {
	const envPath = `${__dirname}/.env.test`;
	const envContent = readFileSync(envPath, 'utf-8');
	envContent.split('\n').forEach(line => {
		const [key, ...values] = line.split('=');
		if (key && values.length > 0) {
			process.env[key.trim()] = values.join('=').trim();
		}
	});
} catch (err) {
	// Ignore if .env.test doesn't exist
}

// Set minimal test environment if not already set
// Note: GLM variables are loaded from .env file, don't override them
if (!process.env.FLOYD_GLM_API_KEY && !process.env.GLM_API_KEY) {
	// Only set mock key if neither is configured
	process.env.FLOYD_GLM_API_KEY = 'test-key-for-unit-tests';
}

if (!process.env.FLOYD_GLM_ENDPOINT && !process.env.GLM_API_ENDPOINT) {
	process.env.FLOYD_GLM_ENDPOINT = 'https://test.api.example.com/v1';
}

if (!process.env.FLOYD_GLM_MODEL && !process.env.GLM_MODEL) {
	process.env.FLOYD_GLM_MODEL = 'test-model';
}

if (!process.env.FLOYD_LOG_LEVEL) {
	process.env.FLOYD_LOG_LEVEL = 'error'; // Reduce noise during tests
}

if (!process.env.FLOYD_CACHE_ENABLED) {
	process.env.FLOYD_CACHE_ENABLED = 'false';
}

if (!process.env.FLOYD_CACHE_DIR) {
	process.env.FLOYD_CACHE_DIR = '.test-cache';
}

// Use a simpler configuration without @ava/typescript helper
// The tsx loader in nodeArguments handles TypeScript compilation
export default {
	extensions: {
		ts: 'module',
	},
	nodeArguments: ['--import=tsx/esm'],
};
