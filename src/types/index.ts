// Type definitions for Obsidian Operator plugin

export interface RecordingState {
	isRecording: boolean;
	count: number;
	initiatedBy: string | null; // View identifier that started recording
}

export interface CounterUpdate {
	count: number;
	timestamp: number;
}

export interface RecordingUICallbacks {
	onStart: () => void;
	onPause: () => void;
	onStop: () => void;
}

export interface RecordingUIProps {
	isRecording: boolean;
	countDisplay: string;
	callbacks: RecordingUICallbacks;
}
