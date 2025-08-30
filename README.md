# Obsidian Operator

[![CI](https://github.com/USER/obsidian-operator/actions/workflows/ci.yml/badge.svg)](https://github.com/USER/obsidian-operator/actions/workflows/ci.yml)
[![Coverage](https://codecov.io/gh/USER/obsidian-operator/branch/main/graph/badge.svg)](https://codecov.io/gh/USER/obsidian-operator)
[![License: AGPL v3](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)

**Obsidian Operator** is an experimental plugin for [Obsidian](https://obsidian.md/).
It is designed to solve a neglected niche: safe, hands-free capture of thoughts while commuting or otherwise unable to
  use touch interactions.

The project aims to provide a better user experience for **voice-driven transcription and editing** than current options
  such as Apple Notes, Obsidian Scribe, or ChatGPT voice mode.
It focuses on **reliability, safety, and reducing administrative overhead** when capturing thoughts.

## Motivation & Pain Points

- **Apple Notes**: silently stops transcribing on notification without user awareness.
  Starting a new note while driving is also awkward and dangerous.
- **Obsidian Scribe**: tiny UI buttons make it unusable while driving.
  Each pause forces a new file and requires manual collation later.
- **ChatGPT Voice Mode**: too interruptive.
  It treats pauses as commands, making freeform thought capture impossible.

None of these solutions provide tools for merging recordings, querying transcriptions, or editing by voice.
This project is designed to fill that gap.

## Quick Start

### Installation

1. **Download** or clone this repository
2. **Build the plugin**:
   ```bash
   bun install
   bun run build
   ```
3. **Copy files** to your Obsidian vault:
   - Copy `main.js`, `manifest.json`, and `styles.css` to `<vault>/.obsidian/plugins/obsidian-operator/`
4. **Enable the plugin** in Obsidian Settings → Community plugins

### Usage

- **Open Modal**: Click the microphone icon in the left ribbon, or use Command Palette → "Operator Modal"
- **Open View**: Click the sidebar icon in the left ribbon, or use Command Palette → "Operator View"  
- **Start Recording**: Click the Record button in either interface
- **Stop Recording**: Click the Stop button while recording
- **Keyboard Shortcuts**: 
  - `Cmd+Enter`: Toggle recording on/off
  - `Cmd+Escape`: Stop recording and close modal

*Note: Current version shows mock recording with timer and random numbers.
Real voice transcription will be added in Phase 2.*

## High-Level Goals

- **Safe, big UI**: large on-screen controls suitable for mobile and CarPlay contexts.
- **Voice interactions for everything**: create, name, close, and query files by voice.
- **Two modes**:
  - *Transcription mode*: uninterrupted text capture.
  - *Command mode*: back-and-forth chatbot-style interactions.
- **Trust through transparency**: every edit or change is logged so users can review what happened later.

## Project Status

This project has completed **Phase 1: Hello World Plugin** with a functional foundation:

- ✅ **Working Obsidian Plugin**: Installable plugin with dual UI interfaces (modal + view)
- ✅ **State Management Architecture**: Dual-state coordination system preventing recording conflicts
- ✅ **UI Components**: Reusable recording controls with accessibility features
- ✅ **Testing Infrastructure**: Comprehensive unit and integration test suite with automated coverage analysis
- ✅ **Build System**: Bun-based development workflow with hot reload support
- ✅ **CI/CD Pipeline**: GitHub Actions with automated testing and linting

### Current Features

- **Modal Interface**: Quick recording popup accessible via ribbon icon or keyboard shortcut
- **View Interface**: Dedicated workspace tab for extended recording sessions  
- **Recording Coordination**: Prevents multiple simultaneous recordings across UI instances
- **Mock Recording System**: Timer-based demonstration showing architecture for future voice features

### Next Steps

The plugin is ready for **Phase 2: Core Voice Interface** implementation, including:
- Real audio recording and transcription integration
- Voice command processing and file operations
- Advanced recording management features

See the [`dev/roadmap/`](./dev/roadmap/) directory for detailed milestones and planned phases.
See [`dev/architecture.md`](./dev/architecture.md) for design considerations.

## Development/Contributing

This project maintains high code quality standards with comprehensive testing, automated coverage analysis, and strict linting enforcement.

**Quick Start**:
```bash
bun install          # Install dependencies  
bun run dev          # Development build with watch mode
bun run ci:quality   # Run all quality checks (lint, typecheck, coverage)
```

**Full development setup, coding standards, and contribution guidelines**: See [CONTRIBUTING.md](./CONTRIBUTING.md)
