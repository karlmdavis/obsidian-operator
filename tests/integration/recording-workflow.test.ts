import { afterEach, beforeEach, expect, test } from "bun:test";

/**
 * Integration tests for the complete recording workflow.
 *
 * These tests verify that all components work together correctly:
 * - GlobalRecordingState coordinates multiple UI instances
 * - LocalRecordingState manages individual recording sessions
 * - RecordingUI displays correct state based on service data
 * - Complete end-to-end recording workflows function as expected
 *
 * Unlike unit tests that focus on individual components, these integration
 * tests verify the interactions between components match the intended
 * architectural patterns.
 */

// Use require() to avoid Obsidian package resolution issues in test environment
const { GlobalRecordingState } = require("../../src/services/GlobalRecordingState.js");
const { LocalRecordingState } = require("../../src/services/LocalRecordingState.js");

// Mock DOM environment for RecordingUI testing
class MockHTMLElement {
	private children: MockHTMLElement[] = [];
	private attributes: Record<string, string> = {};
	private classes: string[] = [];
	public textContent = "";
	public disabled = false;
	public onclick: (() => void) | null = null;
	public title = "";

	createEl(tagName: string, options?: { cls?: string; text?: string }): MockHTMLElement {
		const element = new MockHTMLElement();
		if (options?.cls) {
			element.classes = options.cls.split(" ");
		}
		if (options?.text) {
			element.textContent = options.text;
		}
		this.children.push(element);
		return element;
	}

	empty(): void {
		this.children = [];
		this.textContent = "";
	}

	addClass(className: string): void {
		if (!this.classes.includes(className)) {
			this.classes.push(className);
		}
	}

	get classList() {
		return {
			add: (className: string) => this.addClass(className),
			contains: (className: string) => this.classes.includes(className),
		};
	}

	setAttribute(name: string, value: string): void {
		this.attributes[name] = value;
	}

	getAttribute(name: string): string | null {
		return this.attributes[name] || null;
	}

	hasClass(className: string): boolean {
		return this.classes.includes(className);
	}

	getChildren(): MockHTMLElement[] {
		return this.children;
	}

	click(): void {
		if (this.onclick && !this.disabled) {
			this.onclick();
		}
	}
}

// biome-ignore lint: Mock environment requires any types
const { RecordingUI } = require("../../src/components/RecordingUI.js") as any;

// Test fixtures
// biome-ignore lint: Mock state objects require any type for flexible test data
let globalState: any;
let container: MockHTMLElement;

beforeEach(() => {
	globalState = new GlobalRecordingState();
	container = new MockHTMLElement();
});

afterEach(() => {
	if (globalState) {
		globalState.destroy();
	}
});

test("Integration: Single UI instance complete recording workflow", () => {
	// Create a complete recording setup with all components
	const instanceId = "integration-test-1";
	const localState = new LocalRecordingState(instanceId);

	// biome-ignore lint: Mock UI component requires any type for flexible test interfaces
	let recordingUI: any;
	const callbacksTriggered = { record: 0, stop: 0 };

	// Create callbacks that coordinate between states (like modal/view do)
	const callbacks = {
		onRecord: () => {
			callbacksTriggered.record++;
			if (globalState.tryStartRecording(instanceId)) {
				localState.startRecording();
			}
		},
		onStop: () => {
			callbacksTriggered.stop++;
			localState.stopRecording();
			globalState.stopRecording(instanceId);
		},
	};

	// Create initial UI props based on current state
	const createUIProps = () => {
		const localStateData = localState.getState();
		const isGlobalRecording = globalState.isRecording();
		const isLocalRecording = globalState.isRecordingInstance(instanceId);

		return {
			isLocalRecording,
			isGlobalRecording,
			canRecord: !isGlobalRecording || isLocalRecording,
			durationDisplay: localStateData.formattedDuration,
			randomsDisplay: localStateData.formattedRandoms,
			callbacks,
		};
	};

	// Create UI with initial state
	recordingUI = new RecordingUI(container, createUIProps());

	// Verify initial state
	expect(globalState.isRecording()).toBe(false);
	expect(localState.getState().isRecording).toBe(false);
	expect(recordingUI.getButton().disabled).toBe(false);
	expect(recordingUI.getDurationElement().textContent).toBe("00:00");

	// Start recording by clicking UI button
	recordingUI.getButton().click();

	// Verify recording started
	expect(callbacksTriggered.record).toBe(1);
	expect(globalState.isRecording()).toBe(true);
	expect(localState.getState().isRecording).toBe(true);
	expect(globalState.isRecordingInstance(instanceId)).toBe(true);

	// Update UI with new state
	recordingUI.updateProps(createUIProps());

	// Verify UI reflects recording state
	expect(recordingUI.getButton().hasClass("recording")).toBe(true);

	// Stop recording by finding and clicking stop button
	const stopButton = container.getChildren().find((child) => child.hasClass("operator-stop-button"));
	expect(stopButton).toBeTruthy();

	stopButton!.click();

	// Verify recording stopped
	expect(callbacksTriggered.stop).toBe(1);
	expect(globalState.isRecording()).toBe(false);
	expect(localState.getState().isRecording).toBe(false);

	// Cleanup
	recordingUI.destroy();
	localState.destroy();
});

