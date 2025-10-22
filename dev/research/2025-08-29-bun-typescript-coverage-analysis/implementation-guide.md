# Step-by-Step Coverage Implementation Guide

This guide provides detailed instructions for implementing code coverage in your Bun + TypeScript + Obsidian plugin project.

## Phase 1: Basic Coverage Setup (Week 1)

### Step 1: Enable Bun Native Coverage

**Add coverage scripts to package.json:**

```json
{
  "scripts": {
    "test:coverage": "bun test --coverage",
    "test:coverage:html": "bun test --coverage --coverage-reporter=html --coverage-dir=./coverage-html"
  }
}
```

**Test the setup:**
```bash
# Run tests with coverage
bun run test:coverage

# Generate HTML report for local viewing
bun run test:coverage:html
open ./coverage-html/index.html  # macOS
```

**Expected output:**
```
✓ 42 tests passed
✓ Coverage: 73.2% of lines covered
✓ Coverage report saved to ./coverage/lcov.info
```

### Step 2: Configure Coverage Exclusions

**Update bunfig.toml:**
```toml
[test.coverage]
exclude = [
  "**/*.test.ts",
  "**/*.spec.ts", 
  "**/tests/**",
  "**/node_modules/**",
  "**/coverage/**",
  "**/*.d.ts",
  "**/build.ts"
]
```

**Verify exclusions work:**
```bash
bun test --coverage
# Confirm test files aren't included in coverage report
```

### Step 3: Set Initial Coverage Threshold

**Start with achievable threshold (70%):**
```bash
# Add to package.json
"test:coverage:check": "bun test --coverage --coverage-threshold=70"
```

**Run threshold check:**
```bash
bun run test:coverage:check
# Should pass if your current coverage is above 70%
```

### Step 4: Add Coverage to Development Workflow

**Update your CONTRIBUTING.md:**
```markdown
### Running Tests with Coverage

```bash
# Run tests with coverage report
bun run test:coverage

# View HTML coverage report
bun run test:coverage:html
open ./coverage-html/index.html
```

Coverage thresholds:
- Minimum: 70% (current)
- Target: 80% (goal)
- New code: 90% (strict)
```

## Phase 2: CI/CD Integration (Week 2)

### Step 1: Create GitHub Actions Workflow

**Create `.github/workflows/coverage.yml`:**
```yaml
name: Test Coverage

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  coverage:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    - name: Setup Bun
      uses: oven-sh/setup-bun@v1
    - name: Install dependencies
      run: bun install --frozen-lockfile
    - name: Run tests with coverage
      run: bun test --coverage --coverage-reporter=lcov
    - name: Check thresholds
      run: bun test --coverage --coverage-threshold=70
```

**Test the workflow:**
```bash
git add .github/workflows/coverage.yml
git commit -m "Add coverage CI workflow"
git push origin feature-branch
# Verify workflow runs successfully in GitHub Actions
```

### Step 2: Add Coverage Service Integration

**Choose a service (Codecov recommended):**

1. **Sign up for Codecov** at https://codecov.io
2. **Add your repository** to Codecov
3. **Add secrets to GitHub:**
   - Go to GitHub repo → Settings → Secrets
   - Add `CODECOV_TOKEN` with token from Codecov

**Update workflow to upload coverage:**
```yaml
- name: Upload coverage to Codecov
  uses: codecov/codecov-action@v3
  with:
    file: ./coverage/lcov.info
    fail_ci_if_error: true
  env:
    CODECOV_TOKEN: ${{ secrets.CODECOV_TOKEN }}
```

### Step 3: Add Coverage Badge

**Add to README.md:**
```markdown
[![Coverage Status](https://codecov.io/gh/YOUR_USERNAME/obsidian-operator/branch/main/graph/badge.svg)](https://codecov.io/gh/YOUR_USERNAME/obsidian-operator)
```

### Step 4: Configure PR Coverage Comments

**Add to workflow (see examples/github-actions-coverage.yml for full implementation):**
```yaml
- name: Comment PR with coverage
  if: github.event_name == 'pull_request'
  uses: actions/github-script@v6
  with:
    script: |
      // Script to comment coverage results on PR
```

## Phase 3: Advanced Features (Week 3)

### Step 1: Implement Differential Coverage

**Add script to check only changed files:**
```json
{
  "scripts": {
    "coverage:diff": "git diff --name-only HEAD~1 | grep -E '\\.(ts|js)$' | xargs bun test --coverage --coverage-include"
  }
}
```

