"""
library/models/curriculum.py

Implements the Curriculum-Based Organization hierarchy from the spec:

    Education Level -> Class -> Subject -> Topic -> Subtopic
        -> Learning Outcome -> Competency -> Resources

Each level is its own model (rather than one big tree table) because:
  - Subjects, Classes etc. need their own metadata/filters in Smart Search.
  - Subject Coordinators "organize subjects" as a distinct admin action.
  - Competency Mapping links Resources to Learning Outcomes/Competencies
    independently of the strict tree path, which a single adjacency-list
    table would make awkward.
"""
from django.db import models
from django.utils.text import slugify


class TimeStampedModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class EducationLevel(TimeStampedModel):
    """E.g. Pre-Primary, Primary, O-Level, A-Level."""

    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=120, unique=True, blank=True)
    order = models.PositiveIntegerField(
        default=0, help_text="Controls display order, e.g. Primary before A-Level."
    )

    class Meta:
        ordering = ["order", "name"]

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)


class SchoolClass(TimeStampedModel):
    """E.g. P7, S3, S6. Belongs to one Education Level."""

    education_level = models.ForeignKey(
        EducationLevel, on_delete=models.CASCADE, related_name="classes"
    )
    name = models.CharField(max_length=50)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["education_level__order", "order", "name"]
        unique_together = ["education_level", "name"]
        verbose_name = "Class"
        verbose_name_plural = "Classes"

    def __str__(self):
        return f"{self.name} ({self.education_level.name})"


class Subject(TimeStampedModel):
    """E.g. Mathematics, Biology. Linked to one or more Classes via SubjectOffering."""

    name = models.CharField(max_length=100)
    slug = models.SlugField(max_length=120, unique=True, blank=True)
    description = models.TextField(blank=True)
    # "Subject Coordinators organize subjects" -> a coordinator can own a subject.
    coordinator = models.ForeignKey(
        "accounts.User",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="coordinated_subjects",
        limit_choices_to={"role": "COORDINATOR"},
    )

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)


class SubjectOffering(TimeStampedModel):
    """
    Join table: which Subjects are taught in which SchoolClass.
    E.g. "Mathematics" offered in both "S1" and "S2" but with different topics.
    """

    subject = models.ForeignKey(
        Subject, on_delete=models.CASCADE, related_name="offerings"
    )
    school_class = models.ForeignKey(
        SchoolClass, on_delete=models.CASCADE, related_name="subject_offerings"
    )

    class Meta:
        unique_together = ["subject", "school_class"]

    def __str__(self):
        return f"{self.subject.name} - {self.school_class.name}"


class Topic(TimeStampedModel):
    """Topic within a SubjectOffering, e.g. 'Algebra' under Maths/S2."""

    subject_offering = models.ForeignKey(
        SubjectOffering, on_delete=models.CASCADE, related_name="topics"
    )
    name = models.CharField(max_length=150)
    order = models.PositiveIntegerField(default=0)
    description = models.TextField(blank=True)

    class Meta:
        ordering = ["order", "name"]

    def __str__(self):
        return self.name


class Subtopic(TimeStampedModel):
    topic = models.ForeignKey(Topic, on_delete=models.CASCADE, related_name="subtopics")
    name = models.CharField(max_length=150)
    order = models.PositiveIntegerField(default=0)
    description = models.TextField(blank=True)

    class Meta:
        ordering = ["order", "name"]

    def __str__(self):
        return self.name


class LearningOutcome(TimeStampedModel):
    """What a learner should be able to do after engaging with a Subtopic."""

    subtopic = models.ForeignKey(
        Subtopic, on_delete=models.CASCADE, related_name="learning_outcomes"
    )
    statement = models.TextField(help_text="E.g. 'Learner can solve quadratic equations.'")
    code = models.CharField(
        max_length=50,
        blank=True,
        help_text="Optional curriculum reference code, e.g. 'MTC-S2-3.2'.",
    )

    class Meta:
        ordering = ["id"]

    def __str__(self):
        return self.code or self.statement[:60]


class Competency(TimeStampedModel):
    """
    A competency linked to one or more Learning Outcomes. Supports
    Competency Mapping: Resources <-> Learning Outcomes <-> Competencies
    <-> Activities/Assessments.
    """

    name = models.CharField(max_length=150)
    description = models.TextField(blank=True)
    learning_outcomes = models.ManyToManyField(
        LearningOutcome, related_name="competencies", blank=True
    )

    class Meta:
        verbose_name_plural = "Competencies"
        ordering = ["name"]

    def __str__(self):
        return self.name
