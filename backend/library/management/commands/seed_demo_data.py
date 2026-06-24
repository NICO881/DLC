"""
library/management/commands/seed_demo_data.py

Populates the database with a small but realistic set of demo data so the
system can be explored end-to-end immediately after setup:
  - One user per role (admin/coordinator/teacher/student)
  - A curriculum tree: Education Level -> Class -> Subject -> Topic -> Subtopic
  - A couple of sample Resources

Usage:
    python manage.py seed_demo_data
"""
from django.contrib.auth import get_user_model
from django.core.files.base import ContentFile
from django.core.management.base import BaseCommand

from library.models import (
    EducationLevel,
    Resource,
    SchoolClass,
    Subject,
    SubjectOffering,
    Subtopic,
    Topic,
)

User = get_user_model()


class Command(BaseCommand):
    help = "Seed the database with demo users, curriculum data, and sample resources."

    def handle(self, *args, **options):
        self.stdout.write("Seeding demo data...")

        admin, created = User.objects.get_or_create(
            username="admin",
            defaults=dict(
                email="admin@digitallibrary.local",
                first_name="Alice",
                last_name="Admin",
                role=User.Role.ADMIN,
                is_staff=True,
                is_superuser=True,
            ),
        )
        if created:
            admin.set_password("Admin@12345")
            admin.save()

        coordinator, created = User.objects.get_or_create(
            username="coordinator",
            defaults=dict(
                email="coordinator@digitallibrary.local",
                first_name="Carol",
                last_name="Coordinator",
                role=User.Role.COORDINATOR,
            ),
        )
        if created:
            coordinator.set_password("Coord@12345")
            coordinator.save()

        teacher, created = User.objects.get_or_create(
            username="teacher",
            defaults=dict(
                email="teacher@digitallibrary.local",
                first_name="Tom",
                last_name="Teacher",
                role=User.Role.TEACHER,
            ),
        )
        if created:
            teacher.set_password("Teach@12345")
            teacher.save()

        student, created = User.objects.get_or_create(
            username="student",
            defaults=dict(
                email="student@digitallibrary.local",
                first_name="Sam",
                last_name="Student",
                role=User.Role.STUDENT,
                school_class="S2",
                education_level="O-Level",
            ),
        )
        if created:
            student.set_password("Student@12345")
            student.save()

        self.stdout.write(self.style.SUCCESS("Created demo users (admin/coordinator/teacher/student)."))

        # --- Curriculum tree ---
        # Subject list mirrors the 6 tiles in the dashboard reference design.
        # NOTE: These are placeholder NCDC-aligned names for the MVP demo.
        # Swap in the official NCDC Uganda subject/topic list here once
        # confirmed — nothing else in the app needs to change, since the
        # dashboard reads subjects dynamically from the database.
        o_level, _ = EducationLevel.objects.get_or_create(name="O-Level", defaults={"order": 1})
        s2, _ = SchoolClass.objects.get_or_create(
            education_level=o_level, name="S2", defaults={"order": 2}
        )

        subject_defs = [
            ("Mathematics", "Algebra", "Quadratic Equations"),
            ("Biology", "Cell Structure", "Plant Cells"),
            ("Chemistry", "Acids and Bases", "pH Scale"),
            ("ICT", "Coding Fundamentals", "Introduction to Python"),
            ("Geography", "Pre-Colonial Era", "Early Settlement Patterns"),
            ("English", "Essay Writing", "Argumentative Essays"),
        ]

        created_subjects = {}
        created_topics = {}
        created_subtopics = {}

        for subject_name, topic_name, subtopic_name in subject_defs:
            subject, _ = Subject.objects.get_or_create(
                name=subject_name,
                defaults={"description": f"O-Level {subject_name}", "coordinator": coordinator},
            )
            offering, _ = SubjectOffering.objects.get_or_create(subject=subject, school_class=s2)
            topic, _ = Topic.objects.get_or_create(
                subject_offering=offering, name=topic_name, defaults={"order": 1}
            )
            subtopic, _ = Subtopic.objects.get_or_create(
                topic=topic, name=subtopic_name, defaults={"order": 1}
            )
            created_subjects[subject_name] = subject
            created_topics[subject_name] = topic
            created_subtopics[subject_name] = subtopic

        self.stdout.write(
            self.style.SUCCESS(f"Created curriculum: O-Level > S2 > {len(subject_defs)} subjects.")
        )

        # --- Sample resources across types, so the dashboard has content
        # to show in Recent Resources, Past Papers, and Popular Videos. ---
        sample_resources = [
            dict(
                title="Introduction to Quadratic Equations",
                description="A beginner-friendly guide to solving quadratic equations.",
                subject="Mathematics",
                resource_type=Resource.ResourceType.PDF,
                keywords="algebra, quadratic, equations, maths",
                filename="intro-to-quadratic-equations.txt",
            ),
            dict(
                title="S2 Biology - Cell Structure",
                description="Diagrams and notes covering plant and animal cell structure.",
                subject="Biology",
                resource_type=Resource.ResourceType.PDF,
                keywords="biology, cells, structure",
                filename="biology-cell-structure.txt",
            ),
            dict(
                title="S2 Chemistry - Acids & Bases Video",
                description="A video walkthrough of the pH scale and acid-base reactions.",
                subject="Chemistry",
                resource_type=Resource.ResourceType.VIDEO,
                keywords="chemistry, acids, bases, ph",
                filename="chemistry-acids-bases.txt",
            ),
            dict(
                title="S2 ICT: Coding Fundamentals",
                description="Introductory video on coding fundamentals using Python.",
                subject="ICT",
                resource_type=Resource.ResourceType.VIDEO,
                keywords="ict, coding, python, programming",
                filename="ict-coding-fundamentals.txt",
            ),
            dict(
                title="Ugandan History: Pre-colonial Era",
                description="Video covering settlement patterns in pre-colonial Uganda.",
                subject="Geography",
                resource_type=Resource.ResourceType.VIDEO,
                keywords="geography, history, uganda, pre-colonial",
                filename="geography-pre-colonial-era.txt",
            ),
            dict(
                title="S2 Maths Term 1 2023 Past Paper",
                description="End of term past paper for Mathematics, Term I 2023.",
                subject="Mathematics",
                resource_type=Resource.ResourceType.PAST_PAPER,
                keywords="maths, past paper, term 1",
                filename="maths-term1-2023-pastpaper.txt",
            ),
        ]

        for spec in sample_resources:
            subject_name = spec.pop("subject")
            filename = spec.pop("filename")
            resource, created = Resource.objects.get_or_create(
                title=spec["title"],
                defaults=dict(
                    description=spec["description"],
                    author="Tom Teacher",
                    keywords=spec["keywords"],
                    language=Resource.Language.ENGLISH,
                    difficulty_level=Resource.DifficultyLevel.BEGINNER,
                    topic=created_topics[subject_name],
                    subtopic=created_subtopics[subject_name],
                    resource_type=spec["resource_type"],
                    status=Resource.Status.PUBLISHED,
                    uploaded_by=teacher,
                    academic_year=2026,
                    term="TERM_1",
                ),
            )
            if created:
                resource.file.save(
                    filename,
                    ContentFile(
                        b"This is a placeholder file standing in for a real upload.\n"
                        b"Replace via the Upload feature in the app."
                    ),
                    save=True,
                )

        self.stdout.write(self.style.SUCCESS(f"Created {len(sample_resources)} sample published resources."))

        self.stdout.write(self.style.SUCCESS("\nDemo data ready. Login credentials:"))
        self.stdout.write("  admin       / Admin@12345")
        self.stdout.write("  coordinator / Coord@12345")
        self.stdout.write("  teacher     / Teach@12345")
        self.stdout.write("  student     / Student@12345")
