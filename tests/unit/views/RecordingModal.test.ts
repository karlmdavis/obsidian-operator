import { afterEach, beforeEach, expect, test } from "bun:test";

/**
 * Test suite for RecordingModal patterns - testing the architectural patterns
 * used by the modal without importing the actual modal class.
 *
 * Since RecordingModal imports from 'obsidian' which isn't available in test environment,
 * we test the core patterns it implements:
 * - Dual-state coordination between Global and Local recording states
 * - Keyboard shortcut registration and handling patterns
 * - Modal lifecycle and cleanup patterns
 * - UI state synchronization patterns
 */

// Use require() to avoid Obsidian package resolution issues in test environment
const { MockApp, MockModal, MockScope } = require("../../mocks/obsidian.js");
const { GlobalRecordingState } = require("../../../src/services/GlobalRecordingState.js");
const { LocalRecordingState } = require("../../../src/services/LocalRecordingState.js");

// Reserved for future modal scope management tests
void MockScope;

// Test fixtures
// biome-ignore lint: Mock objects require any type for flexible test data
let mockApp: any;
// biome-ignore lint: Mock objects require any type for flexible test data
let globalState: any;
// biome-ignore lint: Mock objects require any type for flexible test data
let localState: any;
// biome-ignore lint: Mock objects require any type for flexible test data
let mockModal: any;

beforeEach(() => {
	// Create fresh instances for each test to prevent state pollution
	mockApp = new MockApp();
	globalState = new GlobalRecordingState();
	localState = new LocalRecordingState("modal-test-123");
	mockModal = new MockModal(mockApp);
});

afterEach(() => {
	// Clean up state to prevent memory leaks
	if (localState) {
		localState.destroy();
		localState = null;
	}
	if (globalState) {
		globalState.destroy();
		globalState = null;
	}
});

test("Modal pattern: unique instance ID generation", () => {
	// Test the pattern used by RecordingModal for creating unique instance IDs
	const timestamp1 = Date.now();
	const timestamp2 = Date.now() + 1;

	const instanceId1 = `modal-${timestamp1}`;
	const instanceId2 = `modal-${timestamp2}`;

	// Should follow modal-{timestamp} pattern
	expect(instanceId1).toMatch(/^modal-\d+$/);
	expect(instanceId2).toMatch(/^modal-\d+$/);

	// Should be unique
	expect(instanceId1).not.toBe(instanceId2);
});

test("Modal pattern: dual-state coordination", () => {
	// Test the core pattern: global state coordination with local state
	const modalInstanceId = "modal-test-456";
	const modalLocalState = new LocalRecordingState(modalInstanceId);

	// Initially, no recording should be active
	expect(globalState.isRecording()).toBe(false);
	expect(modalLocalState.getState().isRecording).toBe(false);

	// Simulate modal record button logic
	const canRecord = globalState.tryStartRecording(modalInstanceId);
	if (canRecord) {
		modalLocalState.startRecording();
	}

	// Both states should now show recording
	expect(globalState.isRecording()).toBe(true);
	expect(modalLocalState.getState().isRecording).toBe(true);

	// Simulate stop button logic
	modalLocalState.stopRecording();
	globalState.stopRecording(modalInstanceId);

	// Both states should show stopped
	expect(globalState.isRecording()).toBe(false);
	expect(modalLocalState.getState().isRecording).toBe(false);

	// Cleanup
	modalLocalState.destroy();
});

test("Modal pattern: prevents concurrent recordings", () => {
	// Test the pattern for preventing concurrent recordings across multiple modal instances
	const modalId1 = "modal-test-001";
	const modalId2 = "modal-test-002";

	const localState1 = new LocalRecordingState(modalId1);
	const localState2 = new LocalRecordingState(modalId2);

	// First modal gets recording permission
	const canRecord1 = globalState.tryStartRecording(modalId1);
	if (canRecord1) {
		localState1.startRecording();
	}
	expect(globalState.isRecording()).toBe(true);
	expect(localState1.getState().isRecording).toBe(true);

	// Second modal should be blocked
	const canRecord2 = globalState.tryStartRecording(modalId2);
	expect(canRecord2).toBe(false);
	expect(globalState.isRecordingInstance(modalId1)).toBe(true);
	expect(globalState.isRecordingInstance(modalId2)).toBe(false);

	// UI pattern: second modal should show disabled state
	const modal2CanRecord = !globalState.isRecording() || globalState.isRecordingInstance(modalId2);
	expect(modal2CanRecord).toBe(false);

	// Cleanup
	localState1.stopRecording();
	globalState.stopRecording(modalId1);
	localState1.destroy();
	localState2.destroy();
});

