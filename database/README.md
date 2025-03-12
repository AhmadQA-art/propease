# Supabase Schema Update Automation

This directory contains the database schema for the PropEase property management system and tools to keep it in sync with your Supabase database.

## Files

- **schema.sql**: The main SQL schema definition file containing all tables, constraints, triggers, and policies.
- **schema.txt**: A plain text copy of the SQL schema, useful for text processing or diffing.
- **SCHEMA.md**: Human-readable documentation of the database schema.
- **schema.ts**: TypeScript interfaces for all database tables, useful for type checking in TypeScript applications.
- **schema.dbml**: Database Markup Language file for quick schema visualization and reference.
- **update_schema.sh**: Automation script to update the schema files from your Supabase database.

## How to Update the Schema

When you make changes to your Supabase database structure (adding tables, columns, constraints, etc.), you can use the `update_schema.sh` script to automatically update your local schema files.

### Prerequisites

- PostgreSQL client tools (`psql`) installed on your system
- Bash shell environment
- Access to your Supabase database

### Configuration

Before running the script, make sure to update the database connection details in `update_schema.sh`:

```bash
# Configuration - Update these values with your Supabase credentials
DB_HOST="your-supabase-host.supabase.co"
DB_PORT="5432"
DB_USER="your-database-user"
DB_NAME="postgres"
DB_PASSWORD="your-database-password"
```

### Running the Script

1. Make the script executable (first time only):
   ```bash
   chmod +x update_schema.sh
   ```

2. Run the script from the database directory:
   ```bash
   ./update_schema.sh
   ```

3. The script will:
   - Connect to your Supabase database
   - Extract the current schema (tables, constraints, functions, triggers, policies)
   - Generate updated SQL schema, text, markdown documentation, and TypeScript interfaces
   - Replace the existing files

### Handling Password with Special Characters

If your database password contains special characters, you might need to escape them in the script. For example, if your password contains `!`, you may need to escape it as `\!` in the script.

## What Gets Updated

The script extracts and updates:

1. Table definitions with columns, data types, and constraints
2. Primary keys
3. Foreign keys
4. Unique constraints
5. Indexes
6. Functions
7. Triggers
8. Row Level Security (RLS) policies

## Using the TypeScript Interfaces

The generated `schema.ts` file contains TypeScript interfaces for all tables in your database. You can import these interfaces in your TypeScript code:

```typescript
import { UserProfiles, Properties, Database } from '../database/schema';

// Use the interfaces for type checking
const user: UserProfiles = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  email: 'user@example.com',
  // ...other properties
};

// The Database interface includes all tables
const db: Database = {
  user_profiles: [user],
  // ...other tables
};
```

## Using the DBML Schema

The generated `schema.dbml` file provides a concise, human-readable representation of your database schema. You can:

1. **Visualize the Schema**: Use tools like [dbdiagram.io](https://dbdiagram.io) to visualize your database structure by copying the DBML content.

2. **Quick Reference**: DBML format makes it easy to quickly understand:
   - Table structures
   - Column types and constraints
   - Relationships between tables
   - Indexes and their configurations

3. **Share with Team**: The DBML format is ideal for sharing database structure with team members who need a quick overview without diving into full SQL definitions.

Example DBML snippet:
```dbml
Table users {
  id uuid [pk, default: `uuid_generate_v4()`]
  email varchar [not null]
  created_at timestamp [default: `now()`]
  updated_at timestamp
}

Table profiles {
  id uuid [pk]
  user_id uuid [ref: > users.id]
  full_name varchar
  avatar_url varchar
}

// Relationships are explicitly defined
Ref: profiles.user_id > users.id
```

## Troubleshooting

If you encounter issues:

1. **Connection errors**: Verify your database credentials and make sure your IP is allowed to connect to the Supabase database.

2. **Permission errors**: Ensure your database user has sufficient privileges to read schema information.

3. **Script execution errors**: Make sure the script is executable (`chmod +x update_schema.sh`).

4. **Special characters in password**: If your password contains special characters, you may need to escape them in the script.

## Manual Updates

If you prefer to update the schema manually:

1. Make changes to your Supabase database through the Supabase UI or SQL editor
2. Run the update script to capture those changes
3. Review the updated schema files
4. Commit the changes to version control

## Best Practices

- Run the update script after making significant changes to your database structure
- Review the changes in the schema files before committing them
- Keep your schema files in version control to track changes over time
- Document major schema changes in your project's changelog 