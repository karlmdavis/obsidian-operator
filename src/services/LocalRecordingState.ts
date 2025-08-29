/**
 * Local recording state for each view instance
 */
export class LocalRecordingState {
	private instanceId: string;
	private isRecording = false;
	private elapsedSeconds = 0;
	private randomNumbers: number[] = [];
	private intervalId: number | null = null;
	private listeners = new Set<(state: LocalStateUpdate) => void>();

	constructor(instanceId: string) {
		this.instanceId = instanceId;
	}

	getId(): string {
		return this.instanceId;
	}

	startRecording(): void {
		if (this.isRecording) return;

		this.isRecording = true;
		this.elapsedSeconds = 0;
		this.randomNumbers = [];

		// Start the interval timer
		this.intervalId = window.setInterval(() => {
			this.elapsedSeconds++;
			const randomNum = Math.floor(Math.random() * 100); // Random 0-99
			this.randomNumbers.push(randomNum);
			this.notifyListeners();
		}, 1000);

		this.notifyListeners();
	}

	stopRecording(): void {
		this.isRecording = false;
		this.elapsedSeconds = 0;
		this.randomNumbers = [];

		if (this.intervalId !== null) {
			window.clearInterval(this.intervalId);
			this.intervalId = null;
		}

		this.notifyListeners();
	}

	getState(): LocalStateUpdate {
		return {
			isRecording: this.isRecording,
			elapsedSeconds: this.elapsedSeconds,
			randomNumbers: [...this.randomNumbers],
			formattedDuration: this.formatDuration(),
			formattedRandoms: this.formatRandomNumbers(),
		};
	}

	subscribe(listener: (state: LocalStateUpdate) => void): () => void {
		this.listeners.add(listener);
		return () => this.listeners.delete(listener);
	}

	private notifyListeners(): void {
		const state = this.getState();
		for (const listener of this.listeners) {
			listener(state);
		}
	}

	private formatDuration(): string {
		const minutes = Math.floor(this.elapsedSeconds / 60);
		const seconds = this.elapsedSeconds % 60;
		return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
	}

	private formatRandomNumbers(): string {
		if (this.randomNumbers.length === 0) return "";
		return this.randomNumbers.map((n) => `${n}...`).join(" ");
	}

	destroy(): void {
		this.stopRecording();
		this.listeners.clear();
	}
}

export interface LocalStateUpdate {
	isRecording: boolean;
	elapsedSeconds: number;
	randomNumbers: number[];
	formattedDuration: string;
	formattedRandoms: string;
}
