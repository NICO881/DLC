/**
 * hooks/useCurriculum.js
 *
 * Loads the curriculum hierarchy needed to populate Smart Search filters
 * (Class, Subject, Topic) without every page re-fetching independently.
 */
import { useEffect, useState } from "react";
import * as curriculumApi from "../api/curriculum";

export function useCurriculum() {
  const [educationLevels, setEducationLevels] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [levels, classList, subjectList] = await Promise.all([
          curriculumApi.listEducationLevels(),
          curriculumApi.listClasses(),
          curriculumApi.listSubjects(),
        ]);
        if (cancelled) return;
        setEducationLevels(levels);
        setClasses(classList);
        setSubjects(subjectList);
      } catch (err) {
        console.error("Failed to load curriculum data", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  async function loadTopicsForOffering(offeringId) {
    if (!offeringId) {
      setTopics([]);
      return;
    }
    const result = await curriculumApi.listTopics({ subject_offering: offeringId });
    setTopics(result);
  }

  return { educationLevels, classes, subjects, topics, loadTopicsForOffering, loading };
}
