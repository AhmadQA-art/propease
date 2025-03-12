import os
import psycopg2
import re
from dotenv import load_dotenv
from psycopg2 import sql

# Load environment variables
load_dotenv()

# Configuration
config = {
    "host": os.getenv("PGHOST"),
    "port": os.getenv("PGPORT"),
    "user": os.getenv("PGUSER"),
    "database": os.getenv("PGDATABASE"),
    "password": os.getenv("PGPASSWORD")
}

SCHEMA_DBML = "schema.dbml"

def get_db_connection():
    """Establish and return a PostgreSQL database connection"""
    try:
        print("⌛ Connecting to database...")
        conn = psycopg2.connect(
            **config,
            connect_timeout=5  # Add connection timeout
        )
        conn.autocommit = True
        print("✅ Database connection established")
        return conn
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        raise

def get_tables(conn):
    """Get all table names from the public schema"""
    with conn.cursor() as cur:
        cur.execute("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_type = 'BASE TABLE'
            ORDER BY table_name
        """)
        return [row[0] for row in cur.fetchall()]

def get_columns(conn, table):
    """Get column definitions for a table"""
    with conn.cursor() as cur:
        cur.execute("""
            SELECT 
                column_name,
                data_type,
                character_maximum_length,
                numeric_precision,
                numeric_scale,
                is_nullable,
                column_default,
                udt_name
            FROM information_schema.columns
            WHERE table_schema = 'public'
            AND table_name = %s
            ORDER BY ordinal_position
        """, (table,))
        return cur.fetchall()

def get_relationships(conn):
    """Get foreign key relationships between tables"""
    with conn.cursor() as cur:
        cur.execute("""
            SELECT
                tc.table_name,
                kcu.column_name,
                ccu.table_name AS foreign_table_name,
                ccu.column_name AS foreign_column_name
            FROM information_schema.table_constraints tc
            JOIN information_schema.key_column_usage kcu
                ON tc.constraint_name = kcu.constraint_name
                AND tc.table_schema = kcu.table_schema
            JOIN information_schema.constraint_column_usage ccu
                ON ccu.constraint_name = tc.constraint_name
                AND ccu.table_schema = tc.table_schema
            WHERE tc.constraint_type = 'FOREIGN KEY'
            AND tc.table_schema = 'public'
        """)
        return cur.fetchall()

def get_indexes(conn):
    """Get indexes for all tables"""
    with conn.cursor() as cur:
        cur.execute("""
            SELECT 
                tablename AS table_name,
                indexname AS index_name,
                indexdef
            FROM pg_indexes
            WHERE schemaname = 'public'
            ORDER BY tablename, indexname
        """)
        
        indexes = {}
        for row in cur.fetchall():
            table_name = row[0]
            if table_name not in indexes:
                indexes[table_name] = []
            
            # Parse the index definition
            index_def = row[2]
            is_unique = 'UNIQUE' in index_def
            columns = re.findall(r'ON public\.[^\(]+\(([^\)]+)\)', index_def)
            columns = [c.strip() for c in columns[0].split(',')] if columns else []
            
            indexes[table_name].append({
                'name': row[1],
                'columns': columns,
                'unique': is_unique
            })
        
        return indexes

def process_column(column):
    """Format column definition in DBML syntax"""
    name, data_type, char_max, num_prec, num_scale, nullable, default, udt = column
    
    # Format the type
    if data_type == 'character varying':
        type_str = f'varchar({char_max})' if char_max else 'varchar'
    elif data_type == 'numeric':
        type_str = f'decimal({num_prec},{num_scale})' if num_prec and num_scale else 'decimal'
    elif data_type == 'ARRAY':
        type_str = f'{udt[:-2]}[]'  # Remove the [] from udt_name and add it back
    else:
        type_str = data_type
    
    # Build the column definition
    col_def = f'  {name} {type_str}'
    
    if default:
        # Clean up default value
        default = re.sub(r"::.*$", "", default)  # Remove type casts
        default = default.replace("'::text", "'")  # Remove text casts
        col_def += f" [default: {default}]"
    
    if nullable == 'NO':
        col_def += " [not null]"
    
    return col_def

def column_exists(conn, table_name, column_name):
    """Verify if a column exists in a table"""
    with conn.cursor() as cur:
        cur.execute("""
            SELECT EXISTS (
                SELECT 1 
                FROM information_schema.columns 
                WHERE table_name = %s 
                AND column_name = %s
            )
        """, (table_name, column_name))
        return cur.fetchone()[0]

def generate_dbml():
    """Main function to generate validated DBML schema"""
    try:
        print("🚀 Starting DBML generation...")
        
        with get_db_connection() as conn, open(SCHEMA_DBML, 'w') as f:
            # Write header
            f.write("""// PropEase Database Schema DBML
// Auto-generated using Python script

Project PropEase {
  database_type: 'PostgreSQL'
  Note: 'PropEase Property Management System Database Schema'
}

""")

            # Get all database metadata first
            print("📊 Fetching tables...")
            tables = get_tables(conn)
            print(f"📑 Found {len(tables)} tables")
            
            print("🔗 Fetching relationships...")
            relationships = get_relationships(conn)
            
            print("📇 Fetching indexes...")
            indexes = get_indexes(conn)

            # Validate relationships before writing
            print("🔍 Validating relationships...")
            valid_relationships = []
            for rel in relationships:
                if (column_exists(conn, rel[0], rel[1]) and 
                    column_exists(conn, rel[2], rel[3])):
                    valid_relationships.append(
                        f"Ref: {rel[0]}.{rel[1]} > {rel[2]}.{rel[3]}"
                    )
            print(f"✅ Validated {len(valid_relationships)}/{len(relationships)} relationships")

            # Process tables with indexes
            total_tables = len(tables)
            for i, table in enumerate(tables, 1):
                print(f"📖 Processing table {i}/{total_tables}: {table}")
                columns = get_columns(conn, table)
                
                if not columns:
                    print(f"⏭️  Skipping empty table: {table}")
                    continue
                
                f.write(f"Table {table} {{\n")
                for col in columns:
                    f.write(process_column(col) + "\n")
                
                # Add indexes if they exist
                if table in indexes:
                    f.write("\n  indexes {\n")
                    for idx in indexes[table]:
                        columns_str = ', '.join(idx['columns'])
                        unique = 'unique ' if idx['unique'] else ''
                        f.write(f"    {unique}({columns_str}) [name: '{idx['name']}']\n")
                    f.write("  }\n")
                
                f.write("}\n\n")

            # Write validated relationships
            if valid_relationships:
                print("✍️ Writing relationships...")
                f.write("\n// Relationships\n")
                f.write('\n'.join(valid_relationships) + "\n")

            print("🎉 DBML schema generation completed successfully!")
            print(f"📄 Output file: {SCHEMA_DBML}")

    except Exception as e:
        print(f"\n❌ Error generating DBML: {str(e)}")
        if 'conn' in locals():
            conn.close()
        exit(1)

if __name__ == "__main__":
    # Verify environment variables
    required_vars = ['PGHOST', 'PGPORT', 'PGUSER', 'PGDATABASE', 'PGPASSWORD']
    missing = [var for var in required_vars if not os.getenv(var)]
    
    if missing:
        print(f"Missing environment variables: {', '.join(missing)}")
        exit(1)
    
    generate_dbml()