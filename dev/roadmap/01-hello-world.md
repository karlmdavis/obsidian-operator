# Epic 1: Hello World Plugin

## Objective

Establish the initial project skeleton and continuous integration pipeline.
Demonstrate a minimal user interface that hints at the intended interaction model.

## Deliverables

- A basic Obsidian plugin written in **TypeScript**.
- A large, full-screen red "Record" button that toggles to a "Pause" state.
  The button does not need to perform real recording, only simulate state changes.
- Unit test coverage for at least one function within the plugin.
- GitHub Actions workflows for linting, testing, building, and packaging.
- Local build scripts to run tests and lint checks without external dependencies.
- Linters and code formatters configured for consistent style.

## Risks & Uncertainties

- **Obsidian UI limits**:
  It may not be possible to render a true full-screen control on iOS devices.
- **Integration testing**:
  Tools such as Playwright may not be fully compatible with the Obsidian plugin environment.
- **Developer onboarding**:
  TypeScript and the Obsidian API may present a learning curve for new contributors.

## Success Criteria

- The plugin loads successfully in Obsidian on desktop and mobile.
- The simulated record/pause button works as expected.
- Tests and CI workflows run without errors.