"""
library/serializers/curriculum.py
"""
from rest_framework import serializers

from library.models import (
    Competency,
    EducationLevel,
    LearningOutcome,
    SchoolClass,
    Subject,
    SubjectOffering,
    Subtopic,
    Topic,
)


class EducationLevelSerializer(serializers.ModelSerializer):
    class Meta:
        model = EducationLevel
        fields = ["id", "name", "slug", "order"]


class SchoolClassSerializer(serializers.ModelSerializer):
    education_level_name = serializers.CharField(source="education_level.name", read_only=True)

    class Meta:
        model = SchoolClass
        fields = ["id", "education_level", "education_level_name", "name", "order"]


class SubjectSerializer(serializers.ModelSerializer):
    coordinator_name = serializers.CharField(
        source="coordinator.get_full_name", read_only=True, default=""
    )
    resource_count = serializers.IntegerField(read_only=True, required=False)

    class Meta:
        model = Subject
        fields = [
            "id",
            "name",
            "slug",
            "description",
            "coordinator",
            "coordinator_name",
            "resource_count",
        ]


class SubjectOfferingSerializer(serializers.ModelSerializer):
    subject_name = serializers.CharField(source="subject.name", read_only=True)
    class_name = serializers.CharField(source="school_class.name", read_only=True)

    class Meta:
        model = SubjectOffering
        fields = ["id", "subject", "subject_name", "school_class", "class_name"]


class TopicSerializer(serializers.ModelSerializer):
    subject_name = serializers.CharField(
        source="subject_offering.subject.name", read_only=True
    )
    class_name = serializers.CharField(
        source="subject_offering.school_class.name", read_only=True
    )

    class Meta:
        model = Topic
        fields = [
            "id",
            "subject_offering",
            "subject_name",
            "class_name",
            "name",
            "order",
            "description",
        ]


class SubtopicSerializer(serializers.ModelSerializer):
    topic_name = serializers.CharField(source="topic.name", read_only=True)

    class Meta:
        model = Subtopic
        fields = ["id", "topic", "topic_name", "name", "order", "description"]


class LearningOutcomeSerializer(serializers.ModelSerializer):
    subtopic_name = serializers.CharField(source="subtopic.name", read_only=True)

    class Meta:
        model = LearningOutcome
        fields = ["id", "subtopic", "subtopic_name", "statement", "code"]


class CompetencySerializer(serializers.ModelSerializer):
    learning_outcome_statements = serializers.SerializerMethodField()

    class Meta:
        model = Competency
        fields = [
            "id",
            "name",
            "description",
            "learning_outcomes",
            "learning_outcome_statements",
        ]

    def get_learning_outcome_statements(self, obj):
        return [lo.statement for lo in obj.learning_outcomes.all()]


class CurriculumTreeSerializer(serializers.Serializer):
    """
    Read-only convenience serializer that returns the full nested tree for
    one Education Level, used to power cascading dropdowns / browse-by-
    curriculum UI on the frontend without N+1 round trips.
    """

    id = serializers.IntegerField()
    name = serializers.CharField()
    classes = serializers.SerializerMethodField()

    def get_classes(self, obj):
        return [
            {
                "id": c.id,
                "name": c.name,
                "subjects": [
                    {
                        "id": off.subject.id,
                        "name": off.subject.name,
                        "offering_id": off.id,
                        "topics": [
                            {
                                "id": t.id,
                                "name": t.name,
                                "subtopics": [
                                    {"id": st.id, "name": st.name}
                                    for st in t.subtopics.all()
                                ],
                            }
                            for t in off.topics.all()
                        ],
                    }
                    for off in c.subject_offerings.select_related("subject").prefetch_related(
                        "topics__subtopics"
                    )
                ],
            }
            for c in obj.classes.all()
        ]
