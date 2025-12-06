import { type NextRequest, NextResponse } from "next/server"
import { getAllDocuments, saveDocument } from "@/lib/documents"

export async function GET() {
  try {
    const documents = await getAllDocuments()
    return NextResponse.json({ documents })
  } catch (error) {
    console.error("Failed to fetch documents:", error)
    return NextResponse.json({ error: "Failed to fetch documents" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, content, output, id } = body

    if (!title || !content) {
      return NextResponse.json({ error: "Title and content are required" }, { status: 400 })
    }

    const document = await saveDocument({ id, title, content, output })
    return NextResponse.json({ document })
  } catch (error) {
    console.error("Failed to save document:", error)
    return NextResponse.json({ error: "Failed to save document" }, { status: 500 })
  }
}
