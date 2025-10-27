/*
  # Setup Storage Buckets

  ## Overview
  Creates storage buckets for product images, banners, brands, categories, and other assets.

  ## Buckets
  - products - Product images
  - banners - Hero and promotional banners
  - brands - Brand logos
  - categories - Category images
  - posts - Blog post cover images

  ## Security
  - Public read access for all buckets
  - Authenticated users can upload (will be restricted to admin in Edge Functions)
*/

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('products', 'products', true, 5242880, ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']),
  ('banners', 'banners', true, 5242880, ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']),
  ('brands', 'brands', true, 5242880, ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']),
  ('categories', 'categories', true, 5242880, ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']),
  ('posts', 'posts', true, 5242880, ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
USING (bucket_id IN ('products', 'banners', 'brands', 'categories', 'posts'));

CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id IN ('products', 'banners', 'brands', 'categories', 'posts'));

CREATE POLICY "Authenticated users can update own uploads"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id IN ('products', 'banners', 'brands', 'categories', 'posts'))
WITH CHECK (bucket_id IN ('products', 'banners', 'brands', 'categories', 'posts'));

CREATE POLICY "Authenticated users can delete own uploads"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id IN ('products', 'banners', 'brands', 'categories', 'posts'));