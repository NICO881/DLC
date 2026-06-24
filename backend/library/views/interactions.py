"""
library/views/interactions.py
"""
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from accounts.permissions import IsTeacherOrAbove
from library.models import AuditLog, Bookmark, Download, ProgressRecord, Rating, ResourceShare
from library.serializers import (
    BookmarkSerializer,
    DownloadSerializer,
    ProgressRecordSerializer,
    RatingSerializer,
    ResourceShareSerializer,
)


class BookmarkViewSet(viewsets.ModelViewSet):
    """Bookmark and Favorites — each user only ever sees/manages their own."""

    serializer_class = BookmarkSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ["collection_name", "resource"]

    def get_queryset(self):
        return Bookmark.objects.filter(user=self.request.user).select_related("resource")


class ProgressRecordViewSet(viewsets.ModelViewSet):
    """
    Progress Tracking. Students update their own progress as they read/
    watch; Teachers/Coordinators/Admins can view (but not edit) progress
    for analytics purposes via a separate filter on `user`.
    """

    serializer_class = ProgressRecordSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ["resource", "is_completed"]

    def get_queryset(self):
        user = self.request.user
        if user.is_admin_role or user.is_coordinator or user.is_teacher:
            # Allow filtering by ?user=<id> for dashboards; default to own records.
            target_user_id = self.request.query_params.get("user")
            if target_user_id:
                return ProgressRecord.objects.filter(user_id=target_user_id).select_related(
                    "resource"
                )
        return ProgressRecord.objects.filter(user=user).select_related("resource")

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class RatingViewSet(viewsets.ModelViewSet):
    serializer_class = RatingSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ["resource"]

    def get_queryset(self):
        return Rating.objects.select_related("user", "resource").all()


class DownloadViewSet(viewsets.ModelViewSet):
    """
    Download Manager — supports resuming interrupted downloads by letting
    the client PATCH `bytes_downloaded`/`status` on an existing record.
    """

    serializer_class = DownloadSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ["status", "resource"]
    http_method_names = ["get", "post", "patch", "head", "options"]

    def get_queryset(self):
        user = self.request.user
        if user.is_admin_role:
            return Download.objects.select_related("resource", "user").all()
        return Download.objects.filter(user=user).select_related("resource")


class ResourceShareViewSet(viewsets.ModelViewSet):
    """Resource Sharing — Teachers share with Classes, Schools, or individuals."""

    serializer_class = ResourceShareSerializer
    permission_classes = [IsAuthenticated, IsTeacherOrAbove]
    filterset_fields = ["resource", "target_type", "target_class"]

    def get_queryset(self):
        user = self.request.user
        from django.db.models import Q

        if user.is_admin_role or user.is_coordinator:
            return ResourceShare.objects.select_related("resource", "shared_by").all()
        # Teachers see shares they made; everyone can see shares targeted
        # directly at them as an individual.
        return ResourceShare.objects.filter(
            Q(shared_by=user) | Q(target_user=user)
        ).select_related("resource", "shared_by")

    def perform_create(self, serializer):
        instance = serializer.save()
        AuditLog.objects.create(
            user=self.request.user,
            action=AuditLog.ActionType.SHARE,
            resource=instance.resource,
            description=f"Shared '{instance.resource.title}' ({instance.target_type})",
        )
