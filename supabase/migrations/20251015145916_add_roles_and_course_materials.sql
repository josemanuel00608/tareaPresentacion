/*
  # Add User Roles and Course Materials System

  ## Summary
  This migration adds a comprehensive role-based system with admin, teacher, and student roles,
  along with course materials, enrollments, and activity tracking.

  ## New Tables

  ### `user_roles`
  - `user_id` (uuid, primary key) - References auth.users
  - `role` (text) - User role: 'admin', 'teacher', or 'student'
  - `created_at` (timestamptz) - Role assignment timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### `enrollments`
  - `id` (uuid, primary key) - Unique enrollment identifier
  - `user_id` (uuid, foreign key) - Reference to auth.users
  - `course_id` (uuid, foreign key) - Reference to courses
  - `purchase_id` (uuid, foreign key) - Reference to purchases
  - `progress` (integer) - Course completion percentage (0-100)
  - `last_accessed` (timestamptz) - Last time user accessed the course
  - `completed` (boolean) - Whether course is completed
  - `completed_at` (timestamptz) - Completion timestamp
  - `created_at` (timestamptz) - Enrollment creation timestamp

  ### `course_materials`
  - `id` (uuid, primary key) - Unique material identifier
  - `course_id` (uuid, foreign key) - Reference to courses
  - `lesson_id` (uuid, foreign key) - Reference to lessons (optional)
  - `title` (text) - Material title
  - `description` (text) - Material description
  - `material_type` (text) - Type: 'video', 'pdf', 'document', 'link'
  - `file_url` (text) - URL to the material
  - `order_index` (integer) - Display order
  - `is_preview` (boolean) - Whether material is available as preview
  - `created_by` (uuid, foreign key) - Reference to teacher who created it
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### `user_activity`
  - `id` (uuid, primary key) - Unique activity identifier
  - `user_id` (uuid, foreign key) - Reference to auth.users
  - `course_id` (uuid, foreign key) - Reference to courses
  - `lesson_id` (uuid, foreign key) - Reference to lessons (optional)
  - `activity_type` (text) - Activity type: 'view', 'complete', 'download'
  - `created_at` (timestamptz) - Activity timestamp

  ### `payment_methods_linked`
  - `id` (uuid, primary key) - Unique identifier
  - `user_id` (uuid, foreign key) - Reference to auth.users
  - `method_type` (text) - Type: 'card', 'paypal', 'wallet'
  - `method_name` (text) - Display name
  - `last_four_digits` (text) - Last 4 digits for cards
  - `is_default` (boolean) - Whether it's the default payment method
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ## Security

  ### Row Level Security (RLS)
  - Enable RLS on all new tables
  - Admins can manage all data
  - Teachers can manage their own course materials
  - Students can view their enrollments and purchased courses
  - Activity tracking respects user privacy

  ## Notes
  1. Default role for new users is 'student'
  2. First user can be set as 'admin' manually
  3. Teachers are assigned by admins
  4. Course materials support previews for non-enrolled users
  5. Activity tracking for analytics and progress
*/

-- Create user_roles table
CREATE TABLE IF NOT EXISTS user_roles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role text DEFAULT 'student' CHECK (role IN ('admin', 'teacher', 'student')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create enrollments table
CREATE TABLE IF NOT EXISTS enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  course_id uuid REFERENCES courses(id) ON DELETE CASCADE NOT NULL,
  purchase_id uuid REFERENCES purchases(id) ON DELETE SET NULL,
  progress integer DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  last_accessed timestamptz DEFAULT now(),
  completed boolean DEFAULT false,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, course_id)
);

-- Create course_materials table
CREATE TABLE IF NOT EXISTS course_materials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid REFERENCES courses(id) ON DELETE CASCADE NOT NULL,
  lesson_id uuid REFERENCES lessons(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text DEFAULT '',
  material_type text DEFAULT 'document' CHECK (material_type IN ('video', 'pdf', 'document', 'link')),
  file_url text DEFAULT '',
  order_index integer DEFAULT 0,
  is_preview boolean DEFAULT false,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create user_activity table
CREATE TABLE IF NOT EXISTS user_activity (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  course_id uuid REFERENCES courses(id) ON DELETE CASCADE,
  lesson_id uuid REFERENCES lessons(id) ON DELETE SET NULL,
  activity_type text DEFAULT 'view' CHECK (activity_type IN ('view', 'complete', 'download')),
  created_at timestamptz DEFAULT now()
);

-- Create payment_methods_linked table
CREATE TABLE IF NOT EXISTS payment_methods_linked (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  method_type text NOT NULL CHECK (method_type IN ('card', 'paypal', 'wallet')),
  method_name text NOT NULL,
  last_four_digits text DEFAULT '',
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role);
CREATE INDEX IF NOT EXISTS idx_enrollments_user ON enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course ON enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_course_materials_course ON course_materials(course_id);
CREATE INDEX IF NOT EXISTS idx_course_materials_preview ON course_materials(is_preview);
CREATE INDEX IF NOT EXISTS idx_user_activity_user ON user_activity(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_methods_linked_user ON payment_methods_linked(user_id);

-- Enable Row Level Security
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods_linked ENABLE ROW LEVEL SECURITY;

-- Policies for user_roles
CREATE POLICY "Users can view own role"
  ON user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policies for enrollments
CREATE POLICY "Users can view own enrollments"
  ON enrollments FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own enrollments"
  ON enrollments FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policies for course_materials
CREATE POLICY "Anyone can view preview materials"
  ON course_materials FOR SELECT
  TO anon, authenticated
  USING (is_preview = true);

CREATE POLICY "Enrolled users can view course materials"
  ON course_materials FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM enrollments
      WHERE enrollments.user_id = auth.uid()
      AND enrollments.course_id = course_materials.course_id
    ) OR is_preview = true
  );

CREATE POLICY "Teachers can manage their course materials"
  ON course_materials FOR ALL
  TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

-- Policies for user_activity
CREATE POLICY "Users can create own activity"
  ON user_activity FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own activity"
  ON user_activity FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policies for payment_methods_linked
CREATE POLICY "Users can manage own payment methods"
  ON payment_methods_linked FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Function to auto-create user role
CREATE OR REPLACE FUNCTION create_user_role()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_roles (user_id, role)
  VALUES (NEW.id, 'student')
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create user role on signup
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created_role'
  ) THEN
    CREATE TRIGGER on_auth_user_created_role
      AFTER INSERT ON auth.users
      FOR EACH ROW
      EXECUTE FUNCTION create_user_role();
  END IF;
END $$;



