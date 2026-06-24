"""
accounts/models.py

Custom user model supporting the four roles defined in the spec:
Student, Teacher, Subject Coordinator, Administrator.

We extend Django's AbstractUser rather than building auth from scratch,
since Django Authentication (login, password hashing, sessions/tokens)
is already part of the chosen tech stack.
"""
from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """
    Custom user model. Email is used as the unique login identifier
    in addition to username, since schools often manage accounts by email.
    """

    class Role(models.TextChoices):
        STUDENT = "STUDENT", "Student"
        TEACHER = "TEACHER", "Teacher"
        COORDINATOR = "COORDINATOR", "Subject Coordinator"
        ADMIN = "ADMIN", "Administrator"

    role = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.STUDENT,
        help_text="Determines what the user can do in the library (see permissions.py).",
    )

    # Optional structured fields useful for a school context.
    education_level = models.CharField(
        max_length=50,
        blank=True,
        help_text="E.g. 'Primary', 'O-Level', 'A-Level'. Mainly relevant for students.",
    )
    school_class = models.CharField(
        max_length=50,
        blank=True,
        help_text="E.g. 'P7', 'S3'. Mainly relevant for students.",
    )
    preferred_language = models.CharField(
        max_length=30,
        default="English",
        help_text="Used to default Local Language Support / accessibility features.",
    )
    phone_number = models.CharField(max_length=20, blank=True)

    # Accessibility preferences (lightweight flags; richer settings can live
    # in a separate profile table later if needed).
    needs_screen_reader = models.BooleanField(default=False)
    needs_high_contrast = models.BooleanField(default=False)
    needs_captions = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.get_full_name() or self.username} ({self.get_role_display()})"

    @property
    def is_student(self):
        return self.role == self.Role.STUDENT

    @property
    def is_teacher(self):
        return self.role == self.Role.TEACHER

    @property
    def is_coordinator(self):
        return self.role == self.Role.COORDINATOR

    @property
    def is_admin_role(self):
        # Named is_admin_role to avoid clashing with Django's is_staff/is_superuser
        return self.role == self.Role.ADMIN
