/**
 * Global recording state that prevents multiple recordings at once
 */
export class GlobalRecordingState {
	private recordingInstanceId: string | null = null;
	private listeners = new Set<(isRecording: boolean, instanceId: string | null) => void>();

	/**
	 * Try to start recording. Returns true if successful, false if already recording.
	 */
	tryStartRecording(instanceId: string): boolean {
		if (this.recordingInstanceId !== null) {
			return false; // Someone else is already recording
		}
		
		this.recordingInstanceId = instanceId;
		this.notifyListeners();
		return true;
	}

	/**
	 * Stop recording if the given instance is the one recording
	 */
	stopRecording(instanceId: string): void {
		if (this.recordingInstanceId === instanceId) {
			this.recordingInstanceId = null;
			this.notifyListeners();
		}
	}

	/**
	 * Check if anyone is currently recording
	 */
	isRecording(): boolean {
		return this.recordingInstanceId !== null;
	}

	/**
	 * Check if a specific instance is the one recording
	 */
	isRecordingInstance(instanceId: string): boolean {
		return this.recordingInstanceId === instanceId;
	}

	/**
	 * Subscribe to global recording state changes
	 */
	subscribe(listener: (isRecording: boolean, instanceId: string | null) => void): () => void {
		this.listeners.add(listener);
		return () => this.listeners.delete(listener);
	}

	private notifyListeners(): void {
		this.listeners.forEach(listener => 
			listener(this.recordingInstanceId !== null, this.recordingInstanceId)
		);
	}

	destroy(): void {
		this.recordingInstanceId = null;
		this.listeners.clear();
	}
}