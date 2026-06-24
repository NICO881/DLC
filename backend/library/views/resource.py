"""
library/views/resource.py

The central ViewSet for the Resource Repository. Covers Phase 1
(Upload, View, Search, Download) plus the lifecycle/sharing/versioning
hooks needed by later phases, all gated through the role permission matrix.
"""
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from accounts.permissions import IsOwnerOrCoordinatorOrAdmin, IsTeacherOrAbove
from library.filters import ResourceFilter
from library.models import AuditLog, Download, Resource, ResourceVersion, ResourceViewEvent
from library.serializers import (
    DownloadSerializer,
    ResourceCreateUpdateSerializer,
    ResourceDetailSerializer,
    ResourceListSerializer,
    ResourceStatusChangeSerializer,
    ResourceVersionSerializer,
)

# Resource Lifecycle: Draft -> Pending Review -> Published -> Inactive -> Archived
# Maps current status -> set of statuses it may move to next, and which
# role is allowed to perform that specific transition.
ALLOWED_TRANSITIONS = {
    Resource.Status.DRAFT: {
        Resource.Status.PENDING_REVIEW: ("TEACHER", "COORDINATOR", "ADMIN"),
        Resource.Status.ARCHIVED: ("COORDINATOR", "ADMIN"),
    },
    Resource.Status.PENDING_REVIEW: {
        Resource.Status.PUBLISHED: ("COORDINATOR", "ADMIN"),
        Resource.Status.DRAFT: ("COORDINATOR", "ADMIN", "TEACHER"),  # sent back for changes
    },
    Resource.Status.PUBLISHED: {
        Resource.Status.INACTIVE: ("TEACHER", "COORDINATOR", "ADMIN"),
        Resource.Status.ARCHIVED: ("COORDINATOR", "ADMIN"),
    },
    Resource.Status.INACTIVE: {
        Resource.Status.PUBLISHED: ("COORDINATOR", "ADMIN"),
        Resource.Status.ARCHIVED: ("COORDINATOR", "ADMIN"),
    },
    Resource.Status.ARCHIVED: {
        Resource.Status.DRAFT: ("ADMIN",),  # restore from archive
    },
}


