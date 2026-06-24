"""
config/urls.py

Top-level URL configuration. All API endpoints live under /api/, split into
/api/ (accounts: auth, user management) and /api/ (library: everything else)
via include() with distinct prefixes below.
"""
from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include("accounts.urls")),
    path("api/", include("library.urls")),
]

# Serve uploaded media (documents/videos/audio/images) directly during
# development. In production on the school server, Nginx/Apache should
# serve MEDIA_ROOT directly instead of Django — see deployment notes.
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
