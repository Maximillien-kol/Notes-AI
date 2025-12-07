-- Create documents table
CREATE TABLE IF NOT EXISTS documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT,
  title TEXT NOT NULL DEFAULT 'Untitled Document',
  content TEXT NOT NULL,
  output TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);

-- Create index on session_id for faster queries (for unauthenticated users)
CREATE INDEX IF NOT EXISTS idx_documents_session_id ON documents(session_id);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON documents(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Create policy: Users can view their own documents or documents from their session
CREATE POLICY "Users can view their own documents"
  ON documents
  FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

-- Create policy: Users can insert their own documents
CREATE POLICY "Users can insert their own documents"
  ON documents
  FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Create policy: Users can update their own documents or documents from their session
CREATE POLICY "Users can update their own documents"
  ON documents
  FOR UPDATE
  USING (auth.uid() = user_id OR user_id IS NULL);

-- Create policy: Users can delete their own documents or documents from their session
CREATE POLICY "Users can delete their own documents"
  ON documents
  FOR DELETE
  USING (auth.uid() = user_id OR user_id IS NULL);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to update updated_at on document updates
CREATE TRIGGER update_documents_updated_at
  BEFORE UPDATE ON documents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SUBSCRIBERS TABLE
-- ============================================

-- Create subscribers table for email signups
CREATE TABLE IF NOT EXISTS subscribers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_subscribers_email ON subscribers(email);

-- Enable Row Level Security (RLS) for subscribers
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;

-- Create policy: Anyone can insert (signup)
CREATE POLICY "Anyone can subscribe"
  ON subscribers
  FOR INSERT
  WITH CHECK (true);

-- Create policy: Only authenticated users can view (for admin purposes later)
CREATE POLICY "Authenticated users can view subscribers"
  ON subscribers
  FOR SELECT
  USING (auth.role() = 'authenticated');
