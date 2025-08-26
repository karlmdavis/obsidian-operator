# Architecture

This document outlines the envisioned architecture and design considerations for **Obsidian Operator**.

## Core Concepts

- **Two primary modes**:
  - *Transcription mode*: uninterrupted text capture without system responses.
  - *Command mode*: interactive, chatbot-like mode where commands and queries are executed.
- **Voice-first interactions**:
  All major functions (create file, close file, name file, query file, navigate, edit) should be possible by voice.
- **Safe, large UI**:
  Full-screen buttons with clear affordances.
  Suitable for mobile and CarPlay contexts.
- **History and trust**:
  Every interaction should be logged.
  Users should be able to review what happened and when.

## Data Model

- **Append-only history**:
  Each session should produce an append-only log (CRDT-like) of voice interactions and resulting changes.
- **Dual representation**:
  - A structured log file (YAML or JSON) that preserves the sequence of interactions.
  - A rendered Markdown file that represents the current “user-facing” document.
- **Sidecar files**:
  May be required to store structured logs alongside Markdown if embedding is not feasible.
- **Transparency**:
  Users should be able to view diffs or history after the fact, even if not during capture.

## Integration Points

- **Transcription APIs**:
  Likely to use cloud services (OpenAI, Anthropic, or similar).
  Local iOS speech-to-text APIs are not available within Obsidian’s web view.
- **Obsidian Vault Access**:
  Operates on Markdown files in the vault.
  Possible fallback integrations include Dropbox or Obsidian Sync.
- **Parallel recording**:
  Recording audio to storage while streaming to transcription service ensures resilience against connection issues.

## Feature Categories

- **File Management**:
  Create, name, close, search, and open files by voice.
- **Navigation & Search**:
  Commands to jump to a section, search by keyword, or list search hits.
- **Editing Commands**:
  Find and replace, cleaning inconsistencies, “make this sound more professional.”
  Must require concise confirmation for destructive edits.
- **Query Features**:
  Read back a portion of the file.
  Answer questions about the current document.

## Risks & Constraints

- **UI Limitations**:
  Obsidian’s plugin framework may restrict full-screen UI, particularly on iOS.
- **Reliance on Cloud APIs**:
  Offline transcription will not be possible.
- **Latency**:
  Streaming transcription may incur delays (1–3 seconds).
- **User Trust**:
  Clear diffs and logs are critical to adoption.