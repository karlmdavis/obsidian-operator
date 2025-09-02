import { afterEach, beforeEach, expect, test } from "bun:test";

/**
 * Integration tests for RecordingModal patterns
 *
 * Since RecordingModal imports from 'obsidian' which isn't available in test environment,
 * we test the architectural patterns it implements by creating a mock implementation
 * that follows the same patterns as the actual RecordingModal class.
 */

// Dynamic imports for TypeScript mock compatibility
const { MockApp, MockModal, MockScope } = await import("../../mocks/obsidian.js");
const { GlobalRecordingState } = await import("../../../src/services/GlobalRecordingState.js");
const { LocalRecordingState } = await import("../../../src/services/LocalRecordingState.js");
const { RecordingUI } = await import("../../../src/components/RecordingUI.js");

/**
 * Mock implementation of RecordingModal that follows the same patterns as the real class
 * This allows us to test the core functionality without importing the actual class
 */
class MockRecordingModal extends MockModal {
	recordingUI: any = null;
	globalState: any;
	localState: any;
	unsubscribeGlobal: (() => void) | null = null;
	unsubscribeLocal: (() => void) | null = null;

	constructor(app: any, globalState: any) {
		super(app);
		this.globalState = globalState;
		this.localState = new LocalRecordingState();
	}

	onOpen(): void {
		const { contentEl } = this;
		contentEl.createEl("h2", { text: "Obsidian Operator" });

		const uiContainer = contentEl.createEl("div", {
			cls: "operator-modal-container",
		});

		// Create callbacks for the UI (same pattern as RecordingModal)
		const callbacks = {
			onRecord: () => {
				if (this.globalState.tryStartRecording(this.localState)) {
					this.localState.startRecording();
				}
			},
			onStop: () => {
				this.localState.stopRecording();
				this.globalState.stopRecording(this.localState);
			},
		};

		// Initialize UI with current state (same pattern as RecordingModal)
		const updateUI = () => {
			if (this.recordingUI) {
				const localStateData = this.localState.getState();
				const isGlobalRecording = this.globalState.isRecording();
				const isLocalRecording = this.globalState.isRecordingInstance(this.localState);

				this.recordingUI.updateProps({
					isLocalRecording,
					isGlobalRecording,
					canRecord: !isGlobalRecording || isLocalRecording,
					durationDisplay: localStateData.formattedDuration,
					randomsDisplay: localStateData.formattedRandoms,
					callbacks,
				});
			}
		};

		// Create initial UI
		const localStateData = this.localState.getState();
		const isGlobalRecording = this.globalState.isRecording();
		const isLocalRecording = this.globalState.isRecordingInstance(this.localState);

		this.recordingUI = new RecordingUI(uiContainer as any, {
			isLocalRecording,
			isGlobalRecording,
			canRecord: !isGlobalRecording,
			durationDisplay: localStateData.formattedDuration,
			randomsDisplay: localStateData.formattedRandoms,
			callbacks,
		});

		// Subscribe to state changes (same pattern as RecordingModal)
		this.unsubscribeGlobal = this.globalState.subscribe(() => updateUI());
		this.unsubscribeLocal = this.localState.subscribe(() => updateUI());

		// Add keyboard shortcuts (same pattern as RecordingModal)
		this.scope.register(["Mod"], "Enter", () => {
			if (!this.globalState.isRecording()) {
				if (this.globalState.tryStartRecording(this.localState)) {
					this.localState.startRecording();
				}
			} else if (this.globalState.isRecordingInstance(this.localState)) {
				this.localState.stopRecording();
				this.globalState.stopRecording(this.localState);
			}
		});

		this.scope.register(["Mod"], "Escape", () => {
			if (this.globalState.isRecordingInstance(this.localState)) {
				this.localState.stopRecording();
				this.globalState.stopRecording(this.localState);
			}
			this.close();
		});
	}

	onClose(): void {
		// Stop recording if this modal was recording (same pattern as RecordingModal)
		if (this.globalState.isRecordingInstance(this.localState)) {
			this.localState.stopRecording();
			this.globalState.stopRecording(this.localState);
		}

		if (this.recordingUI) {
			this.recordingUI.destroy();
			this.recordingUI = null;
		}

		if (this.unsubscribeGlobal) {
			this.unsubscribeGlobal();
			this.unsubscribeGlobal = null;
		}

		if (this.unsubscribeLocal) {
			this.unsubscribeLocal();
			this.unsubscribeLocal = null;
		}

		this.localState.destroy();

		const { contentEl } = this;
		contentEl.empty();
	}
}

