// Conversation engine for the widget builder.
//
// The conversation does not own the data: every answer is folded over the
// default WidgetConfig, in flow order, to derive the current config. Editing a
// past answer simply replaces it and re-derives — preview and timeline follow
// automatically. Undo/redo snapshot the answer map, never UI state.
import { useCallback, useMemo, useReducer } from "react";
import {
  defaultConfig,
  themeName,
  type ContactItem,
  type EntityCardCfg,
  type FaqItem,
  type LauncherStyle,
  type LsParam,
  type WidgetConfig,
} from "../widget/config";

export type LauncherAnswer = { style: LauncherStyle; text: string };

export type AnswerValue =
  | string
  | boolean
  | FaqItem[]
  | ContactItem[]
  | EntityCardCfg[]
  | LsParam[]
  | LauncherAnswer
  | null;

export function isLauncherAnswer(v: AnswerValue): v is LauncherAnswer {
  return typeof v === "object" && v !== null && !Array.isArray(v) && "style" in v;
}

export type StepKind =
  | "template"
  | "variant"
  | "appearance"
  | "color"
  | "background"
  | "position"
  | "text"
  | "launcher"
  | "logo"
  | "urls"
  | "mount"
  | "lsparams"
  | "toggle"
  | "faq"
  | "contacts"
  | "entities"
  | "finish";

export type StepDef = {
  id: string;
  /** Timeline milestone label. */
  label: string;
  /** Assistant message introducing the decision. */
  prompt: string;
  hint?: string;
  kind: StepKind;
  /** Steps hidden when the condition fails simply don't exist in the flow. */
  condition?: (cfg: WidgetConfig) => boolean;
  /** Folds the answer into the config. */
  apply: (cfg: WidgetConfig, value: AnswerValue) => WidgetConfig;
  /** Short human summary for the user bubble + timeline. */
  summarize: (value: AnswerValue, cfg: WidgetConfig) => string;
  skippable?: boolean;
};

