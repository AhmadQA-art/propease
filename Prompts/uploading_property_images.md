Below is a concise guide for future reference on how to upload images to Supabase using a separate table for property images. This guide includes the schema relationship, SQL setup, and a step-by-step process with example code, tailored to your `properties` table as an example. This approach leverages Supabase Storage and a relational table (`property_images`) to manage multiple images per property efficiently.

---

### Guide: Uploading Images to Supabase with a Separate Table

#### Schema Relationship
To support multiple images per property, you’ll create a `property_images` table that links to the `properties` table via a foreign key. The relationship is one-to-many: one property can have many images.

- **`properties` Table**: Stores core property details (already exists in your schema).
- **`property_images` Table**: Stores image metadata (e.g., URL) and links to a specific property.

Here’s how the tables relate:
```
properties (id) ---< property_images (property_id, image_url)
```
- `properties.id` is the primary key.
- `property_images.property_id` is a foreign key referencing `properties.id`.

#### Step 1: Create the `property_images` Table
Add a table to store image URLs and their association with properties. Use this SQL command in Supabase’s SQL Editor:

```sql
CREATE TABLE public.property_images (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(), -- Unique ID for each image entry
  property_id uuid NOT NULL,                             -- Links to properties table
  image_url text NOT NULL,                               -- Public URL of the image in storage
  created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP, -- When the image was added
  PRIMARY KEY (id),
  CONSTRAINT fk_property_id
    FOREIGN KEY (property_id) REFERENCES public.properties (id) ON DELETE CASCADE
);
```

- **`id`**: Unique identifier for each image record.
- **`property_id`**: Foreign key ensuring each image belongs to a specific property. `ON DELETE CASCADE` removes images if the property is deleted.
- **`image_url`**: Stores the URL of the image in Supabase Storage.
- **`created_at`**: Tracks when the image was uploaded.

#### Step 2: Set Up Supabase Storage
Create a bucket in Supabase Storage to hold the image files:

1. Go to the Supabase Dashboard > **Storage**.
2. Click **New Bucket**, name it `property-images`, and save.
3. Set access policies (optional):
   - For public access: Enable public read in the bucket settings or add a policy:
     ```sql
     CREATE POLICY "Allow public read access"
     ON storage.objects
     FOR SELECT
     USING (bucket_id = 'property_images');
     ```
   - For private access: Use signed URLs or authentication in your app.

#### Step 3: Upload Images to Supabase Storage
Use the Supabase client library to upload images and store their URLs. Here’s an example in JavaScript (adaptable to other languages):

```javascript
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient('your-supabase-url', 'your-supabase-key');

// Function to upload an image and link it to a property
async function uploadPropertyImage(propertyId, imageFile) {
  // Step 3.1: Upload the image to the 'property_images' bucket
  const fileName = `${propertyId}/${Date.now()}_${imageFile.name}`; // Unique path, e.g., "property_123/16987654321_image.jpg"
  const { data, error } = await supabase.storage
    .from('property_images')
    .upload(fileName, imageFile);

  if (error) {
    console.error('Upload error:', error.message);
    return;
  }

  // Step 3.2: Get the public URL
  const { data: urlData } = supabase.storage
    .from('property_images')
    .getPublicUrl(fileName);

  const imageUrl = urlData.publicUrl;

  // Step 3.3: Insert the URL into the property_images table
  const { error: dbError } = await supabase
    .from('property_images')
    .insert({ property_id: propertyId, image_url: imageUrl });

  if (dbError) {
    console.error('Database error:', dbError.message);
    return;
  }

  console.log(`Image uploaded and linked: ${imageUrl}`);
}

// Example usage
const propertyId = 'your-property-uuid'; // Replace with actual property ID
const imageFile = document.querySelector('input[type="file"]').files[0]; // From a file input
uploadPropertyImage(propertyId, imageFile);
```

- **File Path**: Uses `${propertyId}/${timestamp}_${filename}` to organize images by property and avoid overwrites.
- **Error Handling**: Checks for errors at each step (upload and database insertion).
- **Public URL**: Retrieved using `getPublicUrl`, which returns a URL like `https://your-supabase-url/storage/v1/object/public/property_images/property_123/16987654321_image.jpg`.

#### Step 4: Query and Display Images
To fetch and display all images for a property:

```javascript
async function getPropertyImages(propertyId) {
  const { data, error } = await supabase
    .from('property_images')
    .select('image_url')
    .eq('property_id', propertyId);

  if (error) {
    console.error('Error fetching images:', error.message);
    return [];
  }

  return data.map(item => item.image_url);
}

// Example usage
const images = await getPropertyImages('your-property-uuid');
images.forEach(url => {
  console.log(`<img src="${url}" alt="Property Image" />`);
});
```

- **SQL Equivalent**:
  ```sql
  SELECT image_url
  FROM property_images
  WHERE property_id = 'your-property-uuid';
  ```

#### How It Works for Property Images
1. **Uploading**: When a user adds an image for a property (e.g., via a form), the file is uploaded to the `property_images` bucket in Supabase Storage. The resulting URL is saved in the `property_images` table with the corresponding `property_id`.
2. **Storage**: Images are stored in the bucket (e.g., `property_images/property_123/16987654321_image.jpg`), and their metadata (URL) is in the database.
3. **Retrieval**: Your app queries `property_images` by `property_id` to get all associated image URLs, then displays them using `<img>` tags or similar.

#### Additional Tips
- **Image Optimization**: Add `?width=200` to the URL for resized images (e.g., `imageUrl + '?width=200'`), leveraging Supabase’s built-in transformations.
- **Security**: If images are sensitive, disable public access and use signed URLs:
  ```javascript
  const { data } = await supabase.storage
    .from('property_images')
    .createSignedUrl(fileName, 3600); // URL valid for 1 hour
  ```
- **Validation**: In your app, check file types (e.g., `.jpg`, `.png`) and sizes before uploading.

---

### Example Schema in Action
- **Properties Table**: Contains `id`, `name`, `address`, etc.
- **Property Images Table**: Contains `id`, `property_id`, `image_url`, `created_at`.
- **Relationship**: For a property with `id = 'abc123'`, `property_images` might have:
  ```
  id: 'xyz789', property_id: 'abc123', image_url: 'https://.../property_abc123/1.jpg'
  id: 'xyz790', property_id: 'abc123', image_url: 'https://.../property_abc123/2.jpg'
  ```

This setup scales well for multiple images and keeps your database clean by offloading file storage to Supabase Storage.

---

This guide should serve as a handy reference for managing property images in Supabase. Let me know if you need further clarification!