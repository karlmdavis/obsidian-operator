// Mock implementations of Obsidian API classes for testing

export interface MockEventTarget {
	addEventListener(type: string, listener: EventListener): void;
	removeEventListener(type: string, listener: EventListener): void;
}

export class MockComponent implements MockEventTarget {
	private listeners = new Map<string, Set<EventListener>>();

	addEventListener(type: string, listener: EventListener): void {
		if (!this.listeners.has(type)) {
			this.listeners.set(type, new Set());
		}
		this.listeners.get(type)!.add(listener);
	}

	removeEventListener(type: string, listener: EventListener): void {
		this.listeners.get(type)?.delete(listener);
	}

	trigger(type: string, event: Event): void {
		const typeListeners = this.listeners.get(type);
		if (typeListeners) {
			for (const listener of typeListeners) {
				listener(event);
			}
		}
	}
}

export class MockWorkspaceLeaf {
	view: any = null;

	setViewState(viewState: { type: string }): Promise<void> {
		return Promise.resolve();
	}

	getViewState() {
		return { type: this.view?.getViewType?.() || "empty" };
	}
}

export class MockWorkspace {
	private leaves: MockWorkspaceLeaf[] = [];

	getLeaf(newLeaf?: boolean): MockWorkspaceLeaf {
		if (newLeaf || this.leaves.length === 0) {
			const leaf = new MockWorkspaceLeaf();
			this.leaves.push(leaf);
			return leaf;
		}
		return this.leaves[0];
	}

	getLeavesOfType(type: string): MockWorkspaceLeaf[] {
		return this.leaves.filter((leaf) => leaf.getViewState().type === type);
	}

	revealLeaf(leaf: MockWorkspaceLeaf): void {
		// Mock implementation - just ensure the leaf is in our list
		if (!this.leaves.includes(leaf)) {
			this.leaves.push(leaf);
		}
	}
}

export class MockVault {
	create(path: string, data: string): Promise<any> {
		return Promise.resolve({ path, content: data });
	}

	read(path: string): Promise<string> {
		return Promise.resolve("mock file content");
	}

	exists(path: string): Promise<boolean> {
		return Promise.resolve(true);
	}
}

export class MockApp {
	workspace = new MockWorkspace();
	vault = new MockVault();

	constructor() {
		// Initialize mock app
	}
}

export class MockPlugin extends MockComponent {
	app: MockApp;
	manifest = { id: "test-plugin", name: "Test Plugin", version: "1.0.0" };

	private commands = new Map<string, any>();
	private ribbonIcons = new Map<string, HTMLElement>();
	private statusBarItems: HTMLElement[] = [];

	constructor(app: MockApp) {
		super();
		this.app = app;
	}

	addCommand(command: {
		id: string;
		name: string;
		callback?: () => void;
		editorCallback?: (editor: any, view: any) => void;
	}): void {
		this.commands.set(command.id, command);
	}

	addRibbonIcon(icon: string, title: string, callback: (evt: MouseEvent) => void): HTMLElement {
		const element = document.createElement("div");
		element.className = "ribbon-icon";
		element.title = title;
		element.onclick = (evt) => callback(evt as MouseEvent);
		this.ribbonIcons.set(icon, element);
		return element;
	}

	addStatusBarItem(): HTMLElement {
		const element = document.createElement("div");
		element.className = "status-bar-item";
		this.statusBarItems.push(element);
		return element;
	}

	registerView(type: string, viewCreator: (leaf: MockWorkspaceLeaf) => any): void {
		// Mock view registration - store the creator function
		(this as any)._viewCreators = (this as any)._viewCreators || {};
		(this as any)._viewCreators[type] = viewCreator;
	}

	// Test helpers
	getCommand(id: string) {
		return this.commands.get(id);
	}

	getRibbonIcon(icon: string) {
		return this.ribbonIcons.get(icon);
	}

	getStatusBarItems() {
		return this.statusBarItems;
	}

	executeCommand(id: string): void {
		const command = this.commands.get(id);
		if (command?.callback) {
			command.callback();
		}
	}

	clickRibbonIcon(icon: string): void {
		const element = this.ribbonIcons.get(icon);
		if (element?.onclick) {
			element.onclick(new MouseEvent("click") as any);
		}
	}
}

export class MockModal extends MockComponent {
	app: MockApp;
	containerEl: HTMLElement;
	contentEl: HTMLElement;

	private isOpen = false;

	constructor(app: MockApp) {
		super();
		this.app = app;
		this.containerEl = document.createElement("div");
		this.containerEl.className = "modal";
		this.contentEl = document.createElement("div");
		this.contentEl.className = "modal-content";
		this.containerEl.appendChild(this.contentEl);
	}

	open(): void {
		this.isOpen = true;
		document.body.appendChild(this.containerEl);
		this.onOpen();
	}

	close(): void {
		this.isOpen = false;
		if (this.containerEl.parentNode) {
			this.containerEl.parentNode.removeChild(this.containerEl);
		}
		this.onClose();
	}

	onOpen(): void {
		// Override in subclasses
	}

	onClose(): void {
		// Override in subclasses
	}

	// Test helpers
	isModalOpen(): boolean {
		return this.isOpen;
	}
}

export class MockItemView extends MockComponent {
	app: MockApp;
	leaf: MockWorkspaceLeaf;
	containerEl: HTMLElement;

	constructor(leaf: MockWorkspaceLeaf) {
		super();
		this.leaf = leaf;
		this.app = leaf.view?.app || new MockApp();
		this.containerEl = document.createElement("div");
		this.containerEl.className = "view-container";
		leaf.view = this;
	}

	getViewType(): string {
		return "mock-view";
	}

	getDisplayText(): string {
		return "Mock View";
	}

	async onOpen(): Promise<void> {
		// Override in subclasses
	}

	async onClose(): Promise<void> {
		// Override in subclasses
	}
}

// Export type aliases that match Obsidian API
export type Component = MockComponent;
export type App = MockApp;
export type Plugin = MockPlugin;
export type Modal = MockModal;
export type ItemView = MockItemView;
export type WorkspaceLeaf = MockWorkspaceLeaf;
export type Workspace = MockWorkspace;
