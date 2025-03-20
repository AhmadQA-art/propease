# Updated Plan

The goal is to ensure the frontend is correctly connected to the Supabase backend for CRUD operations on rental data, while preserving the current design and user experience. The plan will now include a comprehensive overview of all files, components, dialogs, sub-pages, and drawers associated with the Rentals page functionality, referencing the UI Reference Guide (\`frontend/src/pages/UIReference.tsx\`) for design adherence. The plan will also prioritize seamless interaction with Supabase and adherence to the database schema defined in \`database/schema.sql\`.

1.  **Verify Supabase Configuration:**
    *   Ensure the \`frontend/src/config/supabase.ts\` file is correctly configured with the Supabase URL and API key.
    *   Confirm that the Supabase database has the necessary tables and that the schema matches the types defined in \`frontend/src/types/rental.ts\`.

2.  **Review Existing API Calls:**
    *   Examine the \`rentalService\` in \`frontend/src/services/rental.service.ts\` to understand how data is currently fetched and manipulated.
    *   Verify that the API calls align with the Supabase schema and are correctly handling data types and relationships.

3.  **Implement CRUD Operations:**
    *   The \`rentalService\` already implements CRUD operations using Supabase. Ensure these functions are working correctly.
    *   Test each function thoroughly to confirm that data is being created, read, updated, and deleted in the Supabase database.
    *   Focus on implementing correct CRUD operations across the following tables: \`properties\`, \`team_members\`, \`units\`, \`owners\`, \`rental_applications\`, \`tasks\`, and \`activities\`.
    *   Analyze the \`schema.sql\` file to identify any additional related tables and incorporate them into the integration plan, ensuring data integrity and consistency across all operations.

4.  **Handle Complex Operations:**
    *   Identify any complex operations that require custom Supabase API functions. For example, if there's a need to calculate rental revenue or perform complex data aggregations, consider creating Supabase functions for these tasks.
    *   Implement these custom functions in Supabase and call them from the frontend using the Supabase client.

5.  **Update UI Components:**
    *   Ensure that the UI components are correctly displaying and updating data from Supabase.
    *   Pay close attention to the following components and pages:

        *   **Main Rental List Page:** Utilize the Rentals component design from \`frontend/src/pages/ui-reference/Rentals.tsx\`.
        *   **Rental Details Page:**
            *   **Overview Tab:** Implement the Rental Overview design from \`frontend/src/pages/ui-reference/RentalOverview.tsx\`.
            *   **Units Tab:** Implement the Units component design from \`frontend/src/pages/ui-reference/Units.tsx\`.
            *   **Rental Applications Tab:** Implement the design from \`frontend/src/pages/ui-reference/RentalApplications.tsx\`.
            *   **Tasks Tab:** Implement the design from \`frontend/src/pages/ui-reference/RentalTasks.tsx\`.
            *   **Activities Tab:** Implement the design from \`frontend/src/pages/ui-reference/RentalActivities.tsx\`.

6.  **Implement Error Handling:**
    *   Add error handling to all API calls to gracefully handle errors and display informative messages to the user.
    *   Use the \`toast\` library to display error messages.

7.  **Maintain User Experience:**
    *   Ensure that the integration with Supabase does not negatively impact the user experience.
    *   Maintain the current design and layout of the rentals page.
    *   Use loading indicators to provide feedback to the user while data is being fetched.

8.  **Testing:**
    *   Write unit tests and integration tests to verify that the frontend is correctly integrated with the Supabase backend.
    *   Perform end-to-end testing to ensure that all features are working as expected.

**Adding New Rentals through the "Add Rental" View**

The "Add Rental" view, which is displayed after clicking the "Add Rental" button on the main rentals page, should allow users to add new rental properties to the system. The following fields should be included in the "Add Rental" form:

*   **Property Name:** The name of the rental property (text input, maps to \`properties.name\`).
*   **Property Type:** The type of the rental property (e.g., residential, commercial) (select input, maps to a new \`property_type\` column in \`properties\` table, if needed).
*   **Property Manager (Optional):** The property manager assigned to the rental property (select input, maps to \`properties.property_manager_id\`, which is a foreign key to \`property_managers.id\`).
*   **Property Owner (Optional):** The owner of the rental property (select input, maps to \`properties.owner_id\`, which is a foreign key to \`owners.id\`).
*   **Address:** The address of the rental property (text input, maps to \`properties.address\`).
*   **City:** The city of the rental property (text input, maps to \`properties.city\`).
*   **State:** The state of the rental property (text input, maps to \`properties.state\`).
*   **Zip Code:** The zip code of the rental property (text input, maps to \`properties.zip_code\`).
*   **Total Units:** The total number of units in the rental property (number input, maps to \`properties.total_units\`).

In addition to the property details, the "Add Rental" form should also allow users to add units to the rental property. The following fields should be included for each unit:

*   **Unit Number:** The unit number (text input, maps to \`units.unit_number\`).
*   **Rent Amount:** The rent amount for the unit (number input, maps to \`units.rent_amount\`).
*   **Occupancy Status:** The occupancy status of the unit (e.g., vacant, occupied) (select input, maps to \`units.status\`).
*   **Bedrooms:** The number of bedrooms in the unit (number input, maps to \`units.bedrooms\`).
*   **Bathrooms:** The number of bathrooms in the unit (number input, maps to \`units.bathrooms\`).
*   **Square Feet:** The square footage of the unit (number input, maps to \`units.square_feet\`).

When the "Add Rental" form is submitted, the following actions should be performed:

1.  A new record should be created in the \`properties\` table with the property details.
2.  For each unit added, a new record should be created in the \`units\` table with the unit details, and the \`property_id\` should be set to the ID of the newly created property.
3.  If a property manager or owner is selected, the \`property_manager_id\` and \`owner_id\` columns in the \`properties\` table should be updated accordingly.

**Database Schema Considerations**

Based on the \`database/schema.sql\` file, the following tables are relevant to the Rentals page and need to be considered during the integration:

*   \`properties\`: Stores information about rental properties.
*   \`units\`: Stores information about individual units within a property.
*   \`owners\`: Stores information about property owners.
*   \`team_members\`: Stores information about team members.
*   \`property_managers\`: Stores information about property managers.
*   \`owner_properties\`: Stores the relationship between owners and properties.
*   \`rental_applications\`: Stores information about rental applications.
*   \`tasks\`: Stores information about tasks related to rental properties.
*   \`activities\`: Stores activity logs related to rental properties.
*   \`leases\`: Stores information about leases.
*   \`tenants\`: Stores information about tenants.
*   \`user_profiles\`: Stores information about user profiles.
*   \`organizations\`: Stores information about organizations.

The relationships between these tables need to be carefully considered when implementing CRUD operations. For example, when deleting a property, all associated units, leases, and rental applications should also be deleted.

**File Modifications**

*   \`frontend/src/config/supabase.ts\`: Verify Supabase configuration.
*   \`frontend/src/services/rental.service.ts\`: Review and test API calls.
*   \`frontend/src/types/rental.ts\`: Ensure types match Supabase schema.
*   \`frontend/src/pages/Rentals.tsx\`: Ensure data is being fetched and displayed correctly.
*   \`frontend/src/components/RentalCard.tsx\`: Ensure rental data is being displayed correctly.
*   \`frontend/src/components/AddRentalForm.tsx\`: Ensure new rentals are being created correctly. This file needs to be modified to include the new fields for adding units.
*   \`frontend/src/pages/RentalDetails.tsx\`: Ensure rental details are being displayed correctly.
*   \`frontend/src/components/rental-details/OverviewTab.tsx\`: Ensure rental overview is being displayed correctly.
*   \`frontend/src/components/rental-details/UnitsTab.tsx\`: Ensure units are being displayed correctly.
*   \`frontend/src/components/rental-details/ApplicationsTab.tsx\`: Ensure rental applications are being displayed correctly.
*   \`frontend/src/components/rental-details/TasksTab.tsx\`: Ensure tasks are being displayed correctly.
*   \`frontend/src/components/rental-details/ActivitiesTab.tsx\`: Ensure activities are being displayed correctly.