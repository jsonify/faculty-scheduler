-- supabase/migrations/20241221150047_base_schema.down.sql
DO $$ 
BEGIN
    -- Drop triggers if they exist
    IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_employees_updated_at') THEN
        DROP TRIGGER update_employees_updated_at ON employees;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_students_updated_at') THEN
        DROP TRIGGER update_students_updated_at ON students;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_schedules_updated_at') THEN
        DROP TRIGGER update_schedules_updated_at ON schedules;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_support_requirements_updated_at') THEN
        DROP TRIGGER update_support_requirements_updated_at ON support_requirements;
    END IF;

    -- Drop tables if they exist (in correct order due to dependencies)
    DROP TABLE IF EXISTS support_requirements CASCADE;
    DROP TABLE IF EXISTS schedules CASCADE;
    DROP TABLE IF EXISTS students CASCADE;
    DROP TABLE IF EXISTS employees CASCADE;
    
    -- Drop function if exists
    DROP FUNCTION IF EXISTS update_updated_at_column CASCADE;
    
    -- Drop type if exists
    DROP TYPE IF EXISTS employee_role CASCADE;
END $$;