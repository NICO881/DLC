"""
library/admin.py
"""
from django.contrib import admin

from .models import (
    AuditLog,
    Bookmark,
    Competency,
    Download,
    EducationLevel,
    LearningOutcome,
    Notification,
    ProgressRecord,
    Rating,
    Resource,
    ResourceShare,
    ResourceVersion,
    SchoolClass,
    Subject,
    SubjectOffering,
    Subtopic,
    Topic,
)


@admin.register(EducationLevel)
class EducationLevelAdmin(admin.ModelAdmin):
    list_display = ["name", "order"]


@admin.register(SchoolClass)
class SchoolClassAdmin(admin.ModelAdmin):
    list_display = ["name", "education_level", "order"]
    list_filter = ["education_level"]


@admin.register(Subject)
class SubjectAdmin(admin.ModelAdmin):
    list_display = ["name", "coordinator"]
    search_fields = ["name"]


@admin.register(SubjectOffering)
class SubjectOfferingAdmin(admin.ModelAdmin):
    list_display = ["subject", "school_class"]
    list_filter = ["school_class"]


@admin.register(Topic)
class TopicAdmin(admin.ModelAdmin):
    list_display = ["name", "subject_offering", "order"]


@admin.register(Subtopic)
class SubtopicAdmin(admin.ModelAdmin):
    list_display = ["name", "topic", "order"]


@admin.register(LearningOutcome)
class LearningOutcomeAdmin(admin.ModelAdmin):
    list_display = ["code", "subtopic"]
    search_fields = ["statement", "code"]


@admin.register(Competency)
class CompetencyAdmin(admin.ModelAdmin):
    list_display = ["name"]
    filter_horizontal = ["learning_outcomes"]


@admin.register(Resource)
class ResourceAdmin(admin.ModelAdmin):
    list_display = [
        "title",
        "resource_type",
        "status",
        "language",
        "uploaded_by",
        "created_at",
        "is_deleted",
    ]
    list_filter = ["status", "resource_type", "language", "is_deleted"]
    search_fields = ["title", "description", "keywords", "author"]
    filter_horizontal = ["learning_outcomes", "competencies"]
    readonly_fields = ["file_size_bytes", "created_at", "updated_at"]


@admin.register(ResourceVersion)
class ResourceVersionAdmin(admin.ModelAdmin):
    list_display = ["resource", "version_number", "uploaded_by", "created_at"]


@admin.register(Bookmark)
class BookmarkAdmin(admin.ModelAdmin):
    list_display = ["user", "resource", "collection_name", "created_at"]


@admin.register(ProgressRecord)
class ProgressRecordAdmin(admin.ModelAdmin):
    list_display = ["user", "resource", "progress_percent", "is_completed", "last_viewed_at"]
    list_filter = ["is_completed"]


@admin.register(Rating)
class RatingAdmin(admin.ModelAdmin):
    list_display = ["user", "resource", "score", "created_at"]


@admin.register(Download)
class DownloadAdmin(admin.ModelAdmin):
    list_display = ["user", "resource", "status", "started_at"]
    list_filter = ["status"]


@admin.register(ResourceShare)
class ResourceShareAdmin(admin.ModelAdmin):
    list_display = ["resource", "shared_by", "target_type", "created_at"]
    list_filter = ["target_type"]


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ["title", "user", "notification_type", "is_read", "created_at"]
    list_filter = ["notification_type", "is_read"]


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ["created_at", "user", "action", "resource"]
    list_filter = ["action"]
    readonly_fields = [f.name for f in AuditLog._meta.fields]

    def has_add_permission(self, request):
        return False  # Audit logs are append-only, created by app code only.

    def has_change_permission(self, request, obj=None):
        return False
