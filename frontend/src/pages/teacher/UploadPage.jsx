/**
 * pages/teacher/UploadPage.jsx
 *
 * File Management > Upload resources. Supports the formats listed in the
 * spec (PDF/DOCX/PPTX/XLSX, MP4/MP3/JPG/PNG) by letting the uploader pick
 * the resource_type explicitly — simpler and more reliable than sniffing
 * MIME types, especially over a flaky school network connection.
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { UploadCloud } from "lucide-react";
import * as resourcesApi from "../../api/resources";
import CurriculumSelector from "../../components/curriculum/CurriculumSelector";
import { TextField, TextArea, FileDropzone } from "../../components/ui/FormField";
import Select from "../../components/ui/Select";
import Button from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { RESOURCE_TYPE_META, LANGUAGE_LABELS } from "../../utils/resourceTypes";

const RESOURCE_TYPE_OPTIONS = Object.entries(RESOURCE_TYPE_META).map(([value, meta]) => ({
  value,
  label: meta.label,
}));
const LANGUAGE_OPTIONS = Object.entries(LANGUAGE_LABELS).map(([value, label]) => ({
  value,
  label,
}));
const DIFFICULTY_OPTIONS = [
  { value: "BEGINNER", label: "Beginner" },
  { value: "INTERMEDIATE", label: "Intermediate" },
  { value: "ADVANCED", label: "Advanced" },
];

export default function UploadPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "",
    description: "",
    author: "",
    keywords: "",
    resource_type: "",
    language: "ENGLISH",
    difficulty_level: "",
    curriculum: { topic: "", subtopic: "" },
  });
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  function update(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!file) {
      setError("Please choose a file to upload.");
      return;
    }
    if (!form.resource_type) {
      setError("Please select a resource type.");
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("description", form.description);
      formData.append("author", form.author);
      formData.append("keywords", form.keywords);
      formData.append("resource_type", form.resource_type);
      formData.append("language", form.language);
      if (form.difficulty_level) formData.append("difficulty_level", form.difficulty_level);
      if (form.curriculum.topic) formData.append("topic", form.curriculum.topic);
      if (form.curriculum.subtopic) formData.append("subtopic", form.curriculum.subtopic);
      formData.append("file", file);

      const created = await resourcesApi.uploadResource(formData);
      navigate(`/resources/${created.id}`);
    } catch (err) {
      console.error(err);
      const data = err.response?.data;
      if (data && typeof data === "object") {
        const firstError = Object.values(data)[0];
        setError(Array.isArray(firstError) ? firstError[0] : String(firstError));
      } else {
        setError("Something went wrong while uploading. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold text-ink-800 flex items-center gap-2">
          <UploadCloud size={24} className="text-clay-500" /> Upload Resource
        </h1>
        <p className="text-ink-500 text-sm mt-1">
          New resources start as a Draft. Submit for review when you're ready for a Subject
          Coordinator to approve and publish it.
        </p>
      </div>

      {error && (
        <div className="bg-clay-50 text-clay-700 text-sm rounded-card px-4 py-3 mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <Card className="p-5 space-y-4">
          <TextField
            label="Title"
            required
            value={form.title}
            onChange={(v) => update("title", v)}
            placeholder="e.g. Introduction to Quadratic Equations"
          />
          <TextArea
            label="Description"
            value={form.description}
            onChange={(v) => update("description", v)}
            placeholder="A short summary of what this resource covers"
          />
          <div className="grid grid-cols-2 gap-4">
            <TextField
              label="Author"
              value={form.author}
              onChange={(v) => update("author", v)}
              placeholder="e.g. Tom Teacher"
            />
            <TextField
              label="Keywords"
              value={form.keywords}
              onChange={(v) => update("keywords", v)}
              placeholder="comma, separated, tags"
              hint="Used by Smart Search to help learners find this resource."
            />
          </div>
        </Card>

        <Card className="p-5 space-y-4">
          <h2 className="font-display font-semibold text-ink-800">Curriculum placement</h2>
          <CurriculumSelector
            value={form.curriculum}
            onChange={(v) => update("curriculum", v)}
          />
        </Card>

        <Card className="p-5 space-y-4">
          <h2 className="font-display font-semibold text-ink-800">File details</h2>
          <div className="grid grid-cols-3 gap-4">
            <Select
              label="Resource Type"
              value={form.resource_type}
              onChange={(v) => update("resource_type", v)}
              options={RESOURCE_TYPE_OPTIONS}
              placeholder="Select type..."
            />
            <Select
              label="Language"
              value={form.language}
              onChange={(v) => update("language", v)}
              options={LANGUAGE_OPTIONS}
            />
            <Select
              label="Difficulty"
              value={form.difficulty_level}
              onChange={(v) => update("difficulty_level", v)}
              options={DIFFICULTY_OPTIONS}
              placeholder="Not set"
            />
          </div>
          <FileDropzone file={file} onChange={setFile} required />
        </Card>

        <div className="flex justify-end gap-3">
          <Button variant="ghost" type="button" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button type="submit" disabled={submitting} icon={UploadCloud}>
            {submitting ? "Uploading..." : "Upload Resource"}
          </Button>
        </div>
      </form>
    </div>
  );
}
