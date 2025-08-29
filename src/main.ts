import { Plugin } from "obsidian";
import { RecordingModal } from "./views/RecordingModal.js";
import { RecordingView, RECORDING_VIEW_TYPE } from "./views/RecordingView.js";
import { GlobalRecordingState } from "./services/GlobalRecordingState.js";

export default class ObsidianOperatorPlugin extends Plugin {
	private globalState!: GlobalRecordingState;

	async onload() {
		console.log("Loading Obsidian Operator plugin");
		
		// Initialize global state
		this.globalState = new GlobalRecordingState();

		// Register the workspace view
		this.registerView(
			RECORDING_VIEW_TYPE,
			(leaf) => new RecordingView(leaf, this.globalState)
		);

		// Add ribbon icon for modal
		this.addRibbonIcon('microphone', 'Open Operator Modal', () => {
			new RecordingModal(this.app, this.globalState).open();
		});

		// Add ribbon icon for view
		this.addRibbonIcon('sidebar-right', 'Open Operator View', () => {
			this.activateView();
		});

		// Add command for modal
		this.addCommand({
			id: 'open-operator-modal',
			name: 'Operator Modal',
			callback: () => {
				new RecordingModal(this.app, this.globalState).open();
			}
		});

		// Add command for view
		this.addCommand({
			id: 'open-operator-view',
			name: 'Operator View',
			callback: () => {
				this.activateView();
			}
		});

		// Note: Removed toggle-recording command as it doesn't make sense with
		// the new architecture where each view manages its own state
	}

	onunload() {
		console.log("Unloading Obsidian Operator plugin");
		
		// Clean up global state
		if (this.globalState) {
			this.globalState.destroy();
		}
	}

	async activateView() {
		const { workspace } = this.app;

		let leaf = workspace.getLeavesOfType(RECORDING_VIEW_TYPE)[0];

		if (!leaf) {
			// Open as a normal tab in the main area
			const newLeaf = workspace.getLeaf('tab');
			if (newLeaf) {
				await newLeaf.setViewState({ type: RECORDING_VIEW_TYPE, active: true });
				leaf = newLeaf;
			}
		}

		if (leaf) {
			workspace.revealLeaf(leaf);
		}
	}
}
