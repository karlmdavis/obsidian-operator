import { test, expect } from "bun:test";
import { LocalRecordingState } from "../../src/services/LocalRecordingState.js";

test("LocalRecordingState - initial state", () => {
	const state = new LocalRecordingState("test-id");
	
	expect(state.getId()).toBe("test-id");
	
	const stateData = state.getState();
	expect(stateData.isRecording).toBe(false);
	expect(stateData.elapsedSeconds).toBe(0);
	expect(stateData.randomNumbers).toEqual([]);
	expect(stateData.formattedDuration).toBe("00:00");
	expect(stateData.formattedRandoms).toBe("");
});

test("LocalRecordingState - start and stop recording", () => {
	const state = new LocalRecordingState("test-id");
	
	state.startRecording();
	let stateData = state.getState();
	expect(stateData.isRecording).toBe(true);
	expect(stateData.elapsedSeconds).toBe(0);
	
	state.stopRecording();
	stateData = state.getState();
	expect(stateData.isRecording).toBe(false);
	expect(stateData.elapsedSeconds).toBe(0);
	expect(stateData.randomNumbers).toEqual([]);
});

test("LocalRecordingState - duration formatting", () => {
	const state = new LocalRecordingState("test-id");
	
	// Manually set elapsed time for testing
	(state as any).elapsedSeconds = 0;
	expect(state.getState().formattedDuration).toBe("00:00");
	
	(state as any).elapsedSeconds = 59;
	expect(state.getState().formattedDuration).toBe("00:59");
	
	(state as any).elapsedSeconds = 60;
	expect(state.getState().formattedDuration).toBe("01:00");
	
	(state as any).elapsedSeconds = 125;
	expect(state.getState().formattedDuration).toBe("02:05");
});

test("LocalRecordingState - random numbers formatting", () => {
	const state = new LocalRecordingState("test-id");
	
	// Manually set random numbers for testing
	(state as any).randomNumbers = [];
	expect(state.getState().formattedRandoms).toBe("");
	
	(state as any).randomNumbers = [42];
	expect(state.getState().formattedRandoms).toBe("42...");
	
	(state as any).randomNumbers = [42, 7, 99];
	expect(state.getState().formattedRandoms).toBe("42... 7... 99...");
});

test("LocalRecordingState - timer increments", async () => {
	const state = new LocalRecordingState("test-id");
	let updates: any[] = [];
	
	const unsubscribe = state.subscribe((stateData) => {
		updates.push({
			elapsed: stateData.elapsedSeconds,
			randoms: stateData.randomNumbers.length
		});
	});
	
	state.startRecording();
	
	// Wait for 2.1 seconds
	await new Promise(resolve => setTimeout(resolve, 2100));
	
	state.stopRecording();
	unsubscribe();
	
	// Should have at least 3 updates (initial + 2 intervals)
	expect(updates.length).toBeGreaterThanOrEqual(3);
	
	// Check that elapsed time increased
	expect(updates[0].elapsed).toBe(0);
	expect(updates[1].elapsed).toBe(1);
	expect(updates[2].elapsed).toBe(2);
	
	// Check that random numbers were added
	expect(updates[0].randoms).toBe(0);
	expect(updates[1].randoms).toBe(1);
	expect(updates[2].randoms).toBe(2);
});

test("LocalRecordingState - stop clears data", () => {
	const state = new LocalRecordingState("test-id");
	
	// Manually set some data
	(state as any).elapsedSeconds = 10;
	(state as any).randomNumbers = [1, 2, 3];
	
	state.stopRecording();
	
	const stateData = state.getState();
	expect(stateData.elapsedSeconds).toBe(0);
	expect(stateData.randomNumbers).toEqual([]);
	expect(stateData.formattedDuration).toBe("00:00");
	expect(stateData.formattedRandoms).toBe("");
});

test("LocalRecordingState - destroy cleanup", async () => {
	const state = new LocalRecordingState("test-id");
	
	state.startRecording();
	
	// Wait a bit
	await new Promise(resolve => setTimeout(resolve, 100));
	
	state.destroy();
	
	// Should be stopped
	const stateData = state.getState();
	expect(stateData.isRecording).toBe(false);
	expect(stateData.elapsedSeconds).toBe(0);
});