/**
 * pages/teacher/ShareResourcePage.jsx
 *
 * Resource Sharing: Teachers can share with Classes, Schools, or Individual learners.
 */
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Share2 } from "lucide-react";
import * as resourcesApi from "../../api/resources";
import * as interactionsApi from "../../api/interactions";
import * as curriculumApi from "../../api/curriculum";
import { Card, PageLoader } from "../../components/ui/Card";
import Select from "../../components/ui/Select";
import { TextField } from "../../components/ui/FormField";
import Button from "../../components/ui/Button";

const TARGET_OPTIONS = [
  { value: "INDIVIDUAL", label: "Individual Learner" },
  { value: "CLASS", label: "A Class" },
  { value: "SCHOOL", label: "Whole School" },
];

export default function ShareResourcePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [resource, setResource] = useState(null);
  const [classes, setClasses] = useState([]);
  const [targetType, setTargetType] = useState("CLASS");
  const [targetClass, setTargetClass] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    Promise.all([resourcesApi.getResource(id), curriculumApi.listClasses()]).then(
      ([res, classList]) => {
        setResource(res);
        setClasses(classList);
      }
    );
  }, [id]);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await interactionsApi.shareResource({
        resource: id,
        target_type: targetType,
        target_class: targetType === "CLASS" ? targetClass : undefined,
        note,
      });
      setDone(true);
      setTimeout(() => navigate(`/resources/${id}`), 1200);
    } finally {
      setSubmitting(false);
    }
  }

  if (!resource) return <PageLoader />;

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="font-display text-2xl font-semibold text-ink-800 flex items-center gap-2 mb-1">
        <Share2 size={22} className="text-clay-500" /> Share Resource
      </h1>
      <p className="text-ink-500 text-sm mb-6">"{resource.title}"</p>

      {done ? (
        <div className="bg-leaf-50 text-leaf-600 rounded-card px-4 py-3 text-sm font-medium">
          Shared successfully.
        </div>
      ) : (
        <Card className="p-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Select
              label="Share with"
              value={targetType}
              onChange={setTargetType}
              options={TARGET_OPTIONS}
              placeholder={null}
            />
            {targetType === "CLASS" && (
              <Select
                label="Choose class"
                value={targetClass}
                onChange={setTargetClass}
                options={classes.map((c) => ({ value: c.id, label: c.name }))}
              />
            )}
            <TextField
              label="Note (optional)"
              value={note}
              onChange={setNote}
              placeholder="e.g. Please review before Friday's class"
            />
            <Button type="submit" disabled={submitting} className="w-full">
              {submitting ? "Sharing..." : "Share Resource"}
            </Button>
          </form>
        </Card>
      )}
    </div>
  );
}
