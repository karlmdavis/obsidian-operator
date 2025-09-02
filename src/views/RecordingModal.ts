import { type App, Modal } from "obsidian";
import { RecordingUI } from "../components/RecordingUI.js";
import type { GlobalRecordingState } from "../services/GlobalRecordingState.js";
import { LocalRecordingState } from "../services/LocalRecordingState.js";
import type { RecordingUICallbacks } from "./types.js";

export class RecordingModal extends Modal {
	private recordingUI: RecordingUI | null = null;
	private globalState: GlobalRecordingState;
	private localState: LocalRecordingState;
	private unsubscribeGlobal: (() => void) | null = null;
	private unsubscribeLocal: (() => void) | null = null;

	constructor(app: App, globalState: GlobalRecordingState) {
		super(app);
		this.globalState = globalState;
		this.localState = new LocalRecordingState();
	}

	onOpen(): void {
		const { contentEl } = this;
		contentEl.createEl("h2", { text: "Obsidian Operator" });

		const uiContainer = contentEl.createEl("div", {
			cls: "operator-modal-container",
		});

		// Create callbacks for the UI
		const callbacks: RecordingUICallbacks = {
			onRecord: () => {
				if (this.globalState.tryStartRecording(this.localState)) {
					this.localState.startRecording();
				}
			},
			onStop: () => {
				this.localState.stopRecording();
				this.globalState.stopRecording(this.localState);
			},
		};

		// Initialize UI with current state
		const updateUI = () => {
			if (this.recordingUI) {
				const localStateData = this.localState.getState();
				const isGlobalRecording = this.globalState.isRecording();
				const isLocalRecording = this.globalState.isRecordingInstance(this.localState);

				this.recordingUI.updateProps({
					isLocalRecording,
					isGlobalRecording,
					canRecord: !isGlobalRecording || isLocalRecording,
					durationDisplay: localStateData.formattedDuration,
					randomsDisplay: localStateData.formattedRandoms,
					callbacks,
				});
			}
		};

		// Create initial UI
		const localStateData = this.localState.getState();
		const isGlobalRecording = this.globalState.isRecording();
		const isLocalRecording = this.globalState.isRecordingInstance(this.localState);

		this.recordingUI = new RecordingUI(uiContainer, {
			isLocalRecording,
			isGlobalRecording,
			canRecord: !isGlobalRecording,
			durationDisplay: localStateData.formattedDuration,
			randomsDisplay: localStateData.formattedRandoms,
			callbacks,
		});

		// Subscribe to state changes
		this.unsubscribeGlobal = this.globalState.subscribe(() => updateUI());
		this.unsubscribeLocal = this.localState.subscribe(() => updateUI());

		// Add keyboard shortcuts
		this.scope.register(["Mod"], "Enter", () => {
			if (!this.globalState.isRecording()) {
				if (this.globalState.tryStartRecording(this.localState)) {
					this.localState.startRecording();
				}
			} else if (this.globalState.isRecordingInstance(this.localState)) {
				this.localState.stopRecording();
				this.globalState.stopRecording(this.localState);
			}
		});

		this.scope.register(["Mod"], "Escape", () => {
			if (this.globalState.isRecordingInstance(this.localState)) {
				this.localState.stopRecording();
				this.globalState.stopRecording(this.localState);
			}
			this.close();
		});
	}

	onClose(): void {
		// Stop recording if this modal was recording
		if (this.globalState.isRecordingInstance(this.localState)) {
			this.localState.stopRecording();
			this.globalState.stopRecording(this.localState);
		}

		if (this.recordingUI) {
			this.recordingUI.destroy();
			this.recordingUI = null;
		}

		if (this.unsubscribeGlobal) {
			this.unsubscribeGlobal();
			this.unsubscribeGlobal = null;
		}

		if (this.unsubscribeLocal) {
			this.unsubscribeLocal();
			this.unsubscribeLocal = null;
		}

		this.localState.destroy();

		const { contentEl } = this;
		contentEl.empty();
	}
}
