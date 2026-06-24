/**
 * utils/resourceTypes.js
 *
 * Central mapping of resource_type -> icon + "spine color", used by the
 * ResourceCard shelf motif (a colored tab on the left edge of each card,
 * like a labeled spine on a bookshelf) and elsewhere a quick visual type
 * cue is useful.
 */
import {
  FileText,
  FileSpreadsheet,
  Presentation,
  Video,
  Music,
  Image as ImageIcon,
  ClipboardList,
  FlaskConical,
  HelpCircle,
  File,
  Calculator,
  Dna,
  FlaskRound,
  MonitorSmartphone,
  Globe2,
  BookOpenText,
  GraduationCap,
} from "lucide-react";

export const RESOURCE_TYPE_META = {
  PDF: { label: "PDF Document", icon: FileText, spine: "bg-clay-500" },
  DOCX: { label: "Word Document", icon: FileText, spine: "bg-ink-500" },
  PPTX: { label: "Presentation", icon: Presentation, spine: "bg-gold-500" },
  XLSX: { label: "Spreadsheet", icon: FileSpreadsheet, spine: "bg-leaf-500" },
  VIDEO: { label: "Video", icon: Video, spine: "bg-clay-600" },
  AUDIO: { label: "Audio Lesson", icon: Music, spine: "bg-ink-300" },
  IMAGE: { label: "Image / Diagram", icon: ImageIcon, spine: "bg-gold-300" },
  PAST_PAPER: { label: "Past Paper", icon: ClipboardList, spine: "bg-clay-700" },
  SIMULATION: { label: "Simulation", icon: FlaskConical, spine: "bg-leaf-300" },
  QUIZ: { label: "Quiz", icon: HelpCircle, spine: "bg-gold-600" },
  OTHER: { label: "Other", icon: File, spine: "bg-ink-300" },
};

export function getResourceTypeMeta(type) {
  return RESOURCE_TYPE_META[type] || RESOURCE_TYPE_META.OTHER;
}

export function formatFileSize(bytes) {
  if (!bytes || bytes === 0) return "—";
  const units = ["B", "KB", "MB", "GB"];
  let size = bytes;
  let unitIndex = 0;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }
  return `${size.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

export function formatDuration(seconds) {
  if (!seconds) return null;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export const LANGUAGE_LABELS = {
  ENGLISH: "English",
  LUGANDA: "Luganda",
  KISWAHILI: "Kiswahili",
  ATESO: "Ateso",
  RUNYANKOLE: "Runyankole",
};

/**
 * Subject icon + color mapping for the dashboard's subject tile grid.
 * Keyed by subject name (case-insensitive match) so it works directly
 * against whatever Subjects exist in the database — no subject IDs
 * hardcoded here. Falls back to a generic graduation-cap icon for any
 * subject not in this list (e.g. once the real NCDC subject list is seeded).
 */
const SUBJECT_ICON_MAP = {
  mathematics: { icon: Calculator, color: "text-clay-500" },
  maths: { icon: Calculator, color: "text-clay-500" },
  biology: { icon: Dna, color: "text-leaf-500" },
  chemistry: { icon: FlaskRound, color: "text-clay-600" },
  ict: { icon: MonitorSmartphone, color: "text-ink-600" },
  "computer studies": { icon: MonitorSmartphone, color: "text-ink-600" },
  geography: { icon: Globe2, color: "text-leaf-600" },
  english: { icon: BookOpenText, color: "text-gold-600" },
};

export function getSubjectIconMeta(subjectName) {
  const key = (subjectName || "").trim().toLowerCase();
  return SUBJECT_ICON_MAP[key] || { icon: GraduationCap, color: "text-ink-500" };
}
