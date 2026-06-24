"""
library/models/resource.py

The Resource model is the heart of the Digital Library: it represents a
single piece of content (a PDF, video, audio file, image, etc.) along with
all the metadata, lifecycle state, and curriculum links described in the spec.

Design notes:
- We store the uploaded file via Django's FileField, pointed at the Local
  File System storage for the MVP (spec section 6: "Local File System ->
  School server"). Swapping to MinIO later is a matter of changing
  DEFAULT_FILE_STORAGE in settings, not touching this model.
- Multiple Resource Types are supported via a `resource_type` choice field
  plus a generic `file` field; type-specific players (PDF.js, HTML5
  video/audio) are a frontend concern driven by this field.
- Resource Lifecycle (Draft -> Pending Review -> Published -> Inactive ->
  Archived) is modeled as an explicit state machine with timestamps, so
  Subject Coordinators have something concrete to "review/approve".
"""
import os
import uuid

from django.conf import settings
from django.db import models
from django.utils import timezone

from .curriculum import Competency, LearningOutcome, Subtopic, Topic


def resource_upload_path(instance, filename):
    """
    Organizes uploaded files on disk by resource type and year, e.g.:
        documents/2026/<uuid>_original-name.pdf
    Keeps the Local File System storage tidy and predictable for backups.
    """
    ext = filename.split(".")[-1].lower() if "." in filename else ""
    folder = {
        "PDF": "documents",
        "DOCX": "documents",
        "PPTX": "documents",
        "XLSX": "documents",
        "VIDEO": "videos",
        "AUDIO": "audio",
        "IMAGE": "images",
        "PAST_PAPER": "past_papers",
        "OTHER": "misc",
    }.get(instance.resource_type, "misc")
    unique_name = f"{uuid.uuid4().hex}_{filename}"
    year = instance.created_at.year if instance.created_at else timezone.now().year
    return os.path.join(folder, str(year), unique_name)


class Resource(models.Model):
    class ResourceType(models.TextChoices):
        PDF = "PDF", "PDF Document"
        DOCX = "DOCX", "Word Document"
        PPTX = "PPTX", "Presentation"
        XLSX = "XLSX", "Spreadsheet"
        VIDEO = "VIDEO", "Video"
        AUDIO = "AUDIO", "Audio Lesson"
        IMAGE = "IMAGE", "Image / Diagram"
        PAST_PAPER = "PAST_PAPER", "Past Paper"
        SIMULATION = "SIMULATION", "Simulation"
        QUIZ = "QUIZ", "Quiz"
        OTHER = "OTHER", "Other"

    class Status(models.TextChoices):
        """Resource Lifecycle from the spec."""
        DRAFT = "DRAFT", "Draft"
        PENDING_REVIEW = "PENDING_REVIEW", "Pending Review"
        PUBLISHED = "PUBLISHED", "Published"
        INACTIVE = "INACTIVE", "Inactive"
        ARCHIVED = "ARCHIVED", "Archived"

    class DifficultyLevel(models.TextChoices):
        BEGINNER = "BEGINNER", "Beginner"
        INTERMEDIATE = "INTERMEDIATE", "Intermediate"
        ADVANCED = "ADVANCED", "Advanced"

    class Language(models.TextChoices):
        ENGLISH = "ENGLISH", "English"
        LUGANDA = "LUGANDA", "Luganda"
        KISWAHILI = "KISWAHILI", "Kiswahili"
        ATESO = "ATESO", "Ateso"
        RUNYANKOLE = "RUNYANKOLE", "Runyankole"

    # --- Metadata and Tagging (spec section: Metadata and Tagging) ---
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    author = models.CharField(max_length=150, blank=True)
    keywords = models.CharField(
        max_length=500,
        blank=True,
        help_text="Comma-separated keywords/tags, used by Smart Search.",
    )
    language = models.CharField(
        max_length=20, choices=Language.choices, default=Language.ENGLISH
    )
    difficulty_level = models.CharField(
        max_length=20, choices=DifficultyLevel.choices, blank=True
    )
    curriculum_reference = models.CharField(
        max_length=100,
        blank=True,
        help_text="Free-text curriculum code, in addition to structured links below.",
    )

    # --- Curriculum-Based Organization links ---
    topic = models.ForeignKey(
        Topic, on_delete=models.SET_NULL, null=True, blank=True, related_name="resources"
    )
    subtopic = models.ForeignKey(
        Subtopic, on_delete=models.SET_NULL, null=True, blank=True, related_name="resources"
    )

    # --- Competency Mapping ---
    learning_outcomes = models.ManyToManyField(
        LearningOutcome, related_name="resources", blank=True
    )
    competencies = models.ManyToManyField(
        Competency, related_name="resources", blank=True
    )

    # --- File / type info ---
    resource_type = models.CharField(max_length=20, choices=ResourceType.choices)
    file = models.FileField(upload_to=resource_upload_path, max_length=500)
    file_size_bytes = models.BigIntegerField(default=0, editable=False)
    thumbnail = models.ImageField(
        upload_to="thumbnails/%Y/", blank=True, null=True
    )
    duration_seconds = models.PositiveIntegerField(
        null=True, blank=True, help_text="For video/audio resources."
    )

    # --- Lifecycle ---
    status = models.CharField(
        max_length=20, choices=Status.choices, default=Status.DRAFT
    )
    submitted_for_review_at = models.DateTimeField(null=True, blank=True)
    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="reviewed_resources",
    )
    reviewed_at = models.DateTimeField(null=True, blank=True)
    review_notes = models.TextField(blank=True)
    published_at = models.DateTimeField(null=True, blank=True)
    archived_at = models.DateTimeField(null=True, blank=True)

    # --- Ownership / academic year ---
    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="uploaded_resources",
    )
    academic_year = models.PositiveIntegerField(null=True, blank=True)
    term = models.CharField(
        max_length=10,
        blank=True,
        choices=[("TERM_1", "Term I"), ("TERM_2", "Term II"), ("TERM_3", "Term III")],
    )

    # --- Accessibility ---
    has_text_to_speech = models.BooleanField(default=False)
    has_closed_captions = models.BooleanField(default=False)
    is_high_contrast_available = models.BooleanField(default=False)

    # --- Soft delete (so File Management "Delete" can be undone via Backup/Recovery) ---
    is_deleted = models.BooleanField(default=False)
    deleted_at = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["status"]),
            models.Index(fields=["resource_type"]),
            models.Index(fields=["language"]),
            models.Index(fields=["is_deleted"]),
        ]

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        if self.file and hasattr(self.file, "size"):
            try:
                self.file_size_bytes = self.file.size
            except (FileNotFoundError, ValueError):
                pass
        super().save(*args, **kwargs)

    @property
    def keyword_list(self):
        return [k.strip() for k in self.keywords.split(",") if k.strip()]


class ResourceVersion(models.Model):
    """
    Version control (Phase 2 feature, modeled now so migrations don't need
    reshuffling later). Keeps prior files when a Resource is re-uploaded/edited.
    """

    resource = models.ForeignKey(
        Resource, on_delete=models.CASCADE, related_name="versions"
    )
    file = models.FileField(upload_to="versions/%Y/", max_length=500)
    version_number = models.PositiveIntegerField()
    change_notes = models.TextField(blank=True)
    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-version_number"]
        unique_together = ["resource", "version_number"]

    def __str__(self):
        return f"{self.resource.title} v{self.version_number}"
