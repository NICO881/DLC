"""
library/filters.py

Powers Smart Search: filter by Subject, Topic, Keywords, Class, Resource
type, Language, Tags — exactly as listed in the spec. django-filter turns
these into query params like:

    /api/resources/?subject=3&resource_type=PDF&language=ENGLISH&search=algebra

`search` (free text across title/description/keywords/author) is handled
separately by DRF's SearchFilter in the ViewSet, not here.
"""
import django_filters as df

from library.models import Resource


class ResourceFilter(df.FilterSet):
    subject = df.NumberFilter(
        field_name="topic__subject_offering__subject_id",
        label="Subject ID",
    )
    school_class = df.NumberFilter(
        field_name="topic__subject_offering__school_class_id",
        label="Class ID",
    )
    education_level = df.NumberFilter(
        field_name="topic__subject_offering__school_class__education_level_id",
        label="Education Level ID",
    )
    topic = df.NumberFilter(field_name="topic_id")
    subtopic = df.NumberFilter(field_name="subtopic_id")
    keyword = df.CharFilter(field_name="keywords", lookup_expr="icontains")
    resource_type = df.ChoiceFilter(choices=Resource.ResourceType.choices)
    language = df.ChoiceFilter(choices=Resource.Language.choices)
    difficulty_level = df.ChoiceFilter(choices=Resource.DifficultyLevel.choices)
    status = df.ChoiceFilter(choices=Resource.Status.choices)
    academic_year = df.NumberFilter()
    term = df.CharFilter()
    uploaded_by = df.NumberFilter(field_name="uploaded_by_id")

    class Meta:
        model = Resource
        fields = [
            "subject",
            "school_class",
            "education_level",
            "topic",
            "subtopic",
            "keyword",
            "resource_type",
            "language",
            "difficulty_level",
            "status",
            "academic_year",
            "term",
            "uploaded_by",
        ]
