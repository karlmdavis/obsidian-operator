# To-Do: Open Issues and Questions

## Introduction

This file is used to keep track of open issues and questions related to the project.
It's particularly necessary since I'm relying so heavily on LLM-generated code:
  need to review the LLMs' work, often in large batches,
  and go through my findings one by one without overwhelming the context windows.

## Observations for [Phase 1: Hello World Plugin Project Setup](https://github.com/karlmdavis/obsidian-operator/pull/6)

### Commit `3c6dacf6913ec1b8e5ef07543a8772d91de900ce`

What does the `claude.yml` workflow do?

Why does `codeql.yml` run for both JS and TS?

In the `coverage.yml` workflow...

- Is anything using the diff coverage data that gets generated?
- Why upload to codecov with the fallback to coveralls?
- The "Comment PR with coverage report" step seems real custom. Isn't there anything that does that out of the box?
- Does the trend analysis at the end work? How? Is it storing coverage in Git objects attached to the commits?

In the `pr-validation.yml` workflow...

- Why is "Check for merge conflicts" there if it's a no-op and handled by GH itself?
- The "Validate file changes" step seems silly if all it's doing is logging a warning that nothing checks.
- What's the point of the "Label PR based on files changed" step? Not seeing the value.

What's the point of all the extra sections in `CODEOWNERS`?

Why is `indentStyle` set to tabs? Aren't spaces idiomatic?

In `biome.json`, why are `noNonNullAssertion` and `noExplicitAny` disabled?
If it's for mocks/tests, can that be path-scoped?

`build.ts`...

1. How come VS Code can't resolve so many function references?
2. Why does it need a custom runTypeCheck(...) method. Shouldn't that be built-in?
3. is validatePluginOutput(...) needed? Seems a bit extra.
4. Why does it need a custom build(...) method? Shouldn't that be built-in?

`package.json`...

1. Is the minimum version of Node (18) the right one for Obsidian? @types/node is at 22, and the latest available is 24.    
2. Can we update the dependencies to the latest versions, or should we let renovate do that after this gets merged?
3. Why does .husky/pre-commit not use the pre-commit hook defined in package.json? Does anything use the pre-push hook in there? Need to reconcile all that.
4. These are all the same: test:coverage:check, test:coverage:strict, test:coverage. Are they redundant?
5. Also redundant: test and ci:test.
6. Also redundant: coverage:summary and test:coverage:text.

Could the CSS be organized better, and make better use of hierarchy?

`CONTRIBUTING.md`...

1. Could mention the use of volta to manage Node.js versions.
2. What is the hotreload plugin it keeps mentioning? I've not seen it anywhere, nor seen it working.
3. Is the coverage standards table accurate? I think the only thing being enforced is the blanket 80% target?
4. Should mention commenting strategy.

`main.ts`...

1. Thoughts on UX:
    1. Modal only makes sense for command-only interactions, e.g., "find file", "new file", etc.
       Even then... no easy way to open it while driving, so maybe nix it.
    2. Most urgent use case: ability to append to a document and also get a summary of "where I left off".
    3. Could store recordings, history, etc. in a sidecar file. Might need a checksum?
       Or in a directory.
    4. Need to switch view to have a path / be an editor.
2. The Recording View uses the "sidebar-right" icon, which seems weird.
3. Seems odd that activateView() in main.ts is the primary callback for opening a Recording View.
   Is that the best way to structure that?
4. The comments on line 74 are superfluous.
5. Shouldn't onunload() also close any open views? Or is that something else's responsibility?

`RecordingUI.ts`...

1. Need to test the Recording View at mobile-ish UI sizes. Are the buttons big enough?
2. The way that RecordingUIProps get created in the updateUI hooks seems really odd. Is that idiomatic TS?
3. State management is a **whole thing** for this plugin. Would React help? Are other plugins using it?
4. Next steps:
    1. Refactor RecordingUI into a component that can initiate recordings,
         which get transcribed,
         and turns those transcriptions into events.
       Has a single registered event handler/consumer.
        1. For editors (i.e. views), the event consumer primarily appends text to the Markdown file being edited.
        2. For command operators, the event consumer primarily drives navigation events.
    2. We want to stick with mocks for now, so the UI should:
        1. Have a single large record/pause/resume button.
        2. A "Dictate" / "Command" toggle, with large driving-safe buttons.
        3. The recording worker should have two thread-safe operations:
            1. Peek: Returns the tail of the unbounded transcription buffer that it accumulates.
            2. Chomp: Consumes and returns the full transcription buffer, atomically.
        4. The recording UI, for now, should have a large driving-safe "Chomp" button.
            1. When in "Dictate" mode, this should chomp the buffer and append the text to the file being edited.
            2. When in "Command" mode, this should chomp the buffer and send it to the command processor.
        5. For now, the command processor should just produce a notification with the chomped text.
        6. The recording UI should regularly "peek" the buffer and display a driving-safe amount of the latest transcribed text.
5. Every render tick, it's clearing and re-creating the DOM.
6. The "testing helper methods" comments should be on each method, rather than on the block/section.

`GlobalRecordingState`...

1. How does the observer pattern integrate with the render loop?
2. Why is it including its current list of listeners as observable state?

`LocalRecordingState`...

1. The state modeling here is very silly.

`index.ts`...

1. Centralizing types like this is bad for both humans and LLMs: easy to forget about them.
2. I don't think these are used: `PluginEvent`, `RecordingEvent`, `SyncCallback`, `AsyncCallback`, `PluginConfig`, `PluginEnvironment`, `UIElementOptions` and children.

`obsidian-imports.test.ts`...

1. Silly comment at the top.

`recording-workflow.test.ts`...

1. Why is it requiring `RecordingUI.js` as `any`? Why not the TS?

`obsidian.js`...

1. Why do we have this and also `obsidian.ts`?

`RecordingUI.test.ts`...

1. Why do we have two instances of this?
2. We have tests for the child UI and for the modal, but none for the View.

`sample.test.ts`...

1. Do we still need this?
