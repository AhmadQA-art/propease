#!/bin/bash

# Supabase Schema Update Automation
# This script connects to your Supabase database and updates the schema.sql file
# with the current database schema.

# Set script to exit on error
set -e

# Configuration - Update these values with your Supabase credentials
export PGHOST="aws-0-us-west-1.pooler.supabase.com"
export PGPORT="5432"
export PGUSER="postgres.ljojrcciojdprmvrtbdb"
export PGDATABASE="postgres"
export PGPASSWORD="ahmadmomo5007!"

# Output files
SCHEMA_SQL="schema.sql"
SCHEMA_MD="SCHEMA.md"
SCHEMA_TXT="schema.txt"
SCHEMA_TS="schema.ts"
TEMP_DIR="temp_schema"

# Create temporary directory for schema files
echo "Creating temporary directory..."
mkdir -p $TEMP_DIR

# Create a .pgpass file for authentication
echo "Setting up database authentication..."
echo "$PGHOST:$PGPORT:$PGDATABASE:$PGUSER:$PGPASSWORD" > ~/.pgpass
chmod 600 ~/.pgpass

# Function to extract schema
extract_schema() {
  echo "Extracting database schema..."
  
  # Extract schema header with extension creation
  cat > $TEMP_DIR/$SCHEMA_SQL << EOF
-- Updated Supabase Database Schema
-- Last updated: $(date)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

EOF

  # Extract table definitions
  echo "Extracting table definitions..."
  psql -h $PGHOST -p $PGPORT -U $PGUSER -d $PGDATABASE -t -c "
    SELECT 
      'CREATE TABLE ' || table_name || ' (' || 
      string_agg(
        '  \"' || column_name || '\" ' || 
        data_type || 
        CASE 
          WHEN character_maximum_length IS NOT NULL THEN '(' || character_maximum_length || ')'
          WHEN numeric_precision IS NOT NULL AND numeric_scale IS NOT NULL THEN '(' || numeric_precision || ',' || numeric_scale || ')'
          ELSE ''
        END ||
        CASE WHEN is_nullable = 'NO' THEN ' NOT NULL' ELSE '' END ||
        CASE WHEN column_default IS NOT NULL THEN ' DEFAULT ' || column_default ELSE '' END,
        ',\n'
      ) || 
      '\n);'
    FROM 
      information_schema.columns
    WHERE 
      table_schema = 'public'
    GROUP BY 
      table_name
    ORDER BY 
      table_name;
  " >> $TEMP_DIR/$SCHEMA_SQL

  # Extract primary keys
  echo "Extracting primary keys..."
  psql -h $PGHOST -p $PGPORT -U $PGUSER -d $PGDATABASE -t -c "
    SELECT 
      'ALTER TABLE ' || tc.table_name || ' ADD CONSTRAINT ' || tc.constraint_name || ' PRIMARY KEY (' || 
      string_agg(kcu.column_name, ', ') || ');'
    FROM 
      information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
    WHERE 
      tc.constraint_type = 'PRIMARY KEY'
      AND tc.table_schema = 'public'
    GROUP BY 
      tc.table_name, tc.constraint_name
    ORDER BY 
      tc.table_name;
  " >> $TEMP_DIR/$SCHEMA_SQL

  # Extract foreign keys
  echo "Extracting foreign keys..."
  psql -h $PGHOST -p $PGPORT -U $PGUSER -d $PGDATABASE -t -c "
    SELECT 
      'ALTER TABLE ' || tc.table_name || ' ADD CONSTRAINT ' || tc.constraint_name || ' FOREIGN KEY (' || 
      kcu.column_name || ') REFERENCES ' || ccu.table_name || '(' || ccu.column_name || ');'
    FROM 
      information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
    WHERE 
      tc.constraint_type = 'FOREIGN KEY'
      AND tc.table_schema = 'public'
    ORDER BY 
      tc.table_name;
  " >> $TEMP_DIR/$SCHEMA_SQL

  # Extract unique constraints
  echo "Extracting unique constraints..."
  psql -h $PGHOST -p $PGPORT -U $PGUSER -d $PGDATABASE -t -c "
    SELECT 
      'ALTER TABLE ' || tc.table_name || ' ADD CONSTRAINT ' || tc.constraint_name || ' UNIQUE (' || 
      string_agg(kcu.column_name, ', ') || ');'
    FROM 
      information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
    WHERE 
      tc.constraint_type = 'UNIQUE'
      AND tc.table_schema = 'public'
    GROUP BY 
      tc.table_name, tc.constraint_name
    ORDER BY 
      tc.table_name;
  " >> $TEMP_DIR/$SCHEMA_SQL

  # Extract indexes
  echo "Extracting indexes..."
  psql -h $PGHOST -p $PGPORT -U $PGUSER -d $PGDATABASE -t -c "
    SELECT 
      indexdef || ';'
    FROM 
      pg_indexes
    WHERE 
      schemaname = 'public'
      AND indexname NOT IN (
        SELECT constraint_name 
        FROM information_schema.table_constraints 
        WHERE table_schema = 'public'
      )
    ORDER BY 
      tablename, indexname;
  " >> $TEMP_DIR/$SCHEMA_SQL

  # Extract functions
  echo "Extracting functions..."
  psql -h $PGHOST -p $PGPORT -U $PGUSER -d $PGDATABASE -t -c "
    SELECT 
      'CREATE OR REPLACE FUNCTION ' || 
      ns.nspname || '.' || proname || '(' || 
      pg_get_function_arguments(p.oid) || ') RETURNS ' || 
      pg_get_function_result(p.oid) || ' AS $BODY$' || 
      pg_get_functiondef(p.oid) || '$BODY$ LANGUAGE ' || 
      l.lanname || ';'
    FROM 
      pg_proc p
      LEFT JOIN pg_namespace ns ON p.pronamespace = ns.oid
      LEFT JOIN pg_language l ON p.prolang = l.oid
    WHERE 
      ns.nspname = 'public'
    ORDER BY 
      proname;
  " >> $TEMP_DIR/$SCHEMA_SQL

  # Extract triggers
  echo "Extracting triggers..."
  psql -h $PGHOST -p $PGPORT -U $PGUSER -d $PGDATABASE -t -c "
    SELECT 
      'CREATE TRIGGER ' || trigger_name || 
      ' ' || action_timing || ' ' || event_manipulation || 
      ' ON ' || event_object_table || 
      ' FOR EACH ' || action_orientation || 
      ' EXECUTE FUNCTION ' || action_statement || ';'
    FROM 
      information_schema.triggers
    WHERE 
      trigger_schema = 'public'
    ORDER BY 
      event_object_table, trigger_name;
  " >> $TEMP_DIR/$SCHEMA_SQL

  # Extract RLS policies
  echo "Extracting row level security policies..."
  psql -h $PGHOST -p $PGPORT -U $PGUSER -d $PGDATABASE -t -c "
    SELECT 
      'ALTER TABLE ' || tablename || ' ENABLE ROW LEVEL SECURITY;'
    FROM 
      pg_tables
    WHERE 
      schemaname = 'public' AND 
      rowsecurity = 't'
    ORDER BY 
      tablename;
  " >> $TEMP_DIR/$SCHEMA_SQL

  # Fixed query for RLS policies with explicit type casts
  psql -h $PGHOST -p $PGPORT -U $PGUSER -d $PGDATABASE -t -c "
    SELECT 
      'CREATE POLICY \"' || pol.polname::text || '\" ON ' || cls.relname::text || 
      ' FOR ' || 
      CASE 
        WHEN pol.polcmd = '*' THEN 'ALL'::text
        ELSE pol.polcmd::text
      END ||
      CASE 
        WHEN pol.polroles <> '{0}' THEN ' TO ' || array_to_string(ARRAY(
          SELECT rolname::text
          FROM pg_roles 
          WHERE oid = ANY(pol.polroles)
        ), ', ')
        ELSE ''::text
      END ||
      CASE 
        WHEN pol.polqual IS NOT NULL THEN ' USING (' || pg_get_expr(pol.polqual, pol.polrelid)::text || ')'
        ELSE ''::text
      END ||
      CASE 
        WHEN pol.polwithcheck IS NOT NULL THEN ' WITH CHECK (' || pg_get_expr(pol.polwithcheck, pol.polrelid)::text || ')'
        ELSE ''::text
      END || ';'
    FROM 
      pg_policy pol
      JOIN pg_class cls ON cls.oid = pol.polrelid
      JOIN pg_namespace ns ON ns.oid = cls.relnamespace
    WHERE 
      ns.nspname = 'public'
    ORDER BY 
      cls.relname, pol.polname;
  " >> $TEMP_DIR/$SCHEMA_SQL

  # Clean up the SQL file (remove extra whitespace, etc.)
  sed -i 's/^[ \t]*//g' $TEMP_DIR/$SCHEMA_SQL
  
  # Create schema.txt (copy of schema.sql)
  cp $TEMP_DIR/$SCHEMA_SQL $TEMP_DIR/$SCHEMA_TXT
}

