"""
library/views/curriculum.py

CRUD for the curriculum hierarchy. Read access is open to any authenticated
user (students need this to browse/search); write access is restricted to
Coordinators/Admins ("organize subjects") except where a Teacher reasonably
needs to add a Topic/Subtopic while preparing content.
"""
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from accounts.permissions import IsCoordinatorOrAdmin, IsTeacherOrAbove
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
from library.serializers import (
    CompetencySerializer,
    EducationLevelSerializer,
    LearningOutcomeSerializer,
    SchoolClassSerializer,
    SubjectOfferingSerializer,
    SubjectSerializer,
    SubtopicSerializer,
    TopicSerializer,
)


class EducationLevelViewSet(viewsets.ModelViewSet):
    queryset = EducationLevel.objects.all()
    serializer_class = EducationLevelSerializer

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [IsAuthenticated()]
        return [IsCoordinatorOrAdmin()]


class SchoolClassViewSet(viewsets.ModelViewSet):
    queryset = SchoolClass.objects.select_related("education_level").all()
    serializer_class = SchoolClassSerializer
    filterset_fields = ["education_level"]

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [IsAuthenticated()]
        return [IsCoordinatorOrAdmin()]


class SubjectViewSet(viewsets.ModelViewSet):
    """Subject Coordinators "organize subjects"; Admins can manage all."""

    queryset = Subject.objects.select_related("coordinator").all()
    serializer_class = SubjectSerializer
    search_fields = ["name", "description"]

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [IsAuthenticated()]
        return [IsCoordinatorOrAdmin()]


class SubjectOfferingViewSet(viewsets.ModelViewSet):
    queryset = SubjectOffering.objects.select_related("subject", "school_class").all()
    serializer_class = SubjectOfferingSerializer
    filterset_fields = ["subject", "school_class"]

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [IsAuthenticated()]
        return [IsCoordinatorOrAdmin()]


class TopicViewSet(viewsets.ModelViewSet):
    """Teachers may add Topics while preparing their own content."""

    queryset = Topic.objects.select_related(
        "subject_offering__subject", "subject_offering__school_class"
    ).all()
    serializer_class = TopicSerializer
    filterset_fields = ["subject_offering"]
    search_fields = ["name", "description"]

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [IsAuthenticated()]
        return [IsTeacherOrAbove()]


class SubtopicViewSet(viewsets.ModelViewSet):
    queryset = Subtopic.objects.select_related("topic").all()
    serializer_class = SubtopicSerializer
    filterset_fields = ["topic"]
    search_fields = ["name", "description"]

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [IsAuthenticated()]
        return [IsTeacherOrAbove()]


class LearningOutcomeViewSet(viewsets.ModelViewSet):
    queryset = LearningOutcome.objects.select_related("subtopic").all()
    serializer_class = LearningOutcomeSerializer
    filterset_fields = ["subtopic"]

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [IsAuthenticated()]
        return [IsTeacherOrAbove()]


class CompetencyViewSet(viewsets.ModelViewSet):
    """Competency Mapping: resources linked to learning outcomes/competencies."""

    queryset = Competency.objects.prefetch_related("learning_outcomes").all()
    serializer_class = CompetencySerializer
    search_fields = ["name", "description"]

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [IsAuthenticated()]
        return [IsCoordinatorOrAdmin()]
