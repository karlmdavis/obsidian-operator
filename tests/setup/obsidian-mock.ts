// Minimal Obsidian API mocks for testing

export class MockApp {
	workspace = new MockWorkspace();
}

export class MockWorkspace {
	// biome-ignore lint: Mock API requires any type
	activeView: any = null;

	// biome-ignore lint: Mock API requires any type
	getActiveViewOfType(type: any) {
		return this.activeView;
	}
}

export class MockPlugin {
	app = new MockApp();

	addRibbonIcon(icon: string, title: string, callback: () => void) {
		return { addClass: () => {} };
	}

	// biome-ignore lint: Mock API requires any type
	addCommand(command: any) {
		// Mock command registration
	}

	// biome-ignore lint: Mock API requires any type
	addSettingTab(tab: any) {
		// Mock settings tab
	}

	// biome-ignore lint: Mock API requires any type
	loadData(): Promise<any> {
		return Promise.resolve({});
	}

	// biome-ignore lint: Mock API requires any type
	saveData(data: any): Promise<void> {
		return Promise.resolve();
	}
}

export class MockModal {
	app: MockApp;
	contentEl = document.createElement("div");
	modalEl = document.createElement("div");

	constructor(app: MockApp) {
		this.app = app;
	}

	open() {
		// Mock modal open
	}

	close() {
		// Mock modal close
	}
}

export class MockItemView {
	app: MockApp;
	contentEl = document.createElement("div");

	constructor(app: MockApp) {
		this.app = app;
	}

	getViewType() {
		return "mock-view";
	}

	getDisplayText() {
		return "Mock View";
	}
}
