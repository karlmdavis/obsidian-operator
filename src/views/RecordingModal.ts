import { type App, Modal } from "obsidian";
import { RecordingUI } from "../components/RecordingUI.js";
import type { GlobalRecordingState } from "../services/GlobalRecordingState.js";
import { LocalRecordingState } from "../services/LocalRecordingState.js";
import type { RecordingUICallbacks } from "../types/index.js";
import { generateInstanceId } from "../utils/instance-id.js";

export class RecordingModal extends Modal {
	private recordingUI: RecordingUI | null = null;
	private globalState: GlobalRecordingState;
	private localState: LocalRecordingState;
	private unsubscribeGlobal: (() => void) | null = null;
	private unsubscribeLocal: (() => void) | null = null;

	constructor(app: App, globalState: GlobalRecordingState) {
		super(app);
		this.globalState = globalState;
		// Create unique instance ID for this modal using type-safe generation
		this.localState = new LocalRecordingState(generateInstanceId("modal"));
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
				if (this.globalState.tryStartRecording(this.localState.getId())) {
					this.localState.startRecording();
				}
			},
			onStop: () => {
				this.localState.stopRecording();
				this.globalState.stopRecording(this.localState.getId());
			},
		};

		// Initialize UI with current state
		const updateUI = () => {
			if (this.recordingUI) {
				const localStateData = this.localState.getState();
				const isGlobalRecording = this.globalState.isRecording();
				const isLocalRecording = this.globalState.isRecordingInstance(this.localState.getId());

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
		const isLocalRecording = this.globalState.isRecordingInstance(this.localState.getId());

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
				if (this.globalState.tryStartRecording(this.localState.getId())) {
					this.localState.startRecording();
				}
			} else if (this.globalState.isRecordingInstance(this.localState.getId())) {
				this.localState.stopRecording();
				this.globalState.stopRecording(this.localState.getId());
			}
		});

		this.scope.register(["Mod"], "Escape", () => {
			if (this.globalState.isRecordingInstance(this.localState.getId())) {
				this.localState.stopRecording();
				this.globalState.stopRecording(this.localState.getId());
			}
			this.close();
		});
	}

	onClose(): void {
		// Stop recording if this modal was recording
		if (this.globalState.isRecordingInstance(this.localState.getId())) {
			this.localState.stopRecording();
			this.globalState.stopRecording(this.localState.getId());
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
