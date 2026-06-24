/**
 * api/curriculum.js
 */
import client from "./client";

export async function listEducationLevels() {
  const { data } = await client.get("/education-levels/");
  return data.results ?? data;
}

export async function listClasses(params = {}) {
  const { data } = await client.get("/classes/", { params });
  return data.results ?? data;
}

export async function listSubjects(params = {}) {
  const { data } = await client.get("/subjects/", { params });
  return data.results ?? data;
}

export async function createSubject(payload) {
  const { data } = await client.post("/subjects/", payload);
  return data;
}

export async function listSubjectOfferings(params = {}) {
  const { data } = await client.get("/subject-offerings/", { params });
  return data.results ?? data;
}

export async function listTopics(params = {}) {
  const { data } = await client.get("/topics/", { params });
  return data.results ?? data;
}

export async function createTopic(payload) {
  const { data } = await client.post("/topics/", payload);
  return data;
}

export async function listSubtopics(params = {}) {
  const { data } = await client.get("/subtopics/", { params });
  return data.results ?? data;
}

export async function createSubtopic(payload) {
  const { data } = await client.post("/subtopics/", payload);
  return data;
}
