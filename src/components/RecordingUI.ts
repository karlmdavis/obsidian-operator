import type { RecordingUIProps } from "../types/index.js";

/**
 * Reusable UI component for recording controls and status display.
 * 
 * This component follows the "controlled component" pattern - it receives all state
 * via props and communicates back through callbacks, making it completely stateless
 * and reusable across different contexts (modal, view, future components).
 * 
 * Design Principles:
 * - Accessibility-first: proper ARIA labels and semantic HTML
 * - Mobile-optimized: large touch targets for hands-free usage scenarios
 * - State-driven: UI appearance based entirely on props, no internal state
 * - Separation of concerns: UI rendering separate from business logic
 */
export class RecordingUI {
	/** DOM container where the UI is rendered - provided by parent component */
	private container: HTMLElement;
	
	/** Main record button reference - using definite assignment since render() creates it */
	private button!: HTMLButtonElement;
	
	/** Duration display element reference */
	private durationEl!: HTMLElement;
	
	/** Random numbers (future: transcription) display element reference */
	private randomsEl!: HTMLElement;
	
	/** Current props determining UI state and behavior */
	private props: RecordingUIProps;

	/**
	 * Creates a new RecordingUI instance in the provided container.
	 * 
	 * @param container HTML element where the UI will be rendered (modal, view panel, etc.)
	 * @param props Initial state and configuration for the UI
	 */
	constructor(container: HTMLElement, props: RecordingUIProps) {
		this.container = container;
		this.props = props;
		this.render();
	}

	/**
	 * Renders the complete UI based on current props.
	 * 
	 * This method is called on initial creation and whenever props change.
	 * It fully recreates the DOM to ensure UI is always in sync with state.
	 * While this could be optimized with selective updates, full re-render
	 * keeps the implementation simple and bug-free for this phase.
	 */
	private render(): void {
		this.container.empty(); // Clear previous content
		this.container.addClass("operator-recording-ui");

		// Create duration display
		this.durationEl = this.container.createEl("div", {
			cls: "operator-duration",
			text: this.props.durationDisplay,
		});

		// Create main record button
		this.button = this.container.createEl("button", {
			cls: `operator-record-button ${this.props.isLocalRecording ? "recording" : "stopped"}`,
			text: "Record",
		});

		// Disable button if someone else is recording
		this.button.disabled = !this.props.canRecord;
		if (!this.props.canRecord && !this.props.isLocalRecording) {
			this.button.classList.add("disabled");
			this.button.title = "Another instance is already recording";
		}

		// Add click handler for record button
		this.button.onclick = () => {
			if (!this.props.isLocalRecording && this.props.canRecord) {
				this.props.callbacks.onRecord();
			}
		};

		// Create stop button (only visible when THIS instance is recording)
		if (this.props.isLocalRecording) {
			const stopButton = this.container.createEl("button", {
				cls: "operator-stop-button",
				text: "Stop",
			});

			stopButton.onclick = () => {
				this.props.callbacks.onStop();
			};
		}

		// Create random numbers display
		this.randomsEl = this.container.createEl("div", {
			cls: "operator-randoms",
			text: this.props.randomsDisplay,
		});

		// Add accessible labels
		this.button.setAttribute(
			"aria-label",
			this.props.isLocalRecording ? "Recording in progress" : "Start recording",
		);
	}

	/**
	 * Updates the UI with new props and re-renders.
	 * 
	 * Called by parent components when recording state changes to keep UI in sync.
	 * The full re-render approach ensures consistency but could be optimized
	 * for performance in Phase 2 if needed.
	 */
	updateProps(newProps: RecordingUIProps): void {
		this.props = newProps;
		this.render();
	}

	/**
	 * Cleanup method for component unmounting.
	 * Removes all DOM elements and prevents memory leaks.
	 */
	destroy(): void {
		this.container.empty();
	}

	// Testing Helper Methods
	// These provide controlled access to internal DOM elements for unit testing
	// without exposing the full internal state or violating encapsulation

	getButton(): HTMLButtonElement {
		return this.button;
	}

	getDurationElement(): HTMLElement {
		return this.durationEl;
	}

	getRandomsElement(): HTMLElement {
		return this.randomsEl;
	}
}
