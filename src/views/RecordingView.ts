import { ItemView, WorkspaceLeaf } from 'obsidian';
import { RecordingUI } from '../components/RecordingUI.js';
import { GlobalRecordingState } from '../services/GlobalRecordingState.js';
import { LocalRecordingState } from '../services/LocalRecordingState.js';
import { RecordingUICallbacks } from '../types/index.js';

export const RECORDING_VIEW_TYPE = 'operator-recording-view';

export class RecordingView extends ItemView {
	private recordingUI: RecordingUI | null = null;
	private globalState: GlobalRecordingState;
	private localState: LocalRecordingState;
	private unsubscribeGlobal: (() => void) | null = null;
	private unsubscribeLocal: (() => void) | null = null;
	private static instanceCounter = 0;

	constructor(leaf: WorkspaceLeaf, globalState: GlobalRecordingState) {
		super(leaf);
		this.globalState = globalState;
		// Create unique instance ID for this view
		RecordingView.instanceCounter++;
		this.localState = new LocalRecordingState(`view-${RecordingView.instanceCounter}-${Date.now()}`);
	}

	getViewType(): string {
		return RECORDING_VIEW_TYPE;
	}

	getDisplayText(): string {
		return 'Operator';
	}

	getIcon(): string {
		return 'microphone';
	}

	async onOpen(): Promise<void> {
		const container = this.containerEl.children[1];
		container.empty();
		container.addClass('operator-view-container');

		// Add title
		container.createEl('h3', { 
			text: 'Voice Recording',
			cls: 'operator-view-title'
		});
		
		const uiContainer = container.createEl('div', { 
			cls: 'operator-view-ui' 
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
			}
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
					callbacks
				});

				// Update status
				updateStatus();
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
			callbacks
		});

		// Add status info
		const statusEl = container.createEl('div', {
			cls: 'operator-view-status'
		});

		// Update status based on current state
		const updateStatus = () => {
			const isLocalRec = this.globalState.isRecordingInstance(this.localState.getId());
			const isGlobalRec = this.globalState.isRecording();
			
			if (isLocalRec) {
				statusEl.setText('Recording in this view...');
				statusEl.classList.add('recording');
				statusEl.classList.remove('blocked');
			} else if (isGlobalRec) {
				statusEl.setText('Another instance is recording');
				statusEl.classList.add('blocked');
				statusEl.classList.remove('recording');
			} else {
				statusEl.setText('Ready to record');
				statusEl.classList.remove('recording', 'blocked');
			}
		};

		// Initial status
		updateStatus();

		// Subscribe to state changes
		this.unsubscribeGlobal = this.globalState.subscribe(() => updateUI());
		this.unsubscribeLocal = this.localState.subscribe(() => updateUI());
	}

	async onClose(): Promise<void> {
		// Stop recording if this view was recording
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
	}
}