"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Wand2, BrainCircuit, Workflow, Save } from "lucide-react"
import type { ActionType } from "@/lib/ai"

interface ActionButtonsProps {
  onAction: (action: ActionType) => void
  onSave: () => void
  isLoading: boolean
  isSaving: boolean
  disabled?: boolean
}

export function ActionButtons({ onAction, onSave, isLoading, isSaving, disabled }: ActionButtonsProps) {
  const actions: { type: ActionType; label: string; icon: React.ReactNode; description: string }[] = [
    {
      type: "clean",
      label: "Clean Notes",
      icon: <Wand2 className="h-4 w-4" />,
      description: "Rewrite in clear sentences",
    },
    {
      type: "summarize",
      label: "Summarize",
      icon: <BrainCircuit className="h-4 w-4" />,
      description: "Get key points only",
    },
    {
      type: "fullOutput",
      label: "Full Output",
      icon: <Workflow className="h-4 w-4" />,
      description: "Clean + Points + Summary",
    },
  ]

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
        {actions.map(({ type, label, icon, description }) => (
          <Button
            key={type}
            onClick={() => onAction(type)}
            disabled={disabled || isLoading}
            variant={type === "fullOutput" ? "default" : "secondary"}
            className="h-auto py-3 sm:py-3 px-3 sm:px-4 flex flex-col gap-1 items-center justify-center touch-manipulation"
          >
            <span className="flex items-center gap-2">
              {icon}
              <span className="font-medium text-sm sm:text-base">{label}</span>
            </span>
            <span className="text-xs text-muted-foreground hidden sm:block">{description}</span>
          </Button>
        ))}
      </div>
      <Button
        onClick={onSave}
        disabled={disabled || isSaving}
        variant="outline"
        className="w-full gap-2 bg-transparent h-10 sm:h-9 touch-manipulation"
      >
        <Save className="h-4 w-4" />
        {isSaving ? "Saving..." : "Save Document"}
      </Button>
    </div>
  )
}