# Function to generate markdown documentation
generate_markdown() {
  echo "Generating markdown documentation..."
  
  # Create markdown header
  cat > $TEMP_DIR/$SCHEMA_MD << EOF
# Supabase Database Schema Documentation

This document provides an overview of the database schema for the PropEase property management system.
Last updated: $(date)

## Tables
EOF

  # Generate table documentation
  psql -h $PGHOST -p $PGPORT -U $PGUSER -d $PGDATABASE -t -c "
    SELECT 
      '### ' || table_name || E'\n' ||
      string_agg(
        '- **' || column_name || '**: ' || 
        data_type || 
        CASE 
          WHEN character_maximum_length IS NOT NULL THEN '(' || character_maximum_length || ')'
          WHEN numeric_precision IS NOT NULL AND numeric_scale IS NOT NULL THEN '(' || numeric_precision || ',' || numeric_scale || ')'
          ELSE ''
        END ||
        CASE WHEN is_nullable = 'NO' THEN ', required' ELSE '' END ||
        CASE 
          WHEN column_default IS NOT NULL THEN ', default ' || 
            REPLACE(REPLACE(column_default, 'nextval', ''), '::', '')
          ELSE ''
        END,
        E'\n'
      ) || E'\n'
    FROM 
      information_schema.columns
    WHERE 
      table_schema = 'public'
    GROUP BY 
      table_name
    ORDER BY 
      table_name;
  " >> $TEMP_DIR/$SCHEMA_MD

  # Add constraints section
  cat >> $TEMP_DIR/$SCHEMA_MD << EOF

## Constraints

### Primary Keys
EOF

  # Add primary keys
  psql -h $PGHOST -p $PGPORT -U $PGUSER -d $PGDATABASE -t -c "
    SELECT 
      '- **' || tc.table_name || '**: ' || string_agg(kcu.column_name, ', ')
    FROM 
      information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
    WHERE 
      tc.constraint_type = 'PRIMARY KEY'
      AND tc.table_schema = 'public'
    GROUP BY 
      tc.table_name, tc.constraint_name
    ORDER BY 
      tc.table_name;
  " >> $TEMP_DIR/$SCHEMA_MD

  # Add foreign keys section
  cat >> $TEMP_DIR/$SCHEMA_MD << EOF

### Foreign Keys
EOF

  # Add foreign keys
  psql -h $PGHOST -p $PGPORT -U $PGUSER -d $PGDATABASE -t -c "
    SELECT 
      '- **' || tc.table_name || '.' || kcu.column_name || '** references **' || 
      ccu.table_name || '.' || ccu.column_name || '**'
    FROM 
      information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
    WHERE 
      tc.constraint_type = 'FOREIGN KEY'
      AND tc.table_schema = 'public'
    ORDER BY 
      tc.table_name, kcu.column_name;
  " >> $TEMP_DIR/$SCHEMA_MD

  # Add unique constraints section
  cat >> $TEMP_DIR/$SCHEMA_MD << EOF

### Unique Constraints
EOF

  # Add unique constraints
  psql -h $PGHOST -p $PGPORT -U $PGUSER -d $PGDATABASE -t -c "
    SELECT 
      '- **' || tc.table_name || '**: ' || string_agg(kcu.column_name, ', ')
    FROM 
      information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
    WHERE 
      tc.constraint_type = 'UNIQUE'
      AND tc.table_schema = 'public'
    GROUP BY 
      tc.table_name, tc.constraint_name
    ORDER BY 
      tc.table_name;
  " >> $TEMP_DIR/$SCHEMA_MD

  # Add RLS policies section
  cat >> $TEMP_DIR/$SCHEMA_MD << EOF

## Row Level Security Policies
EOF

  # Fixed query for RLS policies in markdown with explicit type casts
  psql -h $PGHOST -p $PGPORT -U $PGUSER -d $PGDATABASE -t -c "
    SELECT 
      '### ' || cls.relname::text || E'\n' ||
      string_agg(
        '- **' || pol.polname::text || '**: ' || 
        'For ' || 
        CASE 
          WHEN pol.polcmd = '*' THEN 'ALL'::text
          ELSE pol.polcmd::text
        END ||
        CASE 
          WHEN pol.polroles <> '{0}' THEN ' to ' || array_to_string(ARRAY(
            SELECT rolname::text
            FROM pg_roles 
            WHERE oid = ANY(pol.polroles)
          ), ', ')
          ELSE ''::text
        END,
        E'\n'
      ) || E'\n'
    FROM 
      pg_policy pol
      JOIN pg_class cls ON cls.oid = pol.polrelid
      JOIN pg_namespace ns ON ns.oid = cls.relnamespace
    WHERE 
      ns.nspname = 'public'
    GROUP BY 
      cls.relname
    ORDER BY 
      cls.relname;
  " >> $TEMP_DIR/$SCHEMA_MD

  # Clean up the markdown file
  sed -i 's/^[ \t]*//g' $TEMP_DIR/$SCHEMA_MD
}

