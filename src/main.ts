import { Plugin } from "obsidian";
import { GlobalRecordingState } from "./services/GlobalRecordingState.js";
import { RecordingModal } from "./views/RecordingModal.js";
import { RECORDING_VIEW_TYPE, RecordingView } from "./views/RecordingView.js";

/**
 * Main plugin class for Obsidian Operator - a voice-driven transcription plugin
 * designed for hands-free operation while commuting or when touch input is impractical.
 *
 * Architecture Overview:
 * - Uses a dual-state management system: GlobalRecordingState prevents concurrent recordings
 *   across multiple views, while LocalRecordingState manages individual view state
 * - Provides two UI modes: Modal for quick interactions, View for extended sessions
 * - Plugin follows Obsidian's lifecycle pattern with proper cleanup on unload
 */
export default class ObsidianOperatorPlugin extends Plugin {
	/**
	 * Global recording state manager - prevents multiple simultaneous recordings
	 * across different views/modals. This is the "single source of truth" for
	 * whether any recording is currently active in the entire plugin.
	 *
	 * Using definite assignment assertion (!) because Obsidian guarantees onload()
	 * will be called before any other plugin methods.
	 */
	private globalState!: GlobalRecordingState;

	/**
	 * Plugin initialization - called by Obsidian when plugin is enabled.
	 * Sets up the dual-UI architecture: modal for quick captures, view for extended sessions.
	 *
	 * The plugin registers both UI modes with Obsidian's workspace system, allowing users
	 * to access voice functionality through ribbon icons, commands, or keyboard shortcuts.
	 */
	async onload() {
		console.log("Loading Obsidian Operator plugin");

		// Initialize the global recording state that coordinates between all UI components
		// This ensures only one recording can happen at a time across the entire plugin
		this.globalState = new GlobalRecordingState();

		// Register our custom view type with Obsidian's workspace system
		// This allows the view to be opened in tabs, split panes, etc. like any other Obsidian view
		this.registerView(RECORDING_VIEW_TYPE, (leaf) => new RecordingView(leaf, this.globalState));

		// Add ribbon icons (left sidebar buttons) for quick access
		// Modal is for quick voice captures without disrupting current workspace
		this.addRibbonIcon("microphone", "Open Operator Modal", () => {
			new RecordingModal(this.app, this.globalState).open();
		});

		// View is for extended voice sessions that benefit from dedicated workspace
		this.addRibbonIcon("sidebar-right", "Open Operator View", () => {
			this.activateView();
		});

		// Register commands for keyboard shortcuts and command palette access
		// Users can assign hotkeys to these for hands-free activation
		this.addCommand({
			id: "open-operator-modal",
			name: "Operator Modal",
			callback: () => {
				new RecordingModal(this.app, this.globalState).open();
			},
		});

		this.addCommand({
			id: "open-operator-view",
			name: "Operator View",
			callback: () => {
				this.activateView();
			},
		});

		// Note: Removed toggle-recording command because with our architecture,
		// each UI component (modal/view) manages its own recording lifecycle.
		// A global toggle would conflict with the state management design.
	}

	/**
	 * Plugin cleanup - called by Obsidian when plugin is disabled or reloaded.
	 * Essential for preventing memory leaks and ensuring clean state transitions.
	 *
	 * The plugin must clean up its global state to prevent orphaned listeners
	 * and ensure proper cleanup of any ongoing recordings.
	 */
	onunload() {
		console.log("Unloading Obsidian Operator plugin");

		// Clean up the global state to prevent memory leaks
		// This stops any ongoing recordings and removes all event listeners
		if (this.globalState) {
			this.globalState.destroy();
		}
	}

	/**
	 * Activates the Recording View in the workspace, creating it if it doesn't exist.
	 *
	 * Obsidian's workspace system allows multiple "leaves" (tabs/panes) of the same view type.
	 * We first check if a Recording View already exists, and if so, bring it to focus.
	 * If not, we create a new tab in the main workspace area.
	 *
	 * This pattern follows Obsidian's best practices for view management and ensures
	 * users don't accidentally create multiple instances when they just want to access
	 * an existing view.
	 */
	async activateView() {
		const { workspace } = this.app;

		// Look for an existing Recording View in any workspace leaf
		let leaf = workspace.getLeavesOfType(RECORDING_VIEW_TYPE)[0];

		if (!leaf) {
			// No existing view found - create a new tab in the main workspace area
			// Using "tab" creates it in the main editor area rather than sidebars
			const newLeaf = workspace.getLeaf("tab");
			if (newLeaf) {
				await newLeaf.setViewState({ type: RECORDING_VIEW_TYPE, active: true });
				leaf = newLeaf;
			}
		}

		// Bring the view to focus, switching to its tab if it exists
		if (leaf) {
			workspace.revealLeaf(leaf);
		}
	}
}
