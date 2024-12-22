-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

BEGIN;

-- Create role types enum
CREATE TYPE employee_role AS ENUM ('teacher', 'para_educator', 'admin', 'specialist');

-- Base employees table
CREATE TABLE IF NOT EXISTS employees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  role employee_role NOT NULL,
  is_active BOOLEAN DEFAULT true,
  daily_capacity INTEGER DEFAULT 480, -- minutes
  shift_start TIME,
  shift_end TIME,
  supervisor_id UUID REFERENCES employees(id), -- Self-referential for hierarchy
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Students table
CREATE TABLE IF NOT EXISTS students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  grade INTEGER NOT NULL,
  support_level INTEGER CHECK (support_level BETWEEN 1 AND 3),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Schedules (combines shifts and student_schedules into one flexible table)
CREATE TABLE IF NOT EXISTS schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID REFERENCES employees(id),
  student_id UUID REFERENCES students(id), -- Optional, only if schedule involves a student
  support_employee_id UUID REFERENCES employees(id), -- Optional, for para-educator assignments
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  location TEXT,
  requires_support BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT valid_schedule_assignment CHECK (
    -- Either employee_id or support_employee_id must be present
    (employee_id IS NOT NULL OR support_employee_id IS NOT NULL) AND
    -- If there's a student, there must be a support employee
    (student_id IS NULL OR support_employee_id IS NOT NULL)
  )
);

-- Support requirements
CREATE TABLE IF NOT EXISTS support_requirements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID REFERENCES students(id),
  support_level INTEGER CHECK (support_level BETWEEN 1 AND 3),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_employee_role ON employees(role);
CREATE INDEX idx_employee_supervisor ON employees(supervisor_id);
CREATE INDEX idx_student_support_level ON students(support_level);
CREATE INDEX idx_schedule_date ON schedules(date);
CREATE INDEX idx_schedule_employee ON schedules(employee_id);
CREATE INDEX idx_schedule_student ON schedules(student_id);
CREATE INDEX idx_schedule_support ON schedules(support_employee_id);
CREATE INDEX idx_support_requirements_student ON support_requirements(student_id);

-- Add triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_employees_updated_at
    BEFORE UPDATE ON employees
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_students_updated_at
    BEFORE UPDATE ON students
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_schedules_updated_at
    BEFORE UPDATE ON schedules
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_support_requirements_updated_at
    BEFORE UPDATE ON support_requirements
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

COMMIT;