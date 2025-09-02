import { afterEach, beforeEach, expect, test } from "bun:test";

/**
 * Test suite for RecordingUI component - the shared UI control used across modal and view.
 *
 * This component is the core reusable UI element that renders recording controls
 * and displays. Tests focus on verifying the controlled component pattern:
 * - UI state is completely determined by props
 * - User interactions are communicated through callbacks
 * - Component handles all edge cases gracefully (disabled states, etc.)
 */

// Mock DOM environment for testing UI components
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

	// Testing helpers
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

const { RecordingUI } = require("../../../src/components/RecordingUI.js") as any;

// Test fixtures
let mockContainer: MockHTMLElement;
let recordingUI: any;
let mockCallbacks: { onRecord: () => void; onStop: () => void };
let recordCallCount: number;
let stopCallCount: number;

beforeEach(() => {
	// Create fresh mock DOM environment
	mockContainer = new MockHTMLElement();

	// Reset callback counters
	recordCallCount = 0;
	stopCallCount = 0;

	// Create mock callbacks to test interaction patterns
	mockCallbacks = {
		onRecord: () => {
			recordCallCount++;
		},
		onStop: () => {
			stopCallCount++;
		},
	};
});

afterEach(() => {
	if (recordingUI) {
		recordingUI.destroy();
		recordingUI = null;
	}
});

test("RecordingUI renders basic UI structure", () => {
	const props = {
		isLocalRecording: false,
		isGlobalRecording: false,
		canRecord: true,
		durationDisplay: "00:00",
		randomsDisplay: "",
		callbacks: mockCallbacks,
	};

	recordingUI = new RecordingUI(mockContainer, props);

	// Verify container has correct CSS class
	expect(mockContainer.hasClass("operator-recording-ui")).toBe(true);

	// Verify UI elements are created
	const children = mockContainer.getChildren();
	expect(children.length).toBeGreaterThanOrEqual(3); // duration, button, randoms

	// Test DOM element access methods
	const button = recordingUI.getButton();
	const durationEl = recordingUI.getDurationElement();
	const randomsEl = recordingUI.getRandomsElement();

	expect(button).toBeTruthy();
	expect(durationEl).toBeTruthy();
	expect(randomsEl).toBeTruthy();
	expect(durationEl.textContent).toBe("00:00");
});

test("RecordingUI handles ready-to-record state", () => {
	const props = {
		isLocalRecording: false,
		isGlobalRecording: false,
		canRecord: true,
		durationDisplay: "00:00",
		randomsDisplay: "",
		callbacks: mockCallbacks,
	};

	recordingUI = new RecordingUI(mockContainer, props);
	const button = recordingUI.getButton();

	// Button should be enabled and clickable
	expect(button.disabled).toBe(false);
	expect(button.hasClass("stopped")).toBe(true);
	expect(button.hasClass("recording")).toBe(false);

	// Clicking should trigger record callback
	button.click();
	expect(recordCallCount).toBe(1);
	expect(stopCallCount).toBe(0);
});

test("RecordingUI handles local recording state", () => {
	const props = {
		isLocalRecording: true,
		isGlobalRecording: true,
		canRecord: true,
		durationDisplay: "01:23",
		randomsDisplay: "45... 67... 89...",
		callbacks: mockCallbacks,
	};

	recordingUI = new RecordingUI(mockContainer, props);
	const button = recordingUI.getButton();

	// Button should show recording state
	expect(button.hasClass("recording")).toBe(true);
	expect(button.hasClass("stopped")).toBe(false);

	// Duration and data should be displayed
	const durationEl = recordingUI.getDurationElement();
	const randomsEl = recordingUI.getRandomsElement();
	expect(durationEl.textContent).toBe("01:23");
	expect(randomsEl.textContent).toBe("45... 67... 89...");

	// Stop button should be present when recording
	const children = mockContainer.getChildren();
	const stopButtonExists = children.some(
		(child) => child.hasClass("operator-stop-button") && child.textContent === "Stop",
	);
	expect(stopButtonExists).toBe(true);
});

test("RecordingUI handles disabled state when other instance recording", () => {
	const props = {
		isLocalRecording: false,
		isGlobalRecording: true, // Someone else is recording
		canRecord: false,
		durationDisplay: "00:00",
		randomsDisplay: "",
		callbacks: mockCallbacks,
	};

	recordingUI = new RecordingUI(mockContainer, props);
	const button = recordingUI.getButton();

	// Button should be disabled
	expect(button.disabled).toBe(true);
	expect(button.hasClass("disabled")).toBe(true);
	expect(button.title).toBe("Another instance is already recording");

	// Clicking disabled button should not trigger callback
	button.click();
	expect(recordCallCount).toBe(0);
});

