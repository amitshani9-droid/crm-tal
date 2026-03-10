-- SQL commands to setup Attachments AND Timeline tables

-- 1. Create client_files table
CREATE TABLE IF NOT EXISTS public.client_files (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id text NOT NULL,
  file_name text NOT NULL,
  file_url text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Note: You MUST create a storage bucket named 'client_attachments' manually in the Supabase Dashboard -> Storage.
-- Make sure to set the bucket as PUBLIC so the files can be downloaded using the file_url.
-- Also add an RLS policy on the bucket to allow insert/select.


-- 2. Create client_logs table
CREATE TABLE IF NOT EXISTS public.client_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id text NOT NULL,
  note_content text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Optional: You can set up RLS for these tables to only allow authenticated users to view/edit.
-- Wait until testing is done before adding strict RLS to ensure smooth integration.
