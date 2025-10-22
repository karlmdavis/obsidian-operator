import { expect, test } from "bun:test";
import { GlobalRecordingState } from "../../src/services/GlobalRecordingState.js";

test("GlobalRecordingState - initial state", () => {
	const state = new GlobalRecordingState();
	const testInstance: object = {};
	expect(state.isRecording()).toBe(false);
	expect(state.isRecordingInstance(testInstance)).toBe(false);
});

test("GlobalRecordingState - can start recording", () => {
	const state = new GlobalRecordingState();
	const instance1: object = {};

	const result = state.tryStartRecording(instance1);
	expect(result).toBe(true);
	expect(state.isRecording()).toBe(true);
	expect(state.isRecordingInstance(instance1)).toBe(true);
});

test("GlobalRecordingState - prevents multiple recordings", () => {
	const state = new GlobalRecordingState();
	const instance1: object = {};
	const instance2: object = {};

	// First instance starts recording
	const result1 = state.tryStartRecording(instance1);
	expect(result1).toBe(true);

	// Second instance tries to start
	const result2 = state.tryStartRecording(instance2);
	expect(result2).toBe(false);

	// State remains with first instance
	expect(state.isRecording()).toBe(true);
	expect(state.isRecordingInstance(instance1)).toBe(true);
	expect(state.isRecordingInstance(instance2)).toBe(false);
});

test("GlobalRecordingState - stop recording", () => {
	const state = new GlobalRecordingState();
	const instance1: object = {};
	const instance2: object = {};

	state.tryStartRecording(instance1);
	expect(state.isRecording()).toBe(true);

	// Wrong instance tries to stop
	state.stopRecording(instance2);
	expect(state.isRecording()).toBe(true);

	// Correct instance stops
	state.stopRecording(instance1);
	expect(state.isRecording()).toBe(false);
});

test("GlobalRecordingState - subscription", () => {
	const state = new GlobalRecordingState();
	const testInstance: object = {};
	let notificationCount = 0;
	let lastIsRecording = false;
	let lastInstance: any = null;
	let lastState = "idle";

	const unsubscribe = state.subscribe((stateInfo) => {
		notificationCount++;
		lastIsRecording = stateInfo.isRecording;
		lastInstance = stateInfo.recordingInstance;
		lastState = stateInfo.state;
	});

	// Start recording
	state.tryStartRecording(testInstance);
	expect(notificationCount).toBe(1);
	expect(lastIsRecording).toBe(true);
	expect(lastInstance).toBe(testInstance);
	expect(lastState).toBe("recording");

	// Stop recording
	state.stopRecording(testInstance);
	expect(notificationCount).toBe(2);
	expect(lastIsRecording).toBe(false);
	expect(lastInstance).toBe(null);
	expect(lastState).toBe("idle");

	// Unsubscribe
	unsubscribe();

	// No more notifications
	const anotherInstance: object = {};
	state.tryStartRecording(anotherInstance);
	expect(notificationCount).toBe(2);
});

test("GlobalRecordingState - destroy", () => {
	const state = new GlobalRecordingState();
	const testInstance: object = {};

	state.tryStartRecording(testInstance);
	expect(state.isRecording()).toBe(true);

	state.destroy();
	expect(state.isRecording()).toBe(false);
});
