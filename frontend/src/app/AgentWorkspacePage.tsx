import { useEffect, useMemo, useState } from 'react'
import { ChatHistorySidebar } from '../components/ChatHistorySidebar'
import { ChatMessages } from '../components/ChatMessages'
import { Composer } from '../components/Composer'
import { FileExplorerPanel } from '../components/FileExplorerPanel'
import { HeaderBar } from '../components/HeaderBar'
import { MobileTabBar } from '../components/MobileTabBar'
import { SettingsModal } from '../components/SettingsModal'
import { fetchFilePreview, fetchFileTree, fetchProviderMetadata, fetchProviderModels } from '../lib/api'
import { useChatStream } from '../hooks/useChatStream'
import { useAppStore } from '../state/useAppStore'
import type { ProviderId } from '../types/app'

export function AgentWorkspacePage() {
  const [input, setInput] = useState('')
  const {
    chats,
    activeChatId,
    sidebarOpen,
    mobileTab,
    settingsOpen,
    providerMeta,
    providers,
    selectedProvider,
    selectedModel,
    e2bApiKey,
    e2bTemplateId,
    runtime,
    ensureChat,
    createChat,
    selectChat,
    deleteChat,
    clearCurrentChat,
    setSidebarOpen,
    setMobileTab,
    setSettingsOpen,
    setProviderMeta,
    updateProvider,
    setProviderModels,
    setProviderStatus,
    setSelectedProvider,
    setSelectedModel,
    setE2bApiKey,
    setE2bTemplateId,
    startStream,
    setFileTree,
    setSelectedFile,
  } = useAppStore()

  const activeChat = useMemo(
    () => chats.find((chat) => chat.id === activeChatId) ?? chats[0],
    [activeChatId, chats],
  )

  const readyToChat = Boolean(providers[selectedProvider].apiKey && selectedModel && e2bApiKey)

  const { streamChat, stop } = useChatStream()

  useEffect(() => {
    ensureChat()
  }, [ensureChat])

  useEffect(() => {
    fetchProviderMetadata()
      .then(setProviderMeta)
      .catch(() => undefined)
  }, [setProviderMeta])

  const saveSettings = async () => {
    const providerIds = Object.keys(providerMeta) as ProviderId[]

    await Promise.all(
      providerIds.map(async (provider) => {
        const config = providers[provider]
        if (!config.apiKey.trim()) {
          setProviderStatus(provider, 'idle')
          return
        }

        setProviderStatus(provider, 'loading')
        try {
          const models = await fetchProviderModels({
            provider,
            apiKey: config.apiKey,
            baseUrl: config.baseUrl,
          })
          setProviderModels(provider, models)
        } catch (error) {
          setProviderModels(
            provider,
            [],
            error instanceof Error ? error.message : 'Failed to load models.',
          )
        }
      }),
    )

    setSettingsOpen(false)
  }

  const sendMessage = async () => {
    if (!activeChat || runtime.isStreaming || !input.trim()) {
      return
    }

    if (!readyToChat) {
      setSettingsOpen(true)
      return
    }

    const message = input.trim()
    setInput('')
    startStream(message)

    await streamChat({
      chatId: activeChat.id,
      message,
      transcript: activeChat.transcript,
      provider: selectedProvider,
      model: selectedModel,
      credentials: {
        apiKey: providers[selectedProvider].apiKey,
        baseUrl: providers[selectedProvider].baseUrl,
      },
      sandbox: {
        apiKey: e2bApiKey,
        sandboxId: activeChat.sandbox?.sandboxId,
        templateId: e2bTemplateId || undefined,
        timeoutMs: 60 * 60 * 1000,
      },
    })
  }

  const refreshFiles = async () => {
    if (!activeChat?.sandbox?.sandboxId || !e2bApiKey) return
    const tree = await fetchFileTree({
      sandboxId: activeChat.sandbox.sandboxId,
      apiKey: e2bApiKey,
    })
    setFileTree(tree)
  }

  const openFile = async (filePath: string) => {
    if (!activeChat?.sandbox?.sandboxId || !e2bApiKey) return
    const preview = await fetchFilePreview({
      sandboxId: activeChat.sandbox.sandboxId,
      apiKey: e2bApiKey,
      filePath,
    })
    setSelectedFile(filePath, preview.exists ? preview.content : 'File not found.')
  }

  return (
    <div className="app" data-design-id="app-container">
      <div className="desktop-shell" data-design-id="desktop-layout">
        <div className="left-stage">
          <ChatHistorySidebar
            open={sidebarOpen}
            chats={chats}
            activeChatId={activeChat?.id ?? null}
            onToggle={() => setSidebarOpen(!sidebarOpen)}
            onCreate={createChat}
            onSelect={selectChat}
            onDelete={deleteChat}
          />

          <section className="chat-column" data-design-id="chat-panel-container">
            <div className="chat-panel" data-design-id="chat-panel">
              <HeaderBar
                title={activeChat?.title ?? 'Orange AI Coding Agent'}
                onReset={clearCurrentChat}
                onOpenSettings={() => setSettingsOpen(true)}
              />
              <ChatMessages messages={activeChat?.messages ?? []} runtime={runtime} />
              <Composer
                value={input}
                onChange={setInput}
                onSend={() => {
                  void sendMessage()
                }}
                onStop={stop}
                runtime={runtime}
                providers={providers}
                providerMeta={providerMeta}
                selectedProvider={selectedProvider}
                selectedModel={selectedModel}
                onProviderChange={setSelectedProvider}
                onModelChange={setSelectedModel}
                readyToChat={readyToChat}
              />
            </div>
          </section>
        </div>

        <section className="workspace-wrap" data-design-id="right-panel-container">
          <FileExplorerPanel
            tree={activeChat?.fileTree ?? []}
            selectedFilePath={activeChat?.selectedFilePath}
            selectedFileContent={activeChat?.selectedFileContent}
            sandboxId={activeChat?.sandbox?.sandboxId}
            onRefresh={() => {
              void refreshFiles()
            }}
            onSelectFile={(path) => {
              void openFile(path)
            }}
          />
        </section>
      </div>

      <div className="mobile-shell">
        <main className="mobile-stage">
          <div className={`mobile-view ${mobileTab === 'chat' ? 'active' : ''}`}>
            <div className="mobile-panel-card">
              <div className="mobile-chat-panel">
                <HeaderBar
                  title={activeChat?.title ?? 'Orange AI Coding Agent'}
                  onReset={clearCurrentChat}
                  onOpenSettings={() => setSettingsOpen(true)}
                />
                <ChatMessages messages={activeChat?.messages ?? []} runtime={runtime} />
                <Composer
                  value={input}
                  onChange={setInput}
                  onSend={() => {
                    void sendMessage()
                  }}
                  onStop={stop}
                  runtime={runtime}
                  providers={providers}
                  providerMeta={providerMeta}
                  selectedProvider={selectedProvider}
                  selectedModel={selectedModel}
                  onProviderChange={setSelectedProvider}
                  onModelChange={setSelectedModel}
                  readyToChat={readyToChat}
                />
              </div>
            </div>
          </div>

          <div className={`mobile-view ${mobileTab === 'files' ? 'active' : ''}`}>
            <div className="mobile-panel-card">
              <div className="mobile-workspace">
                <FileExplorerPanel
                  tree={activeChat?.fileTree ?? []}
                  selectedFilePath={activeChat?.selectedFilePath}
                  selectedFileContent={activeChat?.selectedFileContent}
                  sandboxId={activeChat?.sandbox?.sandboxId}
                  onRefresh={() => {
                    void refreshFiles()
                  }}
                  onSelectFile={(path) => {
                    void openFile(path)
                  }}
                  variant="mobile"
                />
              </div>
            </div>
          </div>
        </main>

        <MobileTabBar activeTab={mobileTab} onChange={setMobileTab} />
      </div>

      <SettingsModal
        open={settingsOpen}
        providerMeta={providerMeta}
        providers={providers}
        e2bApiKey={e2bApiKey}
        e2bTemplateId={e2bTemplateId}
        onClose={() => setSettingsOpen(false)}
        onProviderFieldChange={(provider, field, value) => updateProvider(provider, { [field]: value })}
        onE2bApiKeyChange={setE2bApiKey}
        onE2bTemplateIdChange={setE2bTemplateId}
        onSave={() => {
          void saveSettings()
        }}
      />
    </div>
  )
}