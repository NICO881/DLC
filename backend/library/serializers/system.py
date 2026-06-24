"""
library/serializers/system.py
"""
from rest_framework import serializers

from library.models import AuditLog, Notification


class NotificationSerializer(serializers.ModelSerializer):
    related_resource_title = serializers.CharField(
        source="related_resource.title", read_only=True, default=""
    )

    class Meta:
        model = Notification
        fields = [
            "id",
            "notification_type",
            "title",
            "message",
            "related_resource",
            "related_resource_title",
            "is_read",
            "created_at",
        ]


class AuditLogSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source="user.get_full_name", read_only=True, default="")
    resource_title = serializers.CharField(source="resource.title", read_only=True, default="")

    class Meta:
        model = AuditLog
        fields = [
            "id",
            "user",
            "user_name",
            "action",
            "resource",
            "resource_title",
            "description",
            "ip_address",
            "created_at",
        ]
