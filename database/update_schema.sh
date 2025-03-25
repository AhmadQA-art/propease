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

# Output file
SCHEMA_SQL="schema.sql"
TEMP_DIR="temp_schema"

# Create temporary directory for schema file
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
}

# Main execution
echo "Starting Supabase schema update..."

# Extract schema
extract_schema

# Copy file to final destination
echo "Updating schema file..."
cp $TEMP_DIR/$SCHEMA_SQL $SCHEMA_SQL

# Clean up
echo "Cleaning up..."
rm -rf $TEMP_DIR
rm ~/.pgpass

echo "Schema update completed successfully!"
echo "Updated file:"
echo "- $SCHEMA_SQL"