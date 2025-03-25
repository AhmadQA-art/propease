-- Create a function to handle team member deletion
CREATE OR REPLACE FUNCTION delete_team_member(team_member_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id UUID;
BEGIN
    -- 1. Get the user_id from team_members table
    SELECT user_id INTO v_user_id
    FROM team_members
    WHERE id = team_member_id;

    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Team member not found';
    END IF;

    -- 2. Delete the team member record
    DELETE FROM team_members
    WHERE id = team_member_id;

    -- 3. Remove user roles for this user
    DELETE FROM user_roles
    WHERE user_id = v_user_id;

    -- 4. Delete the user profile
    DELETE FROM user_profiles
    WHERE id = v_user_id;

    -- 5. Delete the user from auth.users using Supabase admin API
    -- This will be handled by the application code using supabase.auth.admin.deleteUser()
    -- The function just needs to ensure all other records are deleted first
END;
$$; 