class ResourceViewSet(viewsets.ModelViewSet):
    """
    /api/resources/

    list/retrieve  -> View + Smart Search (any authenticated user; students
                      only ever see PUBLISHED resources, enforced in
                      get_queryset).
    create         -> Upload (Teacher/Coordinator/Admin only).
    update/partial -> Edit (owner Teacher, or Coordinator/Admin).
    destroy        -> Delete (soft delete; owner or Coordinator/Admin).
    """

    filterset_class = ResourceFilter
    search_fields = ["title", "description", "keywords", "author"]
    ordering_fields = ["created_at", "title", "updated_at"]

    def get_serializer_class(self):
        if self.action == "list":
            return ResourceListSerializer
        if self.action in ["create", "update", "partial_update"]:
            return ResourceCreateUpdateSerializer
        return ResourceDetailSerializer

    def create(self, request, *args, **kwargs):
        """Validate with the create serializer but respond with full detail fields."""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        instance = serializer.instance
        detail = ResourceDetailSerializer(instance, context=self.get_serializer_context())
        headers = self.get_success_headers(detail.data)
        return Response(detail.data, status=status.HTTP_201_CREATED, headers=headers)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop("partial", False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        detail = ResourceDetailSerializer(serializer.instance, context=self.get_serializer_context())
        return Response(detail.data)

    def get_permissions(self):
        if self.action in ["create"]:
            return [IsAuthenticated(), IsTeacherOrAbove()]
        if self.action in ["update", "partial_update", "destroy"]:
            return [IsAuthenticated(), IsOwnerOrCoordinatorOrAdmin()]
        return [IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        qs = (
            Resource.objects.filter(is_deleted=False)
            .select_related(
                "topic__subject_offering__subject",
                "subtopic",
                "uploaded_by",
                "reviewed_by",
            )
            .prefetch_related("ratings")
        )
        # Students (and any non-staff role) only ever see Published content.
        # Teachers see their own resources at any stage plus all Published.
        # Coordinators/Admins see everything.
        if user.is_admin_role or user.is_coordinator:
            return qs
        if user.is_teacher:
            from django.db.models import Q

            return qs.filter(Q(status=Resource.Status.PUBLISHED) | Q(uploaded_by=user))
        return qs.filter(status=Resource.Status.PUBLISHED)

    def perform_destroy(self, instance):
        # Soft delete so Backup and Recovery can "Restore deleted files".
        instance.is_deleted = True
        instance.deleted_at = timezone.now()
        instance.save(update_fields=["is_deleted", "deleted_at"])
        AuditLog.objects.create(
            user=self.request.user,
            action=AuditLog.ActionType.DELETE,
            resource=instance,
            description=f"Soft-deleted '{instance.title}'",
        )

    def perform_create(self, serializer):
        instance = serializer.save()
        AuditLog.objects.create(
            user=self.request.user,
            action=AuditLog.ActionType.UPLOAD,
            resource=instance,
            description=f"Uploaded '{instance.title}'",
        )

    def perform_update(self, serializer):
        instance = serializer.save()
        AuditLog.objects.create(
            user=self.request.user,
            action=AuditLog.ActionType.UPDATE,
            resource=instance,
            description=f"Updated '{instance.title}'",
        )

    def retrieve(self, request, *args, **kwargs):
        response = super().retrieve(request, *args, **kwargs)
        # Log a view event for Usage Analytics + bump ProgressRecord view count.
        instance = self.get_object()
        ResourceViewEvent.objects.create(resource=instance, user=request.user)
        from library.models import ProgressRecord

        progress, _ = ProgressRecord.objects.get_or_create(
            user=request.user, resource=instance
        )
        progress.total_view_count += 1
        progress.save(update_fields=["total_view_count", "last_viewed_at"])
        return response

    @action(detail=False, methods=["get"])
    def popular(self, request):
        """
        GET /api/resources/popular/?resource_type=VIDEO&limit=4
        Student-facing "most viewed" list (unlike /analytics/usage/, which
        is admin-only and far more detailed). Powers the "Popular Videos"
        shelf on the student dashboard, but works for any resource_type.
        """
        from django.db.models import Count

        limit = int(request.query_params.get("limit", 8))
        qs = self.get_queryset().filter(status=Resource.Status.PUBLISHED)
        resource_type = request.query_params.get("resource_type")
        if resource_type:
            qs = qs.filter(resource_type=resource_type)
        qs = qs.annotate(view_count=Count("view_events")).order_by("-view_count")[:limit]
        serializer = ResourceListSerializer(qs, many=True, context={"request": request})
        return Response(serializer.data)

    # ----------------------------------------------------------------
    # Lifecycle actions
    # ----------------------------------------------------------------
    @action(detail=True, methods=["post"], url_path="change-status")
    def change_status(self, request, pk=None):
        """
        POST /api/resources/{id}/change-status/  {"status": "PENDING_REVIEW"}
        Drives Draft -> Pending Review -> Published -> Inactive -> Archived,
        enforcing ALLOWED_TRANSITIONS by the requesting user's role.
        """
        resource = self.get_object()
        serializer = ResourceStatusChangeSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        new_status = serializer.validated_data["status"]
        notes = serializer.validated_data.get("review_notes", "")

        current = resource.status
        transitions = ALLOWED_TRANSITIONS.get(current, {})
        if new_status not in transitions:
            return Response(
                {"detail": f"Cannot move resource from {current} to {new_status}."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        allowed_roles = transitions[new_status]
        if request.user.role not in allowed_roles and not request.user.is_superuser:
            return Response(
                {"detail": "You do not have permission to perform this transition."},
                status=status.HTTP_403_FORBIDDEN,
            )
        # Owner check for Teacher-initiated transitions on their own resource.
        if (
            request.user.role == "TEACHER"
            and resource.uploaded_by_id != request.user.id
            and new_status != Resource.Status.PUBLISHED
        ):
            return Response(
                {"detail": "Teachers may only change the status of their own resources."},
                status=status.HTTP_403_FORBIDDEN,
            )

        now = timezone.now()
        resource.status = new_status
        if new_status == Resource.Status.PENDING_REVIEW:
            resource.submitted_for_review_at = now
        elif new_status == Resource.Status.PUBLISHED:
            resource.published_at = now
            resource.reviewed_by = request.user
            resource.reviewed_at = now
            resource.review_notes = notes
        elif new_status == Resource.Status.ARCHIVED:
            resource.archived_at = now
        resource.save()

        action_map = {
            Resource.Status.PUBLISHED: AuditLog.ActionType.PUBLISH,
            Resource.Status.ARCHIVED: AuditLog.ActionType.ARCHIVE,
        }
        AuditLog.objects.create(
            user=request.user,
            action=action_map.get(new_status, AuditLog.ActionType.UPDATE),
            resource=resource,
            description=f"Status changed {current} -> {new_status}",
        )
        return Response(ResourceDetailSerializer(resource, context={"request": request}).data)

    @action(detail=True, methods=["post"])
    def restore(self, request, pk=None):
        """Restore a soft-deleted resource (Backup and Recovery)."""
        resource = get_object_or_404(Resource, pk=pk, is_deleted=True)
        if not (request.user.is_admin_role or request.user.is_coordinator):
            return Response(
                {"detail": "Only Coordinators/Admins may restore deleted resources."},
                status=status.HTTP_403_FORBIDDEN,
            )
        resource.is_deleted = False
        resource.deleted_at = None
        resource.save(update_fields=["is_deleted", "deleted_at"])
        AuditLog.objects.create(
            user=request.user,
            action=AuditLog.ActionType.RESTORE,
            resource=resource,
            description=f"Restored '{resource.title}'",
        )
        return Response(ResourceDetailSerializer(resource, context={"request": request}).data)

    # ----------------------------------------------------------------
    # Download Manager
    # ----------------------------------------------------------------
    @action(detail=True, methods=["post"])
    def download(self, request, pk=None):
        """
        POST /api/resources/{id}/download/
        Records a Download entry (for resume support + analytics) and
        returns the file URL for the frontend to fetch/save.
        """
        resource = self.get_object()
        download = Download.objects.create(
            user=request.user,
            resource=resource,
            status=Download.DownloadStatus.IN_PROGRESS,
        )
        AuditLog.objects.create(
            user=request.user,
            action=AuditLog.ActionType.DOWNLOAD,
            resource=resource,
            description=f"Started download of '{resource.title}'",
        )
        return Response(DownloadSerializer(download).data, status=status.HTTP_201_CREATED)

    # ----------------------------------------------------------------
    # Version control (Phase 2, modeled now)
    # ----------------------------------------------------------------
    @action(detail=True, methods=["get", "post"])
    def versions(self, request, pk=None):
        resource = self.get_object()
        if request.method == "GET":
            qs = resource.versions.all()
            return Response(ResourceVersionSerializer(qs, many=True).data)

        # POST: upload a new version, bumping version_number.
        latest = resource.versions.order_by("-version_number").first()
        next_version = (latest.version_number + 1) if latest else 1
        serializer = ResourceVersionSerializer(
            data={**request.data, "resource": resource.id, "version_number": next_version}
        )
        serializer.is_valid(raise_exception=True)
        serializer.save(uploaded_by=request.user, version_number=next_version)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
