/**
 * pages/coordinator/CurriculumManagementPage.jsx
 *
 * Lets Coordinators/Admins "organize subjects" — add Subjects and Topics
 * to the curriculum tree. Kept intentionally simple for the MVP: a flat
 * list with quick-add forms rather than a full drag-and-drop tree editor.
 */
import { useEffect, useState } from "react";
import { FolderTree, Plus } from "lucide-react";
import * as curriculumApi from "../../api/curriculum";
import { Card, PageLoader } from "../../components/ui/Card";
import { TextField } from "../../components/ui/FormField";
import Select from "../../components/ui/Select";
import Button from "../../components/ui/Button";

export default function CurriculumManagementPage() {
  const [subjects, setSubjects] = useState([]);
  const [offerings, setOfferings] = useState([]);
  const [classes, setClasses] = useState([]);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);

  const [newSubjectName, setNewSubjectName] = useState("");
  const [newTopicName, setNewTopicName] = useState("");
  const [selectedOffering, setSelectedOffering] = useState("");

  useEffect(() => {
    loadAll();
  }, []);

  function loadAll() {
    setLoading(true);
    Promise.all([
      curriculumApi.listSubjects(),
      curriculumApi.listSubjectOfferings(),
      curriculumApi.listClasses(),
      curriculumApi.listTopics(),
    ]).then(([s, o, c, t]) => {
      setSubjects(s);
      setOfferings(o);
      setClasses(c);
      setTopics(t);
      setLoading(false);
    });
  }

  async function handleAddSubject(e) {
    e.preventDefault();
    if (!newSubjectName.trim()) return;
    await curriculumApi.createSubject({ name: newSubjectName.trim() });
    setNewSubjectName("");
    loadAll();
  }

  async function handleAddTopic(e) {
    e.preventDefault();
    if (!newTopicName.trim() || !selectedOffering) return;
    await curriculumApi.createTopic({
      subject_offering: selectedOffering,
      name: newTopicName.trim(),
    });
    setNewTopicName("");
    loadAll();
  }

  if (loading) return <PageLoader />;

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold text-ink-800 flex items-center gap-2">
          <FolderTree size={24} className="text-clay-500" /> Manage Curriculum
        </h1>
        <p className="text-ink-500 text-sm mt-1">
          Organize Subjects and Topics used to file resources across the library.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card className="p-5">
          <h2 className="font-display font-semibold text-ink-800 mb-4">Subjects</h2>
          <form onSubmit={handleAddSubject} className="flex gap-2 mb-4">
            <TextField
              value={newSubjectName}
              onChange={setNewSubjectName}
              placeholder="New subject name"
              className="flex-1"
            />
            <Button type="submit" icon={Plus} size="md">
              Add
            </Button>
          </form>
          <div className="space-y-1.5 max-h-80 overflow-y-auto">
            {subjects.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between px-3 py-2 bg-ink-50 rounded-card text-sm"
              >
                <span className="text-ink-700 font-medium">{s.name}</span>
                {s.coordinator_name && (
                  <span className="text-xs text-ink-500">{s.coordinator_name}</span>
                )}
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="font-display font-semibold text-ink-800 mb-4">Topics</h2>
          <form onSubmit={handleAddTopic} className="space-y-2 mb-4">
            <Select
              value={selectedOffering}
              onChange={setSelectedOffering}
              options={offerings.map((o) => ({
                value: o.id,
                label: `${o.subject_name} (${o.class_name})`,
              }))}
              placeholder="Select subject + class..."
            />
            <div className="flex gap-2">
              <TextField
                value={newTopicName}
                onChange={setNewTopicName}
                placeholder="New topic name"
                className="flex-1"
              />
              <Button type="submit" icon={Plus} size="md" disabled={!selectedOffering}>
                Add
              </Button>
            </div>
          </form>
          <div className="space-y-1.5 max-h-72 overflow-y-auto">
            {topics.map((t) => (
              <div key={t.id} className="px-3 py-2 bg-ink-50 rounded-card text-sm">
                <span className="text-ink-700 font-medium">{t.name}</span>
                <span className="text-xs text-ink-500 ml-2">
                  {t.subject_name} · {t.class_name}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
