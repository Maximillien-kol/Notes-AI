"use client"

import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Upload } from "lucide-react"
import { useRef, useState } from "react"

interface NotesInputProps {
  value: string
  onChange: (value: string) => void
  title: string
  onTitleChange: (title: string) => void
  disabled?: boolean
}

export function NotesInput({ value, onChange, title, onTitleChange, disabled }: NotesInputProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const extractTextFromPDF = async (file: File): Promise<string> => {
    const pdfjsLib = await import('pdfjs-dist')
    // Use local worker from node_modules instead of CDN
    pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
      'pdfjs-dist/build/pdf.worker.min.mjs',
      import.meta.url
    ).toString()

    const arrayBuffer = await file.arrayBuffer()
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
    let fullText = ''

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i)
      const textContent = await page.getTextContent()
      const pageText = textContent.items.map((item: any) => item.str).join(' ')
      fullText += pageText + '\n\n'
    }

    return fullText.trim()
  }

  const extractTextFromDOCX = async (file: File): Promise<string> => {
    const mammoth = await import('mammoth')
    const arrayBuffer = await file.arrayBuffer()
    const result = await mammoth.extractRawText({ arrayBuffer })
    return result.value
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsProcessing(true)
    try {
      let extractedText = ''

      if (file.type === 'application/pdf') {
        extractedText = await extractTextFromPDF(file)
      } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        extractedText = await extractTextFromDOCX(file)
      } else {
        alert('Unsupported file type. Please upload a PDF or DOCX file.')
        return
      }

      onChange(extractedText)
      if (!title) {
        onTitleChange(file.name.replace(/\.(pdf|docx)$/i, ''))
      }
    } catch (error) {
      console.error('Error extracting text:', error)
      alert('Failed to extract text from the file. Please try again.')
    } finally {
      setIsProcessing(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <label htmlFor="title-input" className="text-sm font-medium text-muted-foreground">
          Document Title
        </label>
        <Input
          id="title-input"
          placeholder="Untitled Document"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          disabled={disabled}
          className="bg-card border-border"
        />
      </div>

      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <label htmlFor="notes-input" className="text-sm font-medium text-muted-foreground">
            Paste your notes here
          </label>
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx"
              onChange={handleFileUpload}
              className="hidden"
              id="file-upload"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled || isProcessing}
              className="h-8 sm:h-7 gap-1.5 text-xs px-2 sm:px-3"
            >
              <Upload className="h-3.5 w-3.5 sm:h-3 sm:w-3" />
              <span className="hidden sm:inline">{isProcessing ? 'Processing...' : 'Upload PDF/DOCX'}</span>
              <span className="sm:hidden">{isProcessing ? 'Processing...' : 'Upload'}</span>
            </Button>
          </div>
        </div>
        <Textarea
          id="notes-input"
          placeholder="Paste your messy notes here...

Example:
- meeting w john tmrw 3pm abt project
- need 2 finish report by friday
- remember: call mom
- ideas for presentation: intro, main points, conclusion
- budget approx $5000 maybe more
- team members: john, sarah, mike"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled || isProcessing}
          className="min-h-[200px] sm:min-h-[250px] lg:min-h-[300px] resize-y bg-card border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary font-mono text-sm leading-relaxed"
        />
        <p className="text-xs text-muted-foreground">{value.length.toLocaleString()} characters</p>
      </div>
    </div>
  )
}
