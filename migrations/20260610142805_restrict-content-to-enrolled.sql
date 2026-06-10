-- ============================================================================
-- Migration: restrict Course / Module / Lesson SELECT to enrolled users
-- Generated: 2026-06-10
-- Replaces the previous "public read" SELECT policies. Users can only read
-- these tables if they have an Enrollment row for the parent course.
-- Admins (public.is_admin()) retain full read access.
-- Note: the Enrollment subquery is implicitly filtered by RLS on Enrollment
-- (userId = auth.uid()::text), so it only sees the caller's enrollments.
-- ============================================================================

-- Course: enrolled in this course OR admin
DROP POLICY IF EXISTS course_select ON "Course";
CREATE POLICY course_select ON "Course" FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM "Enrollment" e
      WHERE e."courseId" = "Course".id
        AND e."userId" = auth.uid()::text
    )
    OR public.is_admin()
  );
-- course_admin (ALL for admin) is kept as-is from the first migration

-- Module: enrolled in the parent course OR admin
DROP POLICY IF EXISTS module_select ON "Module";
CREATE POLICY module_select ON "Module" FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM "Enrollment" e
      WHERE e."courseId" = "Module"."courseId"
        AND e."userId" = auth.uid()::text
    )
    OR public.is_admin()
  );
-- module_admin (ALL for admin) is kept as-is

-- Lesson: enrolled in the lesson's course (joined via Module) OR admin
DROP POLICY IF EXISTS lesson_select ON "Lesson";
CREATE POLICY lesson_select ON "Lesson" FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM "Module" m
      JOIN "Enrollment" e ON e."courseId" = m."courseId"
      WHERE m.id = "Lesson"."moduleId"
        AND e."userId" = auth.uid()::text
    )
    OR public.is_admin()
  );
-- lesson_admin (ALL for admin) is kept as-is
