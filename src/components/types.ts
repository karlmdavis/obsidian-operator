/**
 * Type definitions for UI components.
 *
 * These types define the props and configuration interfaces for reusable
 * UI components, ensuring consistent and type-safe component APIs.
 */

import type { RecordingUICallbacks } from "../views/types.js";

/**
 * Props interface for the RecordingUI component.
 *
 * Combines state from both global and local recording managers to provide complete
 * context for UI rendering decisions. This design allows the UI to show appropriate
 * states like "recording", "disabled (other instance recording)", "ready to record", etc.
 *
 * Phase 2 Extensions: Will include transcription settings, voice command configuration,
 * file destination settings, etc.
 */
export interface RecordingUIProps {
	/** Whether THIS specific UI instance is currently recording */
	isLocalRecording: boolean;

	/** Whether ANY instance in the plugin is currently recording (disables controls) */
	isGlobalRecording: boolean;

	/** Whether this instance is allowed to start a new recording (based on global state) */
	canRecord: boolean;

	/** Formatted timer display string (MM:SS format) */
	durationDisplay: string;

	/** Formatted recording data display (currently random numbers, future: transcription preview) */
	randomsDisplay: string;

	/** Callback functions for user interactions */
	callbacks: RecordingUICallbacks;
}
