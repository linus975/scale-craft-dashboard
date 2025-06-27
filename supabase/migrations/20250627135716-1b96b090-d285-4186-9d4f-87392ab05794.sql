
-- Add is_preview_image boolean field to product_images table
ALTER TABLE product_images 
ADD COLUMN is_preview_image BOOLEAN NOT NULL DEFAULT false;
