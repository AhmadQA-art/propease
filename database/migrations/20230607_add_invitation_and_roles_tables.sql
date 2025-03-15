-- Migration: Add Roles and User Roles tables for invitation feature

-- First check if the roles table already exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM pg_tables
        WHERE schemaname = 'public'
        AND tablename = 'roles'
    ) THEN
        -- Create roles table
        CREATE TABLE roles (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            name VARCHAR(50) UNIQUE NOT NULL,
            description TEXT,
            is_system_role BOOLEAN DEFAULT FALSE,
            permissions JSONB,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
        );
        
        -- Seed the roles table with initial roles
        INSERT INTO roles (name, description, is_system_role) VALUES
            ('team_member', 'Team member with access to specific functionalities', TRUE),
            ('tenant', 'Tenant with access to rental information', TRUE),
            ('vendor', 'Vendor providing services', TRUE),
            ('owner', 'Property owner', TRUE);
            
        RAISE NOTICE 'Created roles table and seeded initial roles';
    ELSE
        RAISE NOTICE 'Roles table already exists, skipping creation';
    END IF;
    
    -- Now check if the user_roles table exists
    IF NOT EXISTS (
        SELECT FROM pg_tables
        WHERE schemaname = 'public'
        AND tablename = 'user_roles'
    ) THEN
        -- Create user_roles table
        CREATE TABLE user_roles (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
            role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
            organization_id UUID,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
            UNIQUE (user_id, role_id, organization_id)
        );
        
        RAISE NOTICE 'Created user_roles table';
    ELSE
        RAISE NOTICE 'User_roles table already exists, skipping creation';
    END IF;
    
    -- Now check if we need to add an expires_at field to organization_invitations
    IF EXISTS (
        SELECT FROM pg_tables
        WHERE schemaname = 'public'
        AND tablename = 'organization_invitations'
    ) AND NOT EXISTS (
        SELECT FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'organization_invitations'
        AND column_name = 'role_id'
    ) THEN
        -- Add role_id to organization_invitations if it doesn't exist
        ALTER TABLE organization_invitations 
        ADD COLUMN role_id UUID REFERENCES roles(id);
        
        RAISE NOTICE 'Added role_id column to organization_invitations table';
    END IF;
    
    -- Now check if the organization_invitations table exists
    IF NOT EXISTS (
        SELECT FROM pg_tables
        WHERE schemaname = 'public'
        AND tablename = 'organization_invitations'
    ) THEN
        -- Create the organization_invitations table
        CREATE TABLE organization_invitations (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            email VARCHAR(255) NOT NULL,
            organization_id UUID NOT NULL,
            role_id UUID NOT NULL REFERENCES roles(id),
            token VARCHAR(255) NOT NULL,
            status VARCHAR(20) DEFAULT 'pending',
            invited_by UUID NOT NULL,
            expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
        );
        
        -- Create index on token
        CREATE INDEX idx_org_invites_token ON organization_invitations(token);
        -- Create index on email
        CREATE INDEX idx_org_invites_email ON organization_invitations(email);
        
        RAISE NOTICE 'Created organization_invitations table';
    ELSE
        RAISE NOTICE 'Organization_invitations table already exists, skipping creation';
    END IF;
    
    -- Add a trigger to update the updated_at column
    IF NOT EXISTS (
        SELECT FROM pg_trigger
        WHERE tgname = 'update_roles_modtime'
    ) THEN
        CREATE TRIGGER update_roles_modtime
        BEFORE UPDATE ON roles
        FOR EACH ROW
        EXECUTE FUNCTION update_modified_column();
        
        CREATE TRIGGER update_user_roles_modtime
        BEFORE UPDATE ON user_roles
        FOR EACH ROW
        EXECUTE FUNCTION update_modified_column();
        
        RAISE NOTICE 'Created triggers for updating timestamps';
    END IF;
END $$; 