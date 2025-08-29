// Mock implementations of Obsidian API classes for testing (CommonJS version)

class MockComponent {
	constructor() {
		this.listeners = new Map();
	}

	addEventListener(type, listener) {
		if (!this.listeners.has(type)) {
			this.listeners.set(type, new Set());
		}
		this.listeners.get(type).add(listener);
	}

	removeEventListener(type, listener) {
		this.listeners.get(type)?.delete(listener);
	}

	trigger(type, event) {
		const typeListeners = this.listeners.get(type);
		if (typeListeners) {
			for (const listener of typeListeners) {
				listener(event);
			}
		}
	}
}

class MockWorkspaceLeaf {
	constructor() {
		this.view = null;
	}

	setViewState(viewState) {
		return Promise.resolve();
	}

	getViewState() {
		return { type: this.view?.getViewType?.() || "empty" };
	}
}

class MockWorkspace {
	constructor() {
		this.leaves = [];
	}

	getLeaf(newLeaf) {
		if (newLeaf || this.leaves.length === 0) {
			const leaf = new MockWorkspaceLeaf();
			this.leaves.push(leaf);
			return leaf;
		}
		return this.leaves[0];
	}

	getLeavesOfType(type) {
		return this.leaves.filter((leaf) => leaf.getViewState().type === type);
	}

	revealLeaf(leaf) {
		if (!this.leaves.includes(leaf)) {
			this.leaves.push(leaf);
		}
	}
}

class MockVault {
	create(path, data) {
		return Promise.resolve({ path, content: data });
	}

	read(path) {
		return Promise.resolve("mock file content");
	}

	exists(path) {
		return Promise.resolve(true);
	}
}

class MockApp {
	constructor() {
		this.workspace = new MockWorkspace();
		this.vault = new MockVault();
	}
}

class MockPlugin extends MockComponent {
	constructor(app) {
		super();
		this.app = app;
		this.manifest = { id: "test-plugin", name: "Test Plugin", version: "1.0.0" };
		this.commands = new Map();
		this.ribbonIcons = new Map();
		this.statusBarItems = [];
	}

	addCommand(command) {
		this.commands.set(command.id, command);
	}

	addRibbonIcon(icon, title, callback) {
		// Since we don't have DOM in pure Node, create a simple mock
		const element = {
			className: "ribbon-icon",
			title: title,
			onclick: callback
		};
		this.ribbonIcons.set(icon, element);
		return element;
	}

	addStatusBarItem() {
		const element = {
			className: "status-bar-item"
		};
		this.statusBarItems.push(element);
		return element;
	}

	registerView(type, viewCreator) {
		this._viewCreators = this._viewCreators || {};
		this._viewCreators[type] = viewCreator;
	}

	// Test helpers
	getCommand(id) {
		return this.commands.get(id);
	}

	getRibbonIcon(icon) {
		return this.ribbonIcons.get(icon);
	}

	getStatusBarItems() {
		return this.statusBarItems;
	}

	executeCommand(id) {
		const command = this.commands.get(id);
		if (command?.callback) {
			command.callback();
		}
	}

	clickRibbonIcon(icon) {
		const element = this.ribbonIcons.get(icon);
		if (element?.onclick) {
			element.onclick(new MouseEvent("click"));
		}
	}
}

// Mock Scope for keyboard shortcuts in modals
class MockScope {
	constructor() {
		this.shortcuts = new Map();
	}

	register(modifiers, key, callback) {
		const shortcutKey = `${modifiers.join("+")}-${key}`;
		this.shortcuts.set(shortcutKey, { modifiers, key, callback });
	}

	// Test helper to get registered shortcuts
	getShortcut(modifiers, key) {
		const shortcutKey = `${modifiers.join("+")}-${key}`;
		return this.shortcuts.get(shortcutKey);
	}

	// Test helper to trigger shortcuts
	triggerShortcut(modifiers, key) {
		const shortcut = this.getShortcut(modifiers, key);
		if (shortcut) {
			shortcut.callback();
		}
	}
}

// Mock HTMLElement that can be extended for DOM testing
class MockHTMLElement {
	constructor() {
		this.children = [];
		this.attributes = {};
		this.classes = [];
		this.textContent = "";
		this.disabled = false;
		this.onclick = null;
		this.title = "";
	}

	createEl(tagName, options = {}) {
		const element = new MockHTMLElement();
		if (options.cls) {
			element.classes = options.cls.split(" ");
		}
		if (options.text) {
			element.textContent = options.text;
		}
		this.children.push(element);
		return element;
	}

	empty() {
		this.children = [];
		this.textContent = "";
	}

	addClass(className) {
		if (!this.classes.includes(className)) {
			this.classes.push(className);
		}
	}

	get classList() {
		return {
			add: (className) => this.addClass(className),
			contains: (className) => this.classes.includes(className),
		};
	}

	setAttribute(name, value) {
		this.attributes[name] = value;
	}

	getAttribute(name) {
		return this.attributes[name] || null;
	}

	// Testing helpers
	hasClass(className) {
		return this.classes.includes(className);
	}

	getChildren() {
		return this.children;
	}

	click() {
		if (this.onclick && !this.disabled) {
			this.onclick();
		}
	}
}

class MockModal extends MockComponent {
	constructor(app) {
		super();
		this.app = app;
		this.containerEl = new MockHTMLElement();
		this.containerEl.addClass("modal");
		this.contentEl = new MockHTMLElement();
		this.contentEl.addClass("modal-content");
		this.containerEl.getChildren().push(this.contentEl);
		this.scope = new MockScope();
		this.isOpen = false;
	}

	open() {
		this.isOpen = true;
		this.onOpen();
	}

	close() {
		this.isOpen = false;
		this.onClose();
	}

	onOpen() {
		// Override in subclasses
	}

	onClose() {
		// Override in subclasses
	}
}

class MockItemView extends MockComponent {
	constructor(leaf) {
		super();
		this.leaf = leaf;
		this.app = leaf.view?.app || new MockApp();
		this.containerEl = new MockHTMLElement();
		this.containerEl.addClass("view-container");
		leaf.view = this;
	}

	getViewType() {
		return "mock-view";
	}

	getDisplayText() {
		return "Mock View";
	}

	async onOpen() {
		// Override in subclasses
	}

	async onClose() {
		// Override in subclasses
	}
}

module.exports = {
	MockComponent,
	MockWorkspaceLeaf,
	MockWorkspace,
	MockVault,
	MockApp,
	MockPlugin,
	MockScope,
	MockHTMLElement,
	MockModal,
	MockItemView,
};