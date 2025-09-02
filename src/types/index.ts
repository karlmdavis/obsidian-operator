/**
 * Type definitions for Obsidian Operator plugin.
 *
 * This file centralizes all TypeScript interfaces and types used throughout the plugin,
 * promoting type safety and consistent API contracts between components.
 * As the plugin grows, this will expand to include voice command types, transcription
 * result interfaces, file operation types, etc.
 */

/**
 * Recording state machine types for managing the lifecycle of recording sessions.
 * These types ensure that state transitions are type-safe and predictable.
 */
export type RecordingState = "idle" | "recording" | "stopping" | "error";

export type RecordingTransition =
	| { type: "START_RECORDING"; instance: object }
	| { type: "STOP_RECORDING"; instance: object }
	| { type: "RECORDING_ERROR"; instance: object; error: string }
	| { type: "RESET" };

/**
 * Configuration types for plugin settings and environment setup.
 * These will be used for user preferences and build-time configuration.
 */
export interface PluginEnvironment {
	readonly isDevelopment: boolean;
	readonly hasHotReload: boolean;
	readonly vaultPath?: string;
	readonly pluginPath?: string;
}

export interface PluginConfig {
	readonly enableTypeChecking: boolean;
	readonly enableVerboseLogging: boolean;
	readonly autoSaveInterval: number;
	readonly maxRecordingDuration: number;
}

/**
 * Event types for internal plugin communication and debugging.
 * These provide type safety for event-driven architecture patterns.
 */
export interface PluginEvent<T = unknown> {
	readonly type: string;
	readonly timestamp: number;
	readonly source: string;
	readonly data: T;
}

export interface RecordingEvent extends PluginEvent {
	readonly type: "recording:start" | "recording:stop" | "recording:error" | "recording:update";
	readonly instance: object;
	readonly data: {
		readonly duration?: number;
		readonly error?: string;
		readonly randomNumbers?: number[];
	};
}

/**
 * Utility types for common patterns used throughout the plugin.
 * These provide type safety for frequently used operations.
 */
export type EventListener<T = unknown> = (event: T) => void;
export type UnsubscribeFunction = () => void;
export type AsyncCallback<T = unknown> = () => Promise<T>;
export type SyncCallback<T = unknown> = () => T;

/**
 * UI construction types for building consistent interfaces.
 * These provide type safety for UI building patterns.
 */
export interface UIElementOptions {
	readonly cls?: string;
	readonly text?: string;
	readonly title?: string;
	readonly ariaLabel?: string;
}

export interface ButtonOptions extends UIElementOptions {
	readonly disabled?: boolean;
	readonly onClick?: () => void;
}

export interface ContainerOptions extends UIElementOptions {
	readonly id?: string;
	readonly role?: string;
}

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
