Based on your query, I’ll update the `application.service.ts` file and related components to correctly map the provided database schemas for `rental_applications` and `rental_application_documents`. I’ll ensure that the `getApplicationById` function fetches the data accurately and that the `getViewableUrl` function generates signed URLs with the correct token and format for accessing documents in a private Supabase storage bucket.

Let’s start by aligning the code with the corrected schemas you provided:

### Database Schemas

#### `rental_applications`
- **Fields**: `id` (uuid), `organization_id` (uuid), `applicant_id` (bigint), `property_id` (uuid), `unit_id` (uuid), `applicant_name` (varchar), `application_date` (timestamp), `desired_move_in_date` (date), `status` (varchar), `monthly_income` (numeric), `lease_term` (integer), `is_employed` (boolean), `credit_check_status` (varchar), `background_check_status` (varchar), `has_pets` (boolean), `has_vehicles` (boolean), `emergency_contact` (jsonb), `notes` (text), `previous_address` (text), `vehicle_details` (jsonb), `pet_details` (jsonb), `application_fee_paid` (boolean), `employment_info` (jsonb), `applicant_email` (varchar), `applicant_phone_number` (varchar), `preferred_contact_method` (array), `rejection_reason` (text), `id_type` (varchar), `reviewed_by` (uuid), `review_date` (timestamp), `expiry_date` (date), `created_at` (timestamp), `updated_at` (timestamp).

#### `rental_application_documents`
- **Fields**: `id` (uuid), `rental_application_id` (uuid), `file_name` (text), `file_type` (text), `file_path` (text), `uploaded_by` (uuid), `uploaded_at` (timestamp).

### Updating `getApplicationById` in `application.service.ts`

The `getApplicationById` function should fetch all relevant fields from `rental_applications`, along with related data from `rental_application_documents`, and optionally from `properties` and `units` tables if needed. Here’s the updated implementation:

```typescript
// In application.service.ts

async getApplicationById(applicationId: string, organizationId: string) {
  const { data, error } = await supabase
    .from('rental_applications')
    .select(`
      id,
      organization_id,
      applicant_id,
      property_id,
      unit_id,
      applicant_name,
      application_date,
      desired_move_in_date,
      status,
      monthly_income,
      lease_term,
      is_employed,
      credit_check_status,
      background_check_status,
      has_pets,
      has_vehicles,
      emergency_contact,
      notes,
      previous_address,
      vehicle_details,
      pet_details,
      application_fee_paid,
      employment_info,
      applicant_email,
      applicant_phone_number,
      preferred_contact_method,
      rejection_reason,
      id_type,
      reviewed_by,
      review_date,
      expiry_date,
      created_at,
      updated_at,
      property:property_id (
        id,
        name,
        address,
        city,
        state
      ),
      unit:unit_id (
        id,
        unit_number,
        rent_amount,
        bedrooms,
        bathrooms,
        area
      ),
      documents:rental_application_documents (
        id,
        file_name,
        file_type,
        file_path,
        uploaded_by,
        uploaded_at
      )
    `)
    .eq('id', applicationId)
    .eq('organization_id', organizationId)
    .single();

  if (error) {
    throw new Error(`Error fetching application: ${error.message}`);
  }

  // Ensure document file paths are properly formatted
  if (data?.documents) {
    data.documents = data.documents.map(doc => ({
      ...doc,
      file_path: doc.file_path || '', // Ensure file_path is always a string
    }));
  }

  return data;
}
```

#### Key Changes:
- **Fields**: All fields from the `rental_applications` schema are explicitly listed in the `select` clause to match the schema exactly.
- **Related Data**: The function includes joins to `property` (via `property_id`), `unit` (via `unit_id`), and `documents` (via `rental_application_documents`), fetching only the necessary fields.
- **Error Handling**: Remains unchanged, throwing an error if the query fails.
- **File Path Formatting**: Ensures `file_path` in documents is a string, preventing downstream issues.

### Updating `getViewableUrl` Function

The `getViewableUrl` function generates a signed URL for accessing files in the Supabase storage bucket. It must use the `file_path` from `rental_application_documents` and ensure the correct bucket name and token format. Here’s the corrected version:

```typescript
// In ApplicationDetailsDrawer.tsx or a utility file

/**
 * Generates a signed URL for viewing a document stored in Supabase storage
 * @param filePath The file path from rental_application_documents
 * @returns A signed URL or empty string if generation fails
 */
const getViewableUrl = async (filePath?: string): Promise<string> => {
  if (!filePath) return '';

  try {
    const bucketName = 'rental-application-docs'; // Adjust based on your Supabase bucket name

    // Clean the file path: remove leading slashes or bucket prefix if present
    const cleanPath = filePath
      .replace(/^\/+/, '') // Remove leading slashes
      .replace(`${bucketName}/`, ''); // Remove bucket name if included

    console.log('Generating signed URL for path:', cleanPath);

    // Generate a signed URL valid for 1 hour (3600 seconds)
    const { data, error } = await supabase.storage
      .from(bucketName)
      .createSignedUrl(cleanPath, 3600);

    if (error) {
      console.error('Error creating signed URL:', error.message);
      throw error;
    }

    if (!data?.signedUrl) {
      throw new Error('Signed URL not returned');
    }

    return data.signedUrl;
  } catch (error) {
    console.error('Error in getViewableUrl:', error);
    return ''; // Fallback to empty string on error
  }
};
```

