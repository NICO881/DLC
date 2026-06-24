"""
smoke_test.py — exercises the core API flows without needing a live server,
using Django's test client. Run with: python3 manage.py shell < smoke_test.py
or via `python3 smoke_test.py` after django.setup().
"""
import os
import sys
import django

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from django.test import Client

client = Client()


def pretty(resp):
    try:
        return resp.status_code, resp.json()
    except Exception:
        return resp.status_code, resp.content[:300]


print("=== 1. Login as student ===")
resp = client.post(
    "/api/auth/login/",
    data={"username": "student", "password": "Student@12345"},
    content_type="application/json",
)
status, body = pretty(resp)
print(status, body)
assert status == 200, "Student login failed"
student_token = body["token"]

print("\n=== 2. Login as teacher ===")
resp = client.post(
    "/api/auth/login/",
    data={"username": "teacher", "password": "Teach@12345"},
    content_type="application/json",
)
status, body = pretty(resp)
print(status, body)
teacher_token = body["token"]

print("\n=== 3. Student lists resources (should see only Published) ===")
resp = client.get("/api/resources/", HTTP_AUTHORIZATION=f"Token {student_token}")
status, body = pretty(resp)
print(status, body)
assert status == 200

print("\n=== 4. Student searches resources by keyword 'algebra' ===")
resp = client.get(
    "/api/resources/?search=algebra", HTTP_AUTHORIZATION=f"Token {student_token}"
)
status, body = pretty(resp)
print(status, body)

print("\n=== 5. Student tries to upload (should be 403) ===")
resp = client.post(
    "/api/resources/",
    data={"title": "Should fail"},
    HTTP_AUTHORIZATION=f"Token {student_token}",
)
status, body = pretty(resp)
print(status, body)
assert status == 403, "Student should NOT be able to upload"

print("\n=== 6. Teacher uploads a new resource (Draft) ===")
from django.core.files.uploadedfile import SimpleUploadedFile

test_file = SimpleUploadedFile("notes.txt", b"Sample note content", content_type="text/plain")
resp = client.post(
    "/api/resources/",
    data={
        "title": "Photosynthesis Notes",
        "description": "Quick revision notes",
        "resource_type": "PDF",
        "language": "ENGLISH",
        "file": test_file,
        "keywords": "biology, photosynthesis",
    },
    HTTP_AUTHORIZATION=f"Token {teacher_token}",
)
status, body = pretty(resp)
print(status, body)
assert status == 201, "Teacher upload should succeed"
new_resource_id = body["id"]
assert body["status"] == "DRAFT"

print("\n=== 7. Student should NOT see the new Draft resource ===")
resp = client.get("/api/resources/", HTTP_AUTHORIZATION=f"Token {student_token}")
status, body = pretty(resp)
ids = [r["id"] for r in body["results"]]
print("Student sees resource IDs:", ids)
assert new_resource_id not in ids, "Draft resource leaked to student!"

print("\n=== 8. Teacher submits resource for review ===")
resp = client.post(
    f"/api/resources/{new_resource_id}/change-status/",
    data={"status": "PENDING_REVIEW"},
    content_type="application/json",
    HTTP_AUTHORIZATION=f"Token {teacher_token}",
)
status, body = pretty(resp)
print(status, body)
assert status == 200

print("\n=== 9. Login as coordinator and publish it ===")
resp = client.post(
    "/api/auth/login/",
    data={"username": "coordinator", "password": "Coord@12345"},
    content_type="application/json",
)
coordinator_token = resp.json()["token"]

resp = client.post(
    f"/api/resources/{new_resource_id}/change-status/",
    data={"status": "PUBLISHED"},
    content_type="application/json",
    HTTP_AUTHORIZATION=f"Token {coordinator_token}",
)
status, body = pretty(resp)
print(status, body)
assert status == 200
assert body["status"] == "PUBLISHED"

print("\n=== 10. Student can now see the published resource ===")
resp = client.get("/api/resources/", HTTP_AUTHORIZATION=f"Token {student_token}")
status, body = pretty(resp)
ids = [r["id"] for r in body["results"]]
print("Student sees resource IDs:", ids)
assert new_resource_id in ids

print("\n=== 11. Student bookmarks the resource ===")
resp = client.post(
    "/api/bookmarks/",
    data={"resource": new_resource_id, "collection_name": "Biology Revision"},
    content_type="application/json",
    HTTP_AUTHORIZATION=f"Token {student_token}",
)
status, body = pretty(resp)
print(status, body)
assert status == 201

print("\n=== 12. Student downloads the resource ===")
resp = client.post(
    f"/api/resources/{new_resource_id}/download/",
    HTTP_AUTHORIZATION=f"Token {student_token}",
)
status, body = pretty(resp)
print(status, body)
assert status == 201

print("\n=== 13. Admin views usage analytics ===")
resp = client.post(
    "/api/auth/login/",
    data={"username": "admin", "password": "Admin@12345"},
    content_type="application/json",
)
admin_token = resp.json()["token"]
resp = client.get("/api/analytics/usage/", HTTP_AUTHORIZATION=f"Token {admin_token}")
status, body = pretty(resp)
print(status, body)
assert status == 200

print("\n=== 14. Admin views storage monitoring ===")
resp = client.get("/api/analytics/storage/", HTTP_AUTHORIZATION=f"Token {admin_token}")
status, body = pretty(resp)
print(status, body)
assert status == 200

print("\n=== 15. Admin views audit logs ===")
resp = client.get("/api/audit-logs/", HTTP_AUTHORIZATION=f"Token {admin_token}")
status, body = pretty(resp)
print(status, body)
assert status == 200

print("\n\n✅ ALL SMOKE TESTS PASSED")
