/**
 * Type definitions for recording views.
 *
 * These types define the contracts between view components and their
 * underlying recording logic, enabling separation of presentation from business logic.
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
