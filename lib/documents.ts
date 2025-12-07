import { supabase } from './supabase'

export interface Document {
  id: string
  title: string
  content: string
  output?: string
  createdAt: number
  updatedAt: number
  sessionId?: string
}

// Get or create a unique session ID for this browser
function getSessionId(): string {
  if (typeof window === 'undefined') return ''
  
  let sessionId = localStorage.getItem('notes-ai-session-id')
  if (!sessionId) {
    // Generate a unique session ID
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
    localStorage.setItem('notes-ai-session-id', sessionId)
  }
  return sessionId
}

export async function getAllDocuments(): Promise<Document[]> {
  try {
    const sessionId = getSessionId()
    
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('session_id', sessionId)
      .order('updated_at', { ascending: false })

    if (error) throw error

    // Convert Supabase format to app format
    return (data || []).map(doc => ({
      id: doc.id,
      title: doc.title,
      content: doc.content,
      output: doc.output,
      createdAt: new Date(doc.created_at).getTime(),
      updatedAt: new Date(doc.updated_at).getTime(),
    }))
  } catch (error) {
    console.error('Error fetching documents:', error)
    return []
  }
}

export async function getDocument(id: string): Promise<Document | null> {
  try {
    const sessionId = getSessionId()
    
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('id', id)
      .eq('session_id', sessionId)
      .single()

    if (error) throw error
    if (!data) return null

    return {
      id: data.id,
      title: data.title,
      content: data.content,
      output: data.output,
      createdAt: new Date(data.created_at).getTime(),
      updatedAt: new Date(data.updated_at).getTime(),
    }
  } catch (error) {
    console.error('Error fetching document:', error)
    return null
  }
}

export async function saveDocument(
  doc: Omit<Document, "id" | "createdAt" | "updatedAt"> & { id?: string },
): Promise<Document> {
  try {
    const now = new Date().toISOString()
    const sessionId = getSessionId()

    if (doc.id) {
      // Update existing document - verify ownership
      const { data, error } = await supabase
        .from('documents')
        .update({
          title: doc.title,
          content: doc.content,
          output: doc.output,
          updated_at: now,
        })
        .eq('id', doc.id)
        .eq('session_id', sessionId)
        .select()
        .single()

      if (error) throw error

      return {
        id: data.id,
        title: data.title,
        content: data.content,
        output: data.output,
        createdAt: new Date(data.created_at).getTime(),
        updatedAt: new Date(data.updated_at).getTime(),
      }
    } else {
      // Insert new document
      const { data, error } = await supabase
        .from('documents')
        .insert({
          title: doc.title,
          content: doc.content,
          output: doc.output,
          session_id: sessionId,
          user_id: null, // For now, no authentication
        })
        .select()
        .single()

      if (error) throw error

      return {
        id: data.id,
        title: data.title,
        content: data.content,
        output: data.output,
        createdAt: new Date(data.created_at).getTime(),
        updatedAt: new Date(data.updated_at).getTime(),
      }
    }
  } catch (error) {
    console.error('Error saving document:', error)
    throw error
  }
}

export async function deleteDocument(id: string): Promise<boolean> {
  try {
    const sessionId = getSessionId()
    
    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', id)
      .eq('session_id', sessionId)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error deleting document:', error)
    return false
  }
}
