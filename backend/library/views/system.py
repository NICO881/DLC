"""
library/views/system.py
"""
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from accounts.permissions import IsAdmin
from library.models import AuditLog, Notification
from library.serializers import AuditLogSerializer, NotificationSerializer


class NotificationViewSet(viewsets.ModelViewSet):
    """
    Alerts users about: New resources, Updates, Recommendations.
    Each user only ever sees their own notifications.
    """

    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ["notification_type", "is_read"]
    http_method_names = ["get", "post", "patch", "delete", "head", "options"]

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)

    @action(detail=True, methods=["patch"])
    def mark_read(self, request, pk=None):
        notification = self.get_object()
        notification.is_read = True
        notification.save(update_fields=["is_read"])
        return Response(NotificationSerializer(notification).data)

    @action(detail=False, methods=["post"], url_path="mark-all-read")
    def mark_all_read(self, request):
        self.get_queryset().update(is_read=True)
        return Response({"detail": "All notifications marked as read."})


class AuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Records: Uploads, Updates, Deletions, User activities.
    Admin-only, per the permission matrix ("Administrators: View analytics"
    implies full system visibility; audit logs are sensitive).
    """

    serializer_class = AuditLogSerializer
    permission_classes = [IsAdmin]
    filterset_fields = ["action", "user", "resource"]

    def get_queryset(self):
        return AuditLog.objects.select_related("user", "resource").all()