test("Modal pattern: keyboard shortcuts handling", () => {
	// Test the pattern for registering and handling keyboard shortcuts
	const scope = mockModal.scope;

	let recordActionTriggered = false;
	let stopActionTriggered = false;

	// Simulate registering shortcuts like RecordingModal does
	scope.register(["Mod"], "Enter", () => {
		// Simulate record/stop toggle logic
		if (!globalState.isRecording()) {
			const canStart = globalState.tryStartRecording(localState.getId());
			if (canStart) {
				localState.startRecording();
				recordActionTriggered = true;
			}
		} else if (globalState.isRecordingInstance(localState.getId())) {
			localState.stopRecording();
			globalState.stopRecording(localState.getId());
			stopActionTriggered = true;
		}
	});

	// Test Enter shortcut triggers record
	const enterShortcut = scope.getShortcut(["Mod"], "Enter");
	expect(enterShortcut).toBeTruthy();

	enterShortcut.callback();
	expect(recordActionTriggered).toBe(true);
	expect(globalState.isRecording()).toBe(true);

	// Test Enter shortcut again triggers stop
	enterShortcut.callback();
	expect(stopActionTriggered).toBe(true);
	expect(globalState.isRecording()).toBe(false);
});

test("Modal pattern: escape shortcut stops and closes", () => {
	// Test the pattern for escape shortcut handling
	const scope = mockModal.scope;
	let modalClosed = false;

	// Start recording first
	globalState.tryStartRecording(localState.getId());
	localState.startRecording();
	expect(globalState.isRecording()).toBe(true);

	// Register escape shortcut pattern
	scope.register(["Mod"], "Escape", () => {
		if (globalState.isRecordingInstance(localState.getId())) {
			localState.stopRecording();
			globalState.stopRecording(localState.getId());
		}
		modalClosed = true; // Simulate modal.close()
	});

	// Trigger escape shortcut
	const escapeShortcut = scope.getShortcut(["Mod"], "Escape");
	expect(escapeShortcut).toBeTruthy();

	escapeShortcut.callback();

	// Should stop recording and close modal
	expect(globalState.isRecording()).toBe(false);
	expect(modalClosed).toBe(true);
});

test("Modal pattern: cleanup and resource management", () => {
	// Test the cleanup patterns used by RecordingModal
	const modalLocalState = new LocalRecordingState("modal-cleanup-test");
	const globalListenerRemoved = false;
	const localListenerRemoved = false;

	// Reserved for future listener cleanup verification
	void globalListenerRemoved;
	void localListenerRemoved;

	// Start recording to create resources that need cleanup
	globalState.tryStartRecording(modalLocalState.getId());
	modalLocalState.startRecording();
	expect(globalState.isRecording()).toBe(true);

	// Simulate listener subscription pattern
	const unsubGlobal = globalState.subscribe(() => {});
	const unsubLocal = modalLocalState.subscribe(() => {});

	// Simulate modal close cleanup pattern
	if (globalState.isRecordingInstance(modalLocalState.getId())) {
		modalLocalState.stopRecording();
		globalState.stopRecording(modalLocalState.getId());
	}

	// Cleanup listeners
	unsubGlobal();
	unsubLocal();
	modalLocalState.destroy();

	// Recording should be stopped after cleanup
	expect(globalState.isRecording()).toBe(false);
});

