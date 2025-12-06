"use client"

import { useState, useEffect, useCallback } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { NotesInput } from "@/components/notes-input"
import { ActionButtons } from "@/components/action-buttons"
import { OutputPanel } from "@/components/output-panel"
import { DocumentsSidebar } from "@/components/documents-sidebar"
import { WelcomeOverlay } from "@/components/welcome-overlay"
import { LimitReachedOverlay } from "@/components/limit-reached-overlay"
import type { ActionType } from "@/lib/ai"
import type { Document } from "@/lib/documents"
import { hasReachedLimit, getResetTime, incrementDocumentCount } from "@/lib/usage-limits"

export default function HomePage() {
  const [notes, setNotes] = useState("")
  const [title, setTitle] = useState("")
  const [output, setOutput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | undefined>()

  const [documents, setDocuments] = useState<Document[]>([])
  const [currentDocId, setCurrentDocId] = useState<string | null>(null)
  const [isLoadingDocs, setIsLoadingDocs] = useState(true)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  const [showWelcome, setShowWelcome] = useState(false)
  const [showLimitReached, setShowLimitReached] = useState(false)
  const [limitReached, setLimitReached] = useState(false)

  // Fetch documents on mount
  const fetchDocuments = useCallback(async () => {
    try {
      const response = await fetch("/api/documents")
      const data = await response.json()
      if (response.ok) {
        setDocuments(data.documents)
      }
    } catch (err) {
      console.error("Failed to fetch documents:", err)
    } finally {
      setIsLoadingDocs(false)
    }
  }, [])

  useEffect(() => {
    const hasVisited = localStorage.getItem("notes-ai-visited")
    if (!hasVisited) {
      setShowWelcome(true)
    }
  }, [])

  useEffect(() => {
    fetchDocuments()
  }, [fetchDocuments])

  // Check usage limits on mount and periodically
  useEffect(() => {
    const checkLimits = () => {
      setLimitReached(hasReachedLimit())
    }

    checkLimits()
    // Check every minute in case reset time has passed
    const interval = setInterval(checkLimits, 60000)

    return () => clearInterval(interval)
  }, [])

  // Auto-save functionality with debouncing
  useEffect(() => {
    // Don't auto-save if there's no content
    if (!notes.trim()) return

    // Debounce auto-save by 2 seconds
    const autoSaveTimer = setTimeout(async () => {
      if (!isSaving && !isLoading) {
        try {
          // If this is a new document, check limits
          if (!currentDocId) {
            if (hasReachedLimit()) {
              setShowLimitReached(true)
              return
            }
          }

          const response = await fetch("/api/documents", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id: currentDocId,
              title: title || "Untitled Document",
              content: notes,
              output: output || undefined,
            }),
          })

          const data = await response.json()

          if (response.ok) {
            // Update current doc ID if it's a new document
            if (!currentDocId && data.document.id) {
              setCurrentDocId(data.document.id)
              // Increment usage counter for new document
              incrementDocumentCount()
              // Recheck limits
              setLimitReached(hasReachedLimit())
            }
            // Silently refresh documents list
            fetchDocuments()
          }
        } catch (err) {
          console.error("Auto-save failed:", err)
          // Don't show error for auto-save failures
        }
      }
    }, 2000) // 2 second debounce

    return () => clearTimeout(autoSaveTimer)
  }, [notes, title, output, currentDocId, isSaving, isLoading, fetchDocuments])

  const handleAction = async (action: ActionType) => {
    if (!notes.trim()) {
      setError("Please paste some notes first.")
      return
    }

    // Check if user has reached free tier limit
    if (limitReached) {
      setShowLimitReached(true)
      return
    }

    setIsLoading(true)
    setError(undefined)
    setOutput("")

    try {
      const response = await fetch("/api/clean", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes, action }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to process notes")
      }

      setOutput(data.result)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    if (!notes.trim()) {
      setError("Please add some content first.")
      return
    }

    setIsSaving(true)
    setError(undefined)

    try {
      const response = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: currentDocId,
          title: title || "Untitled Document",
          content: notes,
          output: output || undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to save document")
      }

      setCurrentDocId(data.document.id)
      await fetchDocuments()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save document")
    } finally {
      setIsSaving(false)
    }
  }

  const handleSelectDoc = (doc: Document) => {
    setCurrentDocId(doc.id)
    setTitle(doc.title)
    setNotes(doc.content)
    setOutput(doc.output || "")
    setError(undefined)
  }

  const handleNewDoc = () => {
    // Check if user has reached free tier limit
    if (hasReachedLimit()) {
      setShowLimitReached(true)
      return
    }

    setCurrentDocId(null)
    setTitle("")
    setNotes("")
    setOutput("")
    setError(undefined)
  }

  const handleDeleteDoc = async (id: string) => {
    try {
      const response = await fetch(`/api/documents/${id}`, { method: "DELETE" })

      if (response.ok) {
        if (currentDocId === id) {
          handleNewDoc()
        }
        await fetchDocuments()
      }
    } catch (err) {
      console.error("Failed to delete document:", err)
    }
  }

  const handleCloseWelcome = () => {
    localStorage.setItem("notes-ai-visited", "true")
    setShowWelcome(false)
  }

  return (
    <div className="min-h-screen flex flex-col bg-background relative z-0">
      {showWelcome && <WelcomeOverlay onClose={handleCloseWelcome} />}
      {showLimitReached && <LimitReachedOverlay onClose={() => setShowLimitReached(false)} resetTime={getResetTime()} />}

      <DocumentsSidebar
        documents={documents}
        currentDocId={currentDocId}
        onSelectDoc={handleSelectDoc}
        onNewDoc={handleNewDoc}
        onDeleteDoc={handleDeleteDoc}
        isLoading={isLoadingDocs}
        isMobileOpen={mobileSidebarOpen}
        onToggleMobile={() => setMobileSidebarOpen(!mobileSidebarOpen)}
      />

      <div className="flex flex-col min-h-screen transition-all duration-200 md:ml-64">
        <Header onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)} />

        <main className="flex-1 overflow-auto">
          <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
            {/* Hero Section */}
            <div className="text-center mb-6 sm:mb-10">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-foreground mb-2 sm:mb-3 text-balance px-2">
                Transform messy notes into clarity
              </h1>
              <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto text-pretty px-4">
                Paste your notes, select an action, and let AI clean, organize, and summarize them instantly.
              </p>
            </div>

            {/* Main Content */}
            <div className="flex flex-col lg:grid lg:grid-cols-2 gap-4 sm:gap-6 max-w-6xl mx-auto">
              {/* Input Section */}
              <div className="space-y-4">
                <NotesInput
                  value={notes}
                  onChange={setNotes}
                  title={title}
                  onTitleChange={setTitle}
                  disabled={isLoading}
                />
                <ActionButtons
                  onAction={handleAction}
                  onSave={handleSave}
                  isLoading={isLoading}
                  isSaving={isSaving}
                  disabled={!notes.trim()}
                />
              </div>

              {/* Output Section */}
              <div>
                <OutputPanel output={output} isLoading={isLoading} error={error} title={title} />
              </div>
            </div>

            {/* Features Section */}
            <div className="mt-8 sm:mt-12 md:mt-16 grid gap-4 sm:gap-6 md:grid-cols-3 max-w-4xl mx-auto">
              {[
                {
                  title: "Clean Notes",
                  description: "Rewrite messy notes into clear, well-organized sentences.",
                },
                {
                  title: "Smart Summarize",
                  description: "Extract key points and main ideas from your content.",
                },
                {
                  title: "Full Analysis",
                  description: "Get cleaned notes, key points, definitions, and summary.",
                },
              ].map((feature) => (
                <div key={feature.title} className="p-4 sm:p-6 rounded-lg border border-border bg-card">
                  <h3 className="font-semibold text-foreground mb-1 sm:mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </div>
  )
}
