"""
library/views/analytics.py

Usage Analytics (most viewed, most downloaded, popular subjects) and
Storage Monitoring (disk space, resource sizes, server health), both
restricted to Administrators per the permission matrix.

These are deliberately simple read-only aggregation endpoints for the MVP;
Phase 2 can move to Grafana/Prometheus dashboards fed by the same queries.
"""
import shutil

from django.conf import settings
from django.db.models import Avg, Count, Sum
from django.utils import timezone
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.permissions import IsAdmin
from library.models import Download, Resource, ResourceViewEvent, Subject


class UsageAnalyticsView(APIView):
    """GET /api/analytics/usage/ — most viewed resources, downloads, popular subjects."""

    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        most_viewed = (
            Resource.objects.filter(is_deleted=False)
            .annotate(view_count=Count("view_events"))
            .order_by("-view_count")[:10]
            .values("id", "title", "resource_type", "view_count")
        )
        most_downloaded = (
            Resource.objects.filter(is_deleted=False)
            .annotate(download_count=Count("downloads"))
            .order_by("-download_count")[:10]
            .values("id", "title", "resource_type", "download_count")
        )
        popular_subjects = (
            Subject.objects.annotate(
                resource_count=Count("offerings__topics__resources", distinct=True)
            )
            .order_by("-resource_count")[:10]
            .values("id", "name", "resource_count")
        )
        by_type = (
            Resource.objects.filter(is_deleted=False)
            .values("resource_type")
            .annotate(count=Count("id"))
            .order_by("-count")
        )
        by_status = (
            Resource.objects.filter(is_deleted=False)
            .values("status")
            .annotate(count=Count("id"))
            .order_by("-count")
        )
        avg_rating = Resource.objects.filter(is_deleted=False).aggregate(
            overall_avg=Avg("ratings__score")
        )

        return Response(
            {
                "most_viewed_resources": list(most_viewed),
                "most_downloaded_resources": list(most_downloaded),
                "popular_subjects": list(popular_subjects),
                "resources_by_type": list(by_type),
                "resources_by_status": list(by_status),
                "overall_average_rating": avg_rating["overall_avg"],
                "generated_at": timezone.now(),
            }
        )


class StorageMonitoringView(APIView):
    """
    GET /api/analytics/storage/ — disk space, resource sizes, server health.
    Reads actual disk usage from the school server's filesystem at MEDIA_ROOT.
    """

    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        total, used, free = shutil.disk_usage(settings.MEDIA_ROOT.parent)
        percent_used = round((used / total) * 100, 1) if total else 0

        size_by_type = (
            Resource.objects.filter(is_deleted=False)
            .values("resource_type")
            .annotate(
                total_bytes=Sum("file_size_bytes"), count=Count("id")
            )
            .order_by("-total_bytes")
        )
        total_resource_bytes = Resource.objects.filter(is_deleted=False).aggregate(
            total=Sum("file_size_bytes")
        )["total"] or 0

        return Response(
            {
                "disk": {
                    "total_bytes": total,
                    "used_bytes": used,
                    "free_bytes": free,
                    "percent_used": percent_used,
                    "warning": percent_used >= settings.STORAGE_WARNING_THRESHOLD_PERCENT,
                    "warning_threshold_percent": settings.STORAGE_WARNING_THRESHOLD_PERCENT,
                },
                "resources": {
                    "total_bytes": total_resource_bytes,
                    "by_type": list(size_by_type),
                },
                "generated_at": timezone.now(),
            }
        )
