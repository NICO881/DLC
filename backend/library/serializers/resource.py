"""
library/serializers/resource.py
"""
from django.utils import timezone
from rest_framework import serializers

from library.models import Resource, ResourceVersion


class ResourceListSerializer(serializers.ModelSerializer):
    """
    Lightweight serializer for search results / listing grids. Avoids
    pulling in heavy nested data so Smart Search stays fast.
    """

    uploaded_by_name = serializers.CharField(
        source="uploaded_by.get_full_name", read_only=True, default=""
    )
    topic_name = serializers.CharField(source="topic.name", read_only=True, default="")
    subtopic_name = serializers.CharField(source="subtopic.name", read_only=True, default="")
    subject_name = serializers.SerializerMethodField()
    is_bookmarked = serializers.SerializerMethodField()
    average_rating = serializers.SerializerMethodField()
    view_count = serializers.SerializerMethodField()

    class Meta:
        model = Resource
        fields = [
            "id",
            "title",
            "description",
            "author",
            "resource_type",
            "language",
            "difficulty_level",
            "status",
            "topic",
            "topic_name",
            "subtopic",
            "subtopic_name",
            "subject_name",
            "thumbnail",
            "file_size_bytes",
            "duration_seconds",
            "uploaded_by_name",
            "keywords",
            "created_at",
            "is_bookmarked",
            "average_rating",
            "view_count",
        ]

    def get_subject_name(self, obj):
        if obj.topic and obj.topic.subject_offering:
            return obj.topic.subject_offering.subject.name
        return ""

    def get_is_bookmarked(self, obj):
        request = self.context.get("request")
        if not request or not request.user.is_authenticated:
            return False
        # Expect the view to annotate/prefetch this for efficiency; fall
        # back to a query if not (kept simple for MVP).
        return obj.bookmarked_by.filter(user=request.user).exists()

    def get_average_rating(self, obj):
        ratings = obj.ratings.all()
        if not ratings:
            return None
        return round(sum(r.score for r in ratings) / len(ratings), 1)

    def get_view_count(self, obj):
        # Only present when the queryset was annotated with view_count
        # (e.g. the /resources/popular/ action); None otherwise so this
        # field doesn't silently look like "0 views" everywhere else.
        return getattr(obj, "view_count", None)


class ResourceDetailSerializer(ResourceListSerializer):
    """Fuller representation for the resource viewer page."""

    learning_outcome_statements = serializers.SerializerMethodField()
    competency_names = serializers.SerializerMethodField()
    reviewed_by_name = serializers.CharField(
        source="reviewed_by.get_full_name", read_only=True, default=""
    )

    class Meta(ResourceListSerializer.Meta):
        fields = ResourceListSerializer.Meta.fields + [
            "file",
            "curriculum_reference",
            "academic_year",
            "term",
            "learning_outcomes",
            "learning_outcome_statements",
            "competencies",
            "competency_names",
            "has_text_to_speech",
            "has_closed_captions",
            "is_high_contrast_available",
            "submitted_for_review_at",
            "reviewed_by_name",
            "reviewed_at",
            "review_notes",
            "published_at",
            "archived_at",
            "updated_at",
        ]

    def get_learning_outcome_statements(self, obj):
        return [lo.statement for lo in obj.learning_outcomes.all()]

    def get_competency_names(self, obj):
        return [c.name for c in obj.competencies.all()]


class ResourceCreateUpdateSerializer(serializers.ModelSerializer):
    """
    Used for Upload / Edit. `file` is required on create but optional on
    update (editing metadata shouldn't force a re-upload).
    """

    class Meta:
        model = Resource
        fields = [
            "id",
            "title",
            "description",
            "author",
            "keywords",
            "language",
            "difficulty_level",
            "curriculum_reference",
            "topic",
            "subtopic",
            "learning_outcomes",
            "competencies",
            "resource_type",
            "file",
            "thumbnail",
            "duration_seconds",
            "academic_year",
            "term",
            "has_text_to_speech",
            "has_closed_captions",
            "is_high_contrast_available",
        ]

    def validate(self, attrs):
        # On create, a file is mandatory; on update it's optional.
        if self.instance is None and not attrs.get("file"):
            raise serializers.ValidationError({"file": "A file is required to upload a resource."})
        return attrs

    def create(self, validated_data):
        request = self.context["request"]
        validated_data["uploaded_by"] = request.user
        validated_data["status"] = Resource.Status.DRAFT
        return super().create(validated_data)


class ResourceStatusChangeSerializer(serializers.Serializer):
    """
    Drives the Resource Lifecycle state machine:
    Draft -> Pending Review -> Published -> Inactive -> Archived.
    Validated against ALLOWED_TRANSITIONS in views.py, not here, since the
    allowed transition depends on the requesting user's role.
    """

    status = serializers.ChoiceField(choices=Resource.Status.choices)
    review_notes = serializers.CharField(required=False, allow_blank=True)


class ResourceVersionSerializer(serializers.ModelSerializer):
    uploaded_by_name = serializers.CharField(
        source="uploaded_by.get_full_name", read_only=True, default=""
    )

    class Meta:
        model = ResourceVersion
        fields = [
            "id",
            "resource",
            "file",
            "version_number",
            "change_notes",
            "uploaded_by_name",
            "created_at",
        ]
        read_only_fields = ["version_number"]
