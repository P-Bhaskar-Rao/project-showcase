# Supabase Setup Guide

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Note down your project URL and anon key

## 2. Environment Variables

Create a `.env` file in the frontend directory with the following variables:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# API Configuration
VITE_API_URL=http://localhost:5000/api
```

## 3. Create Storage Bucket

1. Go to your Supabase dashboard
2. Navigate to Storage
3. Create a new bucket called `project-showcase-bucket` (or any name you prefer)
4. Set the bucket to public (so images can be accessed via URL)
5. Set up the following storage policies for the bucket:

```sql
-- Policy 1: Allow public read access to all images
CREATE POLICY "Allow public read access" ON storage.objects
FOR SELECT USING (bucket_id = 'project-showcase-bucket');

-- Policy 2: Allow authenticated users to upload images
CREATE POLICY "Allow authenticated uploads" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'project-showcase-bucket' 
  AND auth.role() = 'authenticated'
);

-- Policy 3: Allow authenticated users to update their images
CREATE POLICY "Allow authenticated updates" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'project-showcase-bucket' 
  AND auth.role() = 'authenticated'
);

-- Policy 4: Allow authenticated users to delete images
CREATE POLICY "Allow authenticated deletes" ON storage.objects
FOR DELETE USING (
  bucket_id = 'project-showcase-bucket' 
  AND auth.role() = 'authenticated'
);
```

## 4. Bucket Configuration

- **Bucket Name**: `project-showcase-bucket`
- **Public**: Yes (for public URL access)
- **File Size Limit**: 5MB
- **Allowed MIME Types**: image/*

## 5. Testing

After setup, you should be able to:
1. Upload profile images via drag & drop or file selection
2. See the uploaded images in your Supabase storage bucket
3. Access images via public URLs
4. Delete images when removing profile pictures 