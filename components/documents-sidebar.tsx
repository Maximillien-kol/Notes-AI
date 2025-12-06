"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { FileText, Plus, Trash2, ChevronLeft, ChevronRight, User } from "lucide-react"
import type { Document } from "@/lib/documents"
import { cn } from "@/lib/utils"

interface DocumentsSidebarProps {
  documents: Document[]
  currentDocId: string | null
  onSelectDoc: (doc: Document) => void
  onNewDoc: () => void
  onDeleteDoc: (id: string) => void
  isLoading: boolean
}

export function DocumentsSidebar({
  documents,
  currentDocId,
  onSelectDoc,
  onNewDoc,
  onDeleteDoc,
  isLoading,
}: DocumentsSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [userEmail, setUserEmail] = useState<string | null>(null)

  useEffect(() => {
    // Get user email from localStorage
    const email = localStorage.getItem('user-email')
    setUserEmail(email)
  }, [])

  // Extract first name from email (part before @)
  const getDisplayName = (email: string | null) => {
    if (!email) return 'Guest User'
    const username = email.split('@')[0]
    // Capitalize first letter
    return username.charAt(0).toUpperCase() + username.slice(1)
  }

  return (
    <div
      className={cn(
        "fixed left-0 top-0 h-screen border-r border-border bg-card/95 backdrop-blur-sm flex flex-col transition-all duration-200 z-20",
        isCollapsed ? "w-12" : "w-64",
      )}
    >
      <div className="p-3 border-b border-border flex items-center justify-between">
        {!isCollapsed && <h2 className="font-semibold text-sm text-foreground">Documents</h2>}
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setIsCollapsed(!isCollapsed)}>
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {!isCollapsed && (
        <>
          <div className="p-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start gap-2 bg-transparent"
              onClick={onNewDoc}
            >
              <Plus className="h-4 w-4" />
              New Document
            </Button>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-2 space-y-1">
              {isLoading ? (
                <div className="text-xs text-muted-foreground p-2">Loading...</div>
              ) : documents.length === 0 ? (
                <div className="text-xs text-muted-foreground p-2">No documents yet</div>
              ) : (
                documents.map((doc) => (
                  <div
                    key={doc.id}
                    className={cn(
                      "group flex items-center gap-2 p-2 rounded-md cursor-pointer text-sm transition-colors",
                      currentDocId === doc.id
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-muted text-muted-foreground hover:text-foreground",
                    )}
                    onClick={() => onSelectDoc(doc)}
                  >
                    <FileText className="h-4 w-4 shrink-0" />
                    <span className="truncate flex-1">{doc.title}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation()
                        onDeleteDoc(doc.id)
                      }}
                    >
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>

          <div className="mt-auto border-t border-border p-3">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {getDisplayName(userEmail)}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {userEmail || 'Guest'}
                </p>
              </div>
            </div>
          </div>
        </>
      )}

      {isCollapsed && (
        <div className="flex flex-col h-full">
          <div className="p-2">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onNewDoc}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="mt-auto p-2 border-t border-border">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <User className="h-4 w-4 text-primary" />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
