// Type definitions for Obsidian Operator plugin

export interface RecordingUICallbacks {
	onRecord: () => void;
	onStop: () => void;
}

export interface RecordingUIProps {
	isLocalRecording: boolean;  // This instance is recording
	isGlobalRecording: boolean; // Someone is recording
	canRecord: boolean;         // This instance can start recording
	durationDisplay: string;
	randomsDisplay: string;
	callbacks: RecordingUICallbacks;
}