test("Integration: Multi-instance coordination prevents conflicts", () => {
	// Create two complete UI instances to test coordination
	const instance1Id = "integration-multi-1";
	const instance2Id = "integration-multi-2";

	const localState1 = new LocalRecordingState(instance1Id);
	const localState2 = new LocalRecordingState(instance2Id);

	const container1 = new MockHTMLElement();
	const container2 = new MockHTMLElement();

	let ui1RecordAttempts = 0;
	let ui2RecordAttempts = 0;

	// Create callbacks for first instance
	const callbacks1 = {
		onRecord: () => {
			ui1RecordAttempts++;
			if (globalState.tryStartRecording(instance1Id)) {
				localState1.startRecording();
			}
		},
		onStop: () => {
			localState1.stopRecording();
			globalState.stopRecording(instance1Id);
		},
	};

	// Create callbacks for second instance
	const callbacks2 = {
		onRecord: () => {
			ui2RecordAttempts++;
			if (globalState.tryStartRecording(instance2Id)) {
				localState2.startRecording();
			}
		},
		onStop: () => {
			localState2.stopRecording();
			globalState.stopRecording(instance2Id);
		},
	};

	// Helper to create UI props
	// biome-ignore lint: Mock state objects require any type for flexible test data
	const createProps = (instanceId: string, localState: any) => {
		const localStateData = localState.getState();
		const isGlobalRecording = globalState.isRecording();
		const isLocalRecording = globalState.isRecordingInstance(instanceId);

		return {
			isLocalRecording,
			isGlobalRecording,
			canRecord: !isGlobalRecording || isLocalRecording,
			durationDisplay: localStateData.formattedDuration,
			randomsDisplay: localStateData.formattedRandoms,
			callbacks: instanceId === instance1Id ? callbacks1 : callbacks2,
		};
	};

	// Create both UIs
	const ui1 = new RecordingUI(container1, createProps(instance1Id, localState1));
	const ui2 = new RecordingUI(container2, createProps(instance2Id, localState2));

	// First UI starts recording successfully
	ui1.getButton().click();
	expect(ui1RecordAttempts).toBe(1);
	expect(globalState.isRecording()).toBe(true);
	expect(localState1.getState().isRecording).toBe(true);

	// Update UI states
	ui1.updateProps(createProps(instance1Id, localState1));
	ui2.updateProps(createProps(instance2Id, localState2));

	// Second UI should be disabled
	expect(ui2.getButton().disabled).toBe(true);
	expect(ui2.getButton().hasClass("disabled")).toBe(true);

	// Second UI attempts to record but fails
	ui2.getButton().click(); // This should do nothing because button is disabled
	expect(ui2RecordAttempts).toBe(0); // Click handler not called when disabled
	expect(localState2.getState().isRecording).toBe(false);

	// First UI stops recording
	const stopButton1 = container1.getChildren().find((child) => child.hasClass("operator-stop-button"));
	stopButton1!.click();

	expect(globalState.isRecording()).toBe(false);
	expect(localState1.getState().isRecording).toBe(false);

	// Update UI states after recording stopped
	ui1.updateProps(createProps(instance1Id, localState1));
	ui2.updateProps(createProps(instance2Id, localState2));

	// Now second UI can record
	expect(ui2.getButton().disabled).toBe(false);
	ui2.getButton().click();

	expect(ui2RecordAttempts).toBe(1);
	expect(globalState.isRecording()).toBe(true);
	expect(localState2.getState().isRecording).toBe(true);
	expect(globalState.isRecordingInstance(instance2Id)).toBe(true);

	// Cleanup
	localState2.stopRecording();
	globalState.stopRecording(instance2Id);
	ui1.destroy();
	ui2.destroy();
	localState1.destroy();
	localState2.destroy();
});

