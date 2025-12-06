"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Copy, Download, Check, Loader2 } from "lucide-react"
import { useState } from "react"
import { trackEvent, EVENTS } from "@/lib/analytics"
import jsPDF from "jspdf"

interface OutputPanelProps {
  output: string
  isLoading: boolean
  error?: string
  title?: string
}

export function OutputPanel({ output, isLoading, error, title }: OutputPanelProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    if (!output) return

    try {
      await navigator.clipboard.writeText(output)
      setCopied(true)
      trackEvent({ name: EVENTS.COPIED_TO_CLIPBOARD })
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  const handleDownload = () => {
    if (!output) return

    try {
      const doc = new jsPDF()
      const pageWidth = doc.internal.pageSize.getWidth()
      const pageHeight = doc.internal.pageSize.getHeight()
      const margin = 20
      const maxWidth = pageWidth - 2 * margin

      // Add title
      doc.setFontSize(16)
      doc.setFont("helvetica", "bold")
      doc.text("Notes AI Output", margin, margin)

      // Add date
      doc.setFontSize(10)
      doc.setFont("helvetica", "normal")
      const dateStr = new Date().toLocaleDateString()
      doc.text(dateStr, margin, margin + 8)

      // Parse HTML and add content with formatting
      doc.setFontSize(11)
      let yPosition = margin + 20

      // Process HTML content
      const processContent = (htmlContent: string) => {
        // Split by br tags
        const parts = htmlContent.split(/<br\s*\/?>/gi)

        parts.forEach((part) => {
          if (!part.trim()) {
            yPosition += 5
            return
          }

          // Clean HTML tags but detect formatting
          const hasBold = /<b>/.test(part)
          const hasItalic = /<i>/.test(part)
          const cleanText = part.replace(/<\/?[^>]+(>|$)/g, "")

          if (!cleanText.trim()) return

          // Detect section headings
          const isHeading = /^(Cleaned Notes|Key Points|Definitions|Summary)/.test(cleanText)

          // Set font style
          if (hasBold || isHeading) {
            doc.setFont("helvetica", "bold")
          } else if (hasItalic) {
            doc.setFont("helvetica", "italic")
          } else {
            doc.setFont("helvetica", "normal")
          }

          const lines = doc.splitTextToSize(cleanText, maxWidth)

          lines.forEach((line: string) => {
            if (yPosition > pageHeight - margin) {
              doc.addPage()
              yPosition = margin
            }
            doc.text(line, margin, yPosition)
            yPosition += 7
          })
        })
      }

      processContent(output)

      // Save the PDF with custom filename
      const sanitizedTitle = title
        ? title.replace(/[^a-z0-9]/gi, '_').toLowerCase()
        : 'notes-ai'
      doc.save(`${sanitizedTitle}-${new Date().toISOString().split("T")[0]}.pdf`)

      trackEvent({ name: EVENTS.DOWNLOADED_AS_TEXT })
    } catch (err) {
      console.error("Failed to generate PDF:", err)
    }
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 gap-2">
        <CardTitle className="text-base sm:text-lg font-semibold">Output</CardTitle>
        {output && !isLoading && (
          <div className="flex gap-1.5 sm:gap-2">
            <Button variant="outline" size="sm" onClick={handleCopy} className="h-8 gap-1 sm:gap-1.5 bg-transparent px-2 sm:px-3">
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5" />
                  <span className="text-xs sm:text-sm">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span className="text-xs sm:text-sm hidden sm:inline">Copy</span>
                </>
              )}
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownload} className="h-8 gap-1 sm:gap-1.5 bg-transparent px-2 sm:px-3">
              <Download className="h-3.5 w-3.5" />
              <span className="text-xs sm:text-sm hidden sm:inline">Download</span>
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Processing your notes...</p>
            </div>
          </div>
        ) : error ? (
          <div className="rounded-md bg-destructive/10 border border-destructive/20 p-4">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        ) : output ? (
          <div className="prose prose-invert prose-sm max-w-none">
            <div
              className="whitespace-pre-wrap font-sans text-xs sm:text-sm leading-relaxed text-foreground bg-secondary/50 rounded-md p-3 sm:p-4 overflow-auto max-h-[300px] sm:max-h-[400px]"
              dangerouslySetInnerHTML={{ __html: output }}
            />
          </div>
        ) : (
          <div className="flex items-center justify-center py-12 text-center px-4">
            <p className="text-sm text-muted-foreground">
              Your cleaned notes will appear here.
              <br />
              <span className="text-xs">Paste your notes and select an action to begin.</span>
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
