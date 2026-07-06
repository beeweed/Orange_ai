# File Workspace and Editor Preview

## Overview
Rebuild the right-side workspace area so it matches the supplied design’s file explorer and editor preview while preserving the existing file tree loading and file preview logic.

## Goals
- Match the workspace panel styling from the HTML reference.
- Keep refresh and file-open interactions functional.
- Present nested file trees and selected file content clearly.

## Scope / non-goals
- In scope: workspace card, explorer panel, file list, selected file tabs, code preview, empty states.
- Out of scope: editing files, saving files, or new backend capabilities.

## User flows / UX / design notes
- Desktop workspace is a rounded elevated card with a slim header.
- Left area shows file tree; right area shows selected file tabs and code preview.
- Mobile files tab should prioritize file tree and selected file content in a compact stack.
- Code area uses Fira Code and line-oriented preview styling.

## Functional requirements
- Refresh file tree from active sandbox.
- Open a file and show preview content.
- Highlight selected file.
- Render nested directories recursively.
- Show meaningful empty states when there is no sandbox or no selected file.

## Data model / schema
- Uses `FileNode[]`, `selectedFilePath`, `selectedFileContent`, and active chat sandbox summary.
- No schema changes.

## API contracts
- Uses existing `/api/sandbox/files/tree` and `/api/sandbox/files/read` endpoints.

## Edge cases / failure modes
- No sandbox yet: prompt user to start a chat first.
- File missing: display returned not-found copy.
- Very large content: preserve scroll and readable line wrapping behavior.
- Deep trees: maintain indentation and collapse/readability.

## Acceptance criteria
- Workspace appearance is consistent with the provided design.
- Refresh and file-open behavior work with existing APIs.
- Empty and selected states are polished and readable on desktop and mobile.

## Test plan / test cases
- Load an empty chat and verify no-sandbox empty state.
- After sandbox exists, refresh file tree and open multiple files.
- Verify nested folder rendering and active file highlighting.
- Verify mobile files tab layout remains usable.

## Implementation notes
- Convert selected file content into a lightweight code preview with numbered lines.
- Avoid any editable editor dependency; use semantic pre/code rendering.

## Status / open questions
- Status: done
- Open questions: true sandbox content requires user-provided E2B credentials.