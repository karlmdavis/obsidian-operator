# Contributing to Obsidian Operator

Thank you for your interest in contributing to **Obsidian Operator**.
This project is still experimental, but the intent is to create a plugin that improves safe, hands-free capture of
  thoughts in Obsidian.

## Development Setup

### Prerequisites

- **Bun** (v1.0+): Install from [bun.sh](https://bun.sh)
- **Node.js** (v18+): For compatibility with some tools
- **Obsidian**: Desktop app for testing the plugin

### Initial Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/karlmdavis/obsidian-operator.git
   cd obsidian-operator
   ```

2. **Install dependencies**:
   ```bash
   bun install
   ```

3. **Build the plugin**:
   ```bash
   bun run build   # Production build
   bun run dev     # Development build with watch mode
   ```

### Installing the Plugin Locally

#### Manual Installation

1. Build the plugin: `bun run build`
2. Copy the following files to your vault's plugin folder (`<vault>/.obsidian/plugins/obsidian-operator/`):
   - `main.js`
   - `manifest.json`
   - `styles.css`
3. Reload Obsidian or toggle the plugin in Settings → Community plugins

#### Automatic Installation with Hot Reload

1. **Install the Hot Reload plugin** in Obsidian:
   - Community plugins → Browse → Search for "Hot Reload" → Install

2. **Set your vault path**:
   ```bash
   export OBSIDIAN_PLUGINS_PATH="/path/to/your/vault/.obsidian/plugins"
   ```

3. **Run development build**:
   ```bash
   bun run dev
   ```
   
   This will:
   - Watch for changes in `src/`
   - Rebuild automatically on changes
   - Copy files to your vault
   - Create `.hotreload` file to trigger the Hot Reload plugin
   - Obsidian will automatically reload the plugin when changes are detected

### Development Commands

```bash
# Building
bun run dev        # Watch mode with hot reload
bun run build      # Production build

# Testing
bun test           # Run all tests
bun test:watch     # Run tests in watch mode

# Code Quality
bun run lint       # Check for linting issues
bun run format     # Auto-format code
bun run lint:fix   # Fix auto-fixable linting issues
bun run typecheck  # TypeScript type checking
```

### Testing

Tests use Bun's built-in test runner with happy-dom for DOM testing:

```typescript
import { test, expect } from "bun:test";

test("example test", () => {
  expect(1 + 1).toBe(2);
});
```

Run tests with:
```bash
bun test                    # Run all tests
bun test path/to/file       # Run specific test file
bun test --watch            # Watch mode
```

## Contribution Guidelines

### Style & Formatting

- All Markdown files in this repository follow a **one sentence per line** convention.
- Sentences longer than 110 characters should be wrapped at a logical place (comma or clause break).
  Wrapped lines should be indented by two spaces.
- Example:
    
    ```
    This is a sentence that happens to be long enough that it needs wrapping,
      so the second part is indented.
    ```
    
- Code and configuration should use the repository’s provided linters and formatters.

### Design Principles

- **Safety first**: no fiddly UI elements when driving or in other hands-free contexts.
- **Transparency**: all edits and transcriptions should be logged for later review.
- **Minimal administrative work**: automatic file merging, flexible modes, and append-only history where possible.
- **Sensible defaults**: configuration should be available, but the common use case should “just work.”

### Engineering Practices

- Primary language: **TypeScript**.
- Plugin framework: **Obsidian Plugin API**.
- Testing: unit tests required, with integration tests (e.g. Playwright) encouraged when possible.
- CI/CD: use GitHub Actions to run tests, lint, build, and package.
- Local builds: contributors should be able to build, test, and lint locally without extra setup.
- Build system: **Bun** for fast builds, testing, and dependency management.
- Code quality: **Biome** for unified linting and formatting.

### Constraints

- Obsidian plugin framework may not fully support large, full-screen UI elements on iOS.
- Reliance on online transcription APIs is expected.
  iOS local speech-to-text does not appear to be exposed through Obsidian’s web view.
- Voice interactions must confirm destructive edits concisely and safely.