// Test fixtures
let mockApp: any;
let globalState: any;
let recordingModal: MockRecordingModal;

beforeEach(() => {
	// Create fresh instances for each test to prevent state pollution
	mockApp = new MockApp();
	globalState = new GlobalRecordingState();
	recordingModal = new MockRecordingModal(mockApp, globalState);
});

afterEach(() => {
	// Clean up state to prevent memory leaks
	if (recordingModal.isOpen) {
		recordingModal.close();
	}

	if (globalState) {
		globalState.destroy();
		globalState = null;
	}
});

test("RecordingModal constructor initializes correctly", () => {
	expect(recordingModal).toBeTruthy();
	expect(recordingModal.app).toBe(mockApp);
	expect(recordingModal.isOpen).toBe(false);

	// Modal should have required properties
	expect(recordingModal.contentEl).toBeTruthy();
	expect(recordingModal.scope).toBeTruthy();
});

test("RecordingModal onOpen creates UI components", () => {
	recordingModal.open();

	expect(recordingModal.isOpen).toBe(true);

	// Should create title element
	const contentChildren = recordingModal.contentEl.getChildren();
	expect(contentChildren.length).toBeGreaterThan(0);

	// Should have created the header
	const titleElement = contentChildren.find((child: any) => child.textContent === "Obsidian Operator");
	expect(titleElement).toBeTruthy();

	// Should have created UI container
	const uiContainer = contentChildren.find((child: any) => child.hasClass("operator-modal-container"));
	expect(uiContainer).toBeTruthy();
});

test("RecordingModal keyboard shortcuts are registered", () => {
	recordingModal.open();

	// Should register Enter shortcut for record/stop toggle
	const enterShortcut = recordingModal.scope.getShortcut(["Mod"], "Enter");
	expect(enterShortcut).toBeTruthy();
	expect(typeof enterShortcut.callback).toBe("function");

	// Should register Escape shortcut for stop and close
	const escapeShortcut = recordingModal.scope.getShortcut(["Mod"], "Escape");
	expect(escapeShortcut).toBeTruthy();
	expect(typeof escapeShortcut.callback).toBe("function");
});

test("RecordingModal Enter shortcut starts recording", () => {
	recordingModal.open();

	// Initially not recording
	expect(globalState.isRecording()).toBe(false);

	// Trigger Enter shortcut
	const enterShortcut = recordingModal.scope.getShortcut(["Mod"], "Enter");
	enterShortcut.callback();

	// Should start recording
	expect(globalState.isRecording()).toBe(true);
	expect(globalState.isRecordingInstance(recordingModal.localState)).toBe(true);
});

test("RecordingModal Enter shortcut stops recording when already recording", () => {
	recordingModal.open();

	// Start recording first
	const enterShortcut = recordingModal.scope.getShortcut(["Mod"], "Enter");
	enterShortcut.callback();
	expect(globalState.isRecording()).toBe(true);

	// Trigger Enter shortcut again to stop
	enterShortcut.callback();

	// Should stop recording
	expect(globalState.isRecording()).toBe(false);
	expect(globalState.isRecordingInstance(recordingModal.localState)).toBe(false);
});

test("RecordingModal Escape shortcut stops recording and closes modal", () => {
	recordingModal.open();

	// Start recording first
	globalState.tryStartRecording(recordingModal.localState);
	recordingModal.localState.startRecording();
	expect(globalState.isRecording()).toBe(true);

	// Trigger Escape shortcut
	const escapeShortcut = recordingModal.scope.getShortcut(["Mod"], "Escape");
	escapeShortcut.callback();

	// Should stop recording and close modal
	expect(globalState.isRecording()).toBe(false);
	expect(recordingModal.isOpen).toBe(false);
});

test("RecordingModal prevents concurrent recordings", () => {
	const otherInstance = "external-recorder";

	// External instance starts recording
	globalState.tryStartRecording(otherInstance);
	expect(globalState.isRecording()).toBe(true);

	recordingModal.open();

	// Modal should not be able to start recording
	const enterShortcut = recordingModal.scope.getShortcut(["Mod"], "Enter");
	enterShortcut.callback();

	// Global state should still be recording the external instance
	expect(globalState.isRecording()).toBe(true);
	expect(globalState.isRecordingInstance(otherInstance)).toBe(true);
	expect(globalState.isRecordingInstance(recordingModal.localState)).toBe(false);

	// Clean up
	globalState.stopRecording(otherInstance);
});