export const FLOW: StepDef[] = [
  {
    id: "template",
    label: "Template",
    prompt:
      "Hi! I'm your widget designer. Let's build this together — first, which experience would you like?",
    hint: "You can change any decision later.",
    kind: "template",
    apply: (cfg, v) => ({ ...cfg, template: v === "simple" ? "simple" : "overview" }),
    summarize: (v) => (v === "simple" ? "Simple" : "Overview"),
  },
  {
    id: "variant",
    label: "Layout",
    prompt: "Nice choice. How should the widget sit on the page?",
    kind: "variant",
    apply: (cfg, v) => ({ ...cfg, variant: (v as WidgetConfig["variant"]) || cfg.variant }),
    summarize: (v) =>
      ({ classic: "Classic", bold: "Bold", docked: "Docked" })[v as string] ?? String(v),
  },
  {
    id: "appearance",
    label: "Appearance",
    prompt: "Light or dark? Watch the preview flip as you hover.",
    kind: "appearance",
    apply: (cfg, v) => ({ ...cfg, appearance: v === "dark" ? "dark" : "light" }),
    summarize: (v) => (v === "dark" ? "Dark" : "Light"),
  },
  {
    id: "theme",
    label: "Theme",
    prompt: "Now the fun part — pick your brand color.",
    hint: "The whole widget re-tints instantly.",
    kind: "color",
    apply: (cfg, v) => ({ ...cfg, theme: typeof v === "string" && v ? v : cfg.theme }),
    summarize: (v) => themeName(String(v)),
  },
  {
    id: "background",
    label: "Header style",
    prompt: "Should the header be a solid brand color, or a gradient generated from it?",
    kind: "background",
    condition: (cfg) => cfg.template === "overview",
    apply: (cfg, v) => ({ ...cfg, background: v === "solid" ? "solid" : "gradient" }),
    summarize: (v) => (v === "solid" ? "Solid" : "Gradient"),
  },
  {
    id: "position",
    label: "Position",
    prompt: "Which corner of your site should the widget live in?",
    kind: "position",
    apply: (cfg, v) => ({ ...cfg, position: v === "left" ? "left" : "right" }),
    summarize: (v) => (v === "left" ? "Bottom left" : "Bottom right"),
  },
  {
    id: "launcher",
    label: "Floating button",
    prompt: "How should the closed widget invite visitors in? Pick a button style and its text.",
    hint: "This is what people see before they open the widget.",
    kind: "launcher",
    apply: (cfg, v) =>
      isLauncherAnswer(v)
        ? { ...cfg, launcherStyle: v.style, launcherText: v.text.trim() || cfg.launcherText }
        : cfg,
    summarize: (v) =>
      isLauncherAnswer(v)
        ? v.style === "pill"
          ? `Pill · “${v.text}”`
          : `Icon + bubble · “${v.text}”`
        : "Default",
  },
  {
    id: "logo",
    label: "Logo",
    prompt: "Want to show your logo in the widget header instead of the default icon?",
    kind: "logo",
    skippable: true,
    apply: (cfg, v) => (typeof v === "string" && v ? { ...cfg, logoUrl: v } : cfg),
    summarize: (v) => (typeof v === "string" && v ? "Uploaded" : "Default icon"),
  },
  {
    id: "greeting",
    label: "Greeting",
    prompt: "What should the widget say when someone opens it?",
    hint: "Type it and watch it appear letter by letter.",
    kind: "text",
    condition: (cfg) => cfg.template === "overview",
    skippable: true,
    apply: (cfg, v) => (typeof v === "string" && v.trim() ? { ...cfg, greeting: v.trim() } : cfg),
    summarize: (v, cfg) => `“${typeof v === "string" && v.trim() ? v.trim() : cfg.greeting}”`,
  },
  {
    id: "faq",
    label: "FAQ",
    prompt:
      "Want a FAQ section on the home tab? It answers common questions before a chat even starts.",
    kind: "faq",
    condition: (cfg) => cfg.template === "overview",
    skippable: true,
    apply: (cfg, v) => {
      if (v === null || v === false) return { ...cfg, faqOn: false };
      if (Array.isArray(v)) return { ...cfg, faqOn: true, faqItems: v as FaqItem[] };
      return { ...cfg, faqOn: true };
    },
    summarize: (v) =>
      Array.isArray(v)
        ? `${v.length} question${v.length === 1 ? "" : "s"}`
        : v
          ? "Enabled"
          : "Skipped",
  },
  {
    id: "contacts",
    label: "Contact card",
    prompt: "Should visitors see a way to reach a real human?",
    kind: "contacts",
    condition: (cfg) => cfg.template === "overview",
    skippable: true,
    apply: (cfg, v) => {
      if (v === null || v === false) return { ...cfg, contactOn: false };
      if (Array.isArray(v)) return { ...cfg, contactOn: true, contacts: v as ContactItem[] };
      return { ...cfg, contactOn: true };
    },
    summarize: (v) =>
      Array.isArray(v)
        ? `${v.length} contact${v.length === 1 ? "" : "s"}`
        : v
          ? "Enabled"
          : "Skipped",
  },
  {
    id: "lsfields",
    label: "Data fields",
    prompt:
      "Does your site keep values in the browser's localStorage — like a user ID or token — that the widget should send when fetching data?",
    kind: "lsparams",
    condition: (cfg) => cfg.template === "overview",
    skippable: true,
    apply: (cfg, v) => (Array.isArray(v) ? { ...cfg, localStorageParams: v as LsParam[] } : cfg),
    summarize: (v) =>
      Array.isArray(v) && v.length > 0 ? `${v.length} field${v.length === 1 ? "" : "s"}` : "None",
  },
  {
    id: "entities",
    label: "Entity cards",
    prompt:
      "Last big one — should the widget show live data from your APIs? Orders, tickets, products…",
    kind: "entities",
    condition: (cfg) => cfg.template === "overview",
    skippable: true,
    apply: (cfg, v) => {
      if (v === null || v === false) return { ...cfg, entitiesOn: false, entities: [] };
      if (Array.isArray(v))
        return {
          ...cfg,
          entitiesOn: (v as EntityCardCfg[]).length > 0,
          entities: v as EntityCardCfg[],
        };
      return cfg;
    },
    summarize: (v) => (Array.isArray(v) ? `${v.length} added` : "Skipped"),
  },
  {
    id: "mount",
    label: "Placement",
    prompt:
      "By default the webchat floats over your page. Want it there, or rendered inside a specific element instead?",
    kind: "mount",
    // value: "root" or "element:<css-selector>"
    apply: (cfg, v) =>
      typeof v === "string" && v.startsWith("element:")
        ? { ...cfg, mountMode: "element", mountSelector: v.slice("element:".length) }
        : { ...cfg, mountMode: "root", mountSelector: "" },
    summarize: (v) =>
      typeof v === "string" && v.startsWith("element:")
        ? `Inside ${v.slice("element:".length)}`
        : "Page root (floating)",
  },
  {
    id: "urls",
    label: "Website",
    prompt: "Where should your bot appear? Paste your site URLs — separate multiple with commas.",
    kind: "urls",
    skippable: true,
    apply: (cfg, v) => (typeof v === "string" && v.trim() ? { ...cfg, siteUrls: v.trim() } : cfg),
    summarize: (v) => {
      if (typeof v !== "string" || !v.trim()) return "All pages";
      const n = v.split(",").filter((s) => s.trim()).length;
      return n === 1 ? v.trim() : `${n} URLs`;
    },
  },
  {
    id: "finish",
    label: "Publish",
    prompt: "That's everything! Here's your finished widget.",
    kind: "finish",
    apply: (cfg) => cfg,
    summarize: () => "Ready",
  },
];

