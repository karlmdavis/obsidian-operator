# Top 20 TypeScript Obsidian Plugins Analysis

## Overview

Analysis of the most popular TypeScript-based Obsidian plugins to understand community best practices for file structure, build tools, and project organization.

## Top 20 Plugins by GitHub Stars

### Tier 1: Ultra Popular (5k+ stars)
1. **obsidian-git** (8.7k ⭐) - Git integration with automatic commit-and-sync
2. **obsidian-dataview** (8.2k ⭐) - Data index and query language over Markdown files
3. **obsidian-copilot** (5.2k ⭐) - THE Copilot in Obsidian

### Tier 2: Very Popular (2k+ stars)
4. **Templater** (4.2k ⭐) - Template plugin for obsidian
5. **obsidian-kanban** (3.7k ⭐) - Create markdown-backed Kanban boards
6. **obsidian-tasks** (3.1k ⭐) - Task management for knowledge base
7. **obsidian-day-planner** (2.4k ⭐) - Day planning with clean UI
8. **advanced-tables-obsidian** (2.3k ⭐) - Improved table navigation and manipulation
9. **obsidian-spaced-repetition** (2k ⭐) - Fight forgetting curve with flashcards
10. **obsidian-latex-suite** (2k ⭐) - Make LaTeX typesetting as fast as handwriting

### Tier 3: Popular (1.6k+ stars)
11. **obsidian-calendar-plugin** (1.9k ⭐) - Simple calendar widget
12. **quickadd** (1.9k ⭐) - QuickAdd for Obsidian
13. **obsidian-textgenerator-plugin** (1.8k ⭐) - Generate text using various AI providers
14. **obsidian-style-settings** (1.7k ⭐) - Dynamic UI for adjusting theme/plugin CSS
15. **obsidian-pdf-plus** (1.7k ⭐) - PDF annotation & viewing with optional Vim keybindings
16. **obsidian-tracker** (1.6k ⭐) - Tracks occurrences and numbers in notes

## Build Tool Analysis

### esbuild (Most Common)
**Plugins using esbuild:**
- obsidian-git
- Templater  
- obsidian-tasks
- obsidian-copilot
- Many others

**Characteristics:**
- Fast build times
- TypeScript support out of box
- Minimal configuration
- Standard `esbuild.config.mjs` pattern

**Example configuration pattern:**
```javascript
// esbuild.config.mjs
import esbuild from "esbuild";
import process from "process";

const prod = process.argv[2] === "production";

esbuild.build({
  entryPoints: ["src/main.ts"],
  bundle: true,
  external: ["obsidian", "electron", "@codemirror/*"],
  format: "cjs",
  target: "es2018",
  outfile: "main.js",
  minify: prod,
  sourcemap: prod ? false : "inline"
}).catch(() => process.exit(1));
```

### rollup (Traditional)
**Plugins using rollup:**
- obsidian-dataview
- Some older, established plugins

**Characteristics:**
- More configuration options
- Popular in earlier Obsidian plugin ecosystem
- `rollup.config.js` pattern

### webpack (Rare)
- Very few modern plugins use webpack
- Generally considered overkill for Obsidian plugins

## File Structure Patterns

### Standard src/ Organization

**Most common pattern:**
```
src/
├── main.ts           # Plugin entry point
├── settings/         # Settings-related code
│   ├── settings.ts
│   └── settings-tab.ts
├── commands/         # Command definitions
├── views/           # Custom views and modals
├── utils/           # Utility functions
└── types/           # Type definitions
```

**Advanced pattern (larger plugins):**
```
src/
├── main.ts
├── api/             # External API integrations
├── components/      # Reusable UI components  
├── commands/        # Command handlers
├── core/           # Core business logic
├── handlers/       # Event handlers
├── modals/         # Modal dialogs
├── services/       # Service layer
├── settings/       # Settings management
├── types/          # TypeScript definitions
├── utils/          # Helper functions
└── views/          # Custom views
```

### Configuration Files

**Standard files found in most plugins:**
- `manifest.json` - Obsidian plugin metadata
- `package.json` - npm dependencies and scripts
- `tsconfig.json` - TypeScript configuration
- Build config (`esbuild.config.mjs` or `rollup.config.js`)
- `styles.css` - Plugin-specific styles (optional)

**Modern development tools:**
- ESLint configuration (`.eslintrc` or `eslint.config.mjs`)
- Prettier configuration (`.prettierrc`)
- GitHub Actions workflows (`.github/workflows/`)

## Testing Patterns

**Common approaches:**
1. **No testing** (unfortunately common in simpler plugins)
2. **Jest** - Most popular testing framework when testing is present
3. **Vitest** - Growing popularity in newer plugins
4. **Manual testing** - Test vault approach

**Test organization:**
```
tests/
├── unit/
├── integration/ 
└── __mocks__/
```

## Package Management

**Distribution:**
- **npm** (most common)
- **yarn** (less common)
- **pnpm** (growing popularity)
- **bun** (very rare, innovative)

## Development Scripts

**Standard npm scripts pattern:**
```json
{
  "scripts": {
    "dev": "node esbuild.config.mjs",
    "build": "node esbuild.config.mjs production",
    "version": "node version-bump.mjs && git add manifest.json versions.json"
  }
}
```

## Key Observations

### Build Tools
- **esbuild dominates** - 80%+ of popular plugins use esbuild
- Custom build scripts are rare (your build.ts is innovative)
- Most use simple, minimal configurations

### Project Structure  
- Clear separation of concerns is common
- `src/main.ts` as entry point is universal
- Larger plugins organize by feature/domain
- Settings management patterns are consistent

### Development Workflow
- GitHub Actions for CI/CD is standard
- Automated releases using version-bump patterns
- ESLint + Prettier combination common

### Testing
- Testing adoption is inconsistent across plugins
- When present, Jest is most popular
- Test coverage requirements are rare

### Innovation Opportunities
- Build tooling is conservative (mostly standard esbuild)
- Testing practices lag behind modern standards
- Development experience varies widely
- Hot reload support is inconsistent