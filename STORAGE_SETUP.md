# Supabase Storage Setup

## Create Storage Bucket

1. Go to your Supabase Dashboard
2. Navigate to **Storage** in the left sidebar
3. Click **New Bucket**
4. Configure the bucket:
   - **Name**: `doghealthy`
   - **Public bucket**: ✅ Check this (so photos can be publicly accessed)
   - Click **Create bucket**

## Set Up Storage Policies

After creating the bucket, you need to set up policies to allow authenticated users to upload and manage their dog photos.

### Policy 1: Allow authenticated users to upload

```sql
-- Policy for uploading dog photos
CREATE POLICY "Authenticated users can upload dog photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'doghealthy' AND
  (storage.foldername(name))[1] = 'dogs'
);
```

### Policy 2: Allow public read access

```sql
-- Policy for public read access
CREATE POLICY "Anyone can view dog photos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'doghealthy');
```

### Policy 3: Allow users to update their own photos

```sql
-- Policy for updating dog photos
CREATE POLICY "Users can update dog photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'doghealthy' AND
  (storage.foldername(name))[1] = 'dogs'
);
```

### Policy 4: Allow users to delete their own photos

```sql
-- Policy for deleting dog photos
CREATE POLICY "Users can delete dog photos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'doghealthy' AND
  (storage.foldername(name))[1] = 'dogs'
);
```

## Applying Policies via Dashboard

1. In Supabase Dashboard, go to **Storage**
2. Click on the `doghealthy` bucket
3. Go to the **Policies** tab
4. Click **New Policy**
5. Choose **Create a custom policy**
6. Enter each policy from above

## Storage Structure

The storage will be organized as follows:

```
doghealthy/
└── dogs/
    ├── {dog_id}_{timestamp}.jpg
    ├── {dog_id}_{timestamp}.png
    └── ...
```

Each dog photo is stored with:
- Folder: `dogs/`
- Filename format: `{dog_id}_{timestamp}.{ext}`
- This ensures unique filenames and easy organization

## File Upload Limits

Current limits in the application:
- **Max file size**: 5MB
- **Allowed formats**: All image types (jpg, png, gif, webp, etc.)

To change these limits, modify `/pages/dogs/new.vue`:
```javascript
// Validate file size (max 5MB)
if (file.size > 5 * 1024 * 1024) {
  uploadError.value = 'File size must be less than 5MB'
  return
}
```

## Testing Storage

After setup:
1. Start the dev server: `npm run dev`
2. Navigate to `http://localhost:3000/dogs/new`
3. Try uploading a dog photo
4. Check the Supabase Storage dashboard to verify the upload

## Troubleshooting

### Upload fails with "Permission denied"
- Check that storage policies are correctly set up
- Verify the bucket is public
- Ensure user is authenticated

### Can't see uploaded photos
- Check that the `doghealthy` bucket is set to **public**
- Verify the photo URL is correctly stored in the database
- Check browser console for CORS errors

### Photos not loading on page
- Verify the `photo_url` field is correctly populated in the `doghealthy_dogs` table
- Check that the bucket has public read access
- Ensure the URL format is correct

