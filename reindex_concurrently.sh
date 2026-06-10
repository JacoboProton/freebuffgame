#!/usr/bin/env bash
# ============================================================================
# Reindex all 78 public-schema indexes with REINDEX INDEX CONCURRENTLY
# (no exclusive lock). Drops the orphan User_pkey_ccnew first.
# Runs up to 10 reindexes in parallel batches.
# ============================================================================
set +e

echo "==> Step 1: drop orphan _ccnew index (leftover from a previous concurrent reindex)"
npx @insforge/cli db query 'DROP INDEX CONCURRENTLY IF EXISTS "User_pkey_ccnew";' 2>&1
echo ""

# 78 real indexes (User_pkey_ccnew excluded)
INDEXES=(
  "Achievement_key_key"
  "Achievement_pkey"
  "Bundle_pkey"
  "BundleCourse_bundleId_courseId_key"
  "BundleCourse_courseId_idx"
  "BundleCourse_pkey"
  "BundlePurchase_bundleId_idx"
  "BundlePurchase_pkey"
  "BundlePurchase_userId_bundleId_key"
  "Certificate_certificateNumber_key"
  "Certificate_courseId_idx"
  "Certificate_pkey"
  "Certificate_userId_courseId_key"
  "Certificate_userId_idx"
  "Certificate_verificationCode_key"
  "ContentReport_pkey"
  "ContentReport_reporterId_idx"
  "Course_pkey"
  "CoursePurchase_courseId_idx"
  "CoursePurchase_pkey"
  "CoursePurchase_userId_courseId_key"
  "CourseVersion_courseId_idx"
  "CourseVersion_createdById_idx"
  "CourseVersion_pkey"
  "Enrollment_courseId_idx"
  "Enrollment_pkey"
  "Enrollment_userId_courseId_key"
  "Friend_friendId_idx"
  "Friend_pkey"
  "Friend_userId_friendId_key"
  "Game_key_key"
  "Game_pkey"
  "GameScore_gameId_idx"
  "GameScore_pkey"
  "GameScore_userId_gameId_key"
  "InstructorApplication_pkey"
  "InstructorApplication_userId_key"
  "Lesson_moduleId_idx"
  "Lesson_pkey"
  "LessonProgress_lessonId_idx"
  "LessonProgress_pkey"
  "LessonProgress_userId_lessonId_key"
  "Module_courseId_idx"
  "Module_pkey"
  "Notification_pkey"
  "Notification_userId_idx"
  "NotificationTemplate_key_key"
  "NotificationTemplate_pkey"
  "Purchase_itemId_idx"
  "Purchase_pkey"
  "Purchase_userId_itemId_key"
  "PushSubscription_endpoint_key"
  "PushSubscription_pkey"
  "PushSubscription_userId_idx"
  "Referral_code_idx"
  "Referral_code_key"
  "Referral_pkey"
  "Referral_refereeId_idx"
  "Referral_referrerId_idx"
  "Review_courseId_idx"
  "Review_pkey"
  "Review_userId_courseId_key"
  "Review_userId_idx"
  "ShopItem_key_key"
  "ShopItem_pkey"
  "SystemSetting_key_key"
  "SystemSetting_pkey"
  "User_email_key"
  "User_googleId_key"
  "User_pkey"
  "User_referralCode_key"
  "UserAchievement_achievementId_idx"
  "UserAchievement_pkey"
  "UserAchievement_userId_achievementId_key"
  "WeeklyReward_pkey"
  "WeeklyReward_userId_idx"
  "WeeklyReward_weekStart_rank_idx"
  "WeeklyReward_weekStart_userId_key"
)

mkdir -p /tmp/reindex_logs
rm -f /tmp/reindex_logs/*.log
rm -f /tmp/reindex_ok.txt /tmp/reindex_fail.txt
> /tmp/reindex_ok.txt
> /tmp/reindex_fail.txt

echo "==> Step 2: reindex 78 indexes in parallel batches of 10"
SECONDS=0
for idx in "${INDEXES[@]}"; do
  (
    if npx @insforge/cli db query "REINDEX INDEX CONCURRENTLY \"$idx\";" >/tmp/reindex_logs/"$idx".log 2>&1; then
      echo "$idx" >> /tmp/reindex_ok.txt
    else
      echo "$idx" >> /tmp/reindex_fail.txt
    fi
  ) &
  # throttle to 10 concurrent
  while [ "$(jobs -rp | wc -l)" -ge 10 ]; do
    wait -n
  done
done
wait

ELAPSED=$SECONDS
OK=$(wc -l < /tmp/reindex_ok.txt)
FAIL=$(wc -l < /tmp/reindex_fail.txt)

echo ""
echo "==> Step 3: summary (elapsed ${ELAPSED}s)"
echo "OK:   $OK / 78"
echo "FAIL: $FAIL / 78"
echo ""
if [ "$FAIL" -gt 0 ]; then
  echo "Failed indexes:"
  cat /tmp/reindex_fail.txt
  echo ""
  echo "Per-index failure logs (first 10):"
  for idx in $(cat /tmp/reindex_fail.txt | head -10); do
    echo "--- $idx ---"
    cat /tmp/reindex_logs/"$idx".log
  done
fi
