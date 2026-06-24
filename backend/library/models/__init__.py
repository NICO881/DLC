"""
library/models/__init__.py

Models are split across multiple files for readability (this app has ~15
models), but Django needs them all importable from `library.models` as if
they were one module. This file re-exports everything.
"""
from .curriculum import (
    Competency,
    EducationLevel,
    LearningOutcome,
    SchoolClass,
    Subject,
    SubjectOffering,
    Subtopic,
    Topic,
)
from .interactions import Bookmark, Download, ProgressRecord, Rating, ResourceShare
from .resource import Resource, ResourceVersion
from .system import AuditLog, Notification, ResourceViewEvent

__all__ = [
    "EducationLevel",
    "SchoolClass",
    "Subject",
    "SubjectOffering",
    "Topic",
    "Subtopic",
    "LearningOutcome",
    "Competency",
    "Resource",
    "ResourceVersion",
    "Bookmark",
    "ProgressRecord",
    "Rating",
    "Download",
    "ResourceShare",
    "Notification",
    "AuditLog",
    "ResourceViewEvent",
]
