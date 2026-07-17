import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Check,
  ChevronRight,
  ChevronDown,
  Copy,
  MessageSquare,
  Home as HomeIcon,
  X,
  Mic,
  RefreshCw,
  Monitor,
  Bot,
  MoreHorizontal,
  Paperclip,
  Send,
  Sparkles,
  Plus,
  Trash2,
  Play,
  User,
  Mail,
  Phone as PhoneIcon,
  Ticket,
  Star,
  Package,
  ShoppingBag,
  Bell,
  Zap,
} from "lucide-react";

export const Route = createFileRoute("/")({
  component: ConfigPage,
});

// ---------- types ----------
type Template = "simple" | "overview";
type Variant = "classic" | "bold" | "docked";
type Appearance = "light" | "dark";
type Background = "solid" | "gradient";
type Position = "left" | "right";
type Tab = "home" | "messages";
type FaqItem = { id: string; question: string; answer: string };
type LinkItem = { id: string; name: string; url: string };
type ContactItem = { id: string; name: string; role: string; email: string; phone: string };

type EntityLayout = "list" | "card" | "grid" | "compact";
type EntityAction = "none" | "openChat" | "openUrl" | "sendEvent";
type HeaderKV = { id: string; key: string; value: string };
type EntityMapping = {
  title: string;
  subtitle: string;
  badge: string;
  tag: string;
  image: string;
  description: string;
};
type EntityIcon = "ticket" | "star" | "package" | "shopping" | "bell" | "zap";
type TestStatus = "idle" | "loading" | "ok" | "error";
type EntityCardCfg = {
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

const COLORS = [
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

const STEPS_BASE = [
  { n: 1, label: "Templates", key: "templates" as const },
  { n: 2, label: "Customize Look", key: "customize" as const },
  { n: 3, label: "Widget Content", key: "content" as const, overviewOnly: true },
  { n: 4, label: "Add to Website", key: "embed" as const },
];

type IconComp = React.ComponentType<React.SVGProps<SVGSVGElement>>;
const ENTITY_ICONS: Record<EntityIcon, IconComp> = {
  ticket: Ticket,
  star: Star,
  package: Package,
  shopping: ShoppingBag,
  bell: Bell,
  zap: Zap,
};

// ---------- helpers for entity data ----------
function findFirstArray(obj: unknown, path: string[] = []): { path: string; array: unknown[] } | null {
  if (Array.isArray(obj)) return { path: path.join("."), array: obj };
  if (obj && typeof obj === "object") {
    for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
      const r = findFirstArray(v, [...path, k]);
      if (r) return r;
    }
  }
  return null;
}
function collectKeys(sample: unknown, prefix = ""): string[] {
  if (!sample || typeof sample !== "object" || Array.isArray(sample)) return prefix ? [prefix] : [];
  const out: string[] = [];
  for (const [k, v] of Object.entries(sample as Record<string, unknown>)) {
    const p = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === "object" && !Array.isArray(v)) out.push(...collectKeys(v, p));
    else out.push(p);
  }
  return out;
}
function pick(item: unknown, path: string): string {
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

function newEntity(): EntityCardCfg {
  return {
    id: `e${Date.now()}${Math.random().toString(36).slice(2, 6)}`,
    enabled: true,
    name: "Recent Tickets",
    icon: "ticket",
    layout: "list",
    maxItems: 4,
    method: "GET",
    url: "https://jsonplaceholder.typicode.com/todos?_limit=4",
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

const SAMPLE_TICKETS = [
  { id: "TK1001", desc: "Payment issue", status: "Open", priority: "High" },
  { id: "TK1002", desc: "Refund Request", status: "Closed", priority: "Low" },
  { id: "TK1003", desc: "Login problem", status: "Open", priority: "Med" },
];

// ---------- page ----------
function ConfigPage() {
  const [step, setStep] = useState<"templates" | "customize" | "content" | "embed">("templates");
  const [template, setTemplate] = useState<Template>("overview");
  const [variant, setVariant] = useState<Variant>("classic");
  const [greeting, setGreeting] = useState("Hi there 👋 How can we help you today?");
  const [appearance, setAppearance] = useState<Appearance>("light");
  const [theme, setTheme] = useState<string>("#f05742");
  const [showMoreColors, setShowMoreColors] = useState(false);
  const [bubbleColor, setBubbleColor] = useState("#f05742");
  const [iconColor, setIconColor] = useState("#ffffff");
  const [background, setBackground] = useState<Background>("gradient");
  const [position, setPosition] = useState<Position>("right");
  const [attachOn, setAttachOn] = useState(false);
  const [contactOn, setContactOn] = useState(true);
  const [faq, setFaq] = useState(true);
  const [customLinks, setCustomLinks] = useState(false);
  const [entitiesOn, setEntitiesOn] = useState(true);
  const [contacts, setContacts] = useState<ContactItem[]>([
    { id: "c1", name: "Sales team", role: "Talk to a real human", email: "sales@acme.com", phone: "+1 (555) 010-2340" },
  ]);
  const [faqItems, setFaqItems] = useState<FaqItem[]>([
    { id: "f1", question: "What is the delivery time?", answer: "Shipping takes 5 days on average. We will send you a confirmation with tracking." },
    { id: "f2", question: "Do you ship internationally?", answer: "Yes, we deliver worldwide." },
    { id: "f3", question: "What is the return policy?", answer: "You have 7 days to return the product." },
  ]);
  const [linkItems, setLinkItems] = useState<LinkItem[]>([]);
  const [linkDraft, setLinkDraft] = useState("");
  const [entities, setEntities] = useState<EntityCardCfg[]>(() => {
    const e = newEntity();
    // seed with sample so preview shows something immediately
    const sample = { status: true, ticketDetails: SAMPLE_TICKETS };
    e.testResponse = JSON.stringify(sample, null, 2);
    e.testStatus = "ok";
    e.arrayPath = "ticketDetails";
    e.fieldOptions = ["ticketDetails.id", "ticketDetails.desc", "ticketDetails.status", "ticketDetails.priority"];
    e.mapping = {
      title: "ticketDetails.desc",
      subtitle: "ticketDetails.id",
      badge: "ticketDetails.status",
      tag: "ticketDetails.priority",
      image: "",
      description: "",
    };
    return [e];
  });
  const [previewTab, setPreviewTab] = useState<Tab>("home");
  const [copied, setCopied] = useState(false);
  const [platform, setPlatform] = useState("Script Tag");
  const [urls, setUrls] = useState("");

  const steps = useMemo(
    () => STEPS_BASE.filter((s) => !s.overviewOnly || template === "overview"),
    [template],
  );

  const embedCode = `<script src="https://cdn.chatwidget.io/embed.js"
  data-widget-id="wgt_9f2a3b"
  data-theme="${theme}"
  data-position="${position}"
  async></script>`;

  return (
    <div className="font-sans h-screen w-screen overflow-hidden flex text-[13px] text-neutral-800 antialiased" style={{ fontFamily: '"DM Sans", ui-sans-serif, system-ui, sans-serif' }}>
      {/* Left sidebar */}
      <aside className="flex flex-col text-neutral-200" style={{ width: "15%", minWidth: 200, background: "#1e2028" }}>
        <div className="px-5 pt-6 pb-8 flex items-start gap-3">
          <div className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: "#f05742" }}>
            <MessageSquare className="h-4 w-4 text-white" />
          </div>
          <div className="leading-tight">
            <div className="text-[13px] font-semibold text-white">ChatWidget</div>
            <div className="text-[11px] text-neutral-400">Configuration</div>
          </div>
        </div>
        <nav className="px-3 flex-1 space-y-1">
          {steps.map((s) => {
            const active = step === s.key;
            return (
              <button
                key={s.key}
                onClick={() => setStep(s.key)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition ${
                  active ? "bg-white/5 text-white" : "text-neutral-400 hover:text-neutral-200 hover:bg-white/[0.03]"
                }`}
              >
                <span
                  className={`h-6 w-6 rounded-md flex items-center justify-center text-[11px] font-semibold ${active ? "text-white" : "text-neutral-300 bg-white/[0.06]"}`}
                  style={active ? { background: "#f05742" } : undefined}
                >
                  {s.n}
                </span>
                <span className="text-[13px] font-medium">{s.label}</span>
              </button>
            );
          })}
        </nav>
        <div className="p-4 border-t border-white/5 space-y-3">
          <div className="flex items-center gap-2 text-[11px] text-neutral-400">
            <span className="h-2 w-2 rounded-full bg-amber-400 inline-block" />
            Draft — Unpublished
          </div>
          <button className="w-full h-10 rounded-lg text-white text-[13px] font-semibold shadow-sm transition hover:brightness-95" style={{ background: "#f05742" }}>
            Publish Widget
          </button>
        </div>
      </aside>

      {/* Center panel */}
      <section className="bg-white overflow-y-auto" style={{ width: "30%" }}>
        <div className="mx-auto py-10 px-8" style={{ maxWidth: 480 }}>
          {step === "templates" && (
            <TemplatesStep template={template} setTemplate={setTemplate} variant={variant} setVariant={setVariant} />
          )}
          {step === "customize" && (
            <CustomizeStep
              template={template}
              greeting={greeting} setGreeting={setGreeting}
              appearance={appearance} setAppearance={setAppearance}
              theme={theme} setTheme={setTheme}
              showMoreColors={showMoreColors} setShowMoreColors={setShowMoreColors}
              bubbleColor={bubbleColor} setBubbleColor={setBubbleColor}
              iconColor={iconColor} setIconColor={setIconColor}
              background={background} setBackground={setBackground}
              position={position} setPosition={setPosition}
              attachOn={attachOn} setAttachOn={setAttachOn}
            />
          )}
          {step === "content" && template === "overview" && (
            <ContentStep
              contactOn={contactOn} setContactOn={setContactOn}
              faq={faq} setFaq={setFaq}
              customLinks={customLinks} setCustomLinks={setCustomLinks}
              entitiesOn={entitiesOn} setEntitiesOn={setEntitiesOn}
              contacts={contacts} setContacts={setContacts}
              faqItems={faqItems} setFaqItems={setFaqItems}
              linkItems={linkItems} setLinkItems={setLinkItems}
              linkDraft={linkDraft} setLinkDraft={setLinkDraft}
              entities={entities} setEntities={setEntities}
            />
          )}
          {step === "embed" && (
            <EmbedStep
              code={embedCode}
              copied={copied}
              onCopy={() => {
                navigator.clipboard?.writeText(embedCode);
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
              }}
              platform={platform} setPlatform={setPlatform}
              urls={urls} setUrls={setUrls}
              onBack={() => {
                const idx = steps.findIndex((s) => s.key === step);
                if (idx > 0) setStep(steps[idx - 1].key);
              }}
            />
          )}
        </div>
      </section>

      {/* Right preview */}
      <section className="flex flex-col" style={{ width: "55%", background: "#f0f1f3" }}>
        <div className="h-14 px-6 flex items-center justify-between border-b border-black/5">
          <div className="text-[11px] font-semibold tracking-[0.12em] text-neutral-500">LIVE PREVIEW</div>
          <div className="flex items-center gap-2 text-[11px] text-neutral-600">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-60 animate-ping" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
            </span>
            Real-time
          </div>
        </div>
        <div className="flex-1 relative overflow-hidden">
          <PreviewCanvas
            template={template}
            variant={variant}
            greeting={greeting}
            appearance={appearance}
            theme={theme}
            background={background}
            position={position}
            entitiesOn={entitiesOn}
            faq={faq}
            contactOn={contactOn}
            customLinks={customLinks}
            faqItems={faqItems}
            linkItems={linkItems}
            contacts={contacts}
            entities={entities}
            previewTab={previewTab}
            setPreviewTab={setPreviewTab}
          />
        </div>
      </section>
    </div>
  );
}

// ---------- helpers ----------
function GroupLabel({ children, hint }: { children: React.ReactNode; hint?: string }) {
  return (
    <div className="mb-3">
      <div className="text-[13px] font-bold text-neutral-900">{children}</div>
      {hint && <div className="text-[12px] text-neutral-500 mt-0.5">{hint}</div>}
    </div>
  );
}
function Group({ children }: { children: React.ReactNode }) {
  return <div className="mb-8">{children}</div>;
}
function Switch({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!on)}
      className="relative inline-flex h-[22px] w-[38px] items-center rounded-full transition shrink-0"
      style={{ background: on ? "#f05742" : "#d4d4d8" }}
      aria-pressed={on}
    >
      <span className="inline-block h-[18px] w-[18px] transform rounded-full bg-white shadow transition" style={{ transform: on ? "translateX(18px)" : "translateX(2px)" }} />
    </button>
  );
}
function ToggleRow({ label, on, onChange, desc }: { label: string; on: boolean; onChange: (v: boolean) => void; desc?: string }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-neutral-100 last:border-b-0">
      <div>
        <div className="text-[13px] font-medium text-neutral-900">{label}</div>
        {desc && <div className="text-[12px] text-neutral-500 mt-0.5">{desc}</div>}
      </div>
      <Switch on={on} onChange={onChange} />
    </div>
  );
}
function TextInput(p: { value: string; onChange: (v: string) => void; placeholder?: string; className?: string; type?: string }) {
  return (
    <input
      value={p.value}
      onChange={(e) => p.onChange(e.target.value)}
      placeholder={p.placeholder}
      type={p.type || "text"}
      className={`w-full h-10 px-3 rounded-lg border border-neutral-200 bg-white text-[13px] outline-none focus:border-[#f05742] transition ${p.className || ""}`}
    />
  );
}

// ---------- STEP 1 ----------
function TemplatesStep({ template, setTemplate, variant, setVariant }: {
  template: Template; setTemplate: (t: Template) => void;
  variant: Variant; setVariant: (v: Variant) => void;
}) {
  return (
    <>
      <div className="mb-8">
        <h2 className="text-[18px] font-bold text-neutral-900">Choose a template</h2>
        <p className="text-[12px] text-neutral-500 mt-1">Pick a starting layout for your widget. You can always change it later.</p>
      </div>
      <Group>
        <div className="grid grid-cols-2 gap-3">
          <TemplateCard selected={template === "simple"} onClick={() => setTemplate("simple")} title="Simple Widget" desc="Header + chat window + footer. No home screen." illustration={<SimpleMini />} />
          <TemplateCard selected={template === "overview"} onClick={() => setTemplate("overview")} title="Overview Widget" desc="Home tab + messages tab with content blocks." illustration={<OverviewMini />} />
        </div>
      </Group>
      <Group>
        <GroupLabel hint="Layout style for your widget">Choose Layout Variant</GroupLabel>
        <div className="grid grid-cols-3 gap-3">
          {([
            { k: "classic", label: "Classic", mini: <ClassicMini /> },
            { k: "bold", label: "Bold", mini: <BoldMini /> },
            { k: "docked", label: "Docked", mini: <DockedMini /> },
          ] as const).map((v) => {
            const sel = variant === v.k;
            return (
              <button
                key={v.k}
                onClick={() => setVariant(v.k)}
                className="text-left rounded-xl p-3 border transition relative"
                style={{ borderColor: sel ? "#f05742" : "#e5e7eb", background: sel ? "#fff5f2" : "white" }}
              >
                <div className="rounded-lg overflow-hidden h-24 bg-neutral-100 mb-2 flex items-center justify-center">{v.mini}</div>
                <div className="text-[13px] font-semibold text-neutral-900">{v.label}</div>
                {sel && (
                  <div className="absolute top-2 right-2 h-5 w-5 rounded-full flex items-center justify-center" style={{ background: "#f05742" }}>
                    <Check className="h-3 w-3 text-white" strokeWidth={3} />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </Group>
    </>
  );
}

function TemplateCard({ selected, onClick, title, desc, illustration }: {
  selected: boolean; onClick: () => void; title: string; desc: string; illustration: React.ReactNode;
}) {
  return (
    <button onClick={onClick} className="relative text-left rounded-xl border p-4 transition" style={{ borderColor: selected ? "#f05742" : "#e5e7eb", background: selected ? "#fff5f2" : "white" }}>
      <div className="rounded-lg bg-neutral-100 h-28 mb-3 overflow-hidden flex items-center justify-center">{illustration}</div>
      <div className="text-[13px] font-semibold text-neutral-900">{title}</div>
      <div className="text-[11px] text-neutral-500 mt-1">{desc}</div>
      {selected && (
        <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold text-white" style={{ background: "#f05742" }}>
          <Check className="h-3 w-3" strokeWidth={3} /> Selected
        </div>
      )}
    </button>
  );
}
function SimpleMini() { return (
  <div className="w-16 h-24 rounded-md bg-white shadow-sm border border-neutral-200 flex flex-col overflow-hidden">
    <div className="h-4 bg-[#f05742]" />
    <div className="flex-1 p-1 space-y-1">
      <div className="h-1.5 w-8 rounded bg-neutral-200" />
      <div className="h-1.5 w-10 rounded bg-neutral-200 ml-auto" />
    </div>
    <div className="h-3 bg-neutral-100" />
  </div>
); }
function OverviewMini() { return (
  <div className="w-16 h-24 rounded-md bg-white shadow-sm border border-neutral-200 flex flex-col overflow-hidden">
    <div className="h-8 bg-gradient-to-b from-[#1e2038] to-[#f05742]" />
    <div className="flex-1 p-1 space-y-1">
      <div className="h-2 rounded bg-neutral-200" />
      <div className="h-2 rounded bg-neutral-200" />
    </div>
    <div className="h-3 bg-neutral-100 flex justify-around items-center">
      <div className="h-1.5 w-1.5 rounded-full bg-[#f05742]" />
      <div className="h-1.5 w-1.5 rounded-full bg-neutral-300" />
    </div>
  </div>
); }
function ClassicMini() { return (
  <div className="w-16 h-20 rounded-lg bg-white shadow border border-neutral-200 flex flex-col overflow-hidden">
    <div className="h-3 bg-[#f05742]" />
    <div className="flex-1 p-1 space-y-1">
      <div className="h-1.5 w-8 rounded bg-neutral-200" />
      <div className="h-1.5 w-6 rounded bg-neutral-200 ml-auto" />
    </div>
  </div>
); }
function BoldMini() { return (
  <div className="w-20 h-20 flex justify-end">
    <div className="w-12 h-full bg-white rounded-l-md border-l-4 border-t-4 border-b-4 border-[#f05742] p-1 flex flex-col gap-1">
      <div className="h-2 rounded bg-neutral-200" />
      <div className="h-3 rounded bg-neutral-100" />
      <div className="flex gap-0.5 mt-auto">
        <div className="h-2 w-4 rounded-full bg-[#f05742]" />
        <div className="h-2 w-4 rounded-full bg-[#f05742]" />
      </div>
    </div>
  </div>
); }
function DockedMini() { return (
  <div className="w-20 h-20 flex justify-end">
    <div className="w-8 h-full bg-white border border-neutral-300 p-0.5 flex flex-col gap-0.5">
      <div className="h-2 bg-neutral-100" />
      <div className="flex-1 space-y-0.5">
        <div className="h-1 rounded bg-neutral-200" />
        <div className="h-1 rounded bg-neutral-200" />
      </div>
      <div className="h-2 bg-neutral-100" />
    </div>
  </div>
); }

// ---------- STEP 2 ----------
function CustomizeStep(p: {
  template: Template;
  greeting: string; setGreeting: (v: string) => void;
  appearance: Appearance; setAppearance: (v: Appearance) => void;
  theme: string; setTheme: (v: string) => void;
  showMoreColors: boolean; setShowMoreColors: (v: boolean) => void;
  bubbleColor: string; setBubbleColor: (v: string) => void;
  iconColor: string; setIconColor: (v: string) => void;
  background: Background; setBackground: (v: Background) => void;
  position: Position; setPosition: (v: Position) => void;
  attachOn: boolean; setAttachOn: (v: boolean) => void;
}) {
  return (
    <>
      <div className="mb-8">
        <h2 className="text-[18px] font-bold text-neutral-900">Customize look</h2>
        <p className="text-[12px] text-neutral-500 mt-1">Tune the visual identity of the widget on your site.</p>
      </div>
      <Group>
        <GroupLabel>Logo & Assistant Name</GroupLabel>
        <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 flex items-center gap-3">
          <div className="h-11 w-11 rounded-full flex items-center justify-center" style={{ background: p.theme }}>
            <Bot className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1">
            <div className="text-[13px] font-semibold text-neutral-900">Aria Assistant</div>
            <div className="text-[11px] text-neutral-500">Synced from bot settings</div>
          </div>
          <span className="text-[10px] font-semibold text-neutral-500 uppercase tracking-wider">Read-only</span>
        </div>
      </Group>
      {p.template === "overview" && (
        <Group>
          <GroupLabel>Greeting Message</GroupLabel>
          <TextInput value={p.greeting} onChange={p.setGreeting} placeholder="Say hello…" />
        </Group>
      )}
      <Group>
        <GroupLabel>Pick theme and color</GroupLabel>
        <div className="grid grid-cols-2 gap-3 mb-4">
          {(["light", "dark"] as Appearance[]).map((a) => {
            const sel = p.appearance === a;
            return (
              <button key={a} onClick={() => p.setAppearance(a)} className="relative rounded-xl border p-3 transition" style={{ borderColor: sel ? "#f05742" : "#e5e7eb", background: sel ? "#fff5f2" : "white" }}>
                <div className="h-20 rounded-md overflow-hidden mb-2 flex flex-col" style={{ background: a === "light" ? "#fafafa" : "#1e2028" }}>
                  <div className="h-4" style={{ background: p.theme }} />
                  <div className="p-1.5 space-y-1">
                    <div className="h-1.5 w-10 rounded" style={{ background: a === "light" ? "#e5e7eb" : "#3f3f46" }} />
                    <div className="h-1.5 w-14 rounded" style={{ background: a === "light" ? "#e5e7eb" : "#3f3f46" }} />
                  </div>
                </div>
                <div className="text-[12px] font-semibold capitalize text-neutral-800">{a}</div>
                {sel && (
                  <div className="absolute top-2 right-2 h-5 w-5 rounded-full flex items-center justify-center" style={{ background: "#f05742" }}>
                    <Check className="h-3 w-3 text-white" strokeWidth={3} />
                  </div>
                )}
              </button>
            );
          })}
        </div>
        <div className="space-y-2">
          {[COLORS.slice(0, 5), COLORS.slice(5)].map((row, ri) => (
            <div key={ri} className="flex gap-2.5">
              {row.map((c) => (
                <button
                  key={c}
                  onClick={() => p.setTheme(c)}
                  className="h-7 w-7 rounded-full border-2 transition"
                  style={{ background: c, borderColor: p.theme === c ? "#111" : "transparent", boxShadow: p.theme === c ? "0 0 0 2px white inset" : undefined }}
                  aria-label={c}
                />
              ))}
              {ri === 1 && (
                <button
                  onClick={() => { const custom = prompt("Custom color (hex)", p.theme); if (custom) p.setTheme(custom); }}
                  className="h-7 w-7 rounded-full border-2 border-transparent"
                  style={{ background: "conic-gradient(from 0deg, #ef4444, #f59e0b, #eab308, #22c55e, #06b6d4, #6366f1, #a855f7, #ec4899, #ef4444)" }}
                  aria-label="Custom"
                />
              )}
            </div>
          ))}
        </div>
      </Group>
      <Group>
        <div className="flex items-center justify-between mb-3">
          <div className="text-[13px] font-bold text-neutral-900">More colors settings</div>
          <button onClick={() => p.setShowMoreColors(!p.showMoreColors)} className="text-[11px] font-semibold px-3 h-7 rounded-full border border-neutral-300 text-neutral-700 hover:bg-neutral-50">
            {p.showMoreColors ? "Hide" : "Show"}
          </button>
        </div>
        {p.showMoreColors && (
          <div className="grid grid-cols-2 gap-3">
            <ColorField label="Bubble" value={p.bubbleColor} onChange={p.setBubbleColor} />
            <ColorField label="Icon color" value={p.iconColor} onChange={p.setIconColor} />
          </div>
        )}
      </Group>
      {p.template === "overview" && (
        <Group>
          <GroupLabel>Choose background</GroupLabel>
          <div className="space-y-2.5">
            <BgCard selected={p.background === "solid"} onClick={() => p.setBackground("solid")} title="Solid" desc="Theme color used as a background" preview={<div className="h-9 w-14 rounded-md" style={{ background: p.theme }} />} />
            <BgCard selected={p.background === "gradient"} onClick={() => p.setBackground("gradient")} title="Gradient" desc="Colors automatically generated based on the theme color" preview={<div className="h-9 w-14 rounded-md" style={{ background: `radial-gradient(circle at 30% 30%, ${p.theme}, #1e2028)` }} />} />
          </div>
        </Group>
      )}
      <Group>
        <GroupLabel>Widget Position</GroupLabel>
        <div className="grid grid-cols-2 gap-2 rounded-lg bg-neutral-100 p-1">
          {(["left", "right"] as Position[]).map((pos) => (
            <button key={pos} onClick={() => p.setPosition(pos)} className="h-9 rounded-md text-[12px] font-semibold capitalize transition" style={{ background: p.position === pos ? "white" : "transparent", color: p.position === pos ? "#111" : "#6b7280", boxShadow: p.position === pos ? "0 1px 2px rgba(0,0,0,0.06)" : undefined }}>
              {pos}
            </button>
          ))}
        </div>
      </Group>
      <Group>
        <GroupLabel>Features</GroupLabel>
        <ToggleRow label="Attachment" on={p.attachOn} onChange={p.setAttachOn} />
      </Group>
    </>
  );
}
function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <div className="text-[11px] font-semibold text-neutral-600 mb-1.5">{label}</div>
      <div className="flex items-center gap-2 h-10 rounded-lg border border-neutral-200 bg-white px-2">
        <input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="h-6 w-6 rounded overflow-hidden cursor-pointer border-0" />
        <input value={value} onChange={(e) => onChange(e.target.value)} className="flex-1 text-[12px] outline-none bg-transparent" />
      </div>
    </div>
  );
}
function BgCard({ selected, onClick, title, desc, preview }: { selected: boolean; onClick: () => void; title: string; desc: string; preview: React.ReactNode }) {
  return (
    <button onClick={onClick} className="w-full text-left rounded-xl border p-3.5 relative flex items-center gap-3 transition" style={{ borderColor: selected ? "#f05742" : "#e5e7eb", background: selected ? "#fff5f2" : "white" }}>
      <div className="flex-1">
        <div className="text-[13px] font-semibold text-neutral-900">{title}</div>
        <div className="text-[11px] text-neutral-500 mt-0.5">{desc}</div>
      </div>
      <div>{preview}</div>
      {selected && (
        <div className="absolute top-2.5 right-2.5 h-5 w-5 rounded-full bg-black flex items-center justify-center">
          <Check className="h-3 w-3 text-white" strokeWidth={3} />
        </div>
      )}
    </button>
  );
}

// ---------- STEP 3 ----------
function ContentStep(p: {
  contactOn: boolean; setContactOn: (v: boolean) => void;
  faq: boolean; setFaq: (v: boolean) => void;
  customLinks: boolean; setCustomLinks: (v: boolean) => void;
  entitiesOn: boolean; setEntitiesOn: (v: boolean) => void;
  contacts: ContactItem[]; setContacts: React.Dispatch<React.SetStateAction<ContactItem[]>>;
  faqItems: FaqItem[]; setFaqItems: React.Dispatch<React.SetStateAction<FaqItem[]>>;
  linkItems: LinkItem[]; setLinkItems: React.Dispatch<React.SetStateAction<LinkItem[]>>;
  linkDraft: string; setLinkDraft: (v: string) => void;
  entities: EntityCardCfg[]; setEntities: React.Dispatch<React.SetStateAction<EntityCardCfg[]>>;
}) {
  const addFaq = () => p.setFaqItems((prev) => [...prev, { id: `f${Date.now()}`, question: "", answer: "" }]);
  const updateFaq = (id: string, patch: Partial<FaqItem>) => p.setFaqItems((prev) => prev.map((f) => (f.id === id ? { ...f, ...patch } : f)));
  const removeFaq = (id: string) => p.setFaqItems((prev) => prev.filter((f) => f.id !== id));

  const addLink = () => {
    if (!p.linkDraft.trim()) return;
    p.setLinkItems((prev) => [...prev, { id: `l${Date.now()}`, name: "", url: p.linkDraft.trim() }]);
    p.setLinkDraft("");
  };
  const updateLink = (id: string, patch: Partial<LinkItem>) => p.setLinkItems((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  const removeLink = (id: string) => p.setLinkItems((prev) => prev.filter((l) => l.id !== id));

  const addContact = () => p.setContacts((prev) => [...prev, { id: `c${Date.now()}`, name: "", role: "", email: "", phone: "" }]);
  const updateContact = (id: string, patch: Partial<ContactItem>) => p.setContacts((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  const removeContact = (id: string) => p.setContacts((prev) => prev.filter((c) => c.id !== id));

  const addEntity = () => p.setEntities((prev) => [...prev, newEntity()]);
  const updateEntity = (id: string, patch: Partial<EntityCardCfg>) => p.setEntities((prev) => prev.map((e) => (e.id === id ? { ...e, ...patch } : e)));
  const removeEntity = (id: string) => p.setEntities((prev) => prev.filter((e) => e.id !== id));

  const ord = (i: number) => {
    const s = ["th", "st", "nd", "rd"];
    const v = (i + 1) % 100;
    return `${i + 1}${s[(v - 20) % 10] || s[v] || s[0]}`;
  };

  return (
    <>
      <div className="mb-8">
        <h2 className="text-[18px] font-bold text-neutral-900">Widget content</h2>
        <p className="text-[12px] text-neutral-500 mt-1">Configure what your visitors see on the home tab.</p>
      </div>

      <Group>
        <GroupLabel>Provide Help</GroupLabel>
        <div className="rounded-xl border border-neutral-200 bg-white px-4">
          <ToggleRow label="Contact Card" on={p.contactOn} onChange={p.setContactOn} />
          <ToggleRow label="FAQ" on={p.faq} onChange={p.setFaq} />
          <ToggleRow label="Custom Links" on={p.customLinks} onChange={p.setCustomLinks} />
          <ToggleRow label="Custom Entity Cards" on={p.entitiesOn} onChange={p.setEntitiesOn} desc="Render dynamic data from your APIs" />
        </div>
      </Group>

      {p.contactOn && (
        <Group>
          <GroupLabel>Contact Card</GroupLabel>
          <div className="space-y-3">
            {p.contacts.map((c, i) => (
              <div key={c.id} className="rounded-xl border border-neutral-200 bg-white p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-[12px] font-bold text-neutral-800">{ord(i)} Contact</div>
                  <button onClick={() => removeContact(c.id)} className="text-neutral-400 hover:text-red-500"><X className="h-4 w-4" /></button>
                </div>
                <TextInput value={c.name} onChange={(v) => updateContact(c.id, { name: v })} placeholder="Name / Team" />
                <div className="h-2" />
                <TextInput value={c.role} onChange={(v) => updateContact(c.id, { role: v })} placeholder="Role or short description" />
                <div className="h-2" />
                <div className="flex items-center gap-2 h-10 px-3 rounded-lg border border-neutral-200 bg-white">
                  <Mail className="h-4 w-4 text-neutral-400" />
                  <input value={c.email} onChange={(e) => updateContact(c.id, { email: e.target.value })} placeholder="email@example.com" className="flex-1 text-[13px] outline-none bg-transparent" />
                </div>
                <div className="h-2" />
                <div className="flex items-center gap-2 h-10 px-3 rounded-lg border border-neutral-200 bg-white">
                  <PhoneIcon className="h-4 w-4 text-neutral-400" />
                  <input value={c.phone} onChange={(e) => updateContact(c.id, { phone: e.target.value })} placeholder="+1 (555) 000-0000" className="flex-1 text-[13px] outline-none bg-transparent" />
                </div>
              </div>
            ))}
            <button onClick={addContact} className="w-full h-10 rounded-lg border border-dashed border-neutral-300 text-[12px] font-semibold text-neutral-600 hover:border-[#f05742] hover:text-[#f05742]">
              + Add contact
            </button>
          </div>
        </Group>
      )}

      {p.faq && (
        <Group>
          <GroupLabel>FAQ</GroupLabel>
          <div className="space-y-3">
            {p.faqItems.map((f, i) => (
              <div key={f.id} className="rounded-xl border border-neutral-200 bg-white p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-[12px] font-bold text-neutral-800">{ord(i)} Question</div>
                  <button onClick={() => removeFaq(f.id)} className="text-neutral-400 hover:text-red-500"><X className="h-4 w-4" /></button>
                </div>
                <input value={f.question} onChange={(e) => updateFaq(f.id, { question: e.target.value })} placeholder="Type your question" className="w-full h-10 px-3 rounded-lg border border-neutral-200 bg-white text-[13px] outline-none focus:border-[#f05742] mb-2" />
                <div className="relative">
                  <textarea value={f.answer} onChange={(e) => updateFaq(f.id, { answer: e.target.value })} placeholder="Type your answer" rows={3} className="w-full p-3 pr-9 rounded-lg border border-neutral-200 bg-white text-[13px] outline-none focus:border-[#f05742] resize-none" />
                  <Sparkles className="absolute top-2.5 right-2.5 h-4 w-4 text-[#f05742]" />
                </div>
              </div>
            ))}
            <button onClick={addFaq} className="w-full h-10 rounded-lg border border-dashed border-neutral-300 text-[12px] font-semibold text-neutral-600 hover:border-[#f05742] hover:text-[#f05742]">
              + Add question
            </button>
          </div>
        </Group>
      )}

      {p.customLinks && (
        <Group>
          <GroupLabel>Custom links</GroupLabel>
          <div className="flex gap-2 mb-3">
            <input value={p.linkDraft} onChange={(e) => p.setLinkDraft(e.target.value)} placeholder="https://example.com" className="flex-1 h-10 px-3 rounded-lg border border-neutral-200 bg-white text-[13px] outline-none focus:border-[#f05742]" />
            <button onClick={addLink} className="h-10 px-4 rounded-lg text-white text-[12px] font-semibold" style={{ background: "#f05742" }}>Create link</button>
          </div>
          <div className="space-y-2">
            {p.linkItems.map((l) => (
              <div key={l.id} className="rounded-xl border border-neutral-200 bg-white p-3 flex items-start gap-2">
                <div className="text-neutral-300 pt-2 cursor-grab select-none">⋮⋮</div>
                <div className="flex-1 space-y-2">
                  <input value={l.name} onChange={(e) => updateLink(l.id, { name: e.target.value })} placeholder="Name your link" className="w-full h-9 px-3 rounded-lg border border-neutral-200 bg-white text-[13px] outline-none focus:border-[#f05742]" />
                  <input value={l.url} onChange={(e) => updateLink(l.id, { url: e.target.value })} placeholder="URL" className="w-full h-9 px-3 rounded-lg border border-neutral-200 bg-white text-[12px] outline-none focus:border-[#f05742] text-neutral-500" />
                </div>
                <button onClick={() => removeLink(l.id)} className="text-neutral-400 hover:text-red-500 pt-2"><X className="h-4 w-4" /></button>
              </div>
            ))}
          </div>
        </Group>
      )}

      {p.entitiesOn && (
        <Group>
          <GroupLabel hint="Fetch dynamic data and render it as a card block">Custom Entity Cards</GroupLabel>
          <div className="space-y-3">
            {p.entities.map((e) => (
              <EntityEditor
                key={e.id}
                entity={e}
                onChange={(patch) => updateEntity(e.id, patch)}
                onRemove={() => removeEntity(e.id)}
              />
            ))}
            <button onClick={addEntity} className="w-full h-10 rounded-lg border border-dashed border-neutral-300 text-[12px] font-semibold text-neutral-600 hover:border-[#f05742] hover:text-[#f05742]">
              + Add entity card
            </button>
          </div>
        </Group>
      )}
    </>
  );
}

// ---------- Entity Editor ----------
function EntityEditor({ entity, onChange, onRemove }: {
  entity: EntityCardCfg;
  onChange: (patch: Partial<EntityCardCfg>) => void;
  onRemove: () => void;
}) {
  const [open, setOpen] = useState(true);
  const [statusMsg, setStatusMsg] = useState<string>("");

  const addHeader = () => onChange({ headers: [...entity.headers, { id: `h${Date.now()}`, key: "", value: "" }] });
  const updateHeader = (id: string, patch: Partial<HeaderKV>) => onChange({ headers: entity.headers.map((h) => h.id === id ? { ...h, ...patch } : h) });
  const removeHeader = (id: string) => onChange({ headers: entity.headers.filter((h) => h.id !== id) });

  const testApi = async () => {
    onChange({ testStatus: "loading", testError: "" });
    setStatusMsg("");
    try {
      const headers: Record<string, string> = {};
      entity.headers.forEach((h) => { if (h.key.trim()) headers[h.key.trim()] = h.value; });
      const init: RequestInit = { method: entity.method, headers };
      if (entity.method === "POST" && entity.body.trim()) init.body = entity.body;
      const res = await fetch(entity.url, init);
      const text = await res.text();
      let pretty = text;
      let parsed: unknown = null;
      try { parsed = JSON.parse(text); pretty = JSON.stringify(parsed, null, 2); } catch { /* keep raw */ }
      const arr = parsed ? findFirstArray(parsed) : null;
      const arrayPath = arr?.path || "";
      const sample = arr?.array?.[0];
      const keys = sample && typeof sample === "object" ? collectKeys(sample, arrayPath) : [];
      onChange({
        testResponse: pretty,
        testStatus: res.ok ? "ok" : "error",
        testError: res.ok ? "" : `${res.status} ${res.statusText}`,
        arrayPath,
        fieldOptions: keys,
      });
      setStatusMsg(res.ok ? "Success — response parsed." : `Failed: ${res.status}`);
    } catch (err) {
      onChange({ testStatus: "error", testError: String(err) });
      setStatusMsg("Network error — see console.");
    }
  };

  const iconEntries: [EntityIcon, React.ComponentType<{ className?: string }>][] = [
    ["ticket", Ticket], ["star", Star], ["package", Package], ["shopping", ShoppingBag], ["bell", Bell], ["zap", Zap],
  ];

  return (
    <div className="rounded-xl border border-neutral-200 bg-white overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3">
        <Switch on={entity.enabled} onChange={(v) => onChange({ enabled: v })} />
        <button onClick={() => setOpen(!open)} className="flex-1 flex items-center gap-2 text-left">
          <ChevronDown className="h-4 w-4 text-neutral-500 transition" style={{ transform: open ? "none" : "rotate(-90deg)" }} />
          <span className="text-[13px] font-bold text-neutral-900">{entity.name || "Untitled entity"}</span>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">{entity.layout}</span>
        </button>
        <button onClick={onRemove} className="text-neutral-400 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
      </div>

      {open && (
        <div className="border-t border-neutral-100 p-4 space-y-4">
          {/* Basic */}
          <div>
            <div className="text-[11px] font-semibold text-neutral-600 mb-1.5">Entity Name</div>
            <TextInput value={entity.name} onChange={(v) => onChange({ name: v })} placeholder="Recent Tickets" />
          </div>

          <div>
            <div className="text-[11px] font-semibold text-neutral-600 mb-1.5">Entity Icon</div>
            <div className="flex gap-1.5 flex-wrap">
              {iconEntries.map(([k, Icon]) => {
                const sel = entity.icon === k;
                return (
                  <button key={k} onClick={() => onChange({ icon: k })} className="h-9 w-9 rounded-lg border flex items-center justify-center transition" style={{ borderColor: sel ? "#f05742" : "#e5e7eb", background: sel ? "#fff5f2" : "white" }}>
                    <Icon className="h-4 w-4" />
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-[11px] font-semibold text-neutral-600 mb-1.5">Card Layout</div>
              <select value={entity.layout} onChange={(e) => onChange({ layout: e.target.value as EntityLayout })} className="w-full h-10 px-3 rounded-lg border border-neutral-200 bg-white text-[13px] outline-none focus:border-[#f05742]">
                <option value="list">List</option>
                <option value="card">Simple Card</option>
                <option value="grid">Grid</option>
                <option value="compact">Compact</option>
              </select>
            </div>
            <div>
              <div className="text-[11px] font-semibold text-neutral-600 mb-1.5">Maximum Items</div>
              <input type="number" min={1} max={20} value={entity.maxItems} onChange={(e) => onChange({ maxItems: Math.max(1, Number(e.target.value) || 1) })} className="w-full h-10 px-3 rounded-lg border border-neutral-200 bg-white text-[13px] outline-none focus:border-[#f05742]" />
            </div>
          </div>

          {/* Data source */}
          <div className="rounded-lg bg-neutral-50 p-3 space-y-3">
            <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">Data Source</div>
            <div className="grid grid-cols-[100px_1fr] gap-2">
              <select value={entity.method} onChange={(e) => onChange({ method: e.target.value as "GET" | "POST" })} className="h-10 px-3 rounded-lg border border-neutral-200 bg-white text-[13px] outline-none focus:border-[#f05742]">
                <option value="GET">GET</option>
                <option value="POST">POST</option>
              </select>
              <TextInput value={entity.url} onChange={(v) => onChange({ url: v })} placeholder="https://api.example.com/tickets" />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <div className="text-[11px] font-semibold text-neutral-600">Headers</div>
                <button onClick={addHeader} className="text-[11px] font-semibold text-[#f05742] flex items-center gap-0.5"><Plus className="h-3 w-3" /> Add</button>
              </div>
              <div className="space-y-2">
                {entity.headers.map((h) => (
                  <div key={h.id} className="flex gap-2">
                    <input value={h.key} onChange={(e) => updateHeader(h.id, { key: e.target.value })} placeholder="Key" className="flex-1 h-9 px-2.5 rounded-md border border-neutral-200 bg-white text-[12px] outline-none focus:border-[#f05742] font-mono" />
                    <input value={h.value} onChange={(e) => updateHeader(h.id, { value: e.target.value })} placeholder="Value" className="flex-1 h-9 px-2.5 rounded-md border border-neutral-200 bg-white text-[12px] outline-none focus:border-[#f05742] font-mono" />
                    <button onClick={() => removeHeader(h.id)} className="text-neutral-400 hover:text-red-500"><X className="h-4 w-4" /></button>
                  </div>
                ))}
              </div>
            </div>

            {entity.method === "POST" && (
              <div>
                <div className="text-[11px] font-semibold text-neutral-600 mb-1.5">Body (JSON)</div>
                <textarea value={entity.body} onChange={(e) => onChange({ body: e.target.value })} rows={4} placeholder='{ "customerId": "123" }' className="w-full p-2.5 rounded-md border border-neutral-200 bg-white text-[12px] outline-none focus:border-[#f05742] font-mono resize-none" />
              </div>
            )}

            <div className="grid grid-cols-[1fr_auto] gap-2 items-end">
              <div>
                <div className="text-[11px] font-semibold text-neutral-600 mb-1.5">Response Type</div>
                <select value={entity.responseType} onChange={(e) => onChange({ responseType: e.target.value as "JSON" | "XML" | "Text" })} className="w-full h-10 px-3 rounded-lg border border-neutral-200 bg-white text-[13px] outline-none focus:border-[#f05742]">
                  <option>JSON</option>
                  <option>XML</option>
                  <option>Text</option>
                </select>
              </div>
              <button onClick={testApi} disabled={entity.testStatus === "loading"} className="h-10 px-4 rounded-lg text-white text-[12px] font-semibold flex items-center gap-1.5 disabled:opacity-60" style={{ background: "#f05742" }}>
                <Play className="h-3.5 w-3.5" /> {entity.testStatus === "loading" ? "Testing…" : "Test API"}
              </button>
            </div>
            {(entity.testStatus === "ok" || entity.testStatus === "error") && (
              <div className="flex items-center gap-2 text-[11px]">
                <span className={`h-2 w-2 rounded-full ${entity.testStatus === "ok" ? "bg-green-500" : "bg-red-500"}`} />
                <span className={entity.testStatus === "ok" ? "text-green-700" : "text-red-700"}>
                  {statusMsg || (entity.testStatus === "ok" ? "Connected" : entity.testError || "Failed")}
                </span>
              </div>
            )}
          </div>

          {/* Response preview */}
          {entity.testResponse && (
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 mb-1.5">Response Preview</div>
              <pre className="max-h-40 overflow-auto rounded-lg bg-neutral-900 text-neutral-100 p-3 text-[11px] font-mono leading-relaxed">
                {entity.testResponse}
              </pre>
            </div>
          )}

          {/* Field mapping */}
          {entity.fieldOptions.length > 0 && (
            <div className="rounded-lg border border-neutral-200 p-3 space-y-2">
              <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 mb-1">UI Field Mapping</div>
              {(["title", "subtitle", "badge", "tag", "image", "description"] as const).map((field) => (
                <div key={field} className="grid grid-cols-[80px_1fr] gap-2 items-center">
                  <div className="text-[12px] font-medium text-neutral-700 capitalize">{field}</div>
                  <select
                    value={entity.mapping[field]}
                    onChange={(e) => onChange({ mapping: { ...entity.mapping, [field]: e.target.value } })}
                    className="h-9 px-2.5 rounded-md border border-neutral-200 bg-white text-[12px] outline-none focus:border-[#f05742]"
                  >
                    <option value="">— none —</option>
                    {entity.fieldOptions.map((k) => <option key={k} value={k}>{k}</option>)}
                  </select>
                </div>
              ))}
            </div>
          )}

          {/* Card Action */}
          <div className="rounded-lg bg-neutral-50 p-3 space-y-2">
            <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">Card Action</div>
            <select value={entity.onClickAction} onChange={(e) => onChange({ onClickAction: e.target.value as EntityAction })} className="w-full h-10 px-3 rounded-lg border border-neutral-200 bg-white text-[13px] outline-none focus:border-[#f05742]">
              <option value="none">None</option>
              <option value="openChat">Open Chat</option>
              <option value="openUrl">Open URL</option>
              <option value="sendEvent">Send Event</option>
            </select>
            {entity.onClickAction === "openUrl" && (
              <TextInput value={entity.onClickUrl} onChange={(v) => onChange({ onClickUrl: v })} placeholder="https://…/{{id}}" />
            )}
            {entity.onClickAction === "sendEvent" && (
              <textarea value={entity.onClickPayload} onChange={(e) => onChange({ onClickPayload: e.target.value })} rows={3} className="w-full p-2.5 rounded-md border border-neutral-200 bg-white text-[12px] outline-none focus:border-[#f05742] font-mono resize-none" />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ---------- STEP 4 ----------
function EmbedStep(p: {
  code: string; copied: boolean; onCopy: () => void;
  platform: string; setPlatform: (v: string) => void;
  urls: string; setUrls: (v: string) => void;
  onBack: () => void;
}) {
  const platforms = ["Script Tag", "Google Tag Manager", "WordPress", "Shopify", "Wix", "Squarespace"];
  const instr: Record<string, string> = {
    "Script Tag": "Paste the snippet before the closing </body> tag of every page where the widget should appear.",
    "Google Tag Manager": "In GTM, create a new Custom HTML tag, paste the snippet, and set the trigger to All Pages.",
    WordPress: "Open Appearance → Theme File Editor, choose footer.php and paste the snippet before </body>.",
    Shopify: "In your admin, go to Online Store → Themes → Edit code → theme.liquid and paste before </body>.",
    Wix: "Add a Custom Code element under Settings → Custom Code and paste the snippet in the Body — end section.",
    Squarespace: "Under Settings → Advanced → Code Injection, paste the snippet in the Footer field.",
  };
  return (
    <>
      <div className="mb-8">
        <h2 className="text-[18px] font-bold text-neutral-900">Add to your website</h2>
        <p className="text-[12px] text-neutral-500 mt-1">Install the widget in seconds.</p>
      </div>
      <Group>
        <GroupLabel>Embed code</GroupLabel>
        <div className="relative rounded-xl bg-neutral-900 text-neutral-100 p-4 pr-24 font-mono text-[11px] leading-[1.6] whitespace-pre-wrap break-all">
          {p.code}
          <button onClick={p.onCopy} className="absolute top-2.5 right-2.5 h-7 px-2.5 rounded-md text-[11px] font-semibold text-neutral-900 bg-white hover:bg-neutral-100 flex items-center gap-1">
            <Copy className="h-3 w-3" /> {p.copied ? "Copied!" : "Copy"}
          </button>
        </div>
      </Group>
      <Group>
        <GroupLabel>Platform instructions</GroupLabel>
        <div className="flex flex-wrap gap-2 mb-3">
          {platforms.map((pl) => {
            const sel = p.platform === pl;
            return (
              <button key={pl} onClick={() => p.setPlatform(pl)} className="h-7 px-3 rounded-full text-[11px] font-semibold border transition" style={{ background: sel ? "#f05742" : "white", borderColor: sel ? "#f05742" : "#e5e7eb", color: sel ? "white" : "#374151" }}>
                {pl}
              </button>
            );
          })}
        </div>
        <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-[12px] text-neutral-700 leading-relaxed">{instr[p.platform]}</div>
      </Group>
      <Group>
        <GroupLabel>Where should your bot appear?</GroupLabel>
        <input value={p.urls} onChange={(e) => p.setUrls(e.target.value)} placeholder="https://example.com, https://example.com/pricing" className="w-full h-11 px-3.5 rounded-lg border border-neutral-200 bg-white text-[13px] outline-none focus:border-[#f05742]" />
        <div className="text-[11px] text-neutral-500 mt-2">Website URLs — separate multiple with commas.</div>
      </Group>
      <div className="flex justify-between pt-2">
        <button onClick={p.onBack} className="h-10 px-4 rounded-lg border border-neutral-200 text-[13px] font-semibold text-neutral-700 hover:bg-neutral-50">Back</button>
        <button className="h-10 px-5 rounded-lg text-white text-[13px] font-semibold bg-green-600 hover:bg-green-700">Publish Widget</button>
      </div>
    </>
  );
}

// ---------- PREVIEW ----------
function PreviewCanvas(p: {
  template: Template;
  variant: Variant;
  greeting: string;
  appearance: Appearance;
  theme: string;
  background: Background;
  position: Position;
  entitiesOn: boolean;
  faq: boolean;
  contactOn: boolean;
  customLinks: boolean;
  faqItems: FaqItem[];
  linkItems: LinkItem[];
  contacts: ContactItem[];
  entities: EntityCardCfg[];
  previewTab: Tab;
  setPreviewTab: (t: Tab) => void;
}) {
  const bgIsDark = p.appearance === "dark";
  const surface = bgIsDark ? "#1e2028" : "white";
  const surfaceText = bgIsDark ? "#e5e7eb" : "#111827";
  const mutedText = bgIsDark ? "#9ca3af" : "#6b7280";
  const border = bgIsDark ? "rgba(255,255,255,0.08)" : "#eef0f2";

  return (
    <div className="absolute inset-0">
      {/* faux website backdrop */}
      <div className="absolute inset-0 p-6">
        <div className="h-8 w-40 rounded-md bg-white/70 mb-4" />
        <div className="grid grid-cols-3 gap-4">
          <div className="h-24 rounded-lg bg-white/60" />
          <div className="h-24 rounded-lg bg-white/60" />
          <div className="h-24 rounded-lg bg-white/60" />
        </div>
        <div className="h-3 w-64 rounded bg-white/60 mt-6" />
        <div className="h-3 w-80 rounded bg-white/50 mt-2" />
        <div className="h-3 w-52 rounded bg-white/50 mt-2" />
      </div>

      {/* widget wrapper based on variant */}
      <WidgetShell variant={p.variant} position={p.position} theme={p.theme} surface={surface} border={border}>
        {p.template === "simple" ? (
          <SimpleWidgetInner variant={p.variant} theme={p.theme} surface={surface} surfaceText={surfaceText} mutedText={mutedText} border={border} />
        ) : (
          <OverviewWidgetInner
            theme={p.theme}
            greeting={p.greeting}
            background={p.background}
            surface={surface}
            surfaceText={surfaceText}
            mutedText={mutedText}
            border={border}
            entitiesOn={p.entitiesOn}
            faq={p.faq}
            contactOn={p.contactOn}
            customLinks={p.customLinks}
            faqItems={p.faqItems}
            linkItems={p.linkItems}
            contacts={p.contacts}
            entities={p.entities}
            previewTab={p.previewTab}
            setPreviewTab={p.setPreviewTab}
            appearance={p.appearance}
          />
        )}
      </WidgetShell>
    </div>
  );
}

function WidgetShell({ variant, position, theme, surface, border, children }: {
  variant: Variant; position: Position; theme: string; surface: string; border: string; children: React.ReactNode;
}) {
  if (variant === "classic") {
    const posStyle: React.CSSProperties = position === "right" ? { right: 40, bottom: 40 } : { left: 40, bottom: 40 };
    return (
      <div className="absolute w-[360px] h-[600px] rounded-[28px] shadow-2xl overflow-hidden flex flex-col" style={{ ...posStyle, background: surface, border: `1px solid ${border}` }}>
        {children}
      </div>
    );
  }
  const width = variant === "bold" ? "65%" : "42%";
  const anchor: React.CSSProperties = position === "right" ? { right: 0, top: 0, bottom: 0 } : { left: 0, top: 0, bottom: 0 };
  const radius = variant === "bold" ? (position === "right" ? "24px 0 0 24px" : "0 24px 24px 0") : "0";
  const borderStyle: React.CSSProperties =
    variant === "bold"
      ? position === "right"
        ? { borderTop: `4px solid ${theme}`, borderLeft: `4px solid ${theme}`, borderBottom: `4px solid ${theme}` }
        : { borderTop: `4px solid ${theme}`, borderRight: `4px solid ${theme}`, borderBottom: `4px solid ${theme}` }
      : position === "right"
      ? { borderLeft: `1px solid ${border}` }
      : { borderRight: `1px solid ${border}` };
  return (
    <div className="absolute shadow-2xl flex flex-col overflow-hidden" style={{ ...anchor, width, background: surface, borderRadius: radius, ...borderStyle }}>
      {children}
    </div>
  );
}

// ----- Simple widget (chat only) -----
function SimpleWidgetInner({ theme, surface, surfaceText, mutedText, border }: {
  variant: Variant; theme: string; surface: string; surfaceText: string; mutedText: string; border: string;
}) {
  return (
    <>
      <div className="h-14 flex items-center justify-between px-4 shrink-0" style={{ background: theme }}>
        <div className="flex items-center gap-2 text-white">
          <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center"><Bot className="h-4 w-4" /></div>
          <div className="text-[13px] font-semibold">Aria Assistant</div>
        </div>
        <div className="flex items-center gap-2 text-white/80"><MoreHorizontal className="h-4 w-4" /><X className="h-4 w-4" /></div>
      </div>
      <div className="flex-1 p-4 space-y-2.5 overflow-y-auto" style={{ background: surface }}>
        <MsgBubble text="Hey! 👋 How can I help you today?" color="#f3f4f6" fg={surfaceText} />
        <MsgBubble text="I'd like to know about your pricing." color={theme} fg="#fff" right />
        <MsgBubble text="Sure — our plans start at $29/mo." color="#f3f4f6" fg={surfaceText} />
      </div>
      <div className="h-14 border-t flex items-center px-3 gap-2 shrink-0" style={{ borderColor: border, background: surface }}>
        <input placeholder="Type your message…" className="flex-1 h-9 rounded-full px-3 text-[12px] outline-none border" style={{ borderColor: border, background: "transparent", color: surfaceText }} />
        <button className="h-9 w-9 rounded-full flex items-center justify-center text-white" style={{ background: theme }}><Send className="h-4 w-4" /></button>
      </div>
      <div className="text-center text-[10px] text-neutral-400 py-1.5" style={{ background: surface }}>Powered by ChatWidget</div>
      <div style={{ height: 0, color: mutedText }} />
    </>
  );
}

// ----- Overview widget inner (home + messages) -----
function OverviewWidgetInner(p: {
  theme: string;
  greeting: string;
  background: Background;
  surface: string;
  surfaceText: string;
  mutedText: string;
  border: string;
  entitiesOn: boolean;
  faq: boolean;
  contactOn: boolean;
  customLinks: boolean;
  faqItems: FaqItem[];
  linkItems: LinkItem[];
  contacts: ContactItem[];
  entities: EntityCardCfg[];
  previewTab: Tab;
  setPreviewTab: (t: Tab) => void;
  appearance: Appearance;
}) {
  const heroBg = p.background === "solid" ? p.theme : `linear-gradient(180deg, #12142a 0%, ${p.theme} 100%)`;

  return (
    <>
      {p.previewTab === "home" ? (
        <>
          <div className="relative px-5 pt-6 pb-14 shrink-0" style={{ background: heroBg }}>
            <div className="flex items-center justify-between">
              <div className="h-9 w-9 rounded-full bg-white/15 backdrop-blur flex items-center justify-center"><Bot className="h-4 w-4 text-white" /></div>
              <X className="h-4 w-4 text-white/80" />
            </div>
            <div className="mt-6 text-white text-[22px] font-bold leading-tight pr-6">{p.greeting}</div>
            <div className="text-white/70 text-[12px] mt-2">We're here to help — search below or pick an option.</div>
          </div>
          <div className="px-4 -mt-6 relative z-10 shrink-0">
            <button onClick={() => p.setPreviewTab("messages")} className="w-full h-12 rounded-full bg-white shadow-lg flex items-center gap-2 px-4 text-[13px] font-medium text-neutral-700 border border-black/5">
              <MessageSquare className="h-4 w-4" style={{ color: p.theme }} />
              Chat with us
              <span className="ml-auto text-[11px] text-neutral-400">Send a message</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 pt-4 pb-2 space-y-4">
            {p.entitiesOn && p.entities.filter((e) => e.enabled).map((e) => (
              <EntityCardPreview key={e.id} entity={e} theme={p.theme} surfaceText={p.surfaceText} mutedText={p.mutedText} border={p.border} appearance={p.appearance} />
            ))}

            {p.faq && p.faqItems.length > 0 && (
              <div>
                <div className="text-[12px] font-bold mb-2" style={{ color: p.surfaceText }}>Quick answers</div>
                <div className="rounded-xl overflow-hidden border" style={{ borderColor: p.border }}>
                  {p.faqItems.map((f, i) => (
                    <FaqAccordion key={f.id} question={f.question || `Question ${i + 1}`} answer={f.answer} surfaceText={p.surfaceText} mutedText={p.mutedText} border={p.border} theme={p.theme} last={i === p.faqItems.length - 1} />
                  ))}
                </div>
              </div>
            )}

            {p.customLinks && p.linkItems.length > 0 && (
              <div className="space-y-2">
                {p.linkItems.map((l) => (
                  <a key={l.id} href={l.url || "#"} className="flex items-center justify-between px-4 h-11 rounded-xl border text-[13px] font-semibold" style={{ borderColor: p.border, color: p.surfaceText, background: p.appearance === "dark" ? "rgba(255,255,255,0.03)" : "white" }}>
                    <span>{l.name || l.url || "Untitled link"}</span>
                    <ChevronRight className="h-4 w-4" style={{ color: p.mutedText }} />
                  </a>
                ))}
              </div>
            )}

            {p.contactOn && p.contacts.length > 0 && (
              <div>
                <div className="text-[12px] font-bold mb-2" style={{ color: p.surfaceText }}>Get in touch</div>
                <div className="space-y-2">
                  {p.contacts.map((c) => (
                    <div key={c.id} className="rounded-xl border p-3 flex items-center gap-3" style={{ borderColor: p.border, background: p.appearance === "dark" ? "rgba(255,255,255,0.03)" : "white" }}>
                      <div className="h-9 w-9 rounded-full flex items-center justify-center text-white" style={{ background: p.theme }}><User className="h-4 w-4" /></div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[13px] font-semibold truncate" style={{ color: p.surfaceText }}>{c.name || "Contact"}</div>
                        <div className="text-[11px] truncate" style={{ color: p.mutedText }}>{c.role || c.email || c.phone}</div>
                      </div>
                      <div className="flex gap-1.5">
                        {c.email && <div className="h-7 w-7 rounded-full flex items-center justify-center" style={{ background: p.appearance === "dark" ? "rgba(255,255,255,0.06)" : "#f3f4f6" }}><Mail className="h-3.5 w-3.5" style={{ color: p.mutedText }} /></div>}
                        {c.phone && <div className="h-7 w-7 rounded-full flex items-center justify-center" style={{ background: p.appearance === "dark" ? "rgba(255,255,255,0.06)" : "#f3f4f6" }}><PhoneIcon className="h-3.5 w-3.5" style={{ color: p.mutedText }} /></div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <BottomTabs tab={p.previewTab} setTab={p.setPreviewTab} theme={p.theme} mutedText={p.mutedText} border={p.border} surface={p.surface} />
        </>
      ) : (
        <>
          <div className="h-14 flex items-center justify-between px-4 shrink-0" style={{ background: p.theme }}>
            <div className="flex items-center gap-2 text-white">
              <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center"><Bot className="h-4 w-4" /></div>
              <div className="text-[13px] font-semibold">Messages</div>
            </div>
            <X className="h-4 w-4 text-white/80" />
          </div>
          <div className="flex-1 p-4 space-y-2.5 overflow-y-auto" style={{ background: p.surface }}>
            <MsgBubble text="Welcome back! How can I help you today?" color={p.appearance === "dark" ? "#2a2c36" : "#f3f4f6"} fg={p.surfaceText} />
            <MsgBubble text="Do you offer refunds?" color={p.theme} fg="#fff" right />
            <MsgBubble text="Yes — full refunds within 30 days, no questions asked." color={p.appearance === "dark" ? "#2a2c36" : "#f3f4f6"} fg={p.surfaceText} />
          </div>
          <div className="border-t flex items-center px-3 gap-2 h-14 shrink-0" style={{ borderColor: p.border, background: p.surface }}>
            <Paperclip className="h-4 w-4" style={{ color: p.mutedText }} />
            <input placeholder="Type your message…" className="flex-1 h-9 rounded-full px-3 text-[12px] outline-none border" style={{ borderColor: p.border, background: "transparent", color: p.surfaceText }} />
            <button className="h-9 w-9 rounded-full flex items-center justify-center text-white" style={{ background: p.theme }}><Send className="h-4 w-4" /></button>
          </div>
          <BottomTabs tab={p.previewTab} setTab={p.setPreviewTab} theme={p.theme} mutedText={p.mutedText} border={p.border} surface={p.surface} />
        </>
      )}
    </>
  );
}

// ---------- Entity preview ----------
function EntityCardPreview({ entity, theme, surfaceText, mutedText, border, appearance }: {
  entity: EntityCardCfg; theme: string; surfaceText: string; mutedText: string; border: string; appearance: Appearance;
}) {
  const Icon = ENTITY_ICONS[entity.icon] || Ticket;
  // Compute items from response
  const items: Record<string, unknown>[] = useMemo(() => {
    if (!entity.testResponse) return [];
    try {
      const parsed = JSON.parse(entity.testResponse);
      const arr = findFirstArray(parsed);
      if (!arr) return [];
      return arr.array.slice(0, entity.maxItems) as Record<string, unknown>[];
    } catch { return []; }
  }, [entity.testResponse, entity.maxItems]);

  const getField = (item: Record<string, unknown>, mappingPath: string): string => {
    if (!mappingPath) return "";
    // mapping paths are prefixed with arrayPath, strip it
    const prefix = entity.arrayPath ? entity.arrayPath + "." : "";
    const relPath = mappingPath.startsWith(prefix) ? mappingPath.slice(prefix.length) : mappingPath;
    return pick(item, relPath);
  };

  const cardBg = appearance === "dark" ? "rgba(255,255,255,0.04)" : "white";

  if (items.length === 0) {
    return (
      <div className="rounded-xl border p-3 flex items-center gap-3" style={{ borderColor: border, background: cardBg }}>
        <div className="h-9 w-9 rounded-lg flex items-center justify-center text-white" style={{ background: theme }}><Icon className="h-4 w-4" /></div>
        <div className="flex-1">
          <div className="text-[13px] font-bold" style={{ color: surfaceText }}>{entity.name}</div>
          <div className="text-[11px]" style={{ color: mutedText }}>Test the API to load data</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <Icon className="h-4 w-4" style={{ color: theme }} />
        <div className="text-[12px] font-bold" style={{ color: surfaceText }}>{entity.name}</div>
      </div>

      {entity.layout === "grid" ? (
        <div className="grid grid-cols-2 gap-2">
          {items.map((it, i) => (
            <div key={i} className="rounded-xl border p-3" style={{ borderColor: border, background: cardBg }}>
              <div className="text-[12px] font-semibold" style={{ color: surfaceText }}>{getField(it, entity.mapping.title) || "—"}</div>
              <div className="text-[11px] mt-0.5" style={{ color: mutedText }}>{getField(it, entity.mapping.subtitle)}</div>
              {entity.mapping.badge && <div className="mt-2 inline-flex text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: `${theme}22`, color: theme }}>{getField(it, entity.mapping.badge)}</div>}
            </div>
          ))}
        </div>
      ) : entity.layout === "compact" ? (
        <div className="rounded-xl border overflow-hidden" style={{ borderColor: border }}>
          {items.map((it, i) => (
            <div key={i} className="flex items-center justify-between px-3 py-2" style={{ borderTop: i === 0 ? "none" : `1px solid ${border}`, background: cardBg }}>
              <div className="text-[12.5px] font-medium truncate" style={{ color: surfaceText }}>{getField(it, entity.mapping.title) || "—"}</div>
              {entity.mapping.badge && <div className="text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ml-2" style={{ background: `${theme}22`, color: theme }}>{getField(it, entity.mapping.badge)}</div>}
            </div>
          ))}
        </div>
      ) : entity.layout === "card" ? (
        <div className="space-y-2">
          {items.map((it, i) => (
            <div key={i} className="rounded-xl border p-3 shadow-sm" style={{ borderColor: border, background: cardBg }}>
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-lg flex items-center justify-center text-white shrink-0" style={{ background: theme }}><Icon className="h-4 w-4" /></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="text-[13px] font-bold truncate" style={{ color: surfaceText }}>{getField(it, entity.mapping.title) || "—"}</div>
                    {entity.mapping.tag && <div className="text-[9px] font-bold uppercase tracking-wide" style={{ color: theme }}>{getField(it, entity.mapping.tag)}</div>}
                  </div>
                  <div className="text-[11px]" style={{ color: mutedText }}>{getField(it, entity.mapping.subtitle)}</div>
                  {entity.mapping.description && <div className="text-[11px] mt-1" style={{ color: mutedText }}>{getField(it, entity.mapping.description)}</div>}
                  {entity.mapping.badge && <div className="mt-2 inline-flex text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: `${theme}22`, color: theme }}>{getField(it, entity.mapping.badge)}</div>}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // list (default)
        <div className="rounded-xl border overflow-hidden" style={{ borderColor: border, background: cardBg }}>
          {items.map((it, i) => (
            <div key={i} className="flex items-center gap-3 px-3 py-2.5" style={{ borderTop: i === 0 ? "none" : `1px solid ${border}` }}>
              <div className="h-8 w-8 rounded-lg flex items-center justify-center text-white shrink-0" style={{ background: theme }}><Icon className="h-3.5 w-3.5" /></div>
              <div className="flex-1 min-w-0">
                <div className="text-[12.5px] font-semibold truncate" style={{ color: surfaceText }}>{getField(it, entity.mapping.title) || "—"}</div>
                <div className="text-[11px] truncate" style={{ color: mutedText }}>{getField(it, entity.mapping.subtitle)}</div>
              </div>
              {entity.mapping.badge && <div className="text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0" style={{ background: `${theme}22`, color: theme }}>{getField(it, entity.mapping.badge)}</div>}
              <ChevronRight className="h-4 w-4 shrink-0" style={{ color: mutedText }} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function BottomTabs({ tab, setTab, theme, mutedText, border, surface }: {
  tab: Tab; setTab: (t: Tab) => void; theme: string; mutedText: string; border: string; surface: string;
}) {
  return (
    <div className="h-14 border-t flex items-stretch shrink-0" style={{ borderColor: border, background: surface }}>
      {([
        { k: "home" as Tab, label: "Home", icon: HomeIcon },
        { k: "messages" as Tab, label: "Messages", icon: MessageSquare },
      ]).map(({ k, label, icon: Icon }) => {
        const active = tab === k;
        return (
          <button key={k} onClick={() => setTab(k)} className="flex-1 flex flex-col items-center justify-center gap-0.5" style={{ color: active ? theme : mutedText }}>
            <Icon className="h-[18px] w-[18px]" />
            <span className="text-[10px] font-semibold">{label}</span>
          </button>
        );
      })}
    </div>
  );
}

function MsgBubble({ text, color, fg, right }: { text: string; color: string; fg: string; right?: boolean }) {
  return (
    <div className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-[12.5px] ${right ? "ml-auto" : ""}`} style={{ background: color, color: fg }}>{text}</div>
  );
}

function FaqAccordion({ question, answer, surfaceText, mutedText, border, theme, last }: {
  question: string; answer: string; surfaceText: string; mutedText: string; border: string; theme: string; last: boolean;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: last ? "none" : `1px solid ${border}` }}>
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-4 py-3 text-left">
        <span className="text-[13px] font-semibold pr-3" style={{ color: surfaceText }}>{question}</span>
        <ChevronRight className="h-4 w-4 shrink-0 transition-transform" style={{ color: theme, transform: open ? "rotate(90deg)" : "none" }} />
      </button>
      {open && answer && (
        <div className="px-4 pb-3 text-[12px] leading-relaxed" style={{ color: mutedText }}>{answer}</div>
      )}
    </div>
  );
}
