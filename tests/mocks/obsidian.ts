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
}

export class MockPlugin extends MockComponent {
	app: MockApp;
	manifest = { id: "test-plugin", name: "Test Plugin", version: "1.0.0" };

	private commands = new Map<string, any>();
	private ribbonIcons = new Map<string, MockHTMLElement>();
	private statusBarItems: MockHTMLElement[] = [];

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

	addRibbonIcon(icon: string, title: string, callback: (evt: MouseEvent) => void): MockHTMLElement {
		const element = new MockHTMLElement();
		element.addClass("ribbon-icon");
		element.title = title;
		element.onclick = () => callback(new MouseEvent("click") as MouseEvent);
		this.ribbonIcons.set(icon, element);
		return element;
	}

	addStatusBarItem(): MockHTMLElement {
		const element = new MockHTMLElement();
		element.addClass("status-bar-item");
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
			element.onclick();
		}
	}
}

// Mock Scope for keyboard shortcuts in modals
export class MockScope {
	private shortcuts = new Map<string, any>();

	register(modifiers: string[], key: string, callback: () => void): void {
		const shortcutKey = `${modifiers.join("+")}-${key}`;
		this.shortcuts.set(shortcutKey, { modifiers, key, callback });
	}

	// Test helper to get registered shortcuts
	getShortcut(modifiers: string[], key: string) {
		const shortcutKey = `${modifiers.join("+")}-${key}`;
		return this.shortcuts.get(shortcutKey);
	}

	// Test helper to trigger shortcuts
	triggerShortcut(modifiers: string[], key: string): void {
		const shortcut = this.getShortcut(modifiers, key);
		if (shortcut) {
			shortcut.callback();
		}
	}
}

// Mock HTMLElement that can be extended for DOM testing
export class MockHTMLElement {
	private children: MockHTMLElement[] = [];
	private attributes: Record<string, string> = {};
	private classes: string[] = [];
	public textContent = "";
	public disabled = false;
	public onclick: (() => void) | null = null;
	public title = "";

	createEl(tagName: string, options?: { cls?: string; text?: string }): MockHTMLElement {
		const element = new MockHTMLElement();
		if (options?.cls) {
			element.classes = options.cls.split(" ");
		}
		if (options?.text) {
			element.textContent = options.text;
		}
		this.children.push(element);
		return element;
	}

	empty(): void {
		this.children = [];
		this.textContent = "";
	}

	addClass(className: string): void {
		if (!this.classes.includes(className)) {
			this.classes.push(className);
		}
	}

	get classList() {
		return {
			add: (className: string) => this.addClass(className),
			contains: (className: string) => this.classes.includes(className),
		};
	}

	setAttribute(name: string, value: string): void {
		this.attributes[name] = value;
	}

	getAttribute(name: string): string | null {
		return this.attributes[name] || null;
	}

	// Testing helpers
	hasClass(className: string): boolean {
		return this.classes.includes(className);
	}

	getChildren(): MockHTMLElement[] {
		return this.children;
	}

	click(): void {
		if (this.onclick && !this.disabled) {
			this.onclick();
		}
	}
}

export class MockModal extends MockComponent {
	app: MockApp;
	containerEl: MockHTMLElement;
	contentEl: MockHTMLElement;
	scope: MockScope;
	isOpen = false;

	constructor(app: MockApp) {
		super();
		this.app = app;
		this.containerEl = new MockHTMLElement();
		this.containerEl.addClass("modal");
		this.contentEl = new MockHTMLElement();
		this.contentEl.addClass("modal-content");
		this.containerEl.getChildren().push(this.contentEl);
		this.scope = new MockScope();
	}

	open(): void {
		this.isOpen = true;
		this.onOpen();
	}

	close(): void {
		this.isOpen = false;
		this.onClose();
	}

	onOpen(): void {
		// Override in subclasses
	}

	onClose(): void {
		// Override in subclasses
	}
}

export class MockItemView extends MockComponent {
	app: MockApp;
	leaf: MockWorkspaceLeaf;
	containerEl: MockHTMLElement;

	constructor(leaf: MockWorkspaceLeaf) {
		super();
		this.leaf = leaf;
		this.app = leaf.view?.app || new MockApp();
		this.containerEl = new MockHTMLElement();
		this.containerEl.addClass("view-container");
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
export type Scope = MockScope;
export type HTMLElement = MockHTMLElement;

// Also need to fix private property references
interface MockPluginInternal {
	ribbonIcons: Map<string, MockHTMLElement>;
	statusBarItems: MockHTMLElement[];
}
