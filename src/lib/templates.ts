/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Activity,
  CalendarDays,
  Compass,
  GraduationCap,
  Lightbulb,
  ListChecks,
  Repeat2,
  type LucideIcon,
} from "lucide-react"

import { createId } from "@/lib/id"
import type { KanvasEdge, KanvasNode, NodeStyle, TemplateId } from "@/types/board"

export type BoardTemplate = {
  id: Exclude<TemplateId, "blank">
  name: string
  boardTitle: string
  description: string
  icon: LucideIcon
  tint: string
  swatch: string
  bar: string
}

export const TEMPLATES: BoardTemplate[] = [
  {
    id: "dei",
    name: "Dei Learning Plan",
    boardTitle: "Dei Learning Plan",
    description: "Bento roadmap cards, pharmacology audio lecture, and scheduled events stack.",
    icon: GraduationCap,
    tint: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300",
    swatch: "bg-emerald-200",
    bar: "bg-emerald-400",
  },
  {
    id: "cardiology",
    name: "Cardiology Dynamics",
    boardTitle: "Cardiology Dynamics",
    description: "Patient clinical vitals, medication timeline, dynamic BP curves & ECG wave.",
    icon: Activity,
    tint: "bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-300",
    swatch: "bg-rose-200",
    bar: "bg-rose-400",
  },
  {
    id: "uxflow",
    name: "UX Flow Architecture",
    boardTitle: "UX Signup Flow",
    description: "Signup decision branches, workspace forms, and connected dialog architecture.",
    icon: Compass,
    tint: "bg-sky-100 text-sky-800 dark:bg-sky-500/20 dark:text-sky-300",
    swatch: "bg-sky-200",
    bar: "bg-sky-400",
  },
  {
    id: "brainstorm",
    name: "Brainstorm",
    boardTitle: "Brainstorm",
    description: "Dump every idea first. Sort the keepers after.",
    icon: Lightbulb,
    tint: "bg-amber-100 text-amber-800 dark:bg-amber-400/15 dark:text-amber-300",
    swatch: "bg-amber-200",
    bar: "bg-amber-400",
  },
  {
    id: "project",
    name: "Project plan",
    boardTitle: "Project plan",
    description: "Break the work down, set owners, track checklist tasks.",
    icon: ListChecks,
    tint: "bg-indigo-100 text-indigo-800 dark:bg-indigo-400/15 dark:text-indigo-300",
    swatch: "bg-indigo-200",
    bar: "bg-indigo-400",
  },
  {
    id: "weekly",
    name: "Weekly plan",
    boardTitle: "Weekly plan",
    description: "Map Monday, Wednesday, and Friday goals.",
    icon: CalendarDays,
    tint: "bg-teal-100 text-teal-800 dark:bg-teal-400/15 dark:text-teal-300",
    swatch: "bg-teal-200",
    bar: "bg-teal-400",
  },
  {
    id: "retro",
    name: "Retrospective",
    boardTitle: "Retro",
    description: "Went well, to improve, and action items.",
    icon: Repeat2,
    tint: "bg-purple-100 text-purple-800 dark:bg-purple-400/15 dark:text-purple-300",
    swatch: "bg-purple-200",
    bar: "bg-purple-400",
  },
]

const NOTE_STYLE_BUTTER: NodeStyle = {
  fill: "#fef9c3",
  stroke: "#fde047",
  text: "#713f12",
  fontSize: 14,
}
const NOTE_STYLE_LILAC: NodeStyle = {
  fill: "#f3e8ff",
  stroke: "#d8b4fe",
  text: "#581c87",
  fontSize: 14,
}
const NOTE_STYLE_MINT: NodeStyle = {
  fill: "#ecfdf5",
  stroke: "#a7f3d0",
  text: "#065f46",
  fontSize: 14,
}
const NOTE_STYLE_SKY: NodeStyle = {
  fill: "#f0f9ff",
  stroke: "#bae6fd",
  text: "#0369a1",
  fontSize: 14,
}

const FRAME_STYLE: NodeStyle = {
  fill: "rgba(148,163,184,0.06)",
  stroke: "#94a3b8",
  text: "var(--foreground)",
  fontSize: 12,
}
const TASK_STYLE: NodeStyle = {
  fill: "#ffffff",
  stroke: "#e2e8f0",
  text: "#0f172a",
  fontSize: 13,
}

function note(
  id: string,
  text: string,
  x: number,
  y: number,
  w = 220,
  h = 140,
  style = NOTE_STYLE_BUTTER,
  tag = "Note",
): KanvasNode {
  return {
    id,
    type: "note",
    position: { x, y },
    size: { width: w, height: h },
    style,
    data: { text, tag },
  }
}

