/*
  # Create Online Courses Platform Schema

  ## Summary
  This migration creates the database schema for an online courses platform with courses, categories, instructors, and enrollments.

  ## New Tables
  
  ### `categories`
  - `id` (uuid, primary key) - Unique category identifier
  - `name` (text) - Category name
  - `description` (text) - Category description
  - `slug` (text, unique) - URL-friendly category identifier
  - `created_at` (timestamptz) - Record creation timestamp

  ### `instructors`
  - `id` (uuid, primary key) - Unique instructor identifier
  - `name` (text) - Instructor full name
  - `bio` (text) - Instructor biography
  - `avatar_url` (text) - URL to instructor profile picture
  - `created_at` (timestamptz) - Record creation timestamp

  ### `courses`
  - `id` (uuid, primary key) - Unique course identifier
  - `title` (text) - Course title
  - `description` (text) - Course description
  - `short_description` (text) - Brief course summary
  - `price` (numeric) - Course price
  - `duration_hours` (integer) - Course duration in hours
  - `level` (text) - Course difficulty level (beginner, intermediate, advanced)
  - `thumbnail_url` (text) - URL to course thumbnail image
  - `category_id` (uuid, foreign key) - Reference to categories table
  - `instructor_id` (uuid, foreign key) - Reference to instructors table
  - `is_published` (boolean) - Course visibility status
  - `students_count` (integer) - Number of enrolled students
  - `rating` (numeric) - Average course rating
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### `lessons`
  - `id` (uuid, primary key) - Unique lesson identifier
  - `course_id` (uuid, foreign key) - Reference to courses table
  - `title` (text) - Lesson title
  - `description` (text) - Lesson description
  - `duration_minutes` (integer) - Lesson duration in minutes
  - `order_index` (integer) - Lesson order within course
  - `video_url` (text) - URL to lesson video
  - `created_at` (timestamptz) - Record creation timestamp

  ## Security
  
  ### Row Level Security (RLS)
  - Enable RLS on all tables
  - Public read access for published courses, categories, instructors, and lessons
  - Anonymous users can view all published content
  
  ## Notes
  1. All tables have proper foreign key constraints
  2. Indexes added for common query patterns
  3. Default values set for boolean and timestamp fields
  4. Public read policies enable browsing without authentication
*/

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  slug text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create instructors table
CREATE TABLE IF NOT EXISTS instructors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  bio text DEFAULT '',
  avatar_url text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Create courses table
CREATE TABLE IF NOT EXISTS courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text DEFAULT '',
  short_description text DEFAULT '',
  price numeric(10, 2) DEFAULT 0,
  duration_hours integer DEFAULT 0,
  level text DEFAULT 'beginner',
  thumbnail_url text DEFAULT '',
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  instructor_id uuid REFERENCES instructors(id) ON DELETE SET NULL,
  is_published boolean DEFAULT true,
  students_count integer DEFAULT 0,
  rating numeric(3, 2) DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create lessons table
CREATE TABLE IF NOT EXISTS lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid REFERENCES courses(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text DEFAULT '',
  duration_minutes integer DEFAULT 0,
  order_index integer DEFAULT 0,
  video_url text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_courses_category ON courses(category_id);
CREATE INDEX IF NOT EXISTS idx_courses_instructor ON courses(instructor_id);
CREATE INDEX IF NOT EXISTS idx_courses_published ON courses(is_published);
CREATE INDEX IF NOT EXISTS idx_lessons_course ON lessons(course_id);
CREATE INDEX IF NOT EXISTS idx_lessons_order ON lessons(course_id, order_index);

-- Enable Row Level Security
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE instructors ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Public can view all categories"
  ON categories FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Public can view all instructors"
  ON instructors FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Public can view published courses"
  ON courses FOR SELECT
  TO anon, authenticated
  USING (is_published = true);

CREATE POLICY "Public can view lessons of published courses"
  ON lessons FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM courses
      WHERE courses.id = lessons.course_id
      AND courses.is_published = true
    )
  );
