/**
 * pages/teacher/EditResourcePage.jsx
 */
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Save } from "lucide-react";
import * as resourcesApi from "../../api/resources";
import { TextField, TextArea } from "../../components/ui/FormField";
import Select from "../../components/ui/Select";
import Button from "../../components/ui/Button";
import { Card, PageLoader } from "../../components/ui/Card";
import { LANGUAGE_LABELS } from "../../utils/resourceTypes";

const LANGUAGE_OPTIONS = Object.entries(LANGUAGE_LABELS).map(([value, label]) => ({
  value,
  label,
}));

export default function EditResourcePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    resourcesApi
      .getResource(id)
      .then((data) =>
        setForm({
          title: data.title,
          description: data.description || "",
          author: data.author || "",
          keywords: data.keywords || "",
          language: data.language,
        })
      )
      .finally(() => setLoading(false));
  }, [id]);

  function update(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => formData.append(k, v));
      await resourcesApi.updateResource(id, formData);
      navigate(`/resources/${id}`);
    } catch (err) {
      setError("Couldn't save changes. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  if (loading || !form) return <PageLoader />;

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="font-display text-2xl font-semibold text-ink-800 mb-6">Edit Resource</h1>

      {error && (
        <div className="bg-clay-50 text-clay-700 text-sm rounded-card px-4 py-3 mb-4">{error}</div>
      )}

      <form onSubmit={handleSubmit}>
        <Card className="p-5 space-y-4 mb-5">
          <TextField label="Title" required value={form.title} onChange={(v) => update("title", v)} />
          <TextArea label="Description" value={form.description} onChange={(v) => update("description", v)} />
          <div className="grid grid-cols-2 gap-4">
            <TextField label="Author" value={form.author} onChange={(v) => update("author", v)} />
            <TextField label="Keywords" value={form.keywords} onChange={(v) => update("keywords", v)} />
          </div>
          <Select
            label="Language"
            value={form.language}
            onChange={(v) => update("language", v)}
            options={LANGUAGE_OPTIONS}
          />
        </Card>
        <div className="flex justify-end gap-3">
          <Button variant="ghost" type="button" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button type="submit" icon={Save} disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}
