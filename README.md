# PropEase - Property Management SaaS

PropEase is a comprehensive property management system designed to streamline the management of properties, teams, and maintenance tasks.

## Features

- 🔐 Secure Authentication & User Management
  - Complete user profiles with personal and organization details
  - Role-based access control (Property Manager, Owner, Administrator, Staff)
  - Request access system for new organizations
- 📊 Dashboard with key metrics and analytics
- 🏢 Property management and unit tracking
- 👥 Resident management
- 🔧 Maintenance ticket system
- 💰 Financial tracking and reporting
- 📄 Document management
- 👥 Team collaboration
- 💬 Communication tools

## Tech Stack

### Frontend
- React with TypeScript
- Tailwind CSS for styling
- Vite for build tooling
- React Query for data fetching
- React Router for navigation
- Recharts for data visualization
- Zustand for state management

### Backend
- Node.js with Express
- Supabase for database and authentication
- TypeScript for type safety
- JWT for authentication
- Winston for logging

## Project Structure

```
propease/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── assets/          # Static assets
│   │   ├── components/      # Reusable UI components
│   │   ├── contexts/        # React contexts
│   │   ├── hooks/           # Custom React hooks
│   │   ├── layouts/         # Page layouts
│   │   ├── pages/           # Page components
│   │   │   └── auth/        # Authentication pages (Login, Signup, Request Access)
│   │   ├── services/        # API services
│   │   ├── store/           # State management
│   │   ├── styles/          # Global styles
│   │   ├── types/           # TypeScript types
│   │   └── utils/           # Utility functions
│   └── public/              # Public assets
│
├── backend/                  # Node.js backend application
│   ├── src/
│   │   ├── controllers/     # Route controllers
│   │   ├── middleware/      # Express middleware
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   └── utils/           # Utility functions
│   └── config/              # Configuration files
│
└── database/                # Database schemas and migrations
    └── schema.sql           # Supabase database schema
```

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/propease.git
   cd propease
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Create `.env` in the backend directory:
     ```
     PORT=5000
     SUPABASE_URL=your_supabase_url
     SUPABASE_SERVICE_KEY=your_supabase_service_key
     ```
   - Create `.env` in the frontend directory:
     ```
     VITE_SUPABASE_URL=your_supabase_url
     VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
     ```

4. Start the development servers:
   ```bash
   # Start both frontend and backend
   npm run dev

   # Or start them separately
   npm run dev:frontend
   npm run dev:backend
   ```

5. Set up the database:
   - Go to your Supabase dashboard
   - Navigate to the SQL editor
   - Copy and paste the contents of `database/schema.sql`
   - Run the script

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

### Accessing the Application
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

# PropEase Frontend Implementation

## Frontend People Feature Implementation

This update implements the frontend changes specified in the implementation plan for the People feature. The following changes have been made:

### Dialog Components

1. **AddPersonDialog.tsx**
   - Left unchanged as requested, preserves team member invitation flow
   - Used for inviting team members via email

2. **AddOwnerDialog.tsx**
   - Created new component with fields:
     - First Name (required)
     - Last Name (required)
     - Email (required)
     - Phone (required)
     - Company Name (optional)
     - Properties (optional, searchable multi-select)

3. **AddTenantDialog.tsx**
   - Updated with fields:
     - First Name (required)
     - Last Name (required)
     - Email (required)
     - Phone (required)
     - Unit (optional, searchable dropdown)
     - Lease Start Date (required if unit is selected)
     - Lease End Date (required if unit is selected)

4. **AddVendorDialog.tsx**
   - Updated with fields:
     - First Name (required)
     - Last Name (required)
     - Email (required)
     - Phone (required)
     - Company Name (required)
     - Service Type (required, dropdown)
     - Business Type (required, dropdown)
     - Status (required, dropdown)

### Main Page Components

1. **People.tsx**
   - Added dropdown menu for "Add New" button in All People tab
   - Connected appropriate dialog components based on selected person type
   - Preserved Team tab view as required
   - Added state management for dialog open/close

2. **TableToolbar.tsx**
   - Added customAddButton prop to support the dropdown menu

## Usage

- **All People Tab**: Click "Add New" to see a dropdown with options for Team Member, Owner, Tenant, and Vendor
- **Team Tab**: Click "Add Member" to open the team member invitation dialog
- **Owners Tab**: Click "Add Owner" to open the owner creation dialog
- **Tenants Tab**: Click "Add Tenant" to open the tenant creation dialog
- **Vendors Tab**: Click "Add Vendor" to open the vendor creation dialog

## Notes

- The UI is built according to the implementation plan specifications
- All dialogs use consistent styling and field layouts
- Form validation is included for required fields
- The Team View and team member invitation flow remain unchanged