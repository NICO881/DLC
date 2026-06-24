"""
accounts/permissions.py

Centralized role-based permission classes for DRF views, matching the
permission matrix in the spec:

Students:      search/view/download/bookmark/track progress only.
Teachers:      upload, edit own materials, archive, share. Cannot manage
               users or configure the system.
Coordinators:  review/approve resources, organize subjects.
Administrators: manage users, storage, configure library, restore backups,
               view analytics. Implicitly can do everything below too.

Keeping these in one file makes the permission matrix easy to audit later
instead of scattering role checks across views.
"""
from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsAdmin(BasePermission):
    """Full system control: users, storage, config, backups, analytics."""

    def has_permission(self, request, view):
        user = request.user
        return bool(user and user.is_authenticated and user.is_admin_role)


class IsCoordinatorOrAdmin(BasePermission):
    """Can review/approve resources and organize subjects."""

    def has_permission(self, request, view):
        user = request.user
        return bool(
            user
            and user.is_authenticated
            and (user.is_coordinator or user.is_admin_role)
        )


class IsTeacherOrAbove(BasePermission):
    """Teachers, Coordinators, and Admins can upload/manage resources."""

    def has_permission(self, request, view):
        user = request.user
        return bool(
            user
            and user.is_authenticated
            and (user.is_teacher or user.is_coordinator or user.is_admin_role)
        )


class IsOwnerOrCoordinatorOrAdmin(BasePermission):
    """
    Object-level permission: a Teacher may edit/archive/delete only their
    own uploaded resources. Coordinators and Admins may act on any resource.
    Read access (SAFE_METHODS) is open to any authenticated user; broader
    visibility rules (e.g. only "Published" resources for students) are
    enforced in the queryset, not here.
    """

    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        user = request.user
        if not (user and user.is_authenticated):
            return False
        if user.is_coordinator or user.is_admin_role:
            return True
        return getattr(obj, "uploaded_by_id", None) == user.id


class ReadOnly(BasePermission):
    """Used to explicitly mark endpoints as read-only for all roles (e.g. students)."""

    def has_permission(self, request, view):
        return request.method in SAFE_METHODS
