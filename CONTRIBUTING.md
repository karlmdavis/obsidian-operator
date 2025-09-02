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

2. **Set your vault path** (choose one option):
   
   Option A - Environment variable:
   ```bash
   export OBSIDIAN_PLUGINS_PATH="/path/to/your/vault/.obsidian/plugins"
   ```
   
   Option B - Create `.env` file in project root:
   ```bash
   OBSIDIAN_PLUGINS_PATH=/path/to/your/vault/.obsidian/plugins
   ```

3. **Run development build**:
   ```bash
   bun run dev
   ```
   
   This single command handles everything:
   - Watches for changes in `src/`
   - Rebuilds automatically on changes
   - Automatically installs to your vault (no manual copying needed)
   - Creates `.hotreload` file to trigger the Hot Reload plugin
   - Obsidian will automatically reload the plugin when changes are detected

### Development Commands

```bash
# Building
bun run dev        # Watch mode with hot reload
bun run build      # Production build

# Testing
bun test           # Run all tests
bun test:watch     # Run tests in watch mode

# Code Quality (Individual)
bun run lint       # Check for linting issues and formatting
bun run format     # Auto-format code
bun run lint:fix   # Fix auto-fixable linting issues and formatting
bun run typecheck  # TypeScript type checking

# Code Quality (CI Tasks - Recommended)
bun run ci:quality # Run all quality checks (lint + typecheck + coverage)
bun run ci:coverage # Run coverage analysis only
bun test           # Run tests only
```

#### Quality Verification

**Before submitting PRs, always run:**
```bash
bun run ci:quality
```

This single command runs all quality checks that CI will perform: linting, type checking, testing, and coverage analysis.

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

### Code Coverage

This project maintains **80% minimum coverage** with automated analysis integrated into the CI/CD pipeline.

#### Coverage Commands

```bash
# Basic coverage
bun run test:coverage              # Generate coverage report  
bun run ci:coverage               # Coverage with CI validation (recommended)

# Coverage reports
bun run test:coverage:text        # Generate text coverage report
bun run test:coverage             # Check coverage thresholds
```

#### Coverage Standards

| Metric | Minimum | Target |
|--------|---------|--------|
| Lines | 80% | 85% |
| Functions | 80% | 85% |
| Branches | 75% | 80% |
| Statements | 80% | 85% |

#### Coverage Guidelines

- **New Code**: Aim for 90%+ coverage on new features
- **Bug Fixes**: Include tests that reproduce the bug
- **Critical Paths**: Ensure 100% coverage for core functionality  
- **Review**: Use text reports (`bun run test:coverage:text`) to identify gaps

Coverage is automatically collected in GitHub Actions and reported on pull requests.

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
    
- **Code formatting is enforced** using Biome with the following settings:
  - **Indentation**: Tabs (width: 2)
  - **Line width**: 110 characters
  - **Quotes**: Double quotes for strings
  - **Semicolons**: Always required
  - **Import organization**: Automatic

- **Before committing**: Always run `bun run format` or `bun run lint:fix` to auto-format your code
- **CI enforcement**: All code must pass `bun run lint` which includes formatting checks

### Linting Policy

**Strict linting enforcement is mandatory** - all code must pass linting without errors or warnings.

#### When Lint Suppressions Are Acceptable

Use `// biome-ignore lint: descriptive reason` only in these specific cases:

1. **Mock files**: When simulating external APIs that require `any` types
   ```typescript
   // biome-ignore lint: Mock API requires any type
   someMethod(param: any): any {
   ```

2. **Test files accessing private properties**:
   ```typescript
   // biome-ignore lint: Testing private properties requires any cast
   (instance as any).privateProperty = testValue;
   ```

3. **Test utility arrays with flexible data**:
   ```typescript
   // biome-ignore lint: Test array needs any type for flexible data collection  
   const testData: any[] = [];
   ```

#### Never Acceptable

- Disabling linting rules globally in configuration files
- Using suppressions to avoid fixing legitimate code quality issues
- Suppressions without clear, descriptive reasons
- Suppressions in production code without strong justification

#### How to Use Suppressions

- Always provide a clear, descriptive reason explaining **why** the suppression is necessary
- Place the comment directly above the line that needs suppression
- Use specific rule suppressions when possible rather than blanket `lint` suppressions

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
