// WidgetConfig — the single source of truth shared by the classic form UI,
// the conversational builder, the live preview, and the embed generator.

export type Template = "simple" | "overview";
export type Variant = "classic" | "bold" | "docked";
export type Appearance = "light" | "dark";
export type Background = "solid" | "gradient";
export type Position = "left" | "right";
export type LauncherStyle = "icon" | "pill";
export type Tab = "home" | "messages";
export type FaqItem = { id: string; question: string; answer: string };
export type LinkItem = { id: string; name: string; url: string };
export type ContactItem = { id: string; name: string; role: string; email: string; phone: string };

export type EntityLayout = "list" | "card" | "grid" | "compact";
export type EntityAction = "none" | "openChat" | "openUrl" | "sendEvent";
export type HeaderKV = { id: string; key: string; value: string };
export type EntityMapping = {
  title: string;
  subtitle: string;
  badge: string;
  tag: string;
  image: string;
  description: string;
};
export type EntityIcon = "ticket" | "star" | "package" | "shopping" | "bell" | "zap";
/** A request value read from the visitor's browser localStorage at fetch time. */
export type LsParam = {
  id: string;
  /** localStorage key to read (e.g. "userId", "authToken"). */
  key: string;
  /** How the value is attached to the request. */
  sendAs: "query" | "header" | "body";
  /** Query-param or header name; defaults to the key. */
  name: string;
};
export type TestStatus = "idle" | "loading" | "ok" | "error";
export type AuthKind = "none" | "bearer" | "apikey" | "basic";

export type EntityCardCfg = {
  id: string;
  enabled: boolean;
  name: string;
  icon: EntityIcon;
  layout: EntityLayout;
  maxItems: number;
  method: "GET" | "POST";
  url: string;
  headers: HeaderKV[];
  body: string;
  responseType: "JSON" | "XML" | "Text";
  testResponse: string;
  testStatus: TestStatus;
  testError: string;
  arrayPath: string;
  fieldOptions: string[];
  mapping: EntityMapping;
  onClickAction: EntityAction;
  onClickUrl: string;
  onClickPayload: string;
};

export type WidgetConfig = {
  template: Template;
  variant: Variant;
  appearance: Appearance;
  theme: string;
  background: Background;
  position: Position;
  greeting: string;
  assistantName: string;
  launcherStyle: LauncherStyle;
  launcherText: string;
  /** Data URL of the uploaded logo; empty = default bot icon. */
  logoUrl: string;
  /** Comma-separated site URLs where the widget should appear. */
  siteUrls: string;
  /** "root" = floating over the page; "element" = rendered inside mountSelector. */
  mountMode: "root" | "element";
  /** CSS selector of the host element when mountMode is "element". */
  mountSelector: string;
  /** Widget-level values read from the visitor's localStorage, shared by all entity API requests. */
  localStorageParams: LsParam[];
  attachOn: boolean;
  contactOn: boolean;
  faqOn: boolean;
  customLinksOn: boolean;
  entitiesOn: boolean;
  contacts: ContactItem[];
  faqItems: FaqItem[];
  linkItems: LinkItem[];
  entities: EntityCardCfg[];
};

export const THEME_COLORS = [
  "#111827",
  "#7c3aed",
  "#2563eb",
  "#0d9488",
  "#16a34a",
  "#eab308",
  "#f97316",
  "#f05742",
  "#ec4899",
];

export const THEME_NAMES: Record<string, string> = {
  "#111827": "Ink",
  "#7c3aed": "Violet",
  "#2563eb": "Blue",
  "#0d9488": "Teal",
  "#16a34a": "Green",
  "#eab308": "Yellow",
  "#f97316": "Orange",
  "#f05742": "Coral",
  "#ec4899": "Pink",
};

export function themeName(hex: string): string {
  return THEME_NAMES[hex.toLowerCase()] ?? hex;
}

// ---------- JSON traversal helpers (shared with entity preview) ----------
export function findFirstArray(
  obj: unknown,
  path: string[] = [],
): { path: string; array: unknown[] } | null {
  if (Array.isArray(obj)) return { path: path.join("."), array: obj };
  if (obj && typeof obj === "object") {
    for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
      const r = findFirstArray(v, [...path, k]);
      if (r) return r;
    }
  }
  return null;
}

export function findAllArrays(
  obj: unknown,
  path: string[] = [],
): { path: string; array: unknown[] }[] {
  const out: { path: string; array: unknown[] }[] = [];
  if (Array.isArray(obj)) {
    out.push({ path: path.join("."), array: obj });
    return out;
  }
  if (obj && typeof obj === "object") {
    for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
      out.push(...findAllArrays(v, [...path, k]));
    }
  }
  return out;
}

export function collectKeys(sample: unknown, prefix = ""): string[] {
  if (!sample || typeof sample !== "object" || Array.isArray(sample)) return prefix ? [prefix] : [];
  const out: string[] = [];
  for (const [k, v] of Object.entries(sample as Record<string, unknown>)) {
    const p = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === "object" && !Array.isArray(v)) out.push(...collectKeys(v, p));
    else out.push(p);
  }
  return out;
}

export function pick(item: unknown, path: string): string {
  if (!path || !item) return "";
  const parts = path.split(".");
  let cur: unknown = item;
  for (const p of parts) {
    if (cur && typeof cur === "object" && p in (cur as Record<string, unknown>)) {
      cur = (cur as Record<string, unknown>)[p];
    } else return "";
  }
  if (cur == null) return "";
  return String(cur);
}

