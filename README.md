# Obsidian Operator

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

## High-Level Goals

- **Safe, big UI**: large on-screen controls suitable for mobile and CarPlay contexts.
- **Voice interactions for everything**: create, name, close, and query files by voice.
- **Two modes**:
  - *Transcription mode*: uninterrupted text capture.
  - *Command mode*: back-and-forth chatbot-style interactions.
- **Trust through transparency**: every edit or change is logged so users can review what happened later.

## Project Status

This project is in the **early exploration phase**.
See the [`dev/roadmap/`](./dev/roadmap/) directory for milestones and planned phases.
See [`dev/architecture.md`](./dev/architecture.md) for design considerations.
