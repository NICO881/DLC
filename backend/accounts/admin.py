"""
accounts/admin.py
"""
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as DjangoUserAdmin

from .models import User


@admin.register(User)
class UserAdmin(DjangoUserAdmin):
    list_display = ["username", "email", "first_name", "last_name", "role", "is_active"]
    list_filter = ["role", "is_active", "education_level"]
    fieldsets = DjangoUserAdmin.fieldsets + (
        (
            "Library Profile",
            {
                "fields": (
                    "role",
                    "education_level",
                    "school_class",
                    "preferred_language",
                    "phone_number",
                    "needs_screen_reader",
                    "needs_high_contrast",
                    "needs_captions",
                )
            },
        ),
    )
