import { test, expect } from "bun:test";
import { RecordingUI } from "../../src/components/RecordingUI.js";
import { RecordingUIProps, RecordingUICallbacks } from "../../src/types/index.js";

function createMockContainer(): HTMLElement {
	const container = document.createElement('div');
	// Add basic methods that RecordingUI expects
	(container as any).empty = function() {
		this.innerHTML = '';
	};
	(container as any).addClass = function(className: string) {
		this.classList.add(className);
	};
	(container as any).createEl = function(tagName: string, options?: any) {
		const element = document.createElement(tagName);
		if (options?.cls) {
			element.className = options.cls;
		}
		if (options?.text) {
			element.textContent = options.text;
		}
		this.appendChild(element);
		return element;
	};
	return container;
}

function createMockCallbacks(): RecordingUICallbacks {
	return {
		onRecord: () => {},
		onStop: () => {}
	};
}

test("RecordingUI - initial render with stopped state", () => {
	const container = createMockContainer();
	const callbacks = createMockCallbacks();
	
	const props: RecordingUIProps = {
		isLocalRecording: false,
		isGlobalRecording: false,
		canRecord: true,
		durationDisplay: "00:00",
		randomsDisplay: "",
		callbacks
	};
	
	const ui = new RecordingUI(container, props);
	
	// Check container classes
	expect(container.classList.contains('operator-recording-ui')).toBe(true);
	
	// Check duration exists
	const duration = container.querySelector('.operator-duration');
	expect(duration).toBeTruthy();
	expect(duration?.textContent).toBe("00:00");
	
	// Check button exists and has correct state
	const button = container.querySelector('.operator-record-button');
	expect(button).toBeTruthy();
	expect(button?.textContent).toBe("Record");
	expect(button?.classList.contains('stopped')).toBe(true);
	expect(button?.getAttribute('aria-label')).toBe('Start recording');
	
	// Should not have stop button when not recording
	const stopButton = container.querySelector('.operator-stop-button');
	expect(stopButton).toBeFalsy();
	
	// Check randoms display exists
	const randoms = container.querySelector('.operator-randoms');
	expect(randoms).toBeTruthy();
	expect(randoms?.textContent).toBe("");
	
	ui.destroy();
});

test("RecordingUI - render with recording state", () => {
	const container = createMockContainer();
	const callbacks = createMockCallbacks();
	
	const props: RecordingUIProps = {
		isLocalRecording: true,
		isGlobalRecording: true,
		canRecord: true,
		durationDisplay: "01:23",
		randomsDisplay: "42... 7...",
		callbacks
	};
	
	const ui = new RecordingUI(container, props);
	
	// Check duration shows recording time
	const duration = container.querySelector('.operator-duration');
	expect(duration?.textContent).toBe("01:23");
	
	// Check button has recording state
	const button = container.querySelector('.operator-record-button');
	expect(button?.textContent).toBe("Record");
	expect(button?.classList.contains('recording')).toBe(true);
	expect(button?.getAttribute('aria-label')).toBe('Recording in progress');
	
	// Should have stop button when recording
	const stopButton = container.querySelector('.operator-stop-button');
	expect(stopButton).toBeTruthy();
	expect(stopButton?.textContent).toBe("Stop");
	
	// Check randoms display
	const randoms = container.querySelector('.operator-randoms');
	expect(randoms?.textContent).toBe("42... 7...");
	
	ui.destroy();
});

test("RecordingUI - disabled when another instance is recording", () => {
	const container = createMockContainer();
	const callbacks = createMockCallbacks();
	
	const props: RecordingUIProps = {
		isLocalRecording: false,
		isGlobalRecording: true,
		canRecord: false,
		durationDisplay: "00:00",
		randomsDisplay: "",
		callbacks
	};
	
	const ui = new RecordingUI(container, props);
	
	const button = ui.getButton();
	expect(button.disabled).toBe(true);
	expect(button.classList.contains('disabled')).toBe(true);
	expect(button.title).toBe('Another instance is already recording');
	
	ui.destroy();
});

test("RecordingUI - button click callbacks", () => {
	const container = createMockContainer();
	let recordCalled = false;
	let stopCalled = false;
	
	const callbacks: RecordingUICallbacks = {
		onRecord: () => { recordCalled = true; },
		onStop: () => { stopCalled = true; }
	};
	
	// Test record callback
	const stoppedProps: RecordingUIProps = {
		isLocalRecording: false,
		isGlobalRecording: false,
		canRecord: true,
		durationDisplay: "00:00",
		randomsDisplay: "",
		callbacks
	};
	
	const ui = new RecordingUI(container, stoppedProps);
	const button = ui.getButton();
	
	button.click();
	expect(recordCalled).toBe(true);
	
	// Test stop callback
	const recordingProps: RecordingUIProps = {
		isLocalRecording: true,
		isGlobalRecording: true,
		canRecord: true,
		durationDisplay: "00:05",
		randomsDisplay: "12...",
		callbacks
	};
	
	ui.updateProps(recordingProps);
	
	const stopButton = container.querySelector('.operator-stop-button') as HTMLButtonElement;
	expect(stopButton).toBeTruthy();
	
	stopButton.click();
	expect(stopCalled).toBe(true);
	
	ui.destroy();
});

test("RecordingUI - updateProps changes UI", () => {
	const container = createMockContainer();
	const callbacks = createMockCallbacks();
	
	const initialProps: RecordingUIProps = {
		isLocalRecording: false,
		isGlobalRecording: false,
		canRecord: true,
		durationDisplay: "00:00",
		randomsDisplay: "",
		callbacks
	};
	
	const ui = new RecordingUI(container, initialProps);
	
	// Verify initial state
	expect(ui.getDurationElement().textContent).toBe("00:00");
	expect(ui.getRandomsElement().textContent).toBe("");
	
	// Update to recording state
	const recordingProps: RecordingUIProps = {
		isLocalRecording: true,
		isGlobalRecording: true,
		canRecord: true,
		durationDisplay: "02:15",
		randomsDisplay: "5... 92... 13...",
		callbacks
	};
	
	ui.updateProps(recordingProps);
	
	// Verify updated state
	expect(ui.getDurationElement().textContent).toBe("02:15");
	expect(ui.getRandomsElement().textContent).toBe("5... 92... 13...");
	expect(ui.getButton().classList.contains('recording')).toBe(true);
	
	// Verify stop button appears
	const stopButton = container.querySelector('.operator-stop-button');
	expect(stopButton).toBeTruthy();
	
	ui.destroy();
});

test("RecordingUI - doesn't allow recording when disabled", () => {
	const container = createMockContainer();
	let recordCalled = false;
	
	const callbacks: RecordingUICallbacks = {
		onRecord: () => { recordCalled = true; },
		onStop: () => {}
	};
	
	const props: RecordingUIProps = {
		isLocalRecording: false,
		isGlobalRecording: true,
		canRecord: false,
		durationDisplay: "00:00",
		randomsDisplay: "",
		callbacks
	};
	
	const ui = new RecordingUI(container, props);
	const button = ui.getButton();
	
	// Try to click disabled button
	button.click();
	
	// Callback should not be called
	expect(recordCalled).toBe(false);
	
	ui.destroy();
});