-- ============================================================================
-- Migration: enable RLS on all 28 public tables + add 13 missing FK indexes
-- Generated: 2026-06-10
-- Runs as project_admin (BYPASSRLS) inside a backend-managed transaction
-- ============================================================================

-- 1) HELPER: is_admin() — SECURITY DEFINER to bypass User RLS when checking role
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_admin() RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM "User"
    WHERE id = auth.uid()::text AND role = 'admin'
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- 2) MISSING FOREIGN KEY INDEXES
-- ----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS "Module_courseId_idx"            ON "Module"           ("courseId");
CREATE INDEX IF NOT EXISTS "Lesson_moduleId_idx"            ON "Lesson"           ("moduleId");
CREATE INDEX IF NOT EXISTS "Enrollment_courseId_idx"        ON "Enrollment"       ("courseId");
CREATE INDEX IF NOT EXISTS "LessonProgress_lessonId_idx"    ON "LessonProgress"   ("lessonId");
CREATE INDEX IF NOT EXISTS "UserAchievement_achievementId_idx" ON "UserAchievement" ("achievementId");
CREATE INDEX IF NOT EXISTS "GameScore_gameId_idx"           ON "GameScore"        ("gameId");
CREATE INDEX IF NOT EXISTS "Purchase_itemId_idx"            ON "Purchase"         ("itemId");
CREATE INDEX IF NOT EXISTS "Friend_friendId_idx"            ON "Friend"           ("friendId");
CREATE INDEX IF NOT EXISTS "CoursePurchase_courseId_idx"    ON "CoursePurchase"   ("courseId");
CREATE INDEX IF NOT EXISTS "ContentReport_reporterId_idx"   ON "ContentReport"    ("reporterId");
CREATE INDEX IF NOT EXISTS "Notification_userId_idx"        ON "Notification"     ("userId");
CREATE INDEX IF NOT EXISTS "BundleCourse_courseId_idx"      ON "BundleCourse"     ("courseId");
CREATE INDEX IF NOT EXISTS "BundlePurchase_bundleId_idx"    ON "BundlePurchase"   ("bundleId");

-- 3) ENABLE ROW LEVEL SECURITY ON ALL 28 TABLES
-- ----------------------------------------------------------------------------
ALTER TABLE "User"                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Course"                ENABLE ROW LEVEL SECURITY;
ALTER TABLE "CourseVersion"         ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Module"                ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Lesson"                ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Game"                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Achievement"           ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ShopItem"              ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Bundle"                ENABLE ROW LEVEL SECURITY;
ALTER TABLE "BundleCourse"          ENABLE ROW LEVEL SECURITY;
ALTER TABLE "NotificationTemplate"  ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SystemSetting"         ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Enrollment"            ENABLE ROW LEVEL SECURITY;
ALTER TABLE "LessonProgress"        ENABLE ROW LEVEL SECURITY;
ALTER TABLE "UserAchievement"       ENABLE ROW LEVEL SECURITY;
ALTER TABLE "GameScore"             ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Purchase"              ENABLE ROW LEVEL SECURITY;
ALTER TABLE "CoursePurchase"        ENABLE ROW LEVEL SECURITY;
ALTER TABLE "BundlePurchase"        ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Friend"                ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Notification"          ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PushSubscription"      ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ContentReport"         ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Referral"              ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Review"                ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Certificate"           ENABLE ROW LEVEL SECURITY;
ALTER TABLE "WeeklyReward"          ENABLE ROW LEVEL SECURITY;
ALTER TABLE "InstructorApplication" ENABLE ROW LEVEL SECURITY;

-- 4) POLICIES
-- ----------------------------------------------------------------------------

-- 4.1) User: public read (leaderboards, friend lists); self insert/update
DROP POLICY IF EXISTS user_select_all  ON "User";
DROP POLICY IF EXISTS user_insert_self ON "User";
DROP POLICY IF EXISTS user_update_self ON "User";
CREATE POLICY user_select_all  ON "User" FOR SELECT TO authenticated USING (true);
CREATE POLICY user_insert_self ON "User" FOR INSERT TO authenticated WITH CHECK (id = auth.uid()::text);
CREATE POLICY user_update_self ON "User" FOR UPDATE TO authenticated
  USING (id = auth.uid()::text) WITH CHECK (id = auth.uid()::text);

-- 4.2) Course: published read; admin write
DROP POLICY IF EXISTS course_select ON "Course";
DROP POLICY IF EXISTS course_admin  ON "Course";
CREATE POLICY course_select ON "Course" FOR SELECT TO authenticated
  USING ("isPublished" = true OR public.is_admin());
