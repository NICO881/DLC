"""
library/models/system.py

Cross-cutting system features: Notifications, Audit Logs, Usage Analytics.
These support the system as a whole rather than any one resource.
"""
from django.conf import settings
from django.db import models

from .resource import Resource


class Notification(models.Model):
    """Alerts users about: New resources, Updates, Recommendations."""

    class NotificationType(models.TextChoices):
        NEW_RESOURCE = "NEW_RESOURCE", "New Resource"
        UPDATE = "UPDATE", "Update"
        RECOMMENDATION = "RECOMMENDATION", "Recommendation"
        REVIEW_REQUEST = "REVIEW_REQUEST", "Review Request"
        SHARE = "SHARE", "Resource Shared"
        SYSTEM = "SYSTEM", "System Notice"

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="notifications"
    )
    notification_type = models.CharField(max_length=30, choices=NotificationType.choices)
    title = models.CharField(max_length=200)
    message = models.TextField(blank=True)
    related_resource = models.ForeignKey(
        Resource, on_delete=models.SET_NULL, null=True, blank=True
    )
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [models.Index(fields=["user", "is_read"])]

    def __str__(self):
        return f"{self.title} -> {self.user}"


class AuditLog(models.Model):
    """
    Records: Uploads, Updates, Deletions, User activities.
    Append-only by convention (we never edit/delete rows from app code).
    """

    class ActionType(models.TextChoices):
        UPLOAD = "UPLOAD", "Upload"
        UPDATE = "UPDATE", "Update"
        DELETE = "DELETE", "Delete"
        RESTORE = "RESTORE", "Restore"
        ARCHIVE = "ARCHIVE", "Archive"
        PUBLISH = "PUBLISH", "Publish"
        APPROVE = "APPROVE", "Approve"
        REJECT = "REJECT", "Reject"
        LOGIN = "LOGIN", "Login"
        LOGOUT = "LOGOUT", "Logout"
        DOWNLOAD = "DOWNLOAD", "Download"
        SHARE = "SHARE", "Share"
        OTHER = "OTHER", "Other"

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="audit_logs",
    )
    action = models.CharField(max_length=20, choices=ActionType.choices)
    resource = models.ForeignKey(
        Resource, on_delete=models.SET_NULL, null=True, blank=True, related_name="audit_logs"
    )
    description = models.CharField(max_length=500, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["action"]),
            models.Index(fields=["created_at"]),
        ]

    def __str__(self):
        return f"[{self.created_at:%Y-%m-%d %H:%M}] {self.user} {self.action} {self.resource or ''}"


class ResourceViewEvent(models.Model):
    """
    Lightweight event log feeding Usage Analytics (most viewed resources,
    popular subjects) without overloading ProgressRecord, which is one-row-
    per-user-per-resource. Each view creates a new event row here.
    """

    resource = models.ForeignKey(Resource, on_delete=models.CASCADE, related_name="view_events")
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [models.Index(fields=["resource", "created_at"])]
