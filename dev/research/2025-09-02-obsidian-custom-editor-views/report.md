# Obsidian Custom Editor Views Research Report

## Overview

Obsidian's plugin architecture is highly extensible and allows developers to create alternative interfaces for editing and viewing Markdown files.
After comprehensive research into the Obsidian ecosystem, official documentation, and community plugins, I can confirm that **plugins absolutely can provide alternative editor views** for Markdown files.
This capability opens significant opportunities for specialized editing experiences, including voice-controlled interfaces like the Obsidian Operator project.

## Plugin Categories

### 1. Basic Functionality Plugins

These plugins extend Obsidian's core functionality without changing the editing interface:

- **Command Plugins**: Add new commands to the command palette
- **Ribbon Plugins**: Add icon buttons to the left sidebar for quick actions
- **Status Bar Plugins**: Display information in the bottom status bar
- **Settings Plugins**: Provide configuration interfaces for plugin behavior

### 2. Editor Enhancement Plugins

These plugins modify or extend the existing editor without replacing it:

- **Editor Command Plugins**: Use `editorCallback` to manipulate text in the current editor
- **CodeMirror Extension Plugins**: Leverage CodeMirror 6's extension system to add decorations, widgets, or custom behavior
- **Toolbar Plugins**: Add visual editing interfaces like the Editing Toolbar plugin, which provides Word-like formatting buttons

Examples from the ecosystem:
- **Editing Toolbar**: Provides a WYSIWYG-style toolbar with formatting buttons
- **Editor Syntax Highlight**: Enhances code block syntax highlighting
- **Hemingway Mode**: Disables editing keys to focus on writing flow

### 3. Custom View Plugins

These plugins create entirely new pane types with custom interfaces:

- **ItemView-based Plugins**: Extend the `ItemView` class to create custom panes
- **Modal-based Plugins**: Use the `Modal` class for overlay interfaces
- **Workspace Modification Plugins**: Change how the workspace behaves and displays content

Examples from the ecosystem:
- **Kanban Plugin**: Creates board views for project management
- **Excalidraw**: Provides a drawing interface within Obsidian
- **Full Calendar**: Displays events in calendar format

### 4. Specialized Interface Plugins

These plugins provide domain-specific editing experiences:

- **Data Visualization**: Dataview plugin for querying and displaying vault data
- **Outliner Interfaces**: Hierarchical bullet-point editing like Roam Research
- **Graph Interfaces**: Enhanced graph views and navigation
- **Database Views**: Table and database-like interfaces for structured data

## Technical Implementation Approaches

### Custom ItemView Implementation

The most powerful approach for creating alternative editor views is extending the `ItemView` class:

```typescript
import { ItemView, WorkspaceLeaf } from 'obsidian';

export class VoiceEditorView extends ItemView {
    constructor(leaf: WorkspaceLeaf) {
        super(leaf);
    }

    getViewType(): string {
        return 'voice-editor';
    }

    getDisplayText(): string {
        return 'Voice Editor';
    }

    async onOpen() {
        const container = this.containerEl.children[1];
        container.empty();
        
        // Create custom interface
        container.createEl('div', { 
            cls: 'voice-editor-container',
            text: 'Voice Editor Interface'
        });
        
        // Add voice controls, transcription display, etc.
    }

    async onClose() {
        // Cleanup
    }
}
```

Registration in the main plugin class:

```typescript
this.registerView(
    'voice-editor',
    (leaf) => new VoiceEditorView(leaf)
);
```

Activation:

```typescript
const leaf = this.app.workspace.getLeaf(true);
await leaf.setViewState({
    type: 'voice-editor',
    active: true
});
```

### Editor Extensions via CodeMirror 6

For enhancing the existing editor with overlay features:

```typescript
import { EditorView } from '@codemirror/view';

this.registerEditorExtension([
    EditorView.theme({
        '.voice-indicator': {
            backgroundColor: 'rgba(255, 0, 0, 0.1)',
            padding: '2px'
        }
    }),
    // Additional CM6 extensions
]);
```

Important considerations:
- Must use Obsidian's bundled CodeMirror 6 classes
- Mark @codemirror dependencies as external in bundler
- Extensions apply to all editor instances

### Modal-Based Interfaces

For full-screen or overlay editing experiences:

```typescript
import { Modal, App } from 'obsidian';

class VoiceEditorModal extends Modal {
    constructor(app: App, private file: TFile) {
        super(app);
    }

    onOpen() {
        const { contentEl } = this;
        contentEl.addClass('voice-editor-modal');
        
        // Create full-screen interface
        const container = contentEl.createDiv('voice-container');
        
        // Add large touch-friendly controls
        const recordButton = container.createEl('button', {
            text: '🎤 Start Recording',
            cls: 'voice-record-button'
        });
    }
}
```

## Key APIs and Components

### Core View Components

- **ItemView**: Base class for creating custom view panes
  - Full control over content and behavior
  - Integrates with Obsidian's workspace system
  - Can save and restore state

- **WorkspaceLeaf**: Container for views in the workspace
  - Controls where views appear (main area, sidebars, etc.)
  - Manages view lifecycle

- **Modal**: Overlay interface component
  - Good for full-screen experiences
  - Doesn't require workspace integration
  - Ideal for mobile interfaces

### Editor Manipulation APIs