**Use in PR workflow:**
```yaml
- name: Check diff coverage
  run: |
    CHANGED_FILES=$(git diff --name-only origin/main...HEAD | grep -E '\.(ts|js)$' || true)
    if [ ! -z "$CHANGED_FILES" ]; then
      echo "$CHANGED_FILES" | xargs bun test --coverage --coverage-include
    fi
```

### Step 2: Increase Coverage Threshold

**Gradually increase threshold:**
```bash
# Week 1: Start at 70%
"test:coverage:check": "bun test --coverage --coverage-threshold=70"

# Week 3: Increase to 75%
"test:coverage:check": "bun test --coverage --coverage-threshold=75"

# Week 4: Target 80%
"test:coverage:check": "bun test --coverage --coverage-threshold=80"
```

**Add granular thresholds:**
```toml
# bunfig.toml
[test.coverage]
thresholds = { lines = 80, functions = 80, branches = 75, statements = 80 }
```

### Step 3: Add Coverage Quality Gates

**Pre-commit hook for coverage:**
```bash
# Install husky for git hooks
bun add --dev husky

# Add pre-commit hook
npx husky add .husky/pre-commit "bun run test:coverage:check"
```

**Branch protection with coverage:**
```yaml
# In GitHub: Settings → Branches → Add rule
# Require status checks to pass: "Test Coverage"
```

## Phase 4: Obsidian Plugin-Specific Implementation

### Step 1: Mock Obsidian APIs for Coverage

**Enhance your existing mocks:**
```typescript
// tests/mocks/obsidian.ts
export class MockPlugin {
  app = new MockApp();
  manifest = { id: 'test-plugin', version: '1.0.0' };
  
  async onload(): Promise<void> {
    // Mock implementation for coverage
  }
  
  addCommand(command: Command): Command {
    // Mock command registration
    return command;
  }
  
  addRibbonIcon(icon: string, title: string, callback: () => void): HTMLElement {
    // Mock ribbon icon for coverage
    const element = document.createElement('div');
    element.onclick = callback;
    return element;
  }
}
```

### Step 2: Test Plugin Lifecycle Events

**Add comprehensive lifecycle tests:**
```typescript
// tests/plugin-lifecycle.test.ts
import { test, expect } from 'bun:test';
import MyPlugin from '../src/main';

test('plugin onload coverage', async () => {
  const plugin = new MyPlugin();
  plugin.app = mockApp;
  plugin.manifest = mockManifest;
  
  await plugin.onload();
  
  // Verify all onload paths are covered
  expect(plugin.isLoaded).toBe(true);
  expect(plugin.commands).toHaveLength(2);
  expect(plugin.ribbonIcons).toHaveLength(1);
});

test('plugin onunload coverage', () => {
  const plugin = new MyPlugin();
  plugin.onload();
  
  plugin.onunload();
  
  // Verify cleanup paths are covered
  expect(plugin.isLoaded).toBe(false);
});
```

### Step 3: Test UI Components for Coverage

**Modal coverage:**
```typescript
// tests/modals.test.ts
import { RecordingModal } from '../src/views/RecordingModal';

test('modal interaction coverage', () => {
  const modal = new RecordingModal(mockApp, mockPlugin);
  modal.open();
  
  // Cover all button interactions
  const recordButton = modal.contentEl.querySelector('.record-button');
  recordButton?.click(); // Covers start recording
  recordButton?.click(); // Covers stop recording
  
  // Cover keyboard shortcuts
  modal.scope.keys.forEach(key => {
    key.func?.(); // Covers all keyboard handlers
  });
  
  modal.close();
});
```

**View coverage:**
```typescript
// tests/views.test.ts
import { RecordingView } from '../src/views/RecordingView';

test('view lifecycle coverage', () => {
  const view = new RecordingView();
  
  view.onOpen(); // Cover view opening
  view.onClose(); // Cover view closing
  
  // Test all view states
  ['idle', 'recording', 'processing'].forEach(state => {
    view.setState(state); // Cover state transitions
  });
});
```

### Step 4: Test Error Handling Paths

**Add error scenario tests:**
```typescript
// tests/error-handling.test.ts
test('error path coverage', async () => {
  const plugin = new MyPlugin();
  
  // Mock API failure
  plugin.app.vault.create = jest.fn().mockRejectedValue(new Error('Vault error'));
  
  try {
    await plugin.createNote();
  } catch (error) {
    expect(error.message).toContain('Vault error');
  }
  
  // Verify error handling path is covered
});
```

