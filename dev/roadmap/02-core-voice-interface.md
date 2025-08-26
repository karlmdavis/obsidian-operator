# Epic 2: Core Voice Interface

## Objective

Prove out the feasibility of voice interaction inside an Obsidian plugin.
Demonstrate both transcription capture and basic command recognition.

## Deliverables

- A UI toggle between **Transcription Mode** and **Command Mode**.
- In Transcription Mode:
  Captured speech is transcribed and appended to the screen.
- In Command Mode:
  The system recognizes at least two simple commands.
  For example, “My name is X” and “Hello,” with corresponding responses.
- Ability to stream audio to a transcription service and display results in near real time.
- Continued support for unit tests and GitHub Actions workflows.

## Risks & Uncertainties

- **Transcription API selection**:
  Which cloud service to use (OpenAI, Anthropic, or others) must be evaluated.
- **Latency**:
  Streaming transcription may introduce delays of one to three seconds.
- **Connectivity**:
  Offline transcription is not feasible in the plugin environment.
- **User trust**:
  Even in simple command mode, interactions must be predictable and transparent.

## Success Criteria

- Transcription Mode produces text reliably and appends it to the current view.
- Command Mode correctly identifies and responds to at least two simple commands.
- The plugin demonstrates end-to-end integration with at least one transcription API.
