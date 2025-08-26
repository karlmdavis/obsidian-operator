# Epic 3: Basic Functionality

## Objective

Add practical features that make the plugin useful in day-to-day workflows.
Support creating, appending, and searching files inside an Obsidian vault.

## Deliverables

- Ability to append transcribed text to a real Markdown file in the vault.
- Voice commands to create a new file and name it.
- Voice commands to search for and open files.
- Configuration options for:
  - File naming conventions.
  - Storage location of audio recordings.
- Retain structured logs of sessions while producing user-facing Markdown files.
- Maintain unit tests and CI/CD coverage.

## Risks & Uncertainties

- **File management UX**:
  Ensuring that file creation and search are reliable and not confusing to the user.
- **Diff handling**:
  Determining how to present history or diffs to maintain user trust.
- **Configuration complexity**:
  Balancing flexibility with simplicity for default settings.

## Success Criteria

- Users can capture transcriptions directly into Markdown files.
- Users can create and name new files by voice.
- Users can search for and open files by voice.
- Configuration options are available and work reliably with sensible defaults.