function frame(id: string, title: string, x: number, y: number, w = 360, h = 260): KanvasNode {
  return {
    id,
    type: "frame",
    position: { x, y },
    size: { width: w, height: h },
    style: FRAME_STYLE,
    data: { title },
  }
}

function task(
  id: string,
  title: string,
  items: { id: string; text: string; done: boolean }[],
  x: number,
  y: number,
  w = 260,
  h = 190,
): KanvasNode {
  return {
    id,
    type: "task",
    position: { x, y },
    size: { width: w, height: h },
    style: TASK_STYLE,
    data: { title, items },
  }
}

export function seedDeiLearningPlan(): { nodes: KanvasNode[]; edges: any[] } {
  const nid1 = "dei_roadmap_1"
  const nid2 = "dei_roadmap_2"
  const nid3 = "dei_roadmap_3"
  const nid4 = "dei_roadmap_4"
  const nidMedia = "dei_media_pharma"
  const nidEvt1 = "dei_event_webinar"
  const nidEvt2 = "dei_event_lesson"
  const nidEvt3 = "dei_event_task1"
  const nidEvt4 = "dei_event_task2"

  const nodes: KanvasNode[] = [
    // 1. Roadmap: Medical Terminology (Top Left)
    {
      id: nid1,
      type: "note",
      position: { x: -390, y: 115 },
      size: { width: 290, height: 165 },
      style: { fill: "#ffffff", stroke: "#e2e8f0", text: "#0f172a", fontSize: 14 },
      data: {
        title: "Medical Terminology",
        subtitle: "Learn basic medical language for effective communication.",
        text: "Learn basic medical language for effective communication.",
        status: "Completed",
        badgeIcon: "+",
        tag: "Roadmap",
      },
    },

    // 2. Media Course: Pharmacology Basics (Tilted Lilac Bento Card)
    {
      id: nidMedia,
      type: "note",
      position: { x: -445, y: 320 },
      size: { width: 325, height: 195 },
      rotation: -8,
      style: { fill: "#f3e8ff", stroke: "#d8b4fe", text: "#581c87", fontSize: 13 },
      data: {
        title: "Pharmacology Basics",
        subtitle: "Learn basic medical language for effective communication.",
        text: "Learn basic medical language for effective communication.",
        isMedia: true,
        duration: "00:30",
        avatars: ["ET", "AS", "MR"],
        tag: "Media",
      },
    },

    // 3. Roadmap: Anatomy and Physiology (Center Top)
    {
      id: nid2,
      type: "note",
      position: { x: -20, y: 185 },
      size: { width: 290, height: 165 },
      style: { fill: "#ffffff", stroke: "#e2e8f0", text: "#0f172a", fontSize: 14 },
      data: {
        title: "Anatomy and Physiology",
        subtitle: "Understand the structure and function of the human body.",
        text: "Understand the structure and function of the human body.",
        status: "Completed",
        badgeIcon: "01",
        tag: "Roadmap",
      },
    },

    // 4. Roadmap: Medical Ethics and Professionalism (Center Bottom)
    {
      id: nid3,
      type: "note",
      position: { x: -20, y: 420 },
      size: { width: 300, height: 165 },
      style: { fill: "#ffffff", stroke: "#e2e8f0", text: "#0f172a", fontSize: 14 },
      data: {
        title: "Medical Ethics and Professionalism",
        subtitle: "Understand ethical principles and professionalism in healthcare.",
        text: "Understand ethical principles and professionalism in healthcare.",
        status: "Upcoming",
        badgeIcon: "02",
        tag: "Roadmap",
      },
    },

    // 5. Roadmap: Disease Pathophysiology (Bottom Left)
    {
      id: nid4,
      type: "note",
      position: { x: -390, y: 570 },
      size: { width: 290, height: 165 },
      style: { fill: "#ffffff", stroke: "#e2e8f0", text: "#0f172a", fontSize: 14 },
      data: {
        title: "Disease Pathophysiology",
        subtitle: "Study the cellular and molecular basis of common diseases.",
        text: "Study the cellular and molecular basis of common diseases.",
        status: "Upcoming",
        badgeIcon: "03",
        tag: "Roadmap",
      },
    },

    // 6. Event: Webinar (Cyan Card)
    {
      id: nidEvt1,
      type: "note",
      position: { x: 350, y: 115 },
      size: { width: 290, height: 175 },
      style: { fill: "#e0f2fe", stroke: "#7dd3fc", text: "#0369a1", fontSize: 13 },
      data: {
        category: "Webinar",
        date: "Tu, 25.03",
        time: "Start at 12:30",
        text: "Understanding medical research, critical appraisal skills, and applying evidence-based guidelines in practice",
        tag: "Webinar",
      },
    },

    // 7. Event: Lesson (Lilac Card)
    {
      id: nidEvt2,
      type: "note",
      position: { x: 350, y: 320 },
      size: { width: 290, height: 150 },
      style: { fill: "#f3e8ff", stroke: "#d8b4fe", text: "#581c87", fontSize: 13 },
      data: {
        category: "Lesson",
        date: "We, 26.03",
        text: "Overview of healthcare delivery systems, health policy, and their impact on patient care.",
        tag: "Lesson",
      },
    },

    // 8. Event: Task (Butter Card)
    {
      id: nidEvt3,
      type: "note",
      position: { x: 350, y: 500 },
      size: { width: 290, height: 160 },
      style: { fill: "#fef3c7", stroke: "#fcd34d", text: "#78350f", fontSize: 13 },
      data: {
        category: "Task",
        date: "Th, 27.03",
        text: "Examination of major global health issues, including infectious diseases, non-communicable diseases, and healthcare disparities.",
        tag: "Task",
      },
    },

    // 9. Event: Task (Mint Card)
    {
      id: nidEvt4,
      type: "note",
      position: { x: 350, y: 690 },
      size: { width: 290, height: 150 },
      rotation: 2,
      style: { fill: "#ecfdf5", stroke: "#6ee7b7", text: "#065f46", fontSize: 13 },
      data: {
        category: "Task",
        date: "Fr, 28.03",
        text: "Importance of teamwork and communication among healthcare professionals for optimal patient outcomes.",
        tag: "Task",
      },
    },
  ]

  const edges = [
    {
      id: "edge_roadmap_1_2",
      source: nid1,
      target: nid2,
      type: "smoothstep",
      color: "#10b981",
    },
    {
      id: "edge_roadmap_2_3",
      source: nid2,
      target: nid3,
      type: "smoothstep",
      color: "#10b981",
    },
    {
      id: "edge_roadmap_3_4",
      source: nid3,
      target: nid4,
      type: "smoothstep",
      color: "#10b981",
    },
    {
      id: "edge_roadmap_1_media",
      source: nid1,
      target: nidMedia,
      type: "smoothstep",
      color: "#10b981",
    },
  ]

  return { nodes, edges }
}

