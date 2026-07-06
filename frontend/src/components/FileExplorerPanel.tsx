import { ChevronRight, FileCode2, Folder, RefreshCcw } from 'lucide-react'
import clsx from 'clsx'
import type { FileNode } from '../types/app'
import { fileTypeClass } from '../utils/chat'
import { withLineNumbers } from '../utils/code'

type TreeNodeProps = {
  node: FileNode
  selectedFilePath?: string
  onSelectFile: (path: string) => void
}

function TreeNode({ node, selectedFilePath, onSelectFile }: TreeNodeProps) {
  if (node.type === 'dir') {
    return (
      <div className="tree-node">
        <div className="tree-row">
          <span className="tree-chevron open">
            <ChevronRight size={10} />
          </span>
          <span className="tree-icon folder">
            <Folder size={14} />
          </span>
          <span>{node.name}</span>
        </div>
        <div className="tree-children">
          {node.children?.map((child) => (
            <TreeNode
              key={child.path}
              node={child}
              selectedFilePath={selectedFilePath}
              onSelectFile={onSelectFile}
            />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="tree-row clickable-row" onClick={() => onSelectFile(node.path)}>
      <span className="tree-chevron" />
      <span className={clsx('tree-icon', fileTypeClass(node))}>
        <FileCode2 size={14} />
      </span>
      <span className={clsx(node.path === selectedFilePath && 'active-file-name')}>{node.name}</span>
    </div>
  )
}

type Props = {
  tree: FileNode[]
  selectedFilePath?: string
  selectedFileContent?: string
  onRefresh: () => void
  onSelectFile: (path: string) => void
}

export function FileExplorerPanel({
  tree,
  selectedFilePath,
  selectedFileContent,
  onRefresh,
  onSelectFile,
}: Props) {
  const lines = selectedFileContent ? withLineNumbers(selectedFileContent) : []

  return (
    <div className="workspace-card">
      <header className="workspace-header" data-design-id="right-panel-header">
        <div className="brand compact-brand">
          <span style={{ color: 'var(--muted-foreground)', display: 'flex', alignItems: 'center' }}>
            <Folder size={18} />
          </span>
          <span style={{ fontWeight: 600, fontSize: 14 }}>Workspace Files</span>
        </div>
        <button className="icon-btn" onClick={onRefresh} aria-label="Refresh files">
          <RefreshCcw size={16} />
        </button>
      </header>

      <section className="panel-view files-layout active" data-design-id="file-panel">
        <aside className="file-explorer" data-design-id="file-explorer">
          <div className="explorer-header">
            <span>Explorer</span>
            <button aria-label="Refresh files" onClick={onRefresh}>
              <RefreshCcw size={14} />
            </button>
          </div>
          <div className="file-tree">
            {tree.length ? (
              tree.map((node) => (
                <TreeNode
                  key={node.path}
                  node={node}
                  selectedFilePath={selectedFilePath}
                  onSelectFile={onSelectFile}
                />
              ))
            ) : (
              <div className="empty-pane">No sandbox files yet. Ask the agent to create something.</div>
            )}
          </div>
        </aside>

        <div className="file-editor-region" data-design-id="code-editor-area">
          <div className="tab-strip">
            <div className="file-tab active">{selectedFilePath ? selectedFilePath.split('/').at(-1) : 'No file selected'}</div>
          </div>
          <div className="crumbs mono">{selectedFilePath || '/home/user'}</div>
          <div className="editor-shell editor-flat">
            <div className="editor-header">{selectedFilePath || 'Preview'}</div>
            <div className="editor-stage">
              {selectedFileContent ? (
                <div className="code-preview">
                  {lines.map((line, index) => (
                    <div key={`${index}_${line}`} className="code-line">
                      <span className="line-num">{index + 1}</span>
                      <span>{line || ' '}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-pane">Select a file from the explorer to preview its contents.</div>
              )}
            </div>
            <div className="editor-footer">
              <div className="left">
                <span>{selectedFilePath ? `Lines ${lines.length}` : 'No selection'}</span>
              </div>
              <div className="right">
                <span>Sandbox preview</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