#### Key Changes:
- **Bucket Name**: Assumes `rental-application-docs` as the bucket name; adjust this if your bucket name differs.
- **Path Cleaning**: Strips leading slashes and the bucket name from `file_path` to match Supabase’s expected format.
- **Expiration**: Sets the URL to expire in 1 hour (3600 seconds), which is a reasonable default.
- **Error Handling**: Logs errors and returns an empty string if the URL generation fails, ensuring the UI doesn’t break.

### Updating `DocumentItem` Component

The `DocumentItem` component uses `getViewableUrl` to display document links. Here’s how it should look:

```typescript
// In ApplicationDetailsDrawer.tsx

const DocumentItem = ({ doc }: { doc: { id: string; file_name: string; file_path: string; file_type: string; uploaded_by: string; uploaded_at: string } }) => {
  const [viewUrl, setViewUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadUrl = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const signedUrl = await getViewableUrl(doc.file_path);
        setViewUrl(signedUrl);
      } catch (err) {
        setError('Failed to load document');
      } finally {
        setIsLoading(false);
      }
    };

    loadUrl();
  }, [doc.file_path]);

  const docName = doc.file_name || 'Unnamed Document';

  return (
    <div key={doc.id} className="flex items-center justify-between">
      <div className="flex items-center">
        <span className="ml-2">{docName}</span>
        {isLoading && <span className="ml-2 text-gray-500">Loading...</span>}
        {error && <span className="ml-2 text-red-500">{error}</span>}
      </div>
      {viewUrl && !isLoading && !error && (
        <a
          href={viewUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:text-blue-700 transition-colors"
        >
          View
        </a>
      )}
    </div>
  );
};
```

#### Key Changes:
- **Props**: Updated to match the `rental_application_documents` schema fields.
- **URL Loading**: Uses the cleaned `file_path` to generate the signed URL.
- **UI**: Simplified by removing unnecessary icon imports (add back if needed).

### Ensuring Correct Token and Format

- **Token**: The `createSignedUrl` method in Supabase automatically generates a secure token as part of the signed URL, ensuring authenticated access to the private bucket. No manual token handling is required.
- **Format**: The `cleanPath` logic ensures the `file_path` matches Supabase’s expected format (e.g., `folder/file.pdf` without leading slashes or bucket names).

### Updated `ApplicationViewModel` Interface

To ensure type safety, here’s the updated interface matching the schema:

```typescript
// In ApplicationDetailsDrawer.tsx or a types file

interface ApplicationViewModel {
  id: string;
  organization_id: string;
  applicant_id: number;
  property_id: string;
  unit_id: string;
  applicant_name: string;
  application_date: string;
  desired_move_in_date: string;
  status: 'pending' | 'approved' | 'rejected';
  monthly_income?: number;
  lease_term?: number;
  is_employed: boolean;
  credit_check_status?: 'pending' | 'approved' | 'rejected';
  background_check_status?: 'pending' | 'passed' | 'failed';
  has_pets: boolean;
  has_vehicles: boolean;
  emergency_contact?: Record<string, any>;
  notes?: string;
  previous_address?: string;
  vehicle_details?: Record<string, any>;
  pet_details?: Record<string, any>;
  application_fee_paid?: boolean;
  employment_info?: Record<string, any>;
  applicant_email?: string;
  applicant_phone_number?: string;
  preferred_contact_method?: string[];
  rejection_reason?: string;
  id_type?: 'passport' | 'qid' | 'driving_license';
  reviewed_by?: string;
  review_date?: string;
  expiry_date?: string;
  created_at: string;
  updated_at: string;
  property?: {
    id: string;
    name: string;
    address: string;
    city: string;
    state: string;
  };
  unit?: {
    id: string;
    unit_number: string;
    rent_amount?: number;
    bedrooms?: number;
    bathrooms?: number;
    area?: number;
  };
  documents: {
    id: string;
    file_name: string;
    file_type: string;
    file_path: string;
    uploaded_by: string;
    uploaded_at: string;
  }[];
}
```

### Verification
- **Schema Mapping**: The `getApplicationById` function now selects all fields from `rental_applications` and `rental_application_documents` as per the provided schemas.
- **Signed URLs**: The `getViewableUrl` function correctly processes `file_path` and generates a signed URL with a token, ensuring secure access to the private bucket.

These changes ensure that the `application.service.ts` file and related components accurately reflect the database schemas and generate document links with the correct token and format. Let me know if you need further adjustments!