export function seedCardiologyDynamics(): { nodes: KanvasNode[]; edges: any[] } {
  const nidPatient = "cardio_patient"
  const nidAugPill = "cardio_aug_aspirin"
  const nidAugBP = "cardio_aug_bp"
  const nidAugSymptoms = "cardio_aug_symptoms"
  const nidSepPill1 = "cardio_sep_bisoprolol"
  const nidSepPill2 = "cardio_sep_aspirin"
  const nidSepBP = "cardio_sep_bp"
  const nidSepECG = "cardio_sep_ecg"
  const nidScrubber = "cardio_scrubber"

  const nodes: KanvasNode[] = [
    {
      id: nidPatient,
      type: "note",
      position: { x: -360, y: 110 },
      size: { width: 740, height: 135 },
      style: { fill: "#ffffff", stroke: "#e2e8f0", text: "#0f172a", fontSize: 13 },
      data: {
        isClinical: true,
        patient: { name: "Tiffany Woodward", age: 24, gender: "Female" },
        diagnosis: "Hypertension",
        vitals: { hr: "89 bpm", bp: "100/67", o2: "98%", temp: "36.8°C" },
        tag: "Vitals",
      },
    },
    {
      id: nidAugPill,
      type: "note",
      position: { x: -280, y: 285 },
      size: { width: 160, height: 46 },
      style: { fill: "#334155", stroke: "#1e293b", text: "#f8fafc", fontSize: 12 },
      data: {
        title: "Aspirin x2",
        isMedication: true,
        tag: "Medication",
      },
    },
    {
      id: nidAugBP,
      type: "note",
      position: { x: -90, y: 285 },
      size: { width: 240, height: 155 },
      style: { fill: "#ffffff", stroke: "#e2e8f0", text: "#0f172a", fontSize: 13 },
      data: {
        title: "Blood Pressure",
        subtitle: "Friday — Average: 160 / 80",
        chartType: "bp",
        chartValue: "160 / 80",
        chartDelta: "+10",
        tag: "Dynamics",
      },
    },
    {
      id: nidAugSymptoms,
      type: "note",
      position: { x: -90, y: 470 },
      size: { width: 240, height: 155 },
      style: { fill: "#ffffff", stroke: "#e2e8f0", text: "#0f172a", fontSize: 13 },
      data: {
        title: "Symptoms",
        subtitle: "Headache reported at office visit",
        isSymptoms: true,
        tag: "Symptom",
      },
    },
    {
      id: nidSepPill1,
      type: "note",
      position: { x: 190, y: 285 },
      size: { width: 160, height: 46 },
      style: { fill: "#334155", stroke: "#1e293b", text: "#f8fafc", fontSize: 12 },
      data: {
        title: "Bisoprolol x3",
        isMedication: true,
        tag: "Medication",
      },
    },
    {
      id: nidSepPill2,
      type: "note",
      position: { x: 190, y: 345 },
      size: { width: 160, height: 46 },
      style: { fill: "#334155", stroke: "#1e293b", text: "#f8fafc", fontSize: 12 },
      data: {
        title: "Aspirin x2",
        isMedication: true,
        tag: "Medication",
      },
    },
    {
      id: nidSepBP,
      type: "note",
      position: { x: 380, y: 285 },
      size: { width: 240, height: 155 },
      style: { fill: "#ffffff", stroke: "#e2e8f0", text: "#0f172a", fontSize: 13 },
      data: {
        title: "Blood Pressure",
        subtitle: "Thursday — Average: 130 / 70",
        chartType: "bp",
        chartValue: "130 / 70",
        chartDelta: "-20",
        tag: "Dynamics",
      },
    },
    {
      id: nidSepECG,
      type: "note",
      position: { x: 380, y: 470 },
      size: { width: 240, height: 155 },
      style: { fill: "#ffffff", stroke: "#e2e8f0", text: "#0f172a", fontSize: 13 },
      data: {
        title: "ECG",
        subtitle: "Normal Sinus Rhythm",
        chartType: "ecg",
        tag: "Cardiac",
      },
    },
    {
      id: nidScrubber,
      type: "note",
      position: { x: -360, y: 655 },
      size: { width: 740, height: 48 },
      style: { fill: "#ffffff", stroke: "#e2e8f0", text: "#0f172a", fontSize: 12 },
      data: {
        isScrubber: true,
        tag: "Timeline",
      },
    },
  ]

  const edges = [
    { id: "e_c1", source: nidAugPill, target: nidAugBP, type: "smoothstep", color: "#10b981" },
    { id: "e_c2", source: nidAugBP, target: nidAugSymptoms, type: "smoothstep", color: "#10b981" },
    { id: "e_c3", source: nidSepPill1, target: nidSepBP, type: "smoothstep", color: "#10b981" },
    { id: "e_c4", source: nidSepPill2, target: nidSepBP, type: "smoothstep", color: "#10b981" },
    { id: "e_c5", source: nidSepBP, target: nidSepECG, type: "smoothstep", color: "#10b981" },
  ]

  return { nodes, edges }
}