test("Integration: State synchronization through observers", () => {
	// Test complete state synchronization workflow
	const instanceId = "integration-sync-test";
	const localState = new LocalRecordingState(instanceId);

	let globalStateChanges = 0;
	let localStateChanges = 0;
	let uiUpdates = 0;

	// Set up observers like real modal/view would
	// biome-ignore lint: Test requires any type for mock observers
	const globalUnsub = globalState.subscribe((stateInfo: any) => {
		globalStateChanges++;
		// In real app, this would trigger UI update
		uiUpdates++;
	});

	// biome-ignore lint: Test requires any type for mock observers
	const localUnsub = localState.subscribe((stateUpdate: any) => {
		localStateChanges++;
		// In real app, this would trigger UI update
		uiUpdates++;
	});

	// Initial subscription doesn't trigger immediate notifications
	expect(globalStateChanges).toBe(0);
	expect(localStateChanges).toBe(0);
	expect(uiUpdates).toBe(0);

	// Start recording - should trigger both observers
	globalState.tryStartRecording(instanceId);
	localState.startRecording();

	// Both state managers should have notified observers
	expect(globalStateChanges).toBe(1);
	expect(localStateChanges).toBe(1);
	expect(uiUpdates).toBe(2); // One from each state manager

	// Simulate timer tick (LocalRecordingState has internal timer)
	// In real scenario, timer would trigger more local state changes

	// Stop recording - should trigger more notifications
	const prevGlobalChanges = globalStateChanges;
	const prevLocalChanges = localStateChanges;
	const prevUIUpdates = uiUpdates;

	localState.stopRecording();
	globalState.stopRecording(instanceId);

	expect(globalStateChanges).toBe(prevGlobalChanges + 1);
	expect(localStateChanges).toBe(prevLocalChanges + 1);
	expect(uiUpdates).toBe(prevUIUpdates + 2);

	// Cleanup
	globalUnsub();
	localUnsub();
	localState.destroy();
});

test("Integration: Error handling and resilience", () => {
	// Test system handles edge cases gracefully
	const instanceId = "integration-error-test";
	const localState = new LocalRecordingState(instanceId);

	// Attempt to stop recording before starting
	localState.stopRecording();
	globalState.stopRecording(instanceId);

	// Should not throw errors and system should remain stable
	expect(globalState.isRecording()).toBe(false);
	expect(localState.getState().isRecording).toBe(false);

	// Start recording twice
	const success1 = globalState.tryStartRecording(instanceId);
	localState.startRecording();
	expect(success1).toBe(true);

	localState.startRecording(); // Second start should be safe
	const success2 = globalState.tryStartRecording(instanceId); // Should fail
	expect(success2).toBe(false);
	expect(globalState.isRecording()).toBe(true);

	// Stop recording twice
	localState.stopRecording();
	globalState.stopRecording(instanceId);
	expect(globalState.isRecording()).toBe(false);

	localState.stopRecording(); // Second stop should be safe
	globalState.stopRecording(instanceId); // Should be safe
	expect(globalState.isRecording()).toBe(false);

	// Cleanup
	localState.destroy();
});
