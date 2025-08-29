/**
 * Type definitions for Obsidian Operator plugin.
 * 
 * This file centralizes all TypeScript interfaces and types used throughout the plugin,
 * promoting type safety and consistent API contracts between components.
 * As the plugin grows, this will expand to include voice command types, transcription
 * result interfaces, file operation types, etc.
 */

/**
 * Callback interface for RecordingUI component interactions.
 * 
 * This pattern separates UI presentation from business logic, allowing the same
 * RecordingUI component to work in both modal and view contexts with different
 * underlying recording logic.
 */
export interface RecordingUICallbacks {
	/** Called when user clicks the record button - starts recording if allowed */
	onRecord: () => void;
	/** Called when user clicks the stop button - stops active recording */
	onStop: () => void;
}

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
