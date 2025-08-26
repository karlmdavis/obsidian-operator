# Contributing to Obsidian Operator

Thank you for your interest in contributing to **Obsidian Operator**.
This project is still experimental, but the intent is to create a plugin that improves safe, hands-free capture of
  thoughts in Obsidian.

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

### Constraints

- Obsidian plugin framework may not fully support large, full-screen UI elements on iOS.
- Reliance on online transcription APIs is expected.
  iOS local speech-to-text does not appear to be exposed through Obsidian’s web view.
- Voice interactions must confirm destructive edits concisely and safely.