test("RecordingModal UI callbacks work correctly", () => {
	recordingModal.open();

	// Access the RecordingUI instance through the modal
	// Note: The UI callbacks are created in onOpen, so we need to trigger them indirectly

	// Initially not recording
	expect(globalState.isRecording()).toBe(false);

	// Simulate record button click via keyboard shortcut
	const enterShortcut = recordingModal.scope.getShortcut(["Mod"], "Enter");
	enterShortcut.callback();

	// Should start recording
	expect(globalState.isRecording()).toBe(true);
	expect(recordingModal.localState.getState().isRecording).toBe(true);
});

test("RecordingModal local state updates correctly", () => {
	recordingModal.open();

	const initialState = recordingModal.localState.getState();
	expect(initialState.isRecording).toBe(false);
	expect(initialState.elapsedSeconds).toBe(0);

	// Start recording
	globalState.tryStartRecording(recordingModal.localState);
	recordingModal.localState.startRecording();

	// Local state should reflect recording
	const recordingState = recordingModal.localState.getState();
	expect(recordingState.isRecording).toBe(true);
	expect(recordingState.formattedDuration).toBeTruthy();
	expect(typeof recordingState.formattedRandoms).toBe("string");
});

test("RecordingModal onClose cleans up properly", () => {
	recordingModal.open();

	// Start recording
	globalState.tryStartRecording(recordingModal.localState);
	recordingModal.localState.startRecording();
	expect(globalState.isRecording()).toBe(true);

	// Close modal
	recordingModal.close();

	// Should stop recording and clean up
	expect(globalState.isRecording()).toBe(false);
	expect(recordingModal.isOpen).toBe(false);

	// Content should be emptied
	expect(recordingModal.contentEl.getChildren().length).toBe(0);
	expect(recordingModal.contentEl.textContent).toBe("");
});

test("RecordingModal handles multiple open/close cycles", () => {
	// First cycle
	recordingModal.open();
	expect(recordingModal.isOpen).toBe(true);
	recordingModal.close();
	expect(recordingModal.isOpen).toBe(false);

	// Second cycle
	recordingModal.open();
	expect(recordingModal.isOpen).toBe(true);

	// Should recreate UI components
	const contentChildren = recordingModal.contentEl.getChildren();
	expect(contentChildren.length).toBeGreaterThan(0);

	recordingModal.close();
	expect(recordingModal.isOpen).toBe(false);
});

test("RecordingModal state observers work correctly", () => {
	recordingModal.open();

	// We can't directly access updateUI since it's a local function in the MockRecordingModal

	// We can't directly access updateUI, but we can test that state changes trigger updates
	// by verifying the recording state changes are reflected

	// Start recording
	globalState.tryStartRecording(recordingModal.localState);
	recordingModal.localState.startRecording();

	// State should be updated
	expect(globalState.isRecording()).toBe(true);
	expect(recordingModal.localState.getState().isRecording).toBe(true);

	// Stop recording
	recordingModal.localState.stopRecording();
	globalState.stopRecording(recordingModal.localState);

	// State should be updated again
	expect(globalState.isRecording()).toBe(false);
	expect(recordingModal.localState.getState().isRecording).toBe(false);
});

test("RecordingModal handles external global state changes", () => {
	recordingModal.open();

	// Initially modal can record
	expect(globalState.isRecording()).toBe(false);

	// External component starts recording
	const externalId = "external-component";
	globalState.tryStartRecording(externalId);

	// Modal should be blocked from recording
	const enterShortcut = recordingModal.scope.getShortcut(["Mod"], "Enter");
	enterShortcut.callback();

	// Modal should not have started recording
	expect(globalState.isRecording()).toBe(true);
	expect(globalState.isRecordingInstance(externalId)).toBe(true);
	expect(globalState.isRecordingInstance(recordingModal.localState)).toBe(false);

	// Stop external recording
	globalState.stopRecording(externalId);

	// Now modal should be able to record
	enterShortcut.callback();
	expect(globalState.isRecordingInstance(recordingModal.localState)).toBe(true);
});

test("RecordingModal error handling - double close", () => {
	recordingModal.open();
	recordingModal.close();

	// Second close should not throw
	expect(() => {
		recordingModal.close();
	}).not.toThrow();

	expect(recordingModal.isOpen).toBe(false);
});

test("RecordingModal error handling - operations on closed modal", () => {
	// Operations on unopened modal should not throw
	expect(() => {
		const escapeShortcut = recordingModal.scope?.getShortcut?.(["Mod"], "Escape");
		// Shortcut shouldn't exist on unopened modal, but accessing it shouldn't crash
		expect(escapeShortcut).toBeUndefined();
	}).not.toThrow();
});
