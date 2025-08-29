import { afterEach, beforeEach, expect, test } from "bun:test";

/**
 * Test suite for main plugin functionality using mocked components.
 *
 * Since the main plugin class has direct imports from 'obsidian' package
 * which doesn't exist in the test environment, we test the plugin's
 * core functionality through integration with its services and components.
 *
 * These tests verify:
 * - Service initialization and coordination
 * - State management between global and local recording states
 * - Component interaction patterns
 * - Cleanup and lifecycle management
 */

// Use require() to avoid Obsidian package resolution issues in test environment
const { MockApp, MockPlugin, MockWorkspaceLeaf } = require("../mocks/obsidian.js");
const { GlobalRecordingState } = require("../../src/services/GlobalRecordingState.js");
const { LocalRecordingState } = require("../../src/services/LocalRecordingState.js");

// Test fixtures
// biome-ignore lint: Mock objects require any type for flexible test data
let mockApp: any;
// biome-ignore lint: Mock objects require any type for flexible test data
let mockPlugin: any;

beforeEach(() => {
	// Create fresh mock instances for each test to prevent state pollution
	mockApp = new MockApp();
	mockPlugin = new MockPlugin(mockApp);
});

afterEach(() => {
	// No specific cleanup needed for these tests as we're testing components in isolation
});

test("GlobalRecordingState can be instantiated", () => {
	// Test that the core global state service can be created
	const globalState = new GlobalRecordingState();

	expect(globalState).toBeTruthy();
	expect(typeof globalState.tryStartRecording).toBe("function");
	expect(typeof globalState.stopRecording).toBe("function");
	expect(typeof globalState.isRecording).toBe("function");
	expect(typeof globalState.subscribe).toBe("function");

	// Clean up
	globalState.destroy();
});

test("LocalRecordingState can be instantiated", () => {
	// Test that local recording state can be created with proper ID
	const instanceId = "test-instance-123";
	const localState = new LocalRecordingState(instanceId);

	expect(localState).toBeTruthy();
	expect(localState.getId()).toBe(instanceId);
	expect(typeof localState.startRecording).toBe("function");
	expect(typeof localState.stopRecording).toBe("function");
	expect(typeof localState.getState).toBe("function");

	// Clean up
	localState.destroy();
});

test("Plugin architecture coordination - Global state prevents concurrent recordings", () => {
	// Test the core architectural pattern: global state coordination
	const globalState = new GlobalRecordingState();
	const instance1 = new LocalRecordingState("instance-1");
	const instance2 = new LocalRecordingState("instance-2");

	// First instance should be able to start recording
	const canStart1 = globalState.tryStartRecording(instance1.getId());
	expect(canStart1).toBe(true);
	expect(globalState.isRecording()).toBe(true);
	expect(globalState.isRecordingInstance(instance1.getId())).toBe(true);

	// Second instance should be blocked
	const canStart2 = globalState.tryStartRecording(instance2.getId());
	expect(canStart2).toBe(false);
	expect(globalState.isRecordingInstance(instance2.getId())).toBe(false);

	// Clean up
	globalState.stopRecording(instance1.getId());
	globalState.destroy();
	instance1.destroy();
	instance2.destroy();
});

test("Plugin architecture coordination - Local state cleanup", () => {
	// Test that local state properly manages its resources
	const localState = new LocalRecordingState("test-instance");

	// Start recording to create interval timer
	localState.startRecording();
	expect(localState.getState().isRecording).toBe(true);

	// Stop recording should clean up
	localState.stopRecording();
	expect(localState.getState().isRecording).toBe(false);
	expect(localState.getState().elapsedSeconds).toBe(0);
	expect(localState.getState().randomNumbers).toHaveLength(0);

	// Destroy should not throw
	expect(() => {
		localState.destroy();
	}).not.toThrow();
});

test("Plugin services integration - State synchronization", () => {
	// Test how global and local states work together (plugin's core pattern)
	const globalState = new GlobalRecordingState();
	const localState = new LocalRecordingState("sync-test");

	let globalNotifications = 0;
	let localNotifications = 0;

	// Subscribe to state changes
	const globalUnsub = globalState.subscribe(() => {
		globalNotifications++;
	});

	const localUnsub = localState.subscribe(() => {
		localNotifications++;
	});

	// Simulate plugin workflow: global permission, then local start
	const canStart = globalState.tryStartRecording(localState.getId());
	if (canStart) {
		localState.startRecording();
	}

	// Verify both states are synchronized
	expect(globalState.isRecording()).toBe(true);
	expect(localState.getState().isRecording).toBe(true);
	expect(globalNotifications).toBeGreaterThan(0);
	expect(localNotifications).toBeGreaterThan(0);

	// Cleanup
	localState.stopRecording();
	globalState.stopRecording(localState.getId());
	globalUnsub();
	localUnsub();
	globalState.destroy();
	localState.destroy();
});

test("Mock Obsidian plugin integration", () => {
	// Test plugin mock integration patterns used throughout the codebase
	expect(mockPlugin.app).toBe(mockApp);
	expect(mockPlugin.app.workspace).toBeTruthy();

	// Test command registration (pattern used in main plugin)
	mockPlugin.addCommand({
		id: "test-command",
		name: "Test Command",
		callback: () => {},
	});

	const command = mockPlugin.getCommand("test-command");
	expect(command).toBeTruthy();
	expect(command?.name).toBe("Test Command");
});

test("Mock workspace leaf management", () => {
	// Test workspace management patterns (used in activateView method)
	const workspace = mockApp.workspace;

	// Test leaf creation
	const leaf = workspace.getLeaf();
	expect(leaf).toBeTruthy();

	// Test leaf type filtering
	const leaves = workspace.getLeavesOfType("test-view-type");
	expect(Array.isArray(leaves)).toBe(true);
});

test("Plugin lifecycle simulation", () => {
	// Simulate the plugin initialization pattern without importing the actual plugin
	const globalState = new GlobalRecordingState();

	// Simulate what onload() does
	expect(globalState).toBeTruthy();
	expect(globalState.isRecording()).toBe(false);

	// Simulate adding commands to mock plugin
	mockPlugin.addCommand({
		id: "open-operator-modal",
		name: "Operator Modal",
		callback: () => {
			// This would open RecordingModal with globalState
			expect(globalState).toBeTruthy();
		},
	});

	// Verify command is registered
	const modalCommand = mockPlugin.getCommand("open-operator-modal");
	expect(modalCommand).toBeTruthy();

	// Simulate onunload() cleanup
	globalState.destroy();
	expect(true).toBe(true); // If we get here, cleanup worked
});