## Performance Optimization

### Step 1: Optimize Coverage Performance

**Conditional coverage in development:**
```json
{
  "scripts": {
    "test": "bun test",
    "test:dev": "bun test --watch",
    "test:coverage": "bun test --coverage",
    "test:ci": "bun test --coverage --coverage-threshold=80"
  }
}
```

**Use coverage only when needed:**
```bash
# Fast development testing
bun run test

# Coverage when needed
bun run test:coverage

# CI pipeline
bun run test:ci
```

### Step 2: Exclude Performance-Heavy Files

**Strategic exclusions:**
```toml
[test.coverage]
exclude = [
  "**/vendor/**",
  "**/third-party/**",
  "**/*.generated.ts",
  "**/build.ts",
  "**/*.config.ts"
]
```

### Step 3: Parallel Test Execution

**Enable parallel testing:**
```toml
[test.performance]
parallel = true
maxConcurrency = 4
```

## Troubleshooting Common Issues

### Issue 1: Coverage Not Matching Source Files

**Problem:** Coverage shows compiled JS instead of TypeScript

**Solution:** Ensure source maps are enabled:
```json
{
  "compilerOptions": {
    "sourceMap": true,
    "inlineSourceMap": false
  }
}
```

### Issue 2: TypeScript Imports Not Covered

**Problem:** Type-only imports affecting coverage

**Solution:** Use proper import syntax:
```typescript
// This doesn't count toward coverage
import type { Plugin } from 'obsidian';

// This does count toward coverage  
import { Plugin } from 'obsidian';
```

### Issue 3: Mock Files Included in Coverage

**Problem:** Test mocks showing in coverage report

**Solution:** Proper exclusion patterns:
```toml
[test.coverage]
exclude = [
  "**/mocks/**",
  "**/*.mock.ts",
  "**/__mocks__/**"
]
```

### Issue 4: Coverage Threshold Failures in CI

**Problem:** Tests pass locally but fail coverage in CI

**Solution:** Run exact CI command locally:
```bash
# Replicate CI environment
CI=true bun test --coverage --coverage-threshold=80
```

### Issue 5: Obsidian API Coverage Issues

**Problem:** Obsidian APIs not covered due to mocking

**Solution:** Comprehensive mocking strategy:
```typescript
// Mock all used Obsidian APIs
jest.mock('obsidian', () => ({
  Plugin: MockPlugin,
  Modal: MockModal,
  TFile: MockTFile,
  // Add all APIs your plugin uses
}));
```

## Maintenance and Monitoring

### Weekly Tasks

**Review coverage trends:**
```bash
# Check current coverage
bun run test:coverage

# Compare with previous week
git log --oneline --since="1 week ago" | head -5
```

**Update coverage goals:**
```bash
# Gradually increase thresholds
# Current: 75% → Target: 80%
```

### Monthly Tasks

**Coverage quality assessment:**
- Review files with low coverage
- Identify missing test scenarios  
- Update coverage exclusions
- Evaluate tool performance

**Tool updates:**
```bash
# Update Bun
curl -fsSL https://bun.sh/install | bash

# Update coverage-related dependencies  
bun update
```

### Quarterly Tasks

**Coverage strategy review:**
- Evaluate coverage service performance
- Consider new tooling options
- Review team coverage practices
- Update documentation

## Success Metrics

### Week 1 Goals
- ✅ Basic coverage working locally
- ✅ HTML reports viewable
- ✅ Coverage exclusions configured
- ✅ Initial threshold set (70%)

### Week 2 Goals  
- ✅ CI/CD integration working
- ✅ Coverage service connected
- ✅ PR comments showing coverage
- ✅ Coverage badge in README

### Week 3 Goals
- ✅ Differential coverage implemented
- ✅ Threshold increased to 75%
- ✅ Pre-commit hooks working
- ✅ Team using coverage reports

### Ongoing Goals
- 📈 Coverage trending upward
- 🚀 Build performance maintained
- 👥 Team adoption of coverage practices
- 🐛 Reduced bug reports in covered areas

This implementation guide provides a structured approach to adding comprehensive code coverage to your Bun + TypeScript + Obsidian plugin project while maintaining excellent development performance and team productivity.