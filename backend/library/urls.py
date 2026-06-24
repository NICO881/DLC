"""
library/urls.py
"""
from rest_framework.routers import DefaultRouter

from django.urls import path

from .views import (
    AuditLogViewSet,
    BookmarkViewSet,
    CompetencyViewSet,
    DownloadViewSet,
    EducationLevelViewSet,
    LearningOutcomeViewSet,
    NotificationViewSet,
    ProgressRecordViewSet,
    RatingViewSet,
    ResourceShareViewSet,
    ResourceViewSet,
    SchoolClassViewSet,
    StorageMonitoringView,
    SubjectOfferingViewSet,
    SubjectViewSet,
    SubtopicViewSet,
    TopicViewSet,
    UsageAnalyticsView,
)

router = DefaultRouter()
router.register("education-levels", EducationLevelViewSet, basename="education-level")
router.register("classes", SchoolClassViewSet, basename="school-class")
router.register("subjects", SubjectViewSet, basename="subject")
router.register("subject-offerings", SubjectOfferingViewSet, basename="subject-offering")
router.register("topics", TopicViewSet, basename="topic")
router.register("subtopics", SubtopicViewSet, basename="subtopic")
router.register("learning-outcomes", LearningOutcomeViewSet, basename="learning-outcome")
router.register("competencies", CompetencyViewSet, basename="competency")
router.register("resources", ResourceViewSet, basename="resource")
router.register("bookmarks", BookmarkViewSet, basename="bookmark")
router.register("progress", ProgressRecordViewSet, basename="progress")
router.register("ratings", RatingViewSet, basename="rating")
router.register("downloads", DownloadViewSet, basename="download")
router.register("shares", ResourceShareViewSet, basename="share")
router.register("notifications", NotificationViewSet, basename="notification")
router.register("audit-logs", AuditLogViewSet, basename="audit-log")

urlpatterns = [
    path("analytics/usage/", UsageAnalyticsView.as_view(), name="usage-analytics"),
    path("analytics/storage/", StorageMonitoringView.as_view(), name="storage-monitoring"),
] + router.urls
