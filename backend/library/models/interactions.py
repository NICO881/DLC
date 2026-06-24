"""
library/models/interactions.py

Models for student/teacher interactions with resources:
Bookmarks, Progress Tracking, Ratings, Downloads, Resource Sharing.
"""
from django.conf import settings
from django.db import models

from .resource import Resource


class Bookmark(models.Model):
    """Bookmark and Favorites — students save resources / organize revision materials."""

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="bookmarks"
    )
    resource = models.ForeignKey(
        Resource, on_delete=models.CASCADE, related_name="bookmarked_by"
    )
    collection_name = models.CharField(
        max_length=100,
        blank=True,
        default="My Bookmarks",
        help_text="Lets students organize bookmarks into named revision sets.",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ["user", "resource", "collection_name"]
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.user} -> {self.resource} ({self.collection_name})"


class ProgressRecord(models.Model):
    """
    Progress Tracking: reading history, watch history, last page/position viewed.
    One row per (user, resource); updated as the learner interacts with it.
    """

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="progress_records"
    )
    resource = models.ForeignKey(
        Resource, on_delete=models.CASCADE, related_name="progress_records"
    )
    last_page_viewed = models.PositiveIntegerField(
        null=True, blank=True, help_text="For PDF/document resources."
    )
    last_position_seconds = models.PositiveIntegerField(
        null=True, blank=True, help_text="Playback position for video/audio resources."
    )
    progress_percent = models.PositiveSmallIntegerField(default=0)
    is_completed = models.BooleanField(default=False)
    first_viewed_at = models.DateTimeField(auto_now_add=True)
    last_viewed_at = models.DateTimeField(auto_now=True)
    total_view_count = models.PositiveIntegerField(default=0)

    class Meta:
        unique_together = ["user", "resource"]
        ordering = ["-last_viewed_at"]

    def __str__(self):
        return f"{self.user} progress on {self.resource} ({self.progress_percent}%)"


class Rating(models.Model):
    """Phase 2: Ratings."""

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="ratings"
    )
    resource = models.ForeignKey(Resource, on_delete=models.CASCADE, related_name="ratings")
    score = models.PositiveSmallIntegerField(help_text="1-5 stars.")
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ["user", "resource"]

    def __str__(self):
        return f"{self.user} rated {self.resource}: {self.score}/5"


class Download(models.Model):
    """
    Download Manager: tracks offline downloads (and supports resuming via
    `bytes_downloaded`), and feeds Usage Analytics ('Most downloaded resources').
    """

    class DownloadStatus(models.TextChoices):
        IN_PROGRESS = "IN_PROGRESS", "In Progress"
        COMPLETED = "COMPLETED", "Completed"
        FAILED = "FAILED", "Failed"
        PAUSED = "PAUSED", "Paused"

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="downloads"
    )
    resource = models.ForeignKey(Resource, on_delete=models.CASCADE, related_name="downloads")
    status = models.CharField(
        max_length=20, choices=DownloadStatus.choices, default=DownloadStatus.IN_PROGRESS
    )
    bytes_downloaded = models.BigIntegerField(default=0)
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-started_at"]

    def __str__(self):
        return f"{self.user} downloading {self.resource} ({self.status})"


class ResourceShare(models.Model):
    """
    Resource Sharing: Teachers can share resources with Classes, Schools,
    or individual learners. We model the share target generically via three
    optional FKs/fields rather than a generic FK, to keep querying simple.
    """

    class TargetType(models.TextChoices):
        CLASS = "CLASS", "Class"
        SCHOOL = "SCHOOL", "Whole School"
        INDIVIDUAL = "INDIVIDUAL", "Individual Learner"

    resource = models.ForeignKey(Resource, on_delete=models.CASCADE, related_name="shares")
    shared_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="shares_made"
    )
    target_type = models.CharField(max_length=20, choices=TargetType.choices)
    target_class = models.ForeignKey(
        "library.SchoolClass",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="resource_shares",
    )
    target_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="shares_received",
    )
    note = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.resource} shared by {self.shared_by} ({self.target_type})"