CREATE POLICY course_admin  ON "Course" FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 4.3) CourseVersion: public read; admin write
DROP POLICY IF EXISTS courseversion_select ON "CourseVersion";
DROP POLICY IF EXISTS courseversion_admin  ON "CourseVersion";
CREATE POLICY courseversion_select ON "CourseVersion" FOR SELECT TO authenticated USING (true);
CREATE POLICY courseversion_admin  ON "CourseVersion" FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 4.4) Module: public read; admin write
DROP POLICY IF EXISTS module_select ON "Module";
DROP POLICY IF EXISTS module_admin  ON "Module";
CREATE POLICY module_select ON "Module" FOR SELECT TO authenticated USING (true);
CREATE POLICY module_admin  ON "Module" FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 4.5) Lesson: public read; admin write
DROP POLICY IF EXISTS lesson_select ON "Lesson";
DROP POLICY IF EXISTS lesson_admin  ON "Lesson";
CREATE POLICY lesson_select ON "Lesson" FOR SELECT TO authenticated USING (true);
CREATE POLICY lesson_admin  ON "Lesson" FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 4.6) Game: public read; admin write
DROP POLICY IF EXISTS game_select ON "Game";
DROP POLICY IF EXISTS game_admin  ON "Game";
CREATE POLICY game_select ON "Game" FOR SELECT TO authenticated USING (true);
CREATE POLICY game_admin  ON "Game" FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 4.7) Achievement: public read; admin write
DROP POLICY IF EXISTS achievement_select ON "Achievement";
DROP POLICY IF EXISTS achievement_admin  ON "Achievement";
CREATE POLICY achievement_select ON "Achievement" FOR SELECT TO authenticated USING (true);
CREATE POLICY achievement_admin  ON "Achievement" FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 4.8) ShopItem: public read (no isActive flag in schema); admin write
DROP POLICY IF EXISTS shopitem_select ON "ShopItem";
DROP POLICY IF EXISTS shopitem_admin  ON "ShopItem";
CREATE POLICY shopitem_select ON "ShopItem" FOR SELECT TO authenticated USING (true);
CREATE POLICY shopitem_admin  ON "ShopItem" FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 4.9) Bundle: public read; admin write
DROP POLICY IF EXISTS bundle_select ON "Bundle";
DROP POLICY IF EXISTS bundle_admin  ON "Bundle";
CREATE POLICY bundle_select ON "Bundle" FOR SELECT TO authenticated USING (true);
CREATE POLICY bundle_admin  ON "Bundle" FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 4.10) BundleCourse: public read; admin write
DROP POLICY IF EXISTS bundlecourse_select ON "BundleCourse";
DROP POLICY IF EXISTS bundlecourse_admin  ON "BundleCourse";
CREATE POLICY bundlecourse_select ON "BundleCourse" FOR SELECT TO authenticated USING (true);
CREATE POLICY bundlecourse_admin  ON "BundleCourse" FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 4.11) NotificationTemplate: admin only (system reads via service_role)
DROP POLICY IF EXISTS ntemplate_admin ON "NotificationTemplate";
CREATE POLICY ntemplate_admin ON "NotificationTemplate" FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 4.12) SystemSetting: public read if isPublic; admin write
DROP POLICY IF EXISTS syssetting_select ON "SystemSetting";
DROP POLICY IF EXISTS syssetting_admin  ON "SystemSetting";
CREATE POLICY syssetting_select ON "SystemSetting" FOR SELECT TO authenticated
  USING ("isPublic" = true OR public.is_admin());
CREATE POLICY syssetting_admin  ON "SystemSetting" FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 4.13) Enrollment: own userId
DROP POLICY IF EXISTS enrollment_own ON "Enrollment";
CREATE POLICY enrollment_own ON "Enrollment" FOR ALL TO authenticated
  USING ("userId" = auth.uid()::text) WITH CHECK ("userId" = auth.uid()::text);

-- 4.14) LessonProgress: own userId
DROP POLICY IF EXISTS lessonprogress_own ON "LessonProgress";
CREATE POLICY lessonprogress_own ON "LessonProgress" FOR ALL TO authenticated
  USING ("userId" = auth.uid()::text) WITH CHECK ("userId" = auth.uid()::text);

-- 4.15) UserAchievement: own userId
DROP POLICY IF EXISTS userachievement_own ON "UserAchievement";
CREATE POLICY userachievement_own ON "UserAchievement" FOR ALL TO authenticated
  USING ("userId" = auth.uid()::text) WITH CHECK ("userId" = auth.uid()::text);

-- 4.16) GameScore: public read (leaderboards); own userId write
DROP POLICY IF EXISTS gamescore_select  ON "GameScore";
DROP POLICY IF EXISTS gamescore_insert  ON "GameScore";
DROP POLICY IF EXISTS gamescore_update  ON "GameScore";
CREATE POLICY gamescore_select ON "GameScore" FOR SELECT TO authenticated USING (true);
CREATE POLICY gamescore_insert ON "GameScore" FOR INSERT TO authenticated
  WITH CHECK ("userId" = auth.uid()::text);
