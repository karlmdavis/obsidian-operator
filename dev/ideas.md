# Ideas

This document collects brainstorming and tangential ideas that may or may not become part of the roadmap.
These represent possibilities and explorations, not commitments.

## Potential Extensions

- **CarPlay integration**:
  It would be ideal to have a separate iPhone launcher icon or CarPlay app for direct access to transcription.
  Feasibility is doubtful, but the value would be high.

- **Standalone iPhone app**:
  Instead of only an Obsidian plugin, a separate app could manage recordings and sync to an Obsidian vault.
  Integration could be through file system access, Dropbox, or Obsidian Sync.

- **Alternative sync approaches**:
  Exploring whether non-Obsidian cloud providers (Dropbox, Google Drive) could act as intermediaries.
  This would be less desirable but may be necessary in constrained environments.

- **Sidecar vs. inline logs**:
  Debate exists around whether interaction histories should be embedded in Markdown or kept in sidecar files.
  A dual data model (YAML/JSON log plus Markdown render) may be the best balance.

- **Command set inspirations**:
  Voice commands could mirror editor paradigms from Vim, Helix, or Emacs.
  This could provide powerful editing metaphors for advanced users.

- **Advanced editing operations**:
  Commands like “make this sound more professional” or “clean up inconsistencies” would be useful.
  These require careful confirmation flows to avoid destructive surprises.

- **Offline functionality**:
  True offline transcription is not feasible within Obsidian.
  However, local recording with deferred cloud transcription could reduce risk of data loss.

## Engineering Explorations

- **CRDT log format**:
  Using CRDT-style append-only logs would guarantee consistent history even across merges.
- **Diff presentation**:
  Visual diff tools inside Obsidian could help build user trust in voice-driven edits.
- **UI modalities**:
  Switching between transcription and command modes via voice triggers rather than buttons.
