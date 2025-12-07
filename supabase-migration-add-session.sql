-- Migration: Add session_id column to existing documents table
-- Run this in your Supabase SQL Editor

-- Step 1: Add session_id column if it doesn't exist
ALTER TABLE documents 
ADD COLUMN IF NOT EXISTS session_id TEXT;

-- Step 2: Create index on session_id for faster queries
CREATE INDEX IF NOT EXISTS idx_documents_session_id ON documents(session_id);

-- Step 3: Update existing documents to have a default session_id (optional)
-- This allows existing documents to be accessible, or you can delete them
-- Uncomment the line below if you want to assign existing documents a session:
-- UPDATE documents SET session_id = 'legacy_session' WHERE session_id IS NULL;

-- All done! Your existing table structure is preserved and session_id is added.