# Function to generate TypeScript interfaces
generate_typescript() {
  echo "Generating TypeScript interfaces..."
  
  # Create TypeScript header
  cat > $TEMP_DIR/$SCHEMA_TS << EOF
/**
 * PropEase Database Schema TypeScript Definitions
 * Auto-generated on: $(date)
 */

// Type definitions for common PostgreSQL data types
type UUID = string;
type Timestamp = string;
type Date = string;
type JSONB = Record<string, any>;

EOF

  # Get all tables
  tables=$(psql -h $PGHOST -p $PGPORT -U $PGUSER -d $PGDATABASE -t -c "
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    ORDER BY table_name;
  ")

  # Process each table
  for table in $tables; do
    # Convert snake_case to PascalCase for interface name
    interface_name=$(echo $table | sed -r 's/(^|_)([a-z])/\U\2/g')
    
    echo "export interface $interface_name {" >> $TEMP_DIR/$SCHEMA_TS
    
    # Get columns for this table
    psql -h $PGHOST -p $PGPORT -U $PGUSER -d $PGDATABASE -t -c "
      SELECT 
        '  ' || column_name || 
        CASE WHEN is_nullable = 'YES' THEN '?: ' ELSE ': ' END ||
        CASE 
          WHEN data_type = 'uuid' THEN 'UUID'
          WHEN data_type = 'timestamp with time zone' OR data_type = 'timestamp without time zone' THEN 'Timestamp'
          WHEN data_type = 'date' THEN 'Date'
          WHEN data_type = 'jsonb' THEN 'JSONB'
          WHEN data_type = 'ARRAY' THEN 'Array<UUID>'
          WHEN data_type LIKE 'integer%' THEN 'number'
          WHEN data_type LIKE 'numeric%' THEN 'number'
          WHEN data_type = 'boolean' THEN 'boolean'
          WHEN data_type = 'text' THEN 'string'
          WHEN data_type LIKE 'character%' THEN 'string'
          ELSE 'any'
        END || ';'
      FROM 
        information_schema.columns
      WHERE 
        table_schema = 'public' AND
        table_name = '$table'
      ORDER BY 
        ordinal_position;
    " >> $TEMP_DIR/$SCHEMA_TS
    
    echo "}" >> $TEMP_DIR/$SCHEMA_TS
    echo "" >> $TEMP_DIR/$SCHEMA_TS
  done

  # Add Database interface
  echo "export interface Database {" >> $TEMP_DIR/$SCHEMA_TS
  
  for table in $tables; do
    interface_name=$(echo $table | sed -r 's/(^|_)([a-z])/\U\2/g')
    echo "  $table: $interface_name[];" >> $TEMP_DIR/$SCHEMA_TS
  done
  
  echo "}" >> $TEMP_DIR/$SCHEMA_TS

  # Clean up the TypeScript file
  sed -i 's/^[ \t]*//g' $TEMP_DIR/$SCHEMA_TS
}

# Main execution
echo "Starting Supabase schema update..."

# Extract schema and generate documentation
extract_schema
generate_markdown
generate_typescript

# Copy files to final destination
echo "Updating schema files..."
cp $TEMP_DIR/$SCHEMA_SQL $SCHEMA_SQL
cp $TEMP_DIR/$SCHEMA_MD $SCHEMA_MD
cp $TEMP_DIR/$SCHEMA_TXT $SCHEMA_TXT
cp $TEMP_DIR/$SCHEMA_TS $SCHEMA_TS

# Clean up
echo "Cleaning up..."
rm -rf $TEMP_DIR
rm ~/.pgpass

echo "Schema update completed successfully!"
echo "Updated files:"
echo "- $SCHEMA_SQL"
echo "- $SCHEMA_MD"
echo "- $SCHEMA_TXT"
echo "- $SCHEMA_TS" 