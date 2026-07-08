import clsx from 'clsx'
import { ChevronRight, FileCode2, Folder, RefreshCcw } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import type { FileNode } from '../types/app'
import { fileTypeClass } from '../utils/chat'
import { withLineNumbers } from '../utils/code'

type TreeNodeProps = {
  node: FileNode
  depth?: number
  openPaths: Set<string>
  togglePath: (path: string) => void
  selectedFilePath?: string
  onSelectFile: (path: string) => void
}

type Props = {
  tree: FileNode[]
  selectedFilePath?: string
  selectedFileContent?: string
  sandboxId?: string
  onRefresh: () => void
  onSelectFile: (path: string) => void
  variant?: 'desktop' | 'mobile'
}

function collectDirectoryPaths(nodes: FileNode[]): string[] {
  return nodes.flatMap((node) => {
    if (node.type !== 'dir') return []
    return [node.path, ...collectDirectoryPaths(node.children ?? [])]
  })
}

function fileName(path?: string) {
  return path?.split('/').at(-1) ?? 'No file selected'
}

function TreeNode({ node, depth = 0, openPaths, togglePath, selectedFilePath, onSelectFile }: TreeNodeProps) {
  if (node.type === 'dir') {
    const isOpen = openPaths.has(node.path)

    return (
      <div className="tree-node">
        <button className="tree-row" onClick={() => togglePath(node.path)} style={{ paddingLeft: 14 + depth * 16 }}>
          <span className={clsx('tree-chevron', isOpen && 'open')}>
            <ChevronRight size={11} />
          </span>
          <span className="tree-icon folder">
            <Folder size={14} />
          </span>
          <span>{node.name}</span>
        </button>

        {isOpen ? (
          <div className="tree-children">
            {node.children?.map((child) => (
              <TreeNode
                key={child.path}
                node={child}
                depth={depth + 1}
                openPaths={openPaths}
                togglePath={togglePath}
                selectedFilePath={selectedFilePath}
                onSelectFile={onSelectFile}
              />
            ))}
          </div>
        ) : null}
      </div>
    )
  }

  return (
    <button
      className={clsx('tree-row', 'clickable-row', node.path === selectedFilePath && 'active')}
      onClick={() => onSelectFile(node.path)}
      style={{ paddingLeft: 14 + depth * 16 }}
    >
      <span className="tree-chevron" />
      <span className={clsx('tree-icon', fileTypeClass(node))}>
        <FileCode2 size={14} />
      </span>
      <span className={clsx(node.path === selectedFilePath && 'active-file-name')}>{node.name}</span>
    </button>
  )
}

export function FileExplorerPanel({
  tree,
  selectedFilePath,
  selectedFileContent,
  sandboxId,
  onRefresh,
  onSelectFile,
  variant = 'desktop',
}: Props) {
  const lines = useMemo(() => (selectedFileContent ? withLineNumbers(selectedFileContent) : []), [selectedFileContent])
  const [openPaths, setOpenPaths] = useState<Set<string>>(new Set())
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    setOpenPaths(new Set(collectDirectoryPaths(tree)))
  }, [tree])

  const togglePath = (path: string) => {
    setOpenPaths((current) => {
      const next = new Set(current)
      if (next.has(path)) {
        next.delete(path)
      } else {
        next.add(path)
      }
      return next
    })
  }

  const handleRefresh = useCallback(() => {
    setRefreshing(true)
    onRefresh()
    setTimeout(() => setRefreshing(false), 2000)
  }, [onRefresh])

  return (
    <div className={clsx('workspace-card', variant === 'mobile' && 'workspace-card-mobile')}>
      <header className="workspace-header" data-design-id="right-panel-header">
        <div className="brand compact-brand">
          <span className="workspace-title-icon">
            <Folder size={18} />
          </span>
          <span className="workspace-title">Workspace Files</span>
        </div>

        <button className="icon-btn" onClick={handleRefresh} aria-label="Refresh files">
          <RefreshCcw size={16} className={refreshing ? 'spin' : ''} />
        </button>
      </header>

      <div className="panel-body">
        <section className="panel-view files-layout active" data-design-id="file-panel">
          <aside className="file-explorer" data-design-id="file-explorer">
            <div className="explorer-header">
              <span className="explorer-heading">
                <Folder size={14} />
                Explorer
              </span>
              <button aria-label="Refresh files" onClick={handleRefresh}>
                <RefreshCcw size={14} className={refreshing ? 'spin' : ''} />
              </button>
            </div>

            <div className="file-tree">
              {tree.length ? (
                tree.map((node) => (
                  <TreeNode
                    key={node.path}
                    node={node}
                    openPaths={openPaths}
                    togglePath={togglePath}
                    selectedFilePath={selectedFilePath}
                    onSelectFile={onSelectFile}
                  />
                ))
              ) : sandboxId ? (
                <div className="empty-pane left-pane-empty">No files loaded yet. Refresh the explorer after the agent creates output.</div>
              ) : (
                <div className="empty-pane left-pane-empty">Start a chat run with a valid E2B key to create a sandbox and populate the workspace explorer.</div>
              )}
            </div>
          </aside>

          <div className="file-editor-region" data-design-id="code-editor-area">
            <div className="tab-strip">
              <div className="file-tab active">
                <span className={clsx('tree-icon', selectedFilePath ? 'ts' : 'file')}>
                  <FileCode2 size={14} />
                </span>
                {fileName(selectedFilePath)}
              </div>
            </div>

            <div className="crumbs mono">{selectedFilePath || (sandboxId ? '/home/user' : 'No sandbox connected')}</div>

                <div className="editor-shell editor-flat">
                  <div className="editor-header">{fileName(selectedFilePath)}</div>
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
                  <div className="empty-pane editor-empty-state">
                    {sandboxId
                      ? 'Select a file from the explorer to preview its contents.'
                      : 'A sandbox preview will appear here after the first successful agent run.'}
                  </div>
                )}
              </div>
              <div className="editor-footer">
                <div className="left">
                  <span>{selectedFilePath ? `Lines ${lines.length}` : 'No selection'}</span>
                  <span>{sandboxId ? 'Sandbox connected' : 'Sandbox offline'}</span>
                </div>
                <div className="right">
                  <span>Preview only</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}