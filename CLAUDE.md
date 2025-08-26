# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Obsidian Operator** is an experimental Obsidian plugin for safe, hands-free voice-driven transcription and editing, designed specifically for use while commuting or otherwise unable to use touch interactions.

The project is currently in the **early exploration phase** with no code implementation yet.

## Architecture & Design

### Core Operating Modes
- **Transcription mode**: Uninterrupted text capture without system responses
- **Command mode**: Interactive, chatbot-style mode where commands and queries are executed

### Key Technical Decisions
- **Language**: TypeScript
- **Framework**: Obsidian Plugin API
- **Transcription**: Cloud services (OpenAI, Anthropic, or similar) - local iOS speech-to-text not available in Obsidian web view
- **Data Model**: Append-only history (CRDT-like) with dual representation:
  - Structured log files (YAML/JSON) preserving interaction sequences
  - Rendered Markdown files for user-facing documents
- **Testing**: Unit tests required, integration tests (e.g., Playwright) encouraged

### UI Requirements
- Large, full-screen controls suitable for mobile and CarPlay contexts
- Voice-first interactions for all major functions
- Safety-focused design with no small touch targets

## Development Roadmap

The project follows a phased approach documented in `dev/roadmap/`:

1. **Hello World Plugin** (`01-hello-world.md`): Establish project skeleton, CI/CD pipeline, basic UI
2. **Core Voice Interface** (`02-core-voice-interface.md`): Implement transcription and basic command recognition
3. **Basic Functionality** (`03-basic-functionality.md`): Add file operations (create, append, search)

## Code Style Guidelines

### Markdown Formatting
- **One sentence per line** convention for all Markdown files
- Lines longer than 110 characters wrapped at logical breaks (comma/clause)
- Wrapped lines indented by two spaces

### TypeScript Conventions
- Follow established linters and formatters (to be configured in phase 1)
- Unit test coverage required for all functions
- Use Obsidian Plugin API patterns and conventions

## Development Workflow

### PR-Based Development
All changes to this repository follow a PR-based workflow:
- Create feature branches with descriptive names (e.g., `feature/`, `fix/`, `setup/`)
- Make atomic commits with clear messages
- Open PRs for review, even for small changes
- Use GitHub's auto-delete branch feature after merge
- CI/CD workflows validate all PRs automatically

### Build & Development Commands

*Note: These commands will be established during phase 1 (Hello World Plugin) implementation:*
- Build process: TBD (TypeScript compilation)
- Testing: TBD (unit test framework)
- Linting: TBD (ESLint or similar)
- Local development: TBD (Obsidian plugin development setup)

## Known Constraints

- Obsidian's plugin framework may restrict full-screen UI, particularly on iOS
- Offline transcription not possible - requires cloud API connectivity
- Streaming transcription expected latency: 1-3 seconds
- iOS local speech-to-text APIs not accessible within Obsidian's web view

## License

This project is licensed under GNU Affero General Public License v3 (AGPL-3.0).