test("Modal pattern: state observer synchronization", () => {
	// Test the observer pattern used for state synchronization
	let globalNotifications = 0;
	let localNotifications = 0;

	// Subscribe to state changes like RecordingModal does
	const unsubGlobal = globalState.subscribe(() => {
		globalNotifications++;
	});

	const unsubLocal = localState.subscribe(() => {
		localNotifications++;
	});

	// Start recording - should trigger notifications
	globalState.tryStartRecording(localState.getId());
	localState.startRecording();

	// Both observers should have been notified
	expect(globalNotifications).toBeGreaterThan(0);
	expect(localNotifications).toBeGreaterThan(0);

	// Stop recording - should trigger more notifications
	const previousGlobal = globalNotifications;
	const previousLocal = localNotifications;

	localState.stopRecording();
	globalState.stopRecording(localState.getId());

	expect(globalNotifications).toBeGreaterThan(previousGlobal);
	expect(localNotifications).toBeGreaterThan(previousLocal);

	// Cleanup
	unsubGlobal();
	unsubLocal();
});

test("Modal pattern: external state change handling", () => {
	// Test how modal handles external global state changes
	const modalId = "modal-external-test";
	const modalLocalState = new LocalRecordingState(modalId);

	// Initially modal can record
	let canRecord = !globalState.isRecording() || globalState.isRecordingInstance(modalId);
	expect(canRecord).toBe(true);

	// External component starts recording
	globalState.tryStartRecording("external-component");

	// Modal should now be blocked
	canRecord = !globalState.isRecording() || globalState.isRecordingInstance(modalId);
	expect(canRecord).toBe(false);
	expect(globalState.isRecording()).toBe(true);
	expect(globalState.isRecordingInstance(modalId)).toBe(false);

	// Stop external recording
	globalState.stopRecording("external-component");

	// Modal should be able to record again
	canRecord = !globalState.isRecording() || globalState.isRecordingInstance(modalId);
	expect(canRecord).toBe(true);
	expect(globalState.isRecording()).toBe(false);

	// Cleanup
	modalLocalState.destroy();
});

test("Modal pattern: error resilience in double operations", () => {
	// Test patterns for handling double open/close operations safely
	const modal = new MockModal(mockApp);

	// Opening twice should not cause errors
	modal.open();
	expect(modal.isOpen).toBe(true);

	modal.open(); // Second open should be safe
	expect(modal.isOpen).toBe(true);

	// Closing twice should not cause errors
	modal.close();
	expect(modal.isOpen).toBe(false);

	modal.close(); // Second close should be safe
	expect(modal.isOpen).toBe(false);
});

test("Modal pattern: UI props calculation logic", () => {
	// Test the logic used to calculate RecordingUI props
	const modalId = "modal-ui-props-test";
	const modalLocalState = new LocalRecordingState(modalId);

	// Test initial state calculation
	const isGlobalRecording = globalState.isRecording();
	const isLocalRecording = globalState.isRecordingInstance(modalId);
	const canRecord = !isGlobalRecording || isLocalRecording;

	expect(isGlobalRecording).toBe(false);
	expect(isLocalRecording).toBe(false);
	expect(canRecord).toBe(true);

	// Test state during recording
	globalState.tryStartRecording(modalId);
	modalLocalState.startRecording();

	const recordingGlobal = globalState.isRecording();
	const recordingLocal = globalState.isRecordingInstance(modalId);
	const canRecordWhileActive = !recordingGlobal || recordingLocal;

	expect(recordingGlobal).toBe(true);
	expect(recordingLocal).toBe(true);
	expect(canRecordWhileActive).toBe(true);

	// Test state when other instance is recording
	const otherId = "other-modal-123";
	globalState.stopRecording(modalId);
	modalLocalState.stopRecording();
	globalState.tryStartRecording(otherId);

	const blockedGlobal = globalState.isRecording();
	const blockedLocal = globalState.isRecordingInstance(modalId);
	const canRecordWhenBlocked = !blockedGlobal || blockedLocal;

	expect(blockedGlobal).toBe(true);
	expect(blockedLocal).toBe(false);
	expect(canRecordWhenBlocked).toBe(false);

	// Cleanup
	globalState.stopRecording(otherId);
	modalLocalState.destroy();
});
