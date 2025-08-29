import type { RecordingUIProps } from "../types/index.js";

export class RecordingUI {
	private container: HTMLElement;
	private button!: HTMLButtonElement;
	private durationEl!: HTMLElement;
	private randomsEl!: HTMLElement;
	private props: RecordingUIProps;

	constructor(container: HTMLElement, props: RecordingUIProps) {
		this.container = container;
		this.props = props;
		this.render();
	}

	private render(): void {
		this.container.empty();
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

	updateProps(newProps: RecordingUIProps): void {
		this.props = newProps;
		this.render();
	}

	destroy(): void {
		this.container.empty();
	}

	// Helper methods for testing
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
