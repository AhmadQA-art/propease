// src/CreateBuckets.js
import React, { useState } from 'react';

const CreateBuckets = () => {
  const [status, setStatus] = useState('');

  // Your Supabase project details
  const SUPABASE_URL = 'https://pgghucjqxicqpavxendw.supabase.co';
  const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBnZ2h1Y2pxeGljcXBhdnhlbmR3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0Mzg4NTY5NywiZXhwIjoyMDU5NDYxNjk3fQ.6xHRzfFsdZ3RUZVIuNDL5dzdTdRmJXxCNYQxOHAvwBw';
  const PROJECT_REF = 'pgghucjqxicqpavxendw';

  const createBuckets = async () => {
    setStatus('Creating buckets...');

    const buckets = [
      { name: 'property-images', public: true },
      { name: 'rental-application-docs', public: false },
      { name: 'lease-documents', public: true },
    ];

    try {
      for (const bucket of buckets) {
        const response = await fetch(
          `https://api.supabase.com/v1/projects/${PROJECT_REF}/storage/buckets`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              name: bucket.name,
              public: bucket.public,
            }),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            `Failed to create ${bucket.name}: ${data.message || 'Unknown error'}`
          );
        }

        console.log(`Created bucket: ${bucket.name}`, data);
      }
      setStatus('All buckets created successfully!');
    } catch (error) {
      console.error(error);
      setStatus(`Error: ${error.message}`);
    }
  };

  return (
    <div>
      <h1>Create Supabase Buckets</h1>
      <button onClick={createBuckets}>Create Buckets</button>
      <p>{status}</p>
    </div>
  );
};

export default CreateBuckets;