/**
 * components/curriculum/CurriculumSelector.jsx
 *
 * Cascading Education Level > Class > Subject > Topic > Subtopic selector,
 * used on the upload/edit form so a Teacher can place a resource correctly
 * in the curriculum tree without needing to know internal IDs.
 */
import { useEffect, useState } from "react";
import * as curriculumApi from "../../api/curriculum";
import Select from "../ui/Select";

export default function CurriculumSelector({ value, onChange }) {
  // value = { topic, subtopic } — the two fields actually stored on Resource.
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [offerings, setOfferings] = useState([]);
  const [topics, setTopics] = useState([]);
  const [subtopics, setSubtopics] = useState([]);

  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedOffering, setSelectedOffering] = useState("");

  useEffect(() => {
    Promise.all([curriculumApi.listClasses(), curriculumApi.listSubjects()]).then(
      ([classList, subjectList]) => {
        setClasses(classList);
        setSubjects(subjectList);
      }
    );
  }, []);

  useEffect(() => {
    if (!selectedClass || !selectedSubject) {
      setOfferings([]);
      return;
    }
    curriculumApi
      .listSubjectOfferings({ school_class: selectedClass, subject: selectedSubject })
      .then((result) => {
        setOfferings(result);
        if (result.length === 1) setSelectedOffering(String(result[0].id));
      });
  }, [selectedClass, selectedSubject]);

  useEffect(() => {
    if (!selectedOffering) {
      setTopics([]);
      return;
    }
    curriculumApi.listTopics({ subject_offering: selectedOffering }).then(setTopics);
  }, [selectedOffering]);

  useEffect(() => {
    if (!value?.topic) {
      setSubtopics([]);
      return;
    }
    curriculumApi.listSubtopics({ topic: value.topic }).then(setSubtopics);
  }, [value?.topic]);

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      <Select
        label="Class"
        value={selectedClass}
        onChange={setSelectedClass}
        options={classes.map((c) => ({ value: c.id, label: c.name }))}
      />
      <Select
        label="Subject"
        value={selectedSubject}
        onChange={setSelectedSubject}
        options={subjects.map((s) => ({ value: s.id, label: s.name }))}
      />
      <Select
        label="Topic"
        value={value?.topic || ""}
        onChange={(v) => onChange({ topic: v, subtopic: "" })}
        options={topics.map((t) => ({ value: t.id, label: t.name }))}
      />
      <Select
        label="Subtopic (optional)"
        value={value?.subtopic || ""}
        onChange={(v) => onChange({ ...value, subtopic: v })}
        options={subtopics.map((s) => ({ value: s.id, label: s.name }))}
      />
    </div>
  );
}
