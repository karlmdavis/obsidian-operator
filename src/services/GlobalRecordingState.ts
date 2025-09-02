import type { EventListener, RecordingState, UnsubscribeFunction } from "../types/index.js";

/**
 * Global recording state coordinator that prevents concurrent recordings across the plugin.
 *
 * This class implements a "singleton recording" pattern where only one recording can be active
 * at any time across all UI components (modal, view, future components). This is essential for:
 * - Preventing audio conflicts when multiple UIs try to record simultaneously
 * - Ensuring consistent user experience (clear feedback about recording state)
 * - Managing shared resources (microphone access) properly
 *
 * Architecture: Uses the Observer pattern to notify all UI components when recording state
 * changes, allowing them to update their interfaces accordingly (e.g., disable record buttons).
 */

/**
 * Type definition for global recording state change listeners.
 */
export type GlobalStateListener = EventListener<{
	isRecording: boolean;
	recordingInstance: object | null;
	state: RecordingState;
}>;
export class GlobalRecordingState {
	/**
	 * Tracks which specific component instance is currently recording.
	 * Null when no recording is active. This allows us to ensure only the
	 * component that started recording can stop it (prevents state conflicts).
	 */
	private recordingInstance: object | null = null;

	/**
	 * Current recording state following the state machine pattern.
	 */
	private currentState: RecordingState = "idle";

	/**
	 * Set of observer functions that get notified when recording state changes.
	 * Using a Set for efficient add/remove operations and automatic deduplication.
	 * Each listener receives comprehensive state information including the state machine state.
	 */
	private listeners = new Set<GlobalStateListener>();

	/**
	 * Attempts to acquire recording permission for a specific UI component.
	 *
	 * This is the entry point for any component that wants to start recording.
	 * The method implements atomic check-and-set to prevent race conditions.
	 *
	 * @param instance The component instance requesting recording permission
	 * @returns true if recording was started successfully, false if another component is already recording
	 */
	tryStartRecording(instance: object): boolean {
		if (this.recordingInstance !== null) {
			return false; // Another component is already recording - reject this request
		}

		// Grant recording permission to this component
		this.recordingInstance = instance;
		this.currentState = "recording";
		this.notifyListeners(); // Inform all UI components about the state change
		return true;
	}

	/**
	 * Releases recording permission, but only if the caller is the current recording owner.
	 *
	 * This prevents components from accidentally stopping recordings they didn't start,
	 * which could happen in complex UI scenarios or during rapid user interactions.
	 *
	 * @param instance The component requesting to stop recording
	 */
	stopRecording(instance: object): void {
		if (this.recordingInstance === instance) {
			this.recordingInstance = null;
			this.currentState = "idle";
			this.notifyListeners(); // Notify all components that recording has stopped
		}
		// If instance doesn't match, silently ignore - this prevents component conflicts
	}

	/**
	 * Gets the current recording state machine state.
	 * Useful for debugging and advanced state management.
	 */
	getCurrentState(): RecordingState {
		return this.currentState;
	}

	/**
	 * Public query method for checking if any recording is currently active.
	 * Used by UI components to determine whether to show recording indicators,
	 * disable record buttons, etc.
	 */
	isRecording(): boolean {
		return this.recordingInstance !== null;
	}

	/**
	 * Checks if a specific component is the one currently recording.
	 * Essential for components to determine if they should show "stop" vs "start" buttons,
	 * and for managing component-specific recording state.
	 */
	isRecordingInstance(instance: object): boolean {
		return this.recordingInstance === instance;
	}

	/**
	 * Subscribe to recording state changes using the Observer pattern.
	 *
	 * UI components use this to receive real-time updates when recording state changes,
	 * allowing them to update their interfaces immediately (e.g., change button text,
	 * show/hide recording indicators, disable controls while another component is recording).
	 *
	 * @param listener Callback function that receives (isRecording, instanceId) when state changes
	 * @returns Unsubscribe function - call this to stop receiving notifications (prevents memory leaks)
	 */
	subscribe(listener: GlobalStateListener): UnsubscribeFunction {
		this.listeners.add(listener);

		// Return cleanup function following React/modern JS patterns
		// This makes it easy for components to clean up: const unsub = globalState.subscribe(...); unsub();
		return () => this.listeners.delete(listener);
	}

	/**
	 * Internal method to notify all subscribed components about state changes.
	 * Called automatically after any state mutation (start/stop recording).
	 *
	 * Uses for...of loop for performance as recommended by Biome linter,
	 * and to ensure proper iteration over the Set.
	 */
	private notifyListeners(): void {
		const stateInfo = {
			isRecording: this.recordingInstance !== null,
			recordingInstance: this.recordingInstance,
			state: this.currentState,
		};

		for (const listener of this.listeners) {
			listener(stateInfo);
		}
	}

	/**
	 * Cleanup method called during plugin unload to prevent memory leaks.
	 *
	 * Stops any active recording and removes all listeners to ensure proper
	 * garbage collection. Essential for plugin reload scenarios and preventing
	 * orphaned references.
	 */
	destroy(): void {
		this.recordingInstance = null;
		this.currentState = "idle";
		this.listeners.clear();
	}
}