CREATE POLICY gamescore_update ON "GameScore" FOR UPDATE TO authenticated
  USING ("userId" = auth.uid()::text) WITH CHECK ("userId" = auth.uid()::text);

-- 4.17) Purchase: own userId
DROP POLICY IF EXISTS purchase_own ON "Purchase";
CREATE POLICY purchase_own ON "Purchase" FOR ALL TO authenticated
  USING ("userId" = auth.uid()::text) WITH CHECK ("userId" = auth.uid()::text);

-- 4.18) CoursePurchase: own userId
DROP POLICY IF EXISTS coursepurchase_own ON "CoursePurchase";
CREATE POLICY coursepurchase_own ON "CoursePurchase" FOR ALL TO authenticated
  USING ("userId" = auth.uid()::text) WITH CHECK ("userId" = auth.uid()::text);

-- 4.19) BundlePurchase: own userId
DROP POLICY IF EXISTS bundlepurchase_own ON "BundlePurchase";
CREATE POLICY bundlepurchase_own ON "BundlePurchase" FOR ALL TO authenticated
  USING ("userId" = auth.uid()::text) WITH CHECK ("userId" = auth.uid()::text);

-- 4.20) Friend: own userId (own friend list)
DROP POLICY IF EXISTS friend_own ON "Friend";
CREATE POLICY friend_own ON "Friend" FOR ALL TO authenticated
  USING ("userId" = auth.uid()::text) WITH CHECK ("userId" = auth.uid()::text);

-- 4.21) Notification: own userId
DROP POLICY IF EXISTS notification_own ON "Notification";
CREATE POLICY notification_own ON "Notification" FOR ALL TO authenticated
  USING ("userId" = auth.uid()::text) WITH CHECK ("userId" = auth.uid()::text);

-- 4.22) PushSubscription: own userId
DROP POLICY IF EXISTS pushsub_own ON "PushSubscription";
CREATE POLICY pushsub_own ON "PushSubscription" FOR ALL TO authenticated
  USING ("userId" = auth.uid()::text) WITH CHECK ("userId" = auth.uid()::text);

-- 4.23) ContentReport: own reporterId
DROP POLICY IF EXISTS contentreport_own ON "ContentReport";
CREATE POLICY contentreport_own ON "ContentReport" FOR ALL TO authenticated
  USING ("reporterId" = auth.uid()::text) WITH CHECK ("reporterId" = auth.uid()::text);

-- 4.24) Referral: own (as referrer or referee); insert only as referrer
DROP POLICY IF EXISTS referral_own ON "Referral";
CREATE POLICY referral_own ON "Referral" FOR ALL TO authenticated
  USING ("referrerId" = auth.uid()::text OR "refereeId" = auth.uid()::text OR public.is_admin())
  WITH CHECK ("referrerId" = auth.uid()::text OR public.is_admin());

-- 4.25) Review: public read; own userId write
DROP POLICY IF EXISTS review_select ON "Review";
DROP POLICY IF EXISTS review_insert ON "Review";
DROP POLICY IF EXISTS review_update ON "Review";
CREATE POLICY review_select ON "Review" FOR SELECT TO authenticated USING (true);
CREATE POLICY review_insert ON "Review" FOR INSERT TO authenticated
  WITH CHECK ("userId" = auth.uid()::text);
CREATE POLICY review_update ON "Review" FOR UPDATE TO authenticated
  USING ("userId" = auth.uid()::text) WITH CHECK ("userId" = auth.uid()::text);

-- 4.26) Certificate: public read (shareable); own userId write
DROP POLICY IF EXISTS certificate_select ON "Certificate";
DROP POLICY IF EXISTS certificate_insert ON "Certificate";
DROP POLICY IF EXISTS certificate_update ON "Certificate";
CREATE POLICY certificate_select ON "Certificate" FOR SELECT TO authenticated USING (true);
CREATE POLICY certificate_insert ON "Certificate" FOR INSERT TO authenticated
  WITH CHECK ("userId" = auth.uid()::text);
CREATE POLICY certificate_update ON "Certificate" FOR UPDATE TO authenticated
  USING ("userId" = auth.uid()::text) WITH CHECK ("userId" = auth.uid()::text);

-- 4.27) WeeklyReward: own userId
DROP POLICY IF EXISTS weeklyreward_own ON "WeeklyReward";
CREATE POLICY weeklyreward_own ON "WeeklyReward" FOR ALL TO authenticated
  USING ("userId" = auth.uid()::text) WITH CHECK ("userId" = auth.uid()::text);

-- 4.28) InstructorApplication: own userId; admin can read all
DROP POLICY IF EXISTS instructorapp_own ON "InstructorApplication";
CREATE POLICY instructorapp_own ON "InstructorApplication" FOR ALL TO authenticated
  USING ("userId" = auth.uid()::text OR public.is_admin())
  WITH CHECK ("userId" = auth.uid()::text);