export function newEntity(): EntityCardCfg {
  return {
    id: `e${Date.now()}${Math.random().toString(36).slice(2, 6)}`,
    enabled: true,
    name: "Recent Tickets",
    icon: "ticket",
    layout: "list",
    maxItems: 4,
    method: "GET",
    url: "",
    headers: [{ id: "h1", key: "Content-Type", value: "application/json" }],
    body: "",
    responseType: "JSON",
    testResponse: "",
    testStatus: "idle",
    testError: "",
    arrayPath: "",
    fieldOptions: [],
    mapping: { title: "", subtitle: "", badge: "", tag: "", image: "", description: "" },
    onClickAction: "openChat",
    onClickUrl: "",
    onClickPayload: `{ "id": "{{id}}" }`,
  };
}

/**
 * Replaces `{{ls.someKey}}` placeholders with values from the browser's
 * localStorage. Missing keys resolve to an empty string. Safe on the server
 * (no localStorage) — placeholders are left empty.
 */
export function resolveLsPlaceholders(input: string): string {
  if (!input.includes("{{")) return input;
  return input.replace(/\{\{\s*ls\.([\w.-]+)\s*\}\}/g, (_, key: string) => {
    try {
      return window.localStorage.getItem(key) ?? "";
    } catch {
      return "";
    }
  });
}

/**
 * Builds the final request pieces for an entity fetch: resolves placeholders
 * and attaches localStorage params as query params / headers.
 */
export function buildEntityRequest(
  e: EntityCardCfg,
  lsParams: LsParam[] = [],
): {
  url: string;
  headers: Record<string, string>;
  body: string;
} {
  let url = resolveLsPlaceholders(e.url);
  const headers: Record<string, string> = {};
  e.headers.forEach((h) => {
    if (h.key.trim()) headers[h.key.trim()] = resolveLsPlaceholders(h.value);
  });
  for (const p of lsParams) {
    if (!p.key.trim()) continue;
    let value = "";
    try {
      value = window.localStorage.getItem(p.key.trim()) ?? "";
    } catch {
      /* SSR / blocked storage */
    }
    const name = p.name.trim() || p.key.trim();
    if (p.sendAs === "header") headers[name] = value;
    else if (p.sendAs === "query")
      url += `${url.includes("?") ? "&" : "?"}${encodeURIComponent(name)}=${encodeURIComponent(value)}`;
  }
  // body fields are merged into the JSON body (used for POST requests)
  let body = resolveLsPlaceholders(e.body);
  const bodyFields = lsParams.filter((p) => p.sendAs === "body" && p.key.trim());
  if (bodyFields.length > 0) {
    let obj: Record<string, unknown> = {};
    try {
      obj = body.trim() ? (JSON.parse(body) as Record<string, unknown>) : {};
    } catch {
      obj = {};
    }
    for (const p of bodyFields) {
      let value = "";
      try {
        value = window.localStorage.getItem(p.key.trim()) ?? "";
      } catch {
        /* SSR / blocked storage */
      }
      obj[p.name.trim() || p.key.trim()] = value;
    }
    body = JSON.stringify(obj);
  }
  return { url, headers, body };
}

export const SAMPLE_TICKETS = [
  { id: "TK1001", desc: "Payment issue", status: "Open", priority: "High" },
  { id: "TK1002", desc: "Refund Request", status: "Closed", priority: "Low" },
  { id: "TK1003", desc: "Login problem", status: "Open", priority: "Med" },
];

export function defaultConfig(): WidgetConfig {
  return {
    template: "overview",
    variant: "classic",
    appearance: "light",
    theme: "#f05742",
    background: "gradient",
    position: "right",
    greeting: "Hi there 👋 How can we help you today?",
    assistantName: "Aria Assistant",
    launcherStyle: "pill",
    launcherText: "Chat with us",
    logoUrl: "",
    siteUrls: "",
    mountMode: "root",
    mountSelector: "",
    localStorageParams: [],
    attachOn: false,
    contactOn: false,
    faqOn: false,
    customLinksOn: false,
    entitiesOn: false,
    contacts: [
      {
        id: "c1",
        name: "Sales team",
        role: "Talk to a real human",
        email: "sales@acme.com",
        phone: "+1 (555) 010-2340",
      },
    ],
    faqItems: [
      {
        id: "f1",
        question: "What is the delivery time?",
        answer: "Shipping takes 5 days on average. We will send you a confirmation with tracking.",
      },
      { id: "f2", question: "Do you ship internationally?", answer: "Yes, we deliver worldwide." },
      {
        id: "f3",
        question: "What is the return policy?",
        answer: "You have 7 days to return the product.",
      },
    ],
    linkItems: [],
    entities: [],
  };
}

export function embedCode(cfg: WidgetConfig): string {
  const urls = cfg.siteUrls.trim();
  return `<script src="https://cdn.chatwidget.io/embed.js"
  data-widget-id="wgt_9f2a3b"
  data-theme="${cfg.theme}"
  data-position="${cfg.position}"
  data-launcher="${cfg.launcherStyle}"${urls ? `\n  data-pages="${urls}"` : ""}${
    cfg.mountMode === "element" && cfg.mountSelector.trim()
      ? `\n  data-mount="${cfg.mountSelector.trim()}"`
      : ""
  }
  async></script>`;
}