- **MarkdownView**: Access to markdown file content and metadata
  - `getFile()`: Get the associated TFile
  - `getEditor()`: Access the Editor instance
  - `save()`: Save changes to disk

- **Editor**: Direct text manipulation interface
  - `getValue()`: Get entire document text
  - `setValue()`: Replace entire document
  - `replaceSelection()`: Insert/replace at cursor
  - `getSelection()`: Get selected text

- **EditorView**: CodeMirror 6 interface
  - Access to CM6 state and extensions
  - Advanced decoration and widget capabilities
  - Real-time syntax tree access

### File System APIs

- **TFile**: Represents a file in the vault
- **Vault**: File operations (read, modify, create)
- **MetadataCache**: Access to parsed file metadata

## Ecosystem Examples

### Kanban Plugin
Creates a completely different view for markdown files formatted as Kanban boards.
Uses ItemView to render cards and columns instead of traditional text editing.
Demonstrates that plugins can completely reimagine how content is displayed and edited.

### Excalidraw Plugin
Provides a full drawing interface within Obsidian.
Stores drawings as markdown files with embedded JSON data.
Shows how plugins can use alternative data formats while maintaining markdown compatibility.

### Editing Toolbar Plugin
Adds a Word-like toolbar to the existing editor.
Provides a "minimal mode" that creates a distraction-free writing experience.
Demonstrates enhancing rather than replacing the editor.

### Dataview Plugin
Creates custom views for querying and displaying vault data.
Uses code blocks to define queries that render as tables, lists, or custom formats.
Shows how plugins can provide data-driven interfaces.

## Voice-Controller Recommendations

For the Obsidian Operator project, based on this research, I recommend:

### Primary Approach: Custom ItemView

Create a dedicated `VoiceEditorView` using ItemView because:

1. **Full Control**: Complete ownership of the interface design
2. **Mobile Optimization**: Can create large, touch-friendly controls
3. **State Management**: Built-in state persistence for transcription sessions
4. **File Integration**: Direct access to markdown files via MarkdownView
5. **Workspace Integration**: Works with Obsidian's tab and pane system

### Implementation Strategy

1. **Create Voice Editor View**:
   - Large, full-screen interface optimized for mobile
   - Minimal touch interactions required
   - Visual feedback for voice states (listening, processing, idle)

2. **Dual Mode Design**:
   - Transcription mode: Continuous capture with minimal UI
   - Command mode: Interactive controls visible

3. **File Handling**:
   - Use Vault API for file operations
   - Maintain markdown format for compatibility
   - Consider dual storage: structured logs + rendered markdown

4. **Mobile-First Design**:
   - Test on iOS Obsidian app early
   - Design for portrait orientation primarily
   - Consider CarPlay display constraints

### Fallback Approach: Modal Interface

If ItemView has limitations on mobile, use Modal as fallback:
- Can achieve true full-screen on mobile
- Simpler implementation
- Less integration with workspace

## Implementation Considerations

### Mobile and iOS Constraints

- Obsidian mobile may have different API availability
- Full-screen capabilities might be restricted
- Test early and often on target devices
- Consider PWA limitations on iOS

### CarPlay Optimization

- Design for minimal interaction
- Large touch targets (minimum 44x44 points)
- High contrast for daylight visibility
- Voice feedback for all actions

### Safety-Focused Design

- Minimize required touch interactions
- Provide audio confirmations
- Auto-save frequently
- Clear visual state indicators

### Technical Requirements

- TypeScript for type safety
- Proper cleanup in onClose/onunload
- Handle app lifecycle events
- Consider offline functionality

### State Management

- Persist recording state between sessions
- Handle app backgrounding gracefully
- Implement recovery from crashes
- Maintain transcription history

## References and Resources

### Official Documentation
- [Obsidian Plugin Development](https://docs.obsidian.md/Plugins/Getting+started/Build+a+plugin)
- [Views API](https://docs.obsidian.md/Plugins/User+interface/Views)
- [ItemView Reference](https://docs.obsidian.md/Reference/TypeScript+API/ItemView)
- [Editor Extensions](https://docs.obsidian.md/Plugins/Editor/Editor+extensions)

### Community Resources
- [Obsidian Hub - Plugins with Custom Views](https://publish.obsidian.md/hub/02+-+Community+Expansions/02.01+Plugins+by+Category/Plugins+with+custom+views)
- [Obsidian Forum - Plugin Development](https://forum.obsidian.md/c/developers/18)

### Example Implementations
- [Obsidian Sample Plugin](https://github.com/obsidianmd/obsidian-sample-plugin)
- [Kanban Plugin](https://github.com/mgmeyers/obsidian-kanban)
- [Excalidraw Plugin](https://github.com/zsviczian/obsidian-excalidraw-plugin)
- [Editing Toolbar](https://github.com/PKM-er/obsidian-editing-toolbar)

### CodeMirror 6 Resources
- [CodeMirror 6 System Guide](https://codemirror.net/docs/guide/)
- [CodeMirror 6 Decoration Examples](https://codemirror.net/examples/decoration/)

## Conclusion

Obsidian's plugin architecture provides excellent support for creating alternative editor views.
The ItemView approach is ideal for the Obsidian Operator's voice-controlled interface requirements.
The ecosystem demonstrates successful implementations of diverse editing experiences, from Kanban boards to drawing tools.
With proper implementation, a voice-controlled editor view can provide a safe, hands-free editing experience optimized for mobile and CarPlay use cases.