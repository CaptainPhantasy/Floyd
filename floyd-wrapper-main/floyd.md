# Floyd CLI Development Guidelines

This document contains important guidelines for developing and maintaining the Floyd CLI project.

## ESM Import Patterns (Critical)

### The Problem

Floyd uses **ES Modules** with TypeScript's `NodeNext` module resolution. This configuration requires specific import patterns to avoid runtime errors.

**Common Error:**
```
Error [ERR_MODULE_NOT_FOUND]: Cannot find module './path/to/file.ts'
```

This occurs when TypeScript source files use `.ts` extensions in import statements. When compiled to JavaScript, the `.ts` extension is preserved, causing Node.js to look for a `.ts` file at runtime (which doesn't exist in the `dist/` directory).

### The Solution

**For Static Imports:**
```typescript
// ❌ WRONG - Will cause runtime error
import { something } from './module.ts';

// ✅ CORRECT - Use .js extension
import { something } from './module.js';

// ✅ ALSO CORRECT - No extension
import { something } from './module';
```

**For Dynamic Imports:**
```typescript
// ❌ WRONG - Will cause runtime error
const module = await import('./module.ts');

// ✅ CORRECT - Use .js extension
const module = await import('./module.js');
```

### Why `.js` in Source?

With `module: "NodeNext"` in `tsconfig.json`, TypeScript understands that `.js` extensions in source code refer to `.ts` files during development. The compiled output correctly references `.js` files, which exist at runtime.

### Guardrails

The project has multiple guardrails to prevent this error:

1. **ESLint Rule** - `.eslintrc.cjs` has a `no-restricted-syntax` rule that catches `.ts` extensions in imports
2. **Build Check** - `npm run build:check` scans `dist/` for any remaining `.ts` imports
3. **Sed Workaround** - The build script includes `sed` commands as a safety net to auto-fix `.ts` extensions in compiled output

### Quick Reference

| Import Type | Wrong | Correct |
|-------------|-------|---------|
| Static | `from './file.ts'` | `from './file.js'` or `from './file'` |
| Dynamic | `import('./file.ts')` | `import('./file.js')` |
| Export | `export { x } from './file.ts'` | `export { x } from './file.js'` or `export { x } from './file'` |

### When in Doubt

- Use `.js` extensions for **dynamic imports** (required)
- Use `.js` extensions or **no extension** for static imports
- Run `npm run lint` to catch violations during development
- Run `npm run build:check` to verify build output is clean

## Additional Guidelines

### Running the Project

- `npm run dev` - Development mode with hot reload
- `npm run build` - Build for production
- `npm run build:check` - Verify no .ts imports in dist/
- `npm start` - Run the built CLI

### Testing

- `npm run test:unit` - Run unit tests
- `npm run test:integration` - Run integration tests
- `npm run test:coverage` - Run tests with coverage report

### Code Quality

- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run typecheck` - Run TypeScript type checking
- `npm run precommit` - Run all checks before committing

### Error Prevention

If you encounter the `ERR_MODULE_NOT_FOUND` error:

1. Check for `.ts` extensions in import statements
2. Run `npm run lint` to find violations
3. Fix the imports to use `.js` extensions
4. Rebuild with `npm run build`
5. Verify with `npm run build:check`
