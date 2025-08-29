import { expect, test } from "bun:test";
import { GlobalRecordingState } from "../../src/services/GlobalRecordingState.js";

test("GlobalRecordingState - initial state", () => {
	const state = new GlobalRecordingState();
	expect(state.isRecording()).toBe(false);
	expect(state.isRecordingInstance("test-id")).toBe(false);
});

test("GlobalRecordingState - can start recording", () => {
	const state = new GlobalRecordingState();

	const result = state.tryStartRecording("instance-1");
	expect(result).toBe(true);
	expect(state.isRecording()).toBe(true);
	expect(state.isRecordingInstance("instance-1")).toBe(true);
});

test("GlobalRecordingState - prevents multiple recordings", () => {
	const state = new GlobalRecordingState();

	// First instance starts recording
	const result1 = state.tryStartRecording("instance-1");
	expect(result1).toBe(true);

	// Second instance tries to start
	const result2 = state.tryStartRecording("instance-2");
	expect(result2).toBe(false);

	// State remains with first instance
	expect(state.isRecording()).toBe(true);
	expect(state.isRecordingInstance("instance-1")).toBe(true);
	expect(state.isRecordingInstance("instance-2")).toBe(false);
});

test("GlobalRecordingState - stop recording", () => {
	const state = new GlobalRecordingState();

	state.tryStartRecording("instance-1");
	expect(state.isRecording()).toBe(true);

	// Wrong instance tries to stop
	state.stopRecording("instance-2");
	expect(state.isRecording()).toBe(true);

	// Correct instance stops
	state.stopRecording("instance-1");
	expect(state.isRecording()).toBe(false);
});

test("GlobalRecordingState - subscription", () => {
	const state = new GlobalRecordingState();
	let notificationCount = 0;
	let lastIsRecording = false;
	let lastInstanceId: string | null = null;
	let lastState: string = "idle";

	const unsubscribe = state.subscribe((stateInfo) => {
		notificationCount++;
		lastIsRecording = stateInfo.isRecording;
		lastInstanceId = stateInfo.recordingInstanceId;
		lastState = stateInfo.state;
	});

	// Start recording
	state.tryStartRecording("instance-1");
	expect(notificationCount).toBe(1);
	expect(lastIsRecording).toBe(true);
	expect(lastInstanceId).toBe("instance-1");
	expect(lastState).toBe("recording");

	// Stop recording
	state.stopRecording("instance-1");
	expect(notificationCount).toBe(2);
	expect(lastIsRecording).toBe(false);
	expect(lastInstanceId).toBe(null);
	expect(lastState).toBe("idle");

	// Unsubscribe
	unsubscribe();

	// No more notifications
	state.tryStartRecording("instance-2");
	expect(notificationCount).toBe(2);
});

test("GlobalRecordingState - destroy", () => {
	const state = new GlobalRecordingState();

	state.tryStartRecording("instance-1");
	expect(state.isRecording()).toBe(true);

	state.destroy();
	expect(state.isRecording()).toBe(false);
});
