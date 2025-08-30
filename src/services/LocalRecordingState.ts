import type { EventListener, UnsubscribeFunction } from "../types/index.js";

/**
 * Local recording state manager for individual UI components (modal, view instances).
 *
 * While GlobalRecordingState coordinates between components to prevent conflicts,
 * LocalRecordingState manages the detailed recording state for each UI instance:
 * - Timer management (elapsed time tracking)
 * - Recording data collection (currently mock data with random numbers)
 * - Component-specific UI state updates
 *
 * In Phase 2, this will be extended to handle actual audio recording, transcription
 * results, and voice command processing. The current implementation serves as a
 * foundation demonstrating the state management patterns.
 */

/**
 * Type definition for local recording state change listeners.
 */
export type LocalStateListener = EventListener<LocalStateUpdate>;
export class LocalRecordingState {
	/**
	 * Unique identifier for this recording instance, used to coordinate with GlobalRecordingState.
	 * Format typically: "modal-{timestamp}" or "view-{uuid}" to ensure uniqueness.
	 */
	private instanceId: string;

	/**
	 * Local recording status - distinct from global state.
	 * This tracks whether THIS component thinks it's recording, while global state
	 * determines whether it's ALLOWED to record.
	 */
	private isRecording = false;

	/**
	 * Running timer for recording duration. Incremented every second while recording.
	 * Reset to 0 when recording stops. Used for UI display and potential transcription chunking.
	 */
	private elapsedSeconds = 0;

	/**
	 * Placeholder data collection during recording - simulates captured voice data.
	 * In Phase 2, this would be replaced with audio chunks, transcription results,
	 * or parsed voice commands. Currently generates random numbers for demonstration.
	 */
	private randomNumbers: number[] = [];

	/**
	 * Browser timer ID for the recording interval. Stored to ensure proper cleanup
	 * and prevent memory leaks. Null when no timer is active.
	 */
	private intervalId: number | null = null;

	/**
	 * Observers that get notified when this component's recording state changes.
	 * Separate from global listeners - these are specific to this UI component.
	 */
	private listeners = new Set<LocalStateListener>();

	constructor(instanceId: string) {
		this.instanceId = instanceId;
	}

	/**
	 * Returns the unique identifier for this recording instance.
	 * Used by GlobalRecordingState to track which component is recording.
	 */
	getId(): string {
		return this.instanceId;
	}

	/**
	 * Starts local recording timer and data collection.
	 *
	 * Note: This only manages the LOCAL state. The caller must first check with
	 * GlobalRecordingState.tryStartRecording() to ensure recording is allowed.
	 * This separation allows for clean error handling - if global state rejects
	 * the recording attempt, we never start the local timer.
	 *
	 * Phase 2 Extension: This method will initialize audio capture and transcription services.
	 */
	startRecording(): void {
		if (this.isRecording) return; // Prevent double-start

		this.isRecording = true;
		this.elapsedSeconds = 0;
		this.randomNumbers = []; // Clear any previous session data

		// Start 1-second interval for demo data generation and UI updates
		// In Phase 2: This will handle audio chunking and real-time transcription
		this.intervalId = window.setInterval(() => {
			this.elapsedSeconds++;
			const randomNum = Math.floor(Math.random() * 100); // Simulate voice data capture
			this.randomNumbers.push(randomNum);
			this.notifyListeners(); // Update UI components with new data
		}, 1000);

		this.notifyListeners(); // Immediate update for recording start
	}

	/**
	 * Stops local recording and cleans up resources.
	 *
	 * Resets all recording state and stops timers. Like startRecording(), this only
	 * handles LOCAL cleanup. The caller should also notify GlobalRecordingState
	 * to release the recording lock.
	 *
	 * Phase 2 Extension: Will handle stopping audio capture, finalizing transcription,
	 * and saving results to files.
	 */
	stopRecording(): void {
		this.isRecording = false;
		this.elapsedSeconds = 0;
		this.randomNumbers = []; // Clear session data

		// Clean up interval timer to prevent memory leaks
		if (this.intervalId !== null) {
			window.clearInterval(this.intervalId);
			this.intervalId = null;
		}

		this.notifyListeners(); // Update UI to reflect stopped state
	}

	/**
	 * Returns current state snapshot for UI components.
	 *
	 * Creates a new object with both raw data and formatted versions for display.
	 * Array is cloned to prevent external modifications to internal state.
	 * This method is called frequently by UI components, so it's designed to be lightweight.
	 */
	getState(): LocalStateUpdate {
		return {
			isRecording: this.isRecording,
			elapsedSeconds: this.elapsedSeconds,
			randomNumbers: [...this.randomNumbers], // Clone to prevent mutation
			formattedDuration: this.formatDuration(),
			formattedRandoms: this.formatRandomNumbers(),
		};
	}

	/**
	 * Subscribe to state changes for this specific recording instance.
	 * UI components use this to update their displays when recording state changes.
	 *
	 * @param listener Function called with new state data when changes occur
	 * @returns Cleanup function to remove the listener and prevent memory leaks
	 */
	subscribe(listener: LocalStateListener): UnsubscribeFunction {
		this.listeners.add(listener);
		return () => this.listeners.delete(listener);
	}

	/**
	 * Internal notification system - informs all subscribed UI components of state changes.
	 * Called after any state mutation to keep UI in sync with recording state.
	 */
	private notifyListeners(): void {
		const state = this.getState();
		for (const listener of this.listeners) {
			listener(state);
		}
	}

	/**
	 * Formats elapsed time as MM:SS for user-friendly display.
	 * Used in UI to show recording duration. Pads with leading zeros for consistent formatting.
	 */
	private formatDuration(): string {
		const minutes = Math.floor(this.elapsedSeconds / 60);
		const seconds = this.elapsedSeconds % 60;
		return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
	}

	/**
	 * Formats the random number array for display purposes.
	 * Placeholder for what will eventually be transcribed text or voice commands.
	 * In Phase 2: This might format transcription confidence scores, command recognition results, etc.
	 */
	private formatRandomNumbers(): string {
		if (this.randomNumbers.length === 0) return "";
		return this.randomNumbers.map((n) => `${n}...`).join(" ");
	}

	/**
	 * Cleanup method for component unmounting or plugin unload.
	 * Ensures recording is stopped and all listeners are removed to prevent memory leaks.
	 */
	destroy(): void {
		this.stopRecording();
		this.listeners.clear();
	}
}

/**
 * State update interface passed to LocalRecordingState subscribers.
 *
 * Contains both raw data (for processing) and formatted strings (for UI display).
 * This pattern reduces the need for UI components to implement their own formatting logic
 * and ensures consistent presentation across different UI components.
 *
 * Phase 2 Extensions: Will include transcription text, confidence scores,
 * recognized commands, audio file paths, etc.
 */
export interface LocalStateUpdate {
	isRecording: boolean; // Current recording status
	elapsedSeconds: number; // Raw timer value
	randomNumbers: number[]; // Mock data - will become transcription/audio data
	formattedDuration: string; // Human-readable timer display (MM:SS)
	formattedRandoms: string; // Formatted data for UI display
}