test("RecordingUI handles stop button interaction", () => {
	const props = {
		isLocalRecording: true,
		isGlobalRecording: true,
		canRecord: true,
		durationDisplay: "00:42",
		randomsDisplay: "12... 34...",
		callbacks: mockCallbacks,
	};

	recordingUI = new RecordingUI(mockContainer, props);

	// Find and click the stop button
	const children = mockContainer.getChildren();
	const stopButton = children.find((child) => child.hasClass("operator-stop-button"));

	expect(stopButton).toBeTruthy();

	stopButton!.click();
	expect(stopCallCount).toBe(1);
	expect(recordCallCount).toBe(0);
});

test("RecordingUI prop updates re-render correctly", () => {
	// Initial state: ready to record
	const initialProps = {
		isLocalRecording: false,
		isGlobalRecording: false,
		canRecord: true,
		durationDisplay: "00:00",
		randomsDisplay: "",
		callbacks: mockCallbacks,
	};

	recordingUI = new RecordingUI(mockContainer, initialProps);

	let button = recordingUI.getButton();
	expect(button.hasClass("stopped")).toBe(true);
	expect(button.disabled).toBe(false);

	// Update to recording state
	const recordingProps = {
		isLocalRecording: true,
		isGlobalRecording: true,
		canRecord: true,
		durationDisplay: "00:15",
		randomsDisplay: "88... 99...",
		callbacks: mockCallbacks,
	};

	recordingUI.updateProps(recordingProps);

	// UI should reflect new state
	button = recordingUI.getButton();
	expect(button.hasClass("recording")).toBe(true);

	const durationEl = recordingUI.getDurationElement();
	const randomsEl = recordingUI.getRandomsElement();
	expect(durationEl.textContent).toBe("00:15");
	expect(randomsEl.textContent).toBe("88... 99...");
});

test("RecordingUI accessibility features", () => {
	const props = {
		isLocalRecording: false,
		isGlobalRecording: false,
		canRecord: true,
		durationDisplay: "00:00",
		randomsDisplay: "",
		callbacks: mockCallbacks,
	};

	recordingUI = new RecordingUI(mockContainer, props);
	const button = recordingUI.getButton();

	// Should have proper ARIA label
	expect(button.getAttribute("aria-label")).toBe("Start recording");

	// Update to recording state and check ARIA label changes
	const recordingProps = { ...props, isLocalRecording: true, isGlobalRecording: true };
	recordingUI.updateProps(recordingProps);

	const updatedButton = recordingUI.getButton();
	expect(updatedButton.getAttribute("aria-label")).toBe("Recording in progress");
});

test("RecordingUI cleanup prevents memory leaks", () => {
	const props = {
		isLocalRecording: false,
		isGlobalRecording: false,
		canRecord: true,
		durationDisplay: "00:00",
		randomsDisplay: "",
		callbacks: mockCallbacks,
	};

	recordingUI = new RecordingUI(mockContainer, props);

	// Verify UI is rendered
	expect(mockContainer.getChildren().length).toBeGreaterThan(0);

	// Destroy should clean up DOM
	recordingUI.destroy();
	expect(mockContainer.getChildren().length).toBe(0);
	expect(mockContainer.textContent).toBe("");
});

test("RecordingUI handles edge case - record button click when already recording", () => {
	const props = {
		isLocalRecording: true, // Already recording
		isGlobalRecording: true,
		canRecord: true,
		durationDisplay: "00:30",
		randomsDisplay: "11... 22...",
		callbacks: mockCallbacks,
	};

	recordingUI = new RecordingUI(mockContainer, props);
	const button = recordingUI.getButton();

	// Clicking record button when already recording should not trigger callback
	button.click();
	expect(recordCallCount).toBe(0);
});

test("RecordingUI callback isolation - different instances have separate callbacks", () => {
	// Create two UI instances with different callbacks
	let ui1RecordCount = 0;
	let ui2RecordCount = 0;

	const callbacks1 = {
		onRecord: () => {
			ui1RecordCount++;
		},
		onStop: () => {},
	};

	const callbacks2 = {
		onRecord: () => {
			ui2RecordCount++;
		},
		onStop: () => {},
	};

	const props1 = {
		isLocalRecording: false,
		isGlobalRecording: false,
		canRecord: true,
		durationDisplay: "00:00",
		randomsDisplay: "",
		callbacks: callbacks1,
	};

	const props2 = { ...props1, callbacks: callbacks2 };

	const container2 = new MockHTMLElement();
	recordingUI = new RecordingUI(mockContainer, props1);
	const recordingUI2 = new RecordingUI(container2, props2);

	// Click both UI record buttons
	recordingUI.getButton().click();
	recordingUI2.getButton().click();

	// Each should trigger only its own callback
	expect(ui1RecordCount).toBe(1);
	expect(ui2RecordCount).toBe(1);

	// Cleanup second UI
	recordingUI2.destroy();
});