export function seedUXFlowArchitecture(): { nodes: KanvasNode[]; edges: any[] } {
  const nidStart = "ux_signup_example"
  const nidForm1 = "ux_company_workspace"
  const nidForm2 = "ux_join_workspace"
  const nidFound = "ux_email_found"

  const nodes: KanvasNode[] = [
    {
      id: nidStart,
      type: "note",
      position: { x: 20, y: 115 },
      size: { width: 200, height: 48 },
      style: { fill: "#eff6ff", stroke: "#93c5fd", text: "#1e40af", fontSize: 14 },
      data: {
        title: "Sign up example",
        tag: "Flow Start",
      },
    },
    {
      id: nidForm1,
      type: "note",
      position: { x: -260, y: 195 },
      size: { width: 280, height: 410 },
      style: { fill: "#ffffff", stroke: "#e2e8f0", text: "#0f172a", fontSize: 13 },
      data: {
        title: "Create a company workspace",
        subtitle: "Personal info",
        isForm: true,
        formFields: [
          "Name",
          "Surname",
          "Email",
          "Phone number",
          "Password",
          "Sign up button",
          "Sign up with Google",
          "Sign up with Facebook",
        ],
        tag: "Form",
      },
    },
    {
      id: nidForm2,
      type: "note",
      position: { x: 160, y: 195 },
      size: { width: 260, height: 180 },
      style: { fill: "#ffffff", stroke: "#e2e8f0", text: "#0f172a", fontSize: 13 },
      data: {
        title: "Join your company workspace",
        subtitle: "Personal info",
        isForm: true,
        formFields: ["E-mail", "Join"],
        tag: "Form",
      },
    },
    {
      id: nidFound,
      type: "note",
      position: { x: 160, y: 415 },
      size: { width: 260, height: 160 },
      style: { fill: "#ffffff", stroke: "#e2e8f0", text: "#0f172a", fontSize: 13 },
      data: {
        title: "Email is found",
        subtitle: "Instructions",
        isForm: true,
        formFields: ["Resend the link"],
        tag: "Dialog",
      },
    },
  ]

  const edges = [
    { id: "e_ux_1", source: nidStart, target: nidForm1, type: "bezier", color: "#3b82f6" },
    { id: "e_ux_2", source: nidStart, target: nidForm2, type: "bezier", color: "#3b82f6" },
    { id: "e_ux_3", source: nidForm2, target: nidFound, type: "bezier", color: "#3b82f6" },
  ]

  return { nodes, edges }
}

