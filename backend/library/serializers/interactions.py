"""
library/serializers/interactions.py
"""
from rest_framework import serializers

from library.models import Bookmark, Download, ProgressRecord, Rating, ResourceShare


class BookmarkSerializer(serializers.ModelSerializer):
    resource_title = serializers.CharField(source="resource.title", read_only=True)
    resource_type = serializers.CharField(source="resource.resource_type", read_only=True)
    thumbnail = serializers.ImageField(source="resource.thumbnail", read_only=True)

    class Meta:
        model = Bookmark
        fields = [
            "id",
            "resource",
            "resource_title",
            "resource_type",
            "thumbnail",
            "collection_name",
            "created_at",
        ]

    def create(self, validated_data):
        validated_data["user"] = self.context["request"].user
        return super().create(validated_data)


class ProgressRecordSerializer(serializers.ModelSerializer):
    resource_title = serializers.CharField(source="resource.title", read_only=True)
    resource_type = serializers.CharField(source="resource.resource_type", read_only=True)

    class Meta:
        model = ProgressRecord
        fields = [
            "id",
            "resource",
            "resource_title",
            "resource_type",
            "last_page_viewed",
            "last_position_seconds",
            "progress_percent",
            "is_completed",
            "first_viewed_at",
            "last_viewed_at",
            "total_view_count",
        ]
        read_only_fields = ["first_viewed_at", "last_viewed_at", "total_view_count"]


class RatingSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source="user.get_full_name", read_only=True)

    class Meta:
        model = Rating
        fields = ["id", "resource", "user", "user_name", "score", "comment", "created_at"]
        read_only_fields = ["user"]

    def create(self, validated_data):
        validated_data["user"] = self.context["request"].user
        return super().create(validated_data)


class DownloadSerializer(serializers.ModelSerializer):
    resource_title = serializers.CharField(source="resource.title", read_only=True)
    file_url = serializers.FileField(source="resource.file", read_only=True)

    class Meta:
        model = Download
        fields = [
            "id",
            "resource",
            "resource_title",
            "file_url",
            "status",
            "bytes_downloaded",
            "started_at",
            "completed_at",
        ]

    def create(self, validated_data):
        validated_data["user"] = self.context["request"].user
        return super().create(validated_data)


class ResourceShareSerializer(serializers.ModelSerializer):
    resource_title = serializers.CharField(source="resource.title", read_only=True)
    shared_by_name = serializers.CharField(source="shared_by.get_full_name", read_only=True)
    target_class_name = serializers.CharField(
        source="target_class.name", read_only=True, default=""
    )
    target_user_name = serializers.CharField(
        source="target_user.get_full_name", read_only=True, default=""
    )

    class Meta:
        model = ResourceShare
        fields = [
            "id",
            "resource",
            "resource_title",
            "shared_by",
            "shared_by_name",
            "target_type",
            "target_class",
            "target_class_name",
            "target_user",
            "target_user_name",
            "note",
            "created_at",
        ]
        read_only_fields = ["shared_by"]

    def validate(self, attrs):
        target_type = attrs.get("target_type")
        if target_type == "CLASS" and not attrs.get("target_class"):
            raise serializers.ValidationError({"target_class": "Required when sharing with a Class."})
        if target_type == "INDIVIDUAL" and not attrs.get("target_user"):
            raise serializers.ValidationError({"target_user": "Required when sharing with an individual."})
        return attrs

    def create(self, validated_data):
        validated_data["shared_by"] = self.context["request"].user
        return super().create(validated_data)
