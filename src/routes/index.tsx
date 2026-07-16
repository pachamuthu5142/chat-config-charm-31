import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Check,
  ChevronRight,
  Copy,
  MessageSquare,
  Home as HomeIcon,
  X,
  Phone,
  Mic,
  MicOff,
  RefreshCw,
  Monitor,
  Bot,
  MoreHorizontal,
  Ticket,
  Paperclip,
  Send,
  Sparkles,
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
  const [contactCard, setContactCard] = useState(true);
  const [faq, setFaq] = useState(true);
  const [customLinks, setCustomLinks] = useState(false);
  const [ticket, setTicket] = useState(true);
  const [faqItems, setFaqItems] = useState<FaqItem[]>([
    { id: "f1", question: "What is the delivery time?", answer: "Shipping takes 5 days on average. We will send you a confirmation message with your package's tracking information and delivery date." },
    { id: "f2", question: "Do you ship internationally?", answer: "Yes, we deliver to any location worldwide." },
    { id: "f3", question: "What is the return policy?", answer: "You have 7 days to return the product." },
  ]);
  const [linkItems, setLinkItems] = useState<LinkItem[]>([]);
  const [linkDraft, setLinkDraft] = useState("");
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
      <aside
        className="flex flex-col text-neutral-200"
        style={{ width: "15%", minWidth: 200, background: "#1e2028" }}
      >
        <div className="px-5 pt-6 pb-8 flex items-start gap-3">
          <div
            className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: "#f05742" }}
          >
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
                  active
                    ? "bg-white/5 text-white"
                    : "text-neutral-400 hover:text-neutral-200 hover:bg-white/[0.03]"
                }`}
              >
                <span
                  className={`h-6 w-6 rounded-md flex items-center justify-center text-[11px] font-semibold ${
                    active ? "text-white" : "text-neutral-300 bg-white/[0.06]"
                  }`}
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
          <button
            className="w-full h-10 rounded-lg text-white text-[13px] font-semibold shadow-sm transition hover:brightness-95"
            style={{ background: "#f05742" }}
          >
            Publish Widget
          </button>
        </div>
      </aside>

      {/* Center panel */}
      <section
        className="bg-white overflow-y-auto"
        style={{ width: "30%" }}
      >
        <div className="mx-auto py-10 px-8" style={{ maxWidth: 460 }}>
          {step === "templates" && (
            <TemplatesStep
              template={template}
              setTemplate={setTemplate}
              variant={variant}
              setVariant={setVariant}
            />
          )}
          {step === "customize" && (
            <CustomizeStep
              template={template}
              greeting={greeting}
              setGreeting={setGreeting}
              appearance={appearance}
              setAppearance={setAppearance}
              theme={theme}
              setTheme={setTheme}
              showMoreColors={showMoreColors}
              setShowMoreColors={setShowMoreColors}
              bubbleColor={bubbleColor}
              setBubbleColor={setBubbleColor}
              iconColor={iconColor}
              setIconColor={setIconColor}
              background={background}
              setBackground={setBackground}
              position={position}
              setPosition={setPosition}
              attachOn={attachOn}
              setAttachOn={setAttachOn}
            />
          )}
          {step === "content" && template === "overview" && (
            <ContentStep
              contactCard={contactCard}
              setContactCard={setContactCard}
              faq={faq}
              setFaq={setFaq}
              customLinks={customLinks}
              setCustomLinks={setCustomLinks}
              ticket={ticket}
              setTicket={setTicket}
              faqItems={faqItems}
              setFaqItems={setFaqItems}
              linkItems={linkItems}
              setLinkItems={setLinkItems}
              linkDraft={linkDraft}
              setLinkDraft={setLinkDraft}
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
              platform={platform}
              setPlatform={setPlatform}
              urls={urls}
              setUrls={setUrls}
              onBack={() => {
                const idx = steps.findIndex((s) => s.key === step);
                if (idx > 0) setStep(steps[idx - 1].key);
              }}
            />
          )}
        </div>
      </section>

      {/* Right preview */}
      <section
        className="flex flex-col"
        style={{ width: "55%", background: "#f0f1f3" }}
      >
        <div className="h-14 px-6 flex items-center justify-between border-b border-black/5">
          <div className="text-[11px] font-semibold tracking-[0.12em] text-neutral-500">
            LIVE PREVIEW
          </div>
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
            ticket={ticket}
            faq={faq}
            contactCard={contactCard}
            customLinks={customLinks}
            faqItems={faqItems}
            linkItems={linkItems}
            previewTab={previewTab}
            setPreviewTab={setPreviewTab}
          />
        </div>
      </section>
    </div>
  );
}

// ---------- form label helper ----------
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

// ---------- switch / checkbox ----------
function Switch({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!on)}
      className="relative inline-flex h-[22px] w-[38px] items-center rounded-full transition"
      style={{ background: on ? "#f05742" : "#d4d4d8" }}
      aria-pressed={on}
    >
      <span
        className="inline-block h-[18px] w-[18px] transform rounded-full bg-white shadow transition"
        style={{ transform: on ? "translateX(18px)" : "translateX(2px)" }}
      />
    </button>
  );
}

function ToggleRow({
  label,
  on,
  onChange,
  desc,
}: {
  label: string;
  on: boolean;
  onChange: (v: boolean) => void;
  desc?: string;
}) {
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

function Checkbox({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <label className="flex items-center gap-2.5 cursor-pointer select-none py-1.5">
      <span
        onClick={() => onChange(!checked)}
        className="h-[18px] w-[18px] rounded border flex items-center justify-center transition"
        style={{
          background: checked ? "#f05742" : "white",
          borderColor: checked ? "#f05742" : "#d4d4d8",
        }}
      >
        {checked && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
      </span>
      <span className="text-[13px] text-neutral-800">{label}</span>
    </label>
  );
}

// ---------- STEP 1 ----------
function TemplatesStep({
  template,
  setTemplate,
  variant,
  setVariant,
}: {
  template: Template;
  setTemplate: (t: Template) => void;
  variant: Variant;
  setVariant: (v: Variant) => void;
}) {
  return (
    <>
      <div className="mb-8">
        <h2 className="text-[18px] font-bold text-neutral-900">Choose a template</h2>
        <p className="text-[12px] text-neutral-500 mt-1">
          Pick a starting layout for your widget. You can always change it later.
        </p>
      </div>

      <Group>
        <div className="grid grid-cols-2 gap-3">
          <TemplateCard
            selected={template === "simple"}
            onClick={() => setTemplate("simple")}
            title="Simple Widget"
            desc="Header + chat window + footer. No home screen."
            illustration={<SimpleMini />}
          />
          <TemplateCard
            selected={template === "overview"}
            onClick={() => setTemplate("overview")}
            title="Overview Widget"
            desc="Home tab + messages tab with content blocks."
            illustration={<OverviewMini />}
          />
        </div>
      </Group>

      <Group>
        <GroupLabel hint="Layout style for your widget">Choose Layout Variant</GroupLabel>
        <div className="grid grid-cols-3 gap-3">
          {(
            [
              { k: "classic", label: "Classic", mini: <ClassicMini /> },
              { k: "bold", label: "Bold", mini: <BoldMini /> },
              { k: "docked", label: "Docked", mini: <DockedMini /> },
            ] as const
          ).map((v) => {
            const sel = variant === v.k;
            return (
              <button
                key={v.k}
                onClick={() => setVariant(v.k)}
                className="text-left rounded-xl p-3 border transition relative"
                style={{
                  borderColor: sel ? "#f05742" : "#e5e7eb",
                  background: sel ? "#fff5f2" : "white",
                }}
              >
                <div className="rounded-lg overflow-hidden h-24 bg-neutral-100 mb-2 flex items-center justify-center">
                  {v.mini}
                </div>
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

function TemplateCard({
  selected,
  onClick,
  title,
  desc,
  illustration,
}: {
  selected: boolean;
  onClick: () => void;
  title: string;
  desc: string;
  illustration: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className="relative text-left rounded-xl border p-4 transition"
      style={{
        borderColor: selected ? "#f05742" : "#e5e7eb",
        background: selected ? "#fff5f2" : "white",
      }}
    >
      <div className="rounded-lg bg-neutral-100 h-28 mb-3 overflow-hidden flex items-center justify-center">
        {illustration}
      </div>
      <div className="text-[13px] font-semibold text-neutral-900">{title}</div>
      <div className="text-[11px] text-neutral-500 mt-1">{desc}</div>
      {selected && (
        <div
          className="absolute top-3 right-3 flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold text-white"
          style={{ background: "#f05742" }}
        >
          <Check className="h-3 w-3" strokeWidth={3} /> Selected
        </div>
      )}
    </button>
  );
}

// mini illustrations
function SimpleMini() {
  return (
    <div className="w-16 h-24 rounded-md bg-white shadow-sm border border-neutral-200 flex flex-col overflow-hidden">
      <div className="h-4 bg-[#f05742]" />
      <div className="flex-1 p-1 space-y-1">
        <div className="h-1.5 w-8 rounded bg-neutral-200" />
        <div className="h-1.5 w-10 rounded bg-neutral-200 ml-auto" />
        <div className="h-1.5 w-6 rounded bg-neutral-200" />
      </div>
      <div className="h-3 bg-neutral-100" />
    </div>
  );
}
function OverviewMini() {
  return (
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
  );
}
function ClassicMini() {
  return (
    <div className="w-16 h-20 rounded-lg bg-white shadow border border-neutral-200 flex flex-col overflow-hidden">
      <div className="h-3 bg-[#f05742]" />
      <div className="flex-1 p-1 space-y-1">
        <div className="h-1.5 w-8 rounded bg-neutral-200" />
        <div className="h-1.5 w-6 rounded bg-neutral-200 ml-auto" />
      </div>
    </div>
  );
}
function VoiceMini() {
  return (
    <div className="w-16 h-20 rounded-lg bg-white shadow border border-neutral-200 flex flex-col p-1 gap-1">
      <div className="h-3 bg-neutral-800 rounded" />
      <div className="flex-1 flex items-center justify-center">
        <div className="h-1.5 w-6 rounded bg-neutral-200" />
      </div>
      <div className="h-3 flex items-center gap-0.5">
        <div className="h-3 w-3 rounded-full bg-gradient-to-br from-fuchsia-500 to-blue-500" />
        <div className="flex-1 h-2 rounded bg-neutral-200" />
        <div className="h-3 w-3 rounded-full bg-red-500" />
      </div>
    </div>
  );
}
function BoldMini() {
  return (
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
  );
}
function DockedMini() {
  return (
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
  );
}

// ---------- STEP 2 ----------
function CustomizeStep(p: {
  template: Template;
  greeting: string;
  setGreeting: (v: string) => void;
  appearance: Appearance;
  setAppearance: (v: Appearance) => void;
  theme: string;
  setTheme: (v: string) => void;
  showMoreColors: boolean;
  setShowMoreColors: (v: boolean) => void;
  bubbleColor: string;
  setBubbleColor: (v: string) => void;
  iconColor: string;
  setIconColor: (v: string) => void;
  background: Background;
  setBackground: (v: Background) => void;
  position: Position;
  setPosition: (v: Position) => void;
  attachOn: boolean;
  setAttachOn: (v: boolean) => void;
}) {
  return (
    <>
      <div className="mb-8">
        <h2 className="text-[18px] font-bold text-neutral-900">Customize look</h2>
        <p className="text-[12px] text-neutral-500 mt-1">
          Tune the visual identity of the widget on your site.
        </p>
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
          <input
            value={p.greeting}
            onChange={(e) => p.setGreeting(e.target.value)}
            className="w-full h-11 px-3.5 rounded-lg border border-neutral-200 bg-white text-[13px] outline-none focus:border-[#f05742] transition"
            placeholder="Say hello to your visitors…"
          />
        </Group>
      )}

      <Group>
        <GroupLabel>Pick theme and color</GroupLabel>
        <div className="grid grid-cols-2 gap-3 mb-4">
          {(["light", "dark"] as Appearance[]).map((a) => {
            const sel = p.appearance === a;
            return (
              <button
                key={a}
                onClick={() => p.setAppearance(a)}
                className="relative rounded-xl border p-3 transition"
                style={{ borderColor: sel ? "#f05742" : "#e5e7eb", background: sel ? "#fff5f2" : "white" }}
              >
                <div
                  className="h-20 rounded-md overflow-hidden mb-2 flex flex-col"
                  style={{ background: a === "light" ? "#fafafa" : "#1e2028" }}
                >
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
                  style={{
                    background: c,
                    borderColor: p.theme === c ? "#111" : "transparent",
                    boxShadow: p.theme === c ? "0 0 0 2px white inset" : undefined,
                  }}
                  aria-label={c}
                />
              ))}
              {ri === 1 && (
                <button
                  onClick={() => {
                    const custom = prompt("Custom color (hex)", p.theme);
                    if (custom) p.setTheme(custom);
                  }}
                  className="h-7 w-7 rounded-full border-2 border-transparent"
                  style={{
                    background:
                      "conic-gradient(from 0deg, #ef4444, #f59e0b, #eab308, #22c55e, #06b6d4, #6366f1, #a855f7, #ec4899, #ef4444)",
                  }}
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
          <button
            onClick={() => p.setShowMoreColors(!p.showMoreColors)}
            className="text-[11px] font-semibold px-3 h-7 rounded-full border border-neutral-300 text-neutral-700 hover:bg-neutral-50"
          >
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
            <BgCard
              selected={p.background === "solid"}
              onClick={() => p.setBackground("solid")}
              title="Solid"
              desc="Theme color used as a background"
              preview={<div className="h-9 w-14 rounded-md" style={{ background: p.theme }} />}
            />
            <BgCard
              selected={p.background === "gradient"}
              onClick={() => p.setBackground("gradient")}
              title="Gradient"
              desc="Colors automatically generated based on the theme color"
              preview={
                <div
                  className="h-9 w-14 rounded-md"
                  style={{ background: `radial-gradient(circle at 30% 30%, ${p.theme}, #1e2028)` }}
                />
              }
            />
          </div>
        </Group>
      )}

      <Group>
        <GroupLabel>Widget Position</GroupLabel>
        <div className="grid grid-cols-2 gap-2 rounded-lg bg-neutral-100 p-1">
          {(["left", "right"] as Position[]).map((pos) => (
            <button
              key={pos}
              onClick={() => p.setPosition(pos)}
              className="h-9 rounded-md text-[12px] font-semibold capitalize transition"
              style={{
                background: p.position === pos ? "white" : "transparent",
                color: p.position === pos ? "#111" : "#6b7280",
                boxShadow: p.position === pos ? "0 1px 2px rgba(0,0,0,0.06)" : undefined,
              }}
            >
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
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-6 w-6 rounded overflow-hidden cursor-pointer border-0"
        />
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 text-[12px] outline-none bg-transparent"
        />
      </div>
    </div>
  );
}

function BgCard({
  selected,
  onClick,
  title,
  desc,
  preview,
}: {
  selected: boolean;
  onClick: () => void;
  title: string;
  desc: string;
  preview: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-xl border p-3.5 relative flex items-center gap-3 transition"
      style={{ borderColor: selected ? "#f05742" : "#e5e7eb", background: selected ? "#fff5f2" : "white" }}
    >
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
  contactCard: boolean;
  setContactCard: (v: boolean) => void;
  faq: boolean;
  setFaq: (v: boolean) => void;
  customLinks: boolean;
  setCustomLinks: (v: boolean) => void;
  ticket: boolean;
  setTicket: (v: boolean) => void;
  faqItems: FaqItem[];
  setFaqItems: React.Dispatch<React.SetStateAction<FaqItem[]>>;
  linkItems: LinkItem[];
  setLinkItems: React.Dispatch<React.SetStateAction<LinkItem[]>>;
  linkDraft: string;
  setLinkDraft: (v: string) => void;
}) {
  const addFaq = () =>
    p.setFaqItems((prev) => [...prev, { id: `f${Date.now()}`, question: "", answer: "" }]);
  const updateFaq = (id: string, patch: Partial<FaqItem>) =>
    p.setFaqItems((prev) => prev.map((f) => (f.id === id ? { ...f, ...patch } : f)));
  const removeFaq = (id: string) => p.setFaqItems((prev) => prev.filter((f) => f.id !== id));

  const addLink = () => {
    if (!p.linkDraft.trim()) return;
    p.setLinkItems((prev) => [...prev, { id: `l${Date.now()}`, name: "", url: p.linkDraft.trim() }]);
    p.setLinkDraft("");
  };
  const updateLink = (id: string, patch: Partial<LinkItem>) =>
    p.setLinkItems((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  const removeLink = (id: string) => p.setLinkItems((prev) => prev.filter((l) => l.id !== id));

  const ord = (i: number) => {
    const s = ["th", "st", "nd", "rd"];
    const v = (i + 1) % 100;
    return `${i + 1}${s[(v - 20) % 10] || s[v] || s[0]}`;
  };

  return (
    <>
      <div className="mb-8">
        <h2 className="text-[18px] font-bold text-neutral-900">Widget content</h2>
        <p className="text-[12px] text-neutral-500 mt-1">
          Configure what your visitors see on the home tab.
        </p>
      </div>

      <Group>
        <GroupLabel>Provide Help</GroupLabel>
        <div className="rounded-xl border border-neutral-200 bg-white px-4">
          <ToggleRow label="Contact Card" on={p.contactCard} onChange={p.setContactCard} />
          <ToggleRow label="FAQ" on={p.faq} onChange={p.setFaq} />
          <ToggleRow label="Custom Links" on={p.customLinks} onChange={p.setCustomLinks} />
          <ToggleRow label="Ticket Feature" on={p.ticket} onChange={p.setTicket} />
        </div>
      </Group>

      {p.faq && (
        <Group>
          <GroupLabel>FAQ</GroupLabel>
          <div className="space-y-3">
            {p.faqItems.map((f, i) => (
              <div key={f.id} className="rounded-xl border border-neutral-200 bg-white p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-[12px] font-bold text-neutral-800">{ord(i)} Question</div>
                  <button
                    onClick={() => removeFaq(f.id)}
                    className="text-neutral-400 hover:text-red-500"
                    aria-label="Delete"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <input
                  value={f.question}
                  onChange={(e) => updateFaq(f.id, { question: e.target.value })}
                  placeholder="Type your question"
                  className="w-full h-10 px-3 rounded-lg border border-neutral-200 bg-white text-[13px] outline-none focus:border-[#f05742] mb-2"
                />
                <div className="relative">
                  <textarea
                    value={f.answer}
                    onChange={(e) => updateFaq(f.id, { answer: e.target.value })}
                    placeholder="Type your answer"
                    rows={3}
                    className="w-full p-3 pr-9 rounded-lg border border-neutral-200 bg-white text-[13px] outline-none focus:border-[#f05742] resize-none"
                  />
                  <Sparkles className="absolute top-2.5 right-2.5 h-4 w-4 text-[#f05742]" />
                </div>
              </div>
            ))}
            <button
              onClick={addFaq}
              className="w-full h-10 rounded-lg border border-dashed border-neutral-300 text-[12px] font-semibold text-neutral-600 hover:border-[#f05742] hover:text-[#f05742]"
            >
              + Add question
            </button>
          </div>
        </Group>
      )}

      {p.customLinks && (
        <Group>
          <GroupLabel>Custom links</GroupLabel>
          <div className="flex gap-2 mb-3">
            <input
              value={p.linkDraft}
              onChange={(e) => p.setLinkDraft(e.target.value)}
              placeholder="https://example.com"
              className="flex-1 h-10 px-3 rounded-lg border border-neutral-200 bg-white text-[13px] outline-none focus:border-[#f05742]"
            />
            <button
              onClick={addLink}
              className="h-10 px-4 rounded-lg text-white text-[12px] font-semibold"
              style={{ background: "#f05742" }}
            >
              Create link
            </button>
          </div>
          <div className="space-y-2">
            {p.linkItems.map((l) => (
              <div key={l.id} className="rounded-xl border border-neutral-200 bg-white p-3 flex items-start gap-2">
                <div className="text-neutral-300 pt-2 cursor-grab select-none">⋮⋮</div>
                <div className="flex-1 space-y-2">
                  <input
                    value={l.name}
                    onChange={(e) => updateLink(l.id, { name: e.target.value })}
                    placeholder="Name your link"
                    className="w-full h-9 px-3 rounded-lg border border-neutral-200 bg-white text-[13px] outline-none focus:border-[#f05742]"
                  />
                  <input
                    value={l.url}
                    onChange={(e) => updateLink(l.id, { url: e.target.value })}
                    placeholder="URL"
                    className="w-full h-9 px-3 rounded-lg border border-neutral-200 bg-white text-[12px] outline-none focus:border-[#f05742] text-neutral-500"
                  />
                </div>
                <button
                  onClick={() => removeLink(l.id)}
                  className="text-neutral-400 hover:text-red-500 pt-2"
                  aria-label="Delete"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </Group>
      )}
    </>
  );
}


// ---------- STEP 4 ----------
function EmbedStep(p: {
  code: string;
  copied: boolean;
  onCopy: () => void;
  platform: string;
  setPlatform: (v: string) => void;
  urls: string;
  setUrls: (v: string) => void;
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
          <button
            onClick={p.onCopy}
            className="absolute top-2.5 right-2.5 h-7 px-2.5 rounded-md text-[11px] font-semibold text-neutral-900 bg-white hover:bg-neutral-100 flex items-center gap-1"
          >
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
              <button
                key={pl}
                onClick={() => p.setPlatform(pl)}
                className="h-7 px-3 rounded-full text-[11px] font-semibold border transition"
                style={{
                  background: sel ? "#f05742" : "white",
                  borderColor: sel ? "#f05742" : "#e5e7eb",
                  color: sel ? "white" : "#374151",
                }}
              >
                {pl}
              </button>
            );
          })}
        </div>
        <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-[12px] text-neutral-700 leading-relaxed">
          {instr[p.platform]}
        </div>
      </Group>

      <Group>
        <GroupLabel>Where should your bot appear?</GroupLabel>
        <input
          value={p.urls}
          onChange={(e) => p.setUrls(e.target.value)}
          placeholder="https://example.com, https://example.com/pricing"
          className="w-full h-11 px-3.5 rounded-lg border border-neutral-200 bg-white text-[13px] outline-none focus:border-[#f05742]"
        />
        <div className="text-[11px] text-neutral-500 mt-2">Website URLs — separate multiple with commas.</div>
      </Group>

      <div className="flex justify-between pt-2">
        <button
          onClick={p.onBack}
          className="h-10 px-4 rounded-lg border border-neutral-200 text-[13px] font-semibold text-neutral-700 hover:bg-neutral-50"
        >
          Back
        </button>
        <button className="h-10 px-5 rounded-lg text-white text-[13px] font-semibold bg-green-600 hover:bg-green-700">
          Publish Widget
        </button>
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
  ticket: boolean;
  faq: boolean;
  contactCard: boolean;
  customLinks: boolean;
  faqItems: FaqItem[];
  linkItems: LinkItem[];
  previewTab: Tab;
  setPreviewTab: (t: Tab) => void;
}) {
  const bgIsDark = p.appearance === "dark";
  const surface = bgIsDark ? "#1e2028" : "white";
  const surfaceText = bgIsDark ? "#e5e7eb" : "#111827";
  const mutedText = bgIsDark ? "#9ca3af" : "#6b7280";
  const border = bgIsDark ? "rgba(255,255,255,0.08)" : "#eef0f2";

  const posStyle: React.CSSProperties =
    p.position === "right"
      ? { right: 40, bottom: 40 }
      : { left: 40, bottom: 40 };

  // For Simple template variants that are docked/bold, full height
  const isDocked = p.template === "simple" && (p.variant === "bold" || p.variant === "docked");

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

      {/* widget */}
      {isDocked ? (
        <DockedWidget
          variant={p.variant as "bold" | "docked"}
          theme={p.theme}
          position={p.position}
          surface={surface}
          surfaceText={surfaceText}
          mutedText={mutedText}
          border={border}
        />
      ) : p.template === "simple" ? (
        <ClassicWidget
          theme={p.theme}
          surface={surface}
          surfaceText={surfaceText}
          mutedText={mutedText}
          border={border}
          position={posStyle}
        />
      ) : (
        <OverviewWidget
          theme={p.theme}
          greeting={p.greeting}
          background={p.background}
          surface={surface}
          surfaceText={surfaceText}
          mutedText={mutedText}
          border={border}
          position={posStyle}
          faqItems={p.faqItems}
          linkItems={p.linkItems}
          ticket={p.ticket}
          faq={p.faq}
          contactCard={p.contactCard}
          customLinks={p.customLinks}
          previewTab={p.previewTab}
          setPreviewTab={p.setPreviewTab}
          appearance={p.appearance}
        />
      )}
    </div>
  );
}

// ----- widgets -----
function ClassicWidget({
  theme,
  surface,
  surfaceText,
  mutedText,
  border,
  position,
}: {
  theme: string;
  surface: string;
  surfaceText: string;
  mutedText: string;
  border: string;
  position: React.CSSProperties;
}) {
  return (
    <div
      className="absolute w-[340px] h-[500px] rounded-2xl shadow-2xl overflow-hidden flex flex-col"
      style={{ ...position, background: surface, border: `1px solid ${border}` }}
    >
      <div className="h-14 flex items-center justify-between px-4" style={{ background: theme }}>
        <div className="flex items-center gap-2 text-white">
          <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center">
            <Bot className="h-4 w-4" />
          </div>
          <div className="text-[13px] font-semibold">Aria Assistant</div>
        </div>
        <X className="h-4 w-4 text-white/80" />
      </div>
      <div className="flex-1 p-4 space-y-2.5 overflow-y-auto">
        <MsgBubble text="Hey! 👋 How can I help you today?" color="#f3f4f6" fg={surfaceText} />
        <MsgBubble text="I'd like to know about your pricing." color={theme} fg="#fff" right />
        <MsgBubble text="Sure — our plans start at $29/mo." color="#f3f4f6" fg={surfaceText} />
      </div>
      <div className="h-14 border-t flex items-center px-3 gap-2" style={{ borderColor: border }}>
        <input
          placeholder="Type your message…"
          className="flex-1 h-9 rounded-full px-3 text-[12px] outline-none border"
          style={{ borderColor: border, background: "transparent", color: surfaceText }}
        />
        <button className="h-9 w-9 rounded-full flex items-center justify-center text-white" style={{ background: theme }}>
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function VoiceWidget({ theme, position }: { theme: string; position: React.CSSProperties }) {
  return (
    <div
      className="absolute w-[360px] rounded-3xl overflow-hidden shadow-2xl bg-white"
      style={{ ...position }}
    >
      <div className="p-4 flex items-center gap-3" style={{ background: "#0f1424" }}>
        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-fuchsia-500 to-blue-500" />
        <div className="text-white">
          <div className="text-[13px] font-semibold">AI Voice Agent</div>
          <div className="text-[11px] text-white/60">Listening…</div>
        </div>
        <div className="ml-auto flex items-center gap-2 text-white/70">
          <MoreHorizontal className="h-4 w-4" />
          <X className="h-4 w-4" />
        </div>
      </div>
      <div className="p-5 min-h-[140px]">
        <div className="rounded-2xl bg-neutral-100 p-3.5 text-[13px] text-neutral-800 max-w-[85%]">
          Hi! Tap the mic and ask me anything about your account.
        </div>
      </div>
      <div className="p-3 flex items-center gap-2 border-t border-neutral-100">
        <button
          className="h-11 w-11 rounded-full flex items-center justify-center text-white shadow-lg"
          style={{
            background: `linear-gradient(135deg, ${theme}, #a855f7 60%, #3b82f6)`,
          }}
        >
          <Mic className="h-5 w-5" />
        </button>
        <div className="flex-1 h-10 rounded-full bg-neutral-100 flex items-center px-4 text-[12px] text-neutral-500">
          Type to Ask
        </div>
        <button className="h-10 w-10 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500">
          <MicOff className="h-4 w-4" />
        </button>
        <button className="h-10 w-10 rounded-full bg-red-500 flex items-center justify-center text-white">
          <Phone className="h-4 w-4" style={{ transform: "rotate(135deg)" }} />
        </button>
      </div>
    </div>
  );
}

function DockedWidget({
  variant,
  theme,
  position,
  surface,
  surfaceText,
  mutedText,
  border,
}: {
  variant: "bold" | "docked";
  theme: string;
  position: Position;
  surface: string;
  surfaceText: string;
  mutedText: string;
  border: string;
}) {
  const width = variant === "bold" ? "65%" : "40%";
  const anchor: React.CSSProperties =
    position === "right"
      ? { right: 0, top: 0, bottom: 0 }
      : { left: 0, top: 0, bottom: 0 };
  const radius = variant === "bold" ? "24px 0 0 24px" : "0";
  const borderStyle: React.CSSProperties =
    variant === "bold"
      ? {
          borderTop: `4px solid ${theme}`,
          borderLeft: `4px solid ${theme}`,
          borderBottom: `4px solid ${theme}`,
        }
      : { borderLeft: `1px solid ${border}` };

  return (
    <div
      className="absolute shadow-2xl flex flex-col"
      style={{
        ...anchor,
        width,
        background: surface,
        borderRadius: radius,
        ...borderStyle,
      }}
    >
      {/* header */}
      {variant === "bold" ? (
        <div className="h-14 flex items-center px-5 gap-3 bg-white border-b" style={{ borderColor: border }}>
          <div className="h-9 w-9 rounded-full flex items-center justify-center" style={{ background: theme }}>
            <Bot className="h-4 w-4 text-white" />
          </div>
          <div className="text-[13px] font-semibold" style={{ color: surfaceText }}>Aria Assistant</div>
          <div className="ml-auto flex items-center gap-3 text-neutral-500">
            <MoreHorizontal className="h-4 w-4" />
            <X className="h-4 w-4" />
          </div>
        </div>
      ) : (
        <div className="h-14 flex items-center px-4 gap-3 bg-white border-b" style={{ borderColor: border }}>
          <div className="h-7 w-7 rounded-md flex items-center justify-center" style={{ background: theme }}>
            <MessageSquare className="h-3.5 w-3.5 text-white" />
          </div>
          <div className="text-[13px] font-semibold" style={{ color: surfaceText }}>ChatWidget</div>
          <a className="ml-4 text-[12px] font-medium" style={{ color: theme }}>Contact Us</a>
          <div className="ml-auto flex items-center gap-3 text-neutral-500">
            <Monitor className="h-4 w-4" />
            <RefreshCw className="h-4 w-4" />
            <X className="h-4 w-4" />
          </div>
        </div>
      )}

      {/* body */}
      {variant === "bold" ? (
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          <div className="rounded-2xl bg-white shadow-sm border p-4 max-w-[80%]" style={{ borderColor: border }}>
            <div className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: theme }}>
              1 · Welcome
            </div>
            <div className="text-[15px] font-semibold mt-1" style={{ color: surfaceText }}>
              Hi there — what brings you here today?
            </div>
            <div className="text-[12px] mt-1.5" style={{ color: mutedText }}>
              Pick one to get started, or type your question below.
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {["Talk to sales", "Report an issue", "Book a demo", "See pricing"].map((q) => (
              <button
                key={q}
                className="h-9 px-4 rounded-full text-[12px] font-semibold text-white"
                style={{ background: theme }}
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex-1 p-6 overflow-y-auto space-y-3">
          <div className="rounded-xl px-4 py-3 text-[14px]" style={{ background: "#f5f5f5", color: surfaceText }}>
            Hey there — I'm your assistant. Ask me anything about the product.
          </div>
          <div className="rounded-xl px-4 py-3 text-[14px] text-white max-w-[70%] ml-auto" style={{ background: theme }}>
            How do I reset my password?
          </div>
          <div className="rounded-xl px-4 py-3 text-[14px]" style={{ background: "#f5f5f5", color: surfaceText }}>
            Sure — visit Settings → Security → Reset password.
          </div>
        </div>
      )}

      {/* footer */}
      {variant === "docked" ? (
        <div className="border-t p-3" style={{ borderColor: border, background: "white" }}>
          <div className="flex items-center gap-2 h-11 rounded-full border px-4" style={{ borderColor: border }}>
            <input placeholder="Ask AI" className="flex-1 text-[13px] outline-none bg-transparent" />
            <Mic className="h-4 w-4 text-neutral-500" />
          </div>
          <div className="text-center text-[10px] text-neutral-400 mt-2">Powered by ChatWidget</div>
        </div>
      ) : (
        <div className="border-t p-3 flex items-center gap-2" style={{ borderColor: border, background: "white" }}>
          <input
            placeholder="Type your message…"
            className="flex-1 h-10 rounded-full px-4 text-[12px] outline-none border"
            style={{ borderColor: border }}
          />
          <button className="h-10 w-10 rounded-full flex items-center justify-center text-white" style={{ background: theme }}>
            <Send className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}

function OverviewWidget({
  theme,
  greeting,
  background,
  surface,
  surfaceText,
  mutedText,
  border,
  position,
  ticket,
  faq,
  contactCard,
  customLinks,
  faqItems,
  linkItems,
  previewTab,
  setPreviewTab,
  appearance,
}: {
  theme: string;
  greeting: string;
  background: Background;
  surface: string;
  surfaceText: string;
  mutedText: string;
  border: string;
  position: React.CSSProperties;
  ticket: boolean;
  faq: boolean;
  contactCard: boolean;
  customLinks: boolean;
  faqItems: FaqItem[];
  linkItems: LinkItem[];
  previewTab: Tab;
  setPreviewTab: (t: Tab) => void;
  appearance: Appearance;
}) {
  const heroBg =
    background === "solid"
      ? theme
      : background === "gradient"
        ? `linear-gradient(180deg, #12142a 0%, ${theme} 100%)`
        : `linear-gradient(180deg, rgba(20,22,45,0.9), ${theme}), repeating-linear-gradient(45deg, #e5e7eb, #e5e7eb 4px, #f3f4f6 4px, #f3f4f6 8px)`;

  return (
    <div
      className="absolute w-[360px] h-[560px] rounded-[28px] shadow-2xl overflow-hidden flex flex-col"
      style={{ ...position, background: surface, border: `1px solid ${border}` }}
    >
      {previewTab === "home" ? (
        <>
          {/* hero */}
          <div className="relative px-5 pt-6 pb-14" style={{ background: heroBg }}>
            <div className="flex items-center justify-between">
              <div className="h-9 w-9 rounded-full bg-white/15 backdrop-blur flex items-center justify-center">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <X className="h-4 w-4 text-white/80" />
            </div>
            <div className="mt-6 text-white text-[22px] font-bold leading-tight pr-6">
              {greeting}
            </div>
            <div className="text-white/70 text-[12px] mt-2">
              We're here to help — search below or pick an option.
            </div>
          </div>

          {/* floating chat pill */}
          <div className="px-4 -mt-6 relative z-10">
            <button
              onClick={() => setPreviewTab("messages")}
              className="w-full h-12 rounded-full bg-white shadow-lg flex items-center gap-2 px-4 text-[13px] font-medium text-neutral-700 border border-black/5"
            >
              <MessageSquare className="h-4 w-4" style={{ color: theme }} />
              Chat with us
              <span className="ml-auto text-[11px] text-neutral-400">Send a message</span>
            </button>
          </div>

          {/* content list */}
          <div className="flex-1 overflow-y-auto px-4 pt-4 pb-2 space-y-3">
            {ticket && (
              <div
                className="rounded-2xl p-4 flex items-center gap-3"
                style={{
                  background: appearance === "dark" ? "rgba(255,255,255,0.05)" : "#fff7ed",
                  border: `1px solid ${appearance === "dark" ? "rgba(255,255,255,0.08)" : "#fed7aa"}`,
                }}
              >
                <div
                  className="h-10 w-10 rounded-xl flex items-center justify-center text-white"
                  style={{ background: theme }}
                >
                  <Ticket className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="text-[13px] font-bold" style={{ color: surfaceText }}>
                    75 Tickets to be reviewed
                  </div>
                  <div className="text-[11px]" style={{ color: mutedText }}>
                    view recent open tickets
                  </div>
                </div>
                <ChevronRight className="h-4 w-4" style={{ color: mutedText }} />
              </div>
            )}

            {faq && faqItems.length > 0 && (
              <div>
                <div className="text-[12px] font-bold mb-2" style={{ color: surfaceText }}>Quick answers</div>
                <div className="rounded-xl overflow-hidden border" style={{ borderColor: border }}>
                  {faqItems.map((f, i) => (
                    <FaqAccordion
                      key={f.id}
                      question={f.question || `Question ${i + 1}`}
                      answer={f.answer}
                      surfaceText={surfaceText}
                      mutedText={mutedText}
                      border={border}
                      theme={theme}
                      last={i === faqItems.length - 1}
                    />
                  ))}
                </div>
              </div>
            )}

            {customLinks && linkItems.length > 0 && (
              <div className="space-y-2">
                {linkItems.map((l) => (
                  <a
                    key={l.id}
                    href={l.url || "#"}
                    className="flex items-center justify-between px-4 h-11 rounded-xl border text-[13px] font-semibold"
                    style={{ borderColor: border, color: surfaceText, background: appearance === "dark" ? "rgba(255,255,255,0.03)" : "white" }}
                  >
                    <span>{l.name || l.url || "Untitled link"}</span>
                    <ChevronRight className="h-4 w-4" style={{ color: mutedText }} />
                  </a>
                ))}
              </div>
            )}

            {contactCard && <ListRow label="Contact us" desc="Talk to a real human" color={surfaceText} muted={mutedText} border={border} />}
          </div>


          <BottomTabs tab={previewTab} setTab={setPreviewTab} theme={theme} mutedText={mutedText} border={border} surface={surface} />
        </>
      ) : (
        <>
          <div className="h-14 flex items-center justify-between px-4" style={{ background: theme }}>
            <div className="flex items-center gap-2 text-white">
              <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center">
                <Bot className="h-4 w-4" />
              </div>
              <div className="text-[13px] font-semibold">Messages</div>
            </div>
            <X className="h-4 w-4 text-white/80" />
          </div>
          <div className="flex-1 p-4 space-y-2.5 overflow-y-auto">
            <MsgBubble text="Welcome back! How can I help you today?" color={appearance === "dark" ? "#2a2c36" : "#f3f4f6"} fg={surfaceText} />
            <MsgBubble text="Do you offer refunds?" color={theme} fg="#fff" right />
            <MsgBubble text="Yes — full refunds within 30 days, no questions asked." color={appearance === "dark" ? "#2a2c36" : "#f3f4f6"} fg={surfaceText} />
          </div>
          <div className="border-t flex items-center px-3 gap-2 h-14" style={{ borderColor: border }}>
            <Paperclip className="h-4 w-4" style={{ color: mutedText }} />
            <input
              placeholder="Type your message…"
              className="flex-1 h-9 rounded-full px-3 text-[12px] outline-none border"
              style={{ borderColor: border, background: "transparent", color: surfaceText }}
            />
            <button className="h-9 w-9 rounded-full flex items-center justify-center text-white" style={{ background: theme }}>
              <Send className="h-4 w-4" />
            </button>
          </div>
          <BottomTabs tab={previewTab} setTab={setPreviewTab} theme={theme} mutedText={mutedText} border={border} surface={surface} />
        </>
      )}
    </div>
  );
}

function ListRow({
  label,
  desc,
  color,
  muted,
  border,
}: {
  label: string;
  desc: string;
  color: string;
  muted: string;
  border: string;
}) {
  return (
    <button
      className="w-full flex items-center gap-3 py-3 px-1 border-b text-left"
      style={{ borderColor: border }}
    >
      <div className="flex-1">
        <div className="text-[13px] font-semibold" style={{ color }}>{label}</div>
        <div className="text-[11px]" style={{ color: muted }}>{desc}</div>
      </div>
      <ChevronRight className="h-4 w-4" style={{ color: muted }} />
    </button>
  );
}

function BottomTabs({
  tab,
  setTab,
  theme,
  mutedText,
  border,
  surface,
}: {
  tab: Tab;
  setTab: (t: Tab) => void;
  theme: string;
  mutedText: string;
  border: string;
  surface: string;
}) {
  return (
    <div className="h-14 border-t flex items-stretch" style={{ borderColor: border, background: surface }}>
      {(
        [
          { k: "home" as Tab, label: "Home", icon: HomeIcon },
          { k: "messages" as Tab, label: "Messages", icon: MessageSquare },
        ]
      ).map(({ k, label, icon: Icon }) => {
        const active = tab === k;
        return (
          <button
            key={k}
            onClick={() => setTab(k)}
            className="flex-1 flex flex-col items-center justify-center gap-0.5"
            style={{ color: active ? theme : mutedText }}
          >
            <Icon className="h-[18px] w-[18px]" />
            <span className="text-[10px] font-semibold">{label}</span>
          </button>
        );
      })}
    </div>
  );
}

function MsgBubble({
  text,
  color,
  fg,
  right,
}: {
  text: string;
  color: string;
  fg: string;
  right?: boolean;
}) {
  return (
    <div className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-[12.5px] ${right ? "ml-auto" : ""}`} style={{ background: color, color: fg }}>
      {text}
    </div>
  );
}
