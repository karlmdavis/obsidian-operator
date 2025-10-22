// vitest.config.ts
// Alternative coverage setup using Vitest (if needed for specific features)

import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    // Test environment
    environment: 'happy-dom',
    
    // Test setup files
    setupFiles: ['./tests/setup/happydom.ts'],
    
    // Global test configuration
    globals: true,
    
    // Test timeout
    testTimeout: 10000,
    
    // Coverage configuration
    coverage: {
      // Coverage provider (v8 is fastest)
      provider: 'v8',
      
      // Coverage reporters
      reporter: ['text', 'lcov', 'html', 'json'],
      
      // Output directory
      reportsDirectory: './coverage',
      
      // Coverage thresholds
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 75,
        statements: 80
      },
      
      // Files to include
      include: [
        'src/**/*.ts',
        'src/**/*.js'
      ],
      
      // Files to exclude
      exclude: [
        '**/*.test.ts',
        '**/*.spec.ts',
        '**/*.test.js', 
        '**/*.spec.js',
        '**/tests/**',
        '**/test/**',
        '**/__tests__/**',
        '**/node_modules/**',
        '**/coverage/**',
        '**/*.d.ts',
        '**/build.ts',
        '**/dist/**'
      ],
      
      // Include all files, even untested ones
      all: true,
      
      // Skip empty files
      skipFull: false,
      
      // Watermarks for coverage coloring
      watermarks: {
        statements: [50, 80],
        functions: [50, 80],
        branches: [50, 80], 
        lines: [50, 80]
      }
    }
  },
  
  // TypeScript resolution
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@tests': resolve(__dirname, 'tests')
    }
  },
  
  // Define globals for Obsidian plugin development
  define: {
    global: 'globalThis',
    // Mock Obsidian globals
    'global.require': {
      main: './main.js'
    }
  }
});

/*
Usage with Vitest (alternative to Bun test):

1. Install Vitest:
   bun add --dev vitest @vitest/coverage-v8 happy-dom

2. Package.json scripts:
   {
     "test": "vitest",
     "test:coverage": "vitest run --coverage",
     "test:ui": "vitest --ui",
     "test:watch": "vitest --watch"
   }

3. Run coverage:
   bun run test:coverage

Comparison: Bun vs Vitest for Coverage

Bun Native:
+ Faster execution (no Node.js overhead)  
+ Zero additional dependencies
+ Native TypeScript support
+ Simpler configuration
- Fewer advanced features
- Smaller ecosystem

Vitest:
+ Rich ecosystem and plugins
+ Excellent UI and developer experience
+ Advanced coverage features
+ Better snapshot testing
- Slower execution (Node.js based)
- More dependencies
- More complex configuration

Recommendation:
- Use Bun native for most projects (performance + simplicity)
- Consider Vitest if you need specific advanced features
*/

// Alternative c8 configuration (if using c8 instead of native coverage)
export const c8Config = {
  // c8 configuration in package.json
  c8: {
    // Include patterns
    include: [
      'src/**/*.ts',
      'src/**/*.js'
    ],
    
    // Exclude patterns  
    exclude: [
      '**/*.test.ts',
      '**/*.spec.ts',
      '**/tests/**',
      '**/node_modules/**',
      '**/coverage/**',
      '**/*.d.ts',
      '**/build.ts'
    ],
    
    // Reporters
    reporter: ['text', 'lcov', 'html', 'json-summary'],
    
    // Output directory
    reportsDir: './coverage',
    
    // Include all files
    all: true,
    
    // Source maps
    sourceMaps: true,
    
    // Thresholds
    lines: 80,
    functions: 80,
    branches: 75,
    statements: 80,
    
    // Check coverage
    checkCoverage: true,
    
    // Watermarks
    watermarks: {
      lines: [50, 80],
      functions: [50, 80],
      branches: [50, 80],
      statements: [50, 80]
    }
  }
};

// NYC configuration (legacy, not recommended)
export const nycConfig = {
  // .nycrc.json (not recommended for Bun projects)
  extends: '@istanbuljs/nyc-config-typescript',
  include: ['src/**/*.ts'],
  exclude: ['**/*.test.ts', '**/*.spec.ts'],
  reporter: ['text', 'lcov', 'html'],
  'report-dir': './coverage',
  'temp-dir': './coverage/.nyc_output',
  all: true,
  'check-coverage': true,
  lines: 80,
  functions: 80,
  branches: 75,
  statements: 80
};

// ESM import/export coverage considerations
export const esmCoverageNotes = `
TypeScript + ESM Coverage Notes:

1. Source Maps:
   - Ensure sourceMap: true in tsconfig.json
   - Use separate .map files (not inline)
   - Configure coverage tool to read source maps

2. Import/Export Coverage:
   - Default exports count toward coverage
   - Named exports count toward coverage
   - Type-only imports/exports don't count
   - Re-exports count toward coverage

3. Dynamic Imports:
   - Covered if the import() call is executed
   - The imported module's coverage is separate
   - Use import() in tests to ensure coverage

4. Module Resolution:
   - Configure path mapping for coverage tools
   - Ensure @ aliases are resolved correctly
   - Test absolute vs relative imports

Example:
// This counts toward coverage
export function utilityFunction() { return 'test'; }

// This counts toward coverage  
export default class MyClass { }

// This does NOT count toward coverage
export type MyType = string;

// This counts if the import() is executed
const module = await import('./dynamic-module');
`;

// Advanced coverage scenarios for Obsidian plugins
export const obsidianCoveragePatterns = {
  // Mock patterns for coverage
  pluginLifecycle: `
// tests/mocks/plugin-lifecycle.ts
export class MockPluginLifecycle {
  onload = jest.fn();
  onunload = jest.fn();
  addCommand = jest.fn();
  addRibbonIcon = jest.fn();
}

// Test to ensure coverage
test('plugin lifecycle coverage', async () => {
  const plugin = new MyPlugin();
  await plugin.onload();  // Covers onload path
  plugin.onunload();      // Covers unload path
});
`,
  
  eventHandlers: `
// Testing event handlers for coverage
test('event handler coverage', () => {
  const modal = new RecordingModal(app, plugin);
  
  // Cover button click events
  const recordButton = modal.contentEl.querySelector('.record-button');
  recordButton?.click(); // Covers click handler
  
  // Cover keyboard events  
  modal.scope.keys.find(k => k.key === 'Enter')?.func(); // Covers Enter key
});
`,
  
  asyncOperations: `
// Coverage for async operations
test('async operation coverage', async () => {
  const plugin = new MyPlugin();
  
  // Cover async initialization
  await plugin.initializeRecording();
  
  // Cover promise chains
  const result = await plugin.processRecording()
    .then(data => data.transcription) // Covers success path
    .catch(error => error.message);   // Covers error path
    
  expect(result).toBeDefined();
});
`,
  
  conditionalLogic: `
// Ensure all branches are covered
test('conditional logic coverage', () => {
  const plugin = new MyPlugin();
  
  // Cover all if/else branches
  plugin.settings.enableRecording = true;
  plugin.updateUI(); // Covers enabled state
  
  plugin.settings.enableRecording = false; 
  plugin.updateUI(); // Covers disabled state
  
  // Cover switch statements
  ['idle', 'recording', 'processing'].forEach(state => {
    plugin.setState(state); // Covers all switch cases
  });
});
`
};