// ---------- state ----------
type Answers = Record<string, AnswerValue>;

type BuilderState = {
  answers: Answers;
  past: Answers[];
  future: Answers[];
  /** Step currently reopened for editing (null = tip of the flow). */
  editing: string | null;
};

type Action =
  | { type: "answer"; stepId: string; value: AnswerValue }
  | { type: "edit"; stepId: string }
  | { type: "cancelEdit" }
  | { type: "undo" }
  | { type: "redo" }
  | { type: "restart" };

export function deriveConfig(answers: Answers): WidgetConfig {
  let cfg = defaultConfig();
  for (const step of FLOW) {
    if (step.condition && !step.condition(cfg)) continue;
    if (step.id in answers) cfg = step.apply(cfg, answers[step.id]);
  }
  return cfg;
}

export function visibleSteps(cfg: WidgetConfig): StepDef[] {
  return FLOW.filter((s) => !s.condition || s.condition(cfg));
}

function reducer(state: BuilderState, action: Action): BuilderState {
  switch (action.type) {
    case "answer": {
      const answers = { ...state.answers, [action.stepId]: action.value };
      return { answers, past: [...state.past, state.answers], future: [], editing: null };
    }
    case "edit":
      return { ...state, editing: action.stepId };
    case "cancelEdit":
      return { ...state, editing: null };
    case "undo": {
      if (state.past.length === 0) return state;
      const past = [...state.past];
      const answers = past.pop()!;
      return { answers, past, future: [state.answers, ...state.future], editing: null };
    }
    case "redo": {
      if (state.future.length === 0) return state;
      const [answers, ...future] = state.future;
      return { answers, past: [...state.past, state.answers], future, editing: null };
    }
    case "restart":
      return { answers: {}, past: [...state.past, state.answers], future: [], editing: null };
  }
}

export function useBuilder() {
  const [state, dispatch] = useReducer(reducer, {
    answers: {},
    past: [],
    future: [],
    editing: null,
  });

  const config = useMemo(() => deriveConfig(state.answers), [state.answers]);
  const steps = useMemo(() => visibleSteps(config), [config]);

  const answeredSteps = useMemo(
    () => steps.filter((s) => s.id in state.answers && s.kind !== "finish"),
    [steps, state.answers],
  );
  const currentStep = useMemo(
    () => steps.find((s) => !(s.id in state.answers)) ?? null,
    [steps, state.answers],
  );
  const done = currentStep?.kind === "finish" || currentStep === null;

  const progress = useMemo(() => {
    const total = steps.filter((s) => s.kind !== "finish").length;
    return total === 0 ? 0 : Math.round((answeredSteps.length / total) * 100);
  }, [steps, answeredSteps]);

  const answer = useCallback(
    (stepId: string, value: AnswerValue) => dispatch({ type: "answer", stepId, value }),
    [],
  );
  const edit = useCallback((stepId: string) => dispatch({ type: "edit", stepId }), []);
  const cancelEdit = useCallback(() => dispatch({ type: "cancelEdit" }), []);
  const undo = useCallback(() => dispatch({ type: "undo" }), []);
  const redo = useCallback(() => dispatch({ type: "redo" }), []);
  const restart = useCallback(() => dispatch({ type: "restart" }), []);

  return {
    config,
    steps,
    answers: state.answers,
    answeredSteps,
    currentStep,
    editing: state.editing,
    done,
    progress,
    canUndo: state.past.length > 0,
    canRedo: state.future.length > 0,
    answer,
    edit,
    cancelEdit,
    undo,
    redo,
    restart,
  };
}
