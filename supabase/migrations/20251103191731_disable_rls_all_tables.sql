/*
  # Disable Row Level Security (RLS) on all tables

  This migration disables RLS on all tables for development/testing purposes.
  WARNING: This removes all security restrictions. Only use in development!
*/

-- Disable RLS on all tables
ALTER TABLE IF EXISTS user_roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS enrollments DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS course_materials DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS user_activity DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS payment_methods_linked DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS forum_posts DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS forum_replies DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS forum_likes DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS courses DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS instructors DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS lessons DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS purchases DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS user_profiles DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view own role" ON user_roles;
DROP POLICY IF EXISTS "Users can view own enrollments" ON enrollments;
DROP POLICY IF EXISTS "Users can update own enrollments" ON enrollments;
DROP POLICY IF EXISTS "Anyone can view preview materials" ON course_materials;
DROP POLICY IF EXISTS "Enrolled users can view course materials" ON course_materials;
DROP POLICY IF EXISTS "Teachers can manage their course materials" ON course_materials;
DROP POLICY IF EXISTS "Users can create own activity" ON user_activity;
DROP POLICY IF EXISTS "Users can view own activity" ON user_activity;
DROP POLICY IF EXISTS "Users can manage own payment methods" ON payment_methods_linked;
DROP POLICY IF EXISTS "Anyone can view forum posts" ON forum_posts;
DROP POLICY IF EXISTS "Authenticated users can create posts" ON forum_posts;
DROP POLICY IF EXISTS "Users can update own posts" ON forum_posts;
DROP POLICY IF EXISTS "Users can delete own posts" ON forum_posts;
DROP POLICY IF EXISTS "Anyone can view forum replies" ON forum_replies;
DROP POLICY IF EXISTS "Authenticated users can create replies" ON forum_replies;
DROP POLICY IF EXISTS "Users can update own replies" ON forum_replies;
DROP POLICY IF EXISTS "Users can delete own replies" ON forum_replies;
DROP POLICY IF EXISTS "Users can view likes" ON forum_likes;
DROP POLICY IF EXISTS "Users can like posts and replies" ON forum_likes;
DROP POLICY IF EXISTS "Users can remove own likes" ON forum_likes;