export function seedNodesForTemplate(templateId: TemplateId): KanvasNode[] {
  const nid = () => createId("node")

  switch (templateId) {
    case "blank":
      return []
    case "dei":
      return seedDeiLearningPlan().nodes
    case "cardiology":
      return seedCardiologyDynamics().nodes
    case "uxflow":
      return seedUXFlowArchitecture().nodes
    case "brainstorm":
      return [
        frame(nid(), "Ideas", -280, -200, 580, 380),
        note(
          nid(),
          "Interactive visual learning cards",
          -240,
          -140,
          220,
          140,
          NOTE_STYLE_LILAC,
          "Idea",
        ),
        note(
          nid(),
          "Instant contrast & pastel palettes",
          -240,
          40,
          220,
          140,
          NOTE_STYLE_MINT,
          "Plan",
        ),
        note(
          nid(),
          "Offline-first IndexedDB persistence",
          20,
          -140,
          220,
          140,
          NOTE_STYLE_BUTTER,
          "Note",
        ),
        note(
          nid(),
          "Bento style dashboard & floating dock",
          20,
          40,
          220,
          140,
          NOTE_STYLE_SKY,
          "Urgent",
        ),
      ]
    case "project":
      return [
        frame(nid(), "Now", -320, -200, 300, 340),
        frame(nid(), "Next", 20, -200, 300, 340),
        frame(nid(), "Later", 360, -200, 300, 340),
        task(
          nid(),
          "Sprint Goals",
          [
            { id: createId("task_item"), text: "Design Bento Dock", done: true },
            { id: createId("task_item"), text: "Viewport & Zoom controls", done: true },
            { id: createId("task_item"), text: "WCAG contrast verification", done: false },
          ],
          -300,
          -140,
          260,
          190,
        ),
      ]
    case "weekly":
      return [
        frame(nid(), "Monday", -320, -180, 250, 240),
        frame(nid(), "Wednesday", -50, -180, 250, 240),
        frame(nid(), "Friday", 220, -180, 250, 240),
        note(nid(), "Weekly kick-off & goals", -300, -120, 210, 130, NOTE_STYLE_BUTTER, "Plan"),
        note(nid(), "Mid-week prototype review", -30, -120, 210, 130, NOTE_STYLE_LILAC, "Task"),
        note(nid(), "Ship release & demo", 240, -120, 210, 130, NOTE_STYLE_MINT, "Urgent"),
      ]
    case "retro":
      return [
        frame(nid(), "Went well", -320, -180, 280, 280),
        frame(nid(), "To improve", -20, -180, 280, 280),
        frame(nid(), "Action items", 280, -180, 280, 280),
        note(nid(), "Fast releases & bento docks", -290, -120, 220, 120, NOTE_STYLE_MINT, "Idea"),
        note(
          nid(),
          "Ensure all contrast is AA compliant",
          10,
          -120,
          220,
          120,
          NOTE_STYLE_BUTTER,
          "Task",
        ),
        note(nid(), "Write docs with visual guide", 310, -120, 220, 120, NOTE_STYLE_SKY, "Plan"),
      ]
    default:
      return []
  }
}

export function seedEdgesForTemplate(templateId: TemplateId): KanvasEdge[] {
  switch (templateId) {
    case "blank":
      return []
    case "dei":
      return seedDeiLearningPlan().edges
    case "cardiology":
      return seedCardiologyDynamics().edges
    case "uxflow":
      return seedUXFlowArchitecture().edges
    default:
      return []
  }
}
