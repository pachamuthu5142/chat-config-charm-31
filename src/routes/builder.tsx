import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  Bot,
  Check,
  Copy,
  MessageSquare,
  Pencil,
  Redo2,
  RotateCcw,
  Sparkles,
  Undo2,
} from "lucide-react";
import { embedCode, themeName, type Tab } from "../widget/config";
import { WidgetPreview } from "../widget/WidgetPreview";
import {
  deriveConfig,
  isLauncherAnswer,
  useBuilder,
  type AnswerValue,
  type StepDef,
} from "../builder/engine";
import {
  BoldMini,
  Chips,
  ChoiceCards,
  ClassicMini,
  ColorPickerControl,
  ContactsControl,
  DockedMini,
  EntityWizard,
  FaqControl,
  LauncherControl,
  LogoUploadControl,
  LsFieldsControl,
  MountControl,
  OverviewMini,
  SimpleMini,
  TextControl,
} from "../builder/controls";
import type { EntityCardCfg } from "../widget/config";

export const Route = createFileRoute("/builder")({
  component: BuilderPage,
});

const ACCENT = "#f05742";

/** A selection made but not yet confirmed — previewed live, committed on confirm. */
type Pending = { stepId: string; value: AnswerValue } | null;

function BuilderPage() {
  const b = useBuilder();
  const [previewTab, setPreviewTab] = useState<Tab>("home");
  const [pending, setPending] = useState<Pending>(null);
  const [entityDraft, setEntityDraft] = useState<EntityCardCfg | null>(null);
  const [entityTesting, setEntityTesting] = useState(false);
  const [mobilePane, setMobilePane] = useState<"chat" | "preview">("chat");
  const [celebrate, setCelebrate] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // the preview reflects pending (unconfirmed) selections immediately
  const previewCfg = useMemo(
    () => (pending ? deriveConfig({ ...b.answers, [pending.stepId]: pending.value }) : b.config),
    [pending, b.answers, b.config],
  );

  // keep the conversation pinned to the active question
  useEffect(() => {
    const el = scrollRef.current;
    if (el) requestAnimationFrame(() => el.scrollTo({ top: el.scrollHeight, behavior: "smooth" }));
  }, [b.currentStep?.id, b.editing, entityDraft, entityTesting]);

  // celebrate once when the flow completes
  useEffect(() => {
    if (b.done) {
      setCelebrate(true);
      const t = setTimeout(() => setCelebrate(false), 3200);
      return () => clearTimeout(t);
    }
  }, [b.done]);

  return (
    <div
      className="font-sans h-screen w-screen overflow-hidden flex flex-col text-[13px] text-neutral-800 antialiased"
      style={{
        fontFamily: '"DM Sans", ui-sans-serif, system-ui, sans-serif',
        background: "#f7f7f8",
      }}
    >
      {/* top bar */}
      <header className="h-14 shrink-0 px-4 lg:px-6 flex items-center gap-3 border-b border-black/5 bg-white">
        <Link
          to="/"
          className="h-8 w-8 rounded-lg flex items-center justify-center text-neutral-500 hover:bg-neutral-100"
          title="Classic form builder"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div
          className="h-8 w-8 rounded-lg flex items-center justify-center"
          style={{ background: ACCENT }}
        >
          <MessageSquare className="h-4 w-4 text-white" />
        </div>
        <div className="leading-tight">
          <div className="text-[13px] font-bold text-neutral-900">Widget Designer</div>
          <div className="text-[10.5px] text-neutral-400">Conversational builder</div>
        </div>

        {/* progress */}
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="w-full max-w-56 hidden sm:flex items-center gap-2.5">
            <div className="flex-1 h-1.5 rounded-full bg-neutral-100 overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ background: ACCENT }}
                animate={{ width: `${b.progress}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
            <span className="text-[11px] font-semibold text-neutral-500 tabular-nums">
              {b.progress}%
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <IconBtn title="Undo" disabled={!b.canUndo} onClick={b.undo}>
            <Undo2 className="h-4 w-4" />
          </IconBtn>
          <IconBtn title="Redo" disabled={!b.canRedo} onClick={b.redo}>
            <Redo2 className="h-4 w-4" />
          </IconBtn>
          <IconBtn
            title="Start over"
            disabled={Object.keys(b.answers).length === 0}
            onClick={b.restart}
          >
            <RotateCcw className="h-4 w-4" />
          </IconBtn>
        </div>
      </header>

      {/* mobile pane switch */}
      <div className="lg:hidden flex border-b border-black/5 bg-white">
        {(["chat", "preview"] as const).map((k) => (
          <button
            key={k}
            onClick={() => setMobilePane(k)}
            className="flex-1 h-10 text-[12px] font-semibold capitalize border-b-2 transition"
            style={{
              borderColor: mobilePane === k ? ACCENT : "transparent",
              color: mobilePane === k ? "#111" : "#9ca3af",
            }}
          >
            {k === "chat" ? "Conversation" : "Preview"}
          </button>
        ))}
      </div>

      <div className="flex-1 flex min-h-0">
        {/* left: conversation */}
        <section
          className={`${mobilePane === "chat" ? "flex" : "hidden"} lg:flex flex-col w-full lg:w-[420px] xl:w-[460px] shrink-0 bg-white border-r border-black/5`}
        >
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-6 space-y-6">
            {b.steps.map((step) => {
              const answered = step.id in b.answers && step.kind !== "finish";
              const isCurrent = b.currentStep?.id === step.id;
              const isEditing = b.editing === step.id;
              if (!answered && !isCurrent) return null;
              return (
                <StepBlock
                  key={step.id}
                  step={step}
                  answered={answered}
                  isEditing={isEditing}
                  isActive={isCurrent || isEditing}
                  summary={answered ? step.summarize(b.answers[step.id], b.config) : ""}
                  onEdit={() => {
                    setPending(null);
                    b.edit(step.id);
                  }}
                  onCancelEdit={() => {
                    setPending(null);
                    b.cancelEdit();
                  }}
                >
                  {(isCurrent || isEditing) && (
                    <StepControl
                      step={step}
                      builder={b}
                      pending={pending}
                      setPending={setPending}
                      onEntityDraft={setEntityDraft}
                      onEntityTesting={setEntityTesting}
                      onDone={() => {
                        setEntityDraft(null);
                        setEntityTesting(false);
                      }}
                    />
                  )}
                </StepBlock>
              );
            })}

            {b.done && !b.editing && <CompletionBlock builder={b} />}
          </div>
        </section>

        {/* center: live preview */}
        <section
          className={`${mobilePane === "preview" ? "block" : "hidden"} lg:block flex-1 relative min-w-0`}
          style={{ background: "#eceef1" }}
        >
          <div className="absolute top-0 inset-x-0 h-12 px-5 flex items-center justify-between z-20 pointer-events-none">
            <div className="text-[10.5px] font-semibold tracking-[0.14em] text-neutral-400">
              LIVE PREVIEW
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-neutral-500">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-60 animate-ping" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
              </span>
              Updates as you answer
            </div>
          </div>
          <WidgetPreview
            cfg={previewCfg}
            tab={previewTab}
            setTab={setPreviewTab}
            entityDraft={entityDraft}
            entityTesting={entityTesting}
            celebrate={celebrate}
          />
        </section>

        {/* right: configuration timeline */}
        <aside className="hidden xl:flex w-64 shrink-0 flex-col bg-white border-l border-black/5">
          <div className="h-12 px-4 flex items-center text-[10.5px] font-semibold tracking-[0.14em] text-neutral-400 border-b border-black/5">
            YOUR CONFIGURATION
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-1">
            <AnimatePresence initial={false}>
              {b.steps
                .filter((s) => s.kind !== "finish")
                .map((step) => {
                  const answered = step.id in b.answers;
                  const active = b.currentStep?.id === step.id || b.editing === step.id;
                  return (
                    <motion.button
                      key={step.id}
                      layout
                      initial={{ opacity: 0, x: 12 }}
                      animate={{ opacity: 1, x: 0 }}
                      onClick={() => {
                        if (answered) {
                          setPending(null);
                          b.edit(step.id);
                        }
                      }}
                      disabled={!answered}
                      className="w-full flex items-start gap-2.5 rounded-lg px-2.5 py-2 text-left transition group disabled:cursor-default enabled:hover:bg-neutral-50"
                      style={active ? { background: "#fff5f2" } : undefined}
                    >
                      <span
                        className="mt-0.5 h-5 w-5 rounded-full flex items-center justify-center shrink-0 border transition"
                        style={{
                          background: answered ? "#16a34a" : "white",
                          borderColor: answered ? "#16a34a" : active ? ACCENT : "#e5e7eb",
                        }}
                      >
                        {answered ? (
                          <Check className="h-3 w-3 text-white" strokeWidth={3} />
                        ) : active ? (
                          <span
                            className="h-1.5 w-1.5 rounded-full"
                            style={{ background: ACCENT }}
                          />
                        ) : null}
                      </span>
                      <span className="flex-1 min-w-0">
                        <span className="block text-[12px] font-semibold text-neutral-800">
                          {step.label}
                        </span>
                        <span className="block text-[11px] text-neutral-400 truncate">
                          {answered
                            ? step.summarize(b.answers[step.id], b.config)
                            : active
                              ? "Deciding now…"
                              : "Up next"}
                        </span>
                      </span>
                      {answered && (
                        <Pencil className="h-3 w-3 mt-1 text-neutral-300 opacity-0 group-hover:opacity-100 transition shrink-0" />
                      )}
                    </motion.button>
                  );
                })}
            </AnimatePresence>
          </div>
          {step_theme_chip(previewCfg.theme)}
        </aside>
      </div>
    </div>
  );
}

function step_theme_chip(theme: string) {
  return (
    <div className="p-3 border-t border-black/5 flex items-center gap-2 text-[11px] text-neutral-500">
      <span
        className="h-4 w-4 rounded-full border border-black/10"
        style={{ background: theme, transition: "background 500ms ease" }}
      />
      Brand color · {themeName(theme)}
    </div>
  );
}

function IconBtn({
  children,
  title,
  disabled,
  onClick,
}: {
  children: React.ReactNode;
  title: string;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      title={title}
      disabled={disabled}
      onClick={onClick}
      className="h-8 w-8 rounded-lg flex items-center justify-center text-neutral-500 hover:bg-neutral-100 disabled:opacity-30 disabled:hover:bg-transparent transition"
    >
      {children}
    </button>
  );
}

// ---------- one Q&A block in the conversation ----------
function StepBlock({
  step,
  answered,
  isEditing,
  isActive,
  summary,
  onEdit,
  onCancelEdit,
  children,
}: {
  step: StepDef;
  answered: boolean;
  isEditing: boolean;
  isActive: boolean;
  summary: string;
  onEdit: () => void;
  onCancelEdit: () => void;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-3"
    >
      {/* assistant bubble */}
      <div className="flex gap-2.5">
        <div
          className="h-7 w-7 rounded-full flex items-center justify-center shrink-0 mt-0.5"
          style={{ background: ACCENT }}
        >
          <Bot className="h-3.5 w-3.5 text-white" />
        </div>
        <div className="max-w-[85%]">
          <div className="rounded-2xl rounded-tl-md bg-neutral-100 px-3.5 py-2.5 text-[13px] leading-relaxed text-neutral-800">
            {step.prompt}
          </div>
          {step.hint && isActive && (
            <div className="text-[11px] text-neutral-400 mt-1 ml-1">{step.hint}</div>
          )}
        </div>
      </div>

      {/* answered → user bubble with hover-edit */}
      {answered && !isEditing && (
        <div className="flex justify-end group">
          <div className="flex items-center gap-2">
            <button
              onClick={onEdit}
              className="opacity-0 group-hover:opacity-100 transition inline-flex items-center gap-1 text-[11px] font-semibold text-neutral-400 hover:text-[#f05742]"
            >
              <Pencil className="h-3 w-3" /> Edit
            </button>
            <div
              className="rounded-2xl rounded-tr-md px-3.5 py-2.5 text-[13px] font-medium text-white max-w-[75%]"
              style={{ background: "#1e2028" }}
            >
              {summary}
            </div>
          </div>
        </div>
      )}

      {/* active control */}
      {isActive && (
        <div className="pl-9 space-y-2">
          {children}
          {isEditing && (
            <button
              onClick={onCancelEdit}
              className="text-[11.5px] text-neutral-400 hover:text-neutral-600 underline underline-offset-2"
            >
              Never mind — keep my answer
            </button>
          )}
        </div>
      )}
    </motion.div>
  );
}

// ---------- routes each step kind to its control ----------
function StepControl({
  step,
  builder,
  pending,
  setPending,
  onEntityDraft,
  onEntityTesting,
  onDone,
}: {
  step: StepDef;
  builder: ReturnType<typeof useBuilder>;
  pending: Pending;
  setPending: (p: Pending) => void;
  onEntityDraft: (e: EntityCardCfg | null) => void;
  onEntityTesting: (t: boolean) => void;
  onDone: () => void;
}) {
  const b = builder;
  const prev = b.answers[step.id];
  const pendingVal = pending && pending.stepId === step.id ? pending.value : undefined;

  // select controls preview live, then commit on confirm
  const select = (v: AnswerValue) => setPending({ stepId: step.id, value: v });
  const commit = (v?: AnswerValue) => {
    const value = v !== undefined ? v : pendingVal;
    if (value === undefined) return;
    setPending(null);
    b.answer(step.id, value);
  };
  const selected =
    typeof pendingVal === "string" ? pendingVal : typeof prev === "string" ? prev : undefined;
  const confirmRow = pendingVal !== undefined && (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="pt-1">
      <button
        onClick={() => commit()}
        className="h-9 px-4 rounded-full text-[12.5px] font-semibold text-white inline-flex items-center gap-1.5"
        style={{ background: ACCENT }}
      >
        <Check className="h-3.5 w-3.5" strokeWidth={3} /> Confirm
      </button>
    </motion.div>
  );

  switch (step.kind) {
    case "template":
      return (
        <>
          <ChoiceCards
            value={selected}
            options={[
              {
                value: "overview",
                title: "Overview",
                desc: "Home tab with content blocks + chat.",
                art: <OverviewMini />,
              },
              {
                value: "simple",
                title: "Simple",
                desc: "A focused chat window, nothing else.",
                art: <SimpleMini />,
              },
            ]}
            onSelect={select}
          />
          {confirmRow}
        </>
      );
    case "variant":
      return (
        <>
          <ChoiceCards
            value={selected}
            options={[
              { value: "classic", title: "Classic", desc: "Floating bubble", art: <ClassicMini /> },
              { value: "bold", title: "Bold", desc: "Wide side panel", art: <BoldMini /> },
              { value: "docked", title: "Docked", desc: "Edge-docked rail", art: <DockedMini /> },
            ]}
            onSelect={select}
          />
          {confirmRow}
        </>
      );
    case "appearance":
      return (
        <>
          <Chips
            value={selected}
            options={[
              { value: "light", label: "☀️ Light" },
              { value: "dark", label: "🌙 Dark" },
            ]}
            onSelect={select}
          />
          {confirmRow}
        </>
      );
    case "color":
      return (
        <>
          <ColorPickerControl value={selected} onSelect={select} />
          {confirmRow}
        </>
      );
    case "background":
      return (
        <>
          <Chips
            value={selected}
            options={[
              { value: "gradient", label: "Gradient" },
              { value: "solid", label: "Solid" },
            ]}
            onSelect={select}
          />
          {confirmRow}
        </>
      );
    case "position":
      return (
        <>
          <Chips
            value={selected}
            options={[
              { value: "left", label: "⬅ Bottom left" },
              { value: "right", label: "Bottom right ➡" },
            ]}
            onSelect={select}
          />
          {confirmRow}
        </>
      );
    case "launcher":
      return (
        <LauncherControl
          initial={
            isLauncherAnswer(pendingVal ?? null)
              ? (pendingVal as { style: "icon" | "pill"; text: string })
              : isLauncherAnswer(prev ?? null)
                ? (prev as { style: "icon" | "pill"; text: string })
                : { style: b.config.launcherStyle, text: b.config.launcherText }
          }
          onChange={select}
          onConfirm={(v) => commit(v)}
        />
      );
    case "logo":
      return (
        <LogoUploadControl
          onChange={select}
          onConfirm={(v) => commit(v)}
          onSkip={() => commit(null)}
        />
      );
    case "text":
      return (
        <TextControl
          placeholder="Hi there 👋 How can we help?"
          initial={typeof prev === "string" ? prev : ""}
          suggestions={[
            "Hi there 👋 How can we help you today?",
            "Welcome! Ask us anything.",
            "Hey 👋 Need a hand?",
          ]}
          onSubmit={(v) => commit(v)}
          onSkip={step.skippable ? () => commit(null) : undefined}
        />
      );
    case "mount":
      return (
        <MountControl
          initial={
            typeof prev === "string" && prev.startsWith("element:")
              ? { mode: "element", selector: prev.slice("element:".length) }
              : { mode: "root", selector: "" }
          }
          onSubmit={({ mode, selector }) =>
            commit(mode === "element" ? `element:${selector}` : "root")
          }
        />
      );
    case "urls":
      return (
        <TextControl
          placeholder="https://example.com, https://example.com/pricing"
          initial={typeof prev === "string" ? prev : ""}
          submitLabel="Save"
          onSubmit={(v) => commit(v)}
          onSkip={step.skippable ? () => commit(null) : undefined}
        />
      );
    case "faq":
      return (
        <FaqControl
          initial={b.config.faqItems}
          onSubmit={(items) => b.answer(step.id, items)}
          onSkip={() => b.answer(step.id, null)}
        />
      );
    case "contacts":
      return (
        <ContactsControl
          initial={b.config.contacts}
          onSubmit={(items) => b.answer(step.id, items)}
          onSkip={() => b.answer(step.id, null)}
        />
      );
    case "lsparams":
      return (
        <LsFieldsControl
          initial={b.config.localStorageParams}
          onSubmit={(params) => commit(params)}
          onSkip={() => commit(null)}
        />
      );
    case "entities":
      return (
        <EntityWizard
          lsParams={b.config.localStorageParams}
          onDraft={onEntityDraft}
          onTesting={onEntityTesting}
          onSubmit={(entities) => {
            onDone();
            b.answer(step.id, entities);
          }}
          onSkip={() => {
            onDone();
            b.answer(step.id, null);
          }}
        />
      );
    case "finish":
      return null;
  }
}

// ---------- completion ----------
const PLATFORMS = [
  "Script Tag",
  "Google Tag Manager",
  "WordPress",
  "Shopify",
  "Wix",
  "Squarespace",
];
const PLATFORM_INSTRUCTIONS: Record<string, string> = {
  "Script Tag":
    "Paste the snippet before the closing </body> tag of every page where the widget should appear.",
  "Google Tag Manager":
    "In GTM, create a new Custom HTML tag, paste the snippet, and set the trigger to All Pages.",
  WordPress:
    "Open Appearance → Theme File Editor, choose footer.php and paste the snippet before </body>.",
  Shopify:
    "In your admin, go to Online Store → Themes → Edit code → theme.liquid and paste before </body>.",
  Wix: "Add a Custom Code element under Settings → Custom Code and paste the snippet in the Body — end section.",
  Squarespace: "Under Settings → Advanced → Code Injection, paste the snippet in the Footer field.",
};

function CompletionBlock({ builder: b }: { builder: ReturnType<typeof useBuilder> }) {
  const [showCode, setShowCode] = useState(false);
  const [copied, setCopied] = useState(false);
  const [platform, setPlatform] = useState("Script Tag");
  const code = embedCode(b.config);

  const checklist = [
    { label: "Appearance", done: true },
    { label: "Content", done: true },
    { label: "FAQ", done: b.config.faqOn },
    { label: "Entity cards", done: b.config.entitiesOn },
    { label: "Logo", done: !!b.config.logoUrl },
    { label: "Website URLs", done: !!b.config.siteUrls.trim() },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-4"
    >
      <div className="flex gap-2.5">
        <div
          className="h-7 w-7 rounded-full flex items-center justify-center shrink-0 mt-0.5"
          style={{ background: ACCENT }}
        >
          <Sparkles className="h-3.5 w-3.5 text-white" />
        </div>
        <div className="rounded-2xl rounded-tl-md bg-neutral-100 px-3.5 py-2.5 text-[13px] leading-relaxed text-neutral-800 max-w-[85%]">
          🎉 Your widget is ready! Here's what we built together:
        </div>
      </div>

      <div className="pl-9 space-y-3">
        <div className="rounded-xl border border-neutral-200 bg-white p-3 space-y-1.5">
          {checklist.map((c, i) => (
            <motion.div
              key={c.label}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 + i * 0.12 }}
              className="flex items-center gap-2 text-[12.5px]"
            >
              <span
                className="h-5 w-5 rounded-full flex items-center justify-center"
                style={{ background: c.done ? "#16a34a" : "#e5e7eb" }}
              >
                <Check className="h-3 w-3 text-white" strokeWidth={3} />
              </span>
              <span className={c.done ? "text-neutral-800 font-medium" : "text-neutral-400"}>
                {c.label}
                {!c.done && " · skipped"}
              </span>
            </motion.div>
          ))}
        </div>

        {!showCode ? (
          <button
            onClick={() => setShowCode(true)}
            className="h-10 px-5 rounded-xl text-white text-[13px] font-semibold shadow-sm hover:brightness-95 transition"
            style={{ background: ACCENT }}
          >
            Generate embed code
          </button>
        ) : (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="overflow-hidden"
          >
            <div className="relative rounded-xl bg-neutral-900 text-neutral-100 p-4 pr-20 font-mono text-[11px] leading-[1.6] whitespace-pre-wrap break-all">
              {code}
              <button
                onClick={() => {
                  navigator.clipboard?.writeText(code);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1500);
                }}
                className="absolute top-2.5 right-2.5 h-7 px-2.5 rounded-md text-[11px] font-semibold text-neutral-900 bg-white hover:bg-neutral-100 flex items-center gap-1"
              >
                <Copy className="h-3 w-3" /> {copied ? "Copied!" : "Copy"}
              </button>
            </div>
            <div className="text-[11.5px] text-neutral-500 mt-2 space-y-0.5">
              <div>
                Renders:{" "}
                <span className="font-medium">
                  {b.config.mountMode === "element"
                    ? `inside ${b.config.mountSelector}`
                    : "floating at the page root"}
                </span>
              </div>
              {b.config.siteUrls.trim() && (
                <div>
                  Appears on: <span className="font-medium">{b.config.siteUrls}</span>
                </div>
              )}
            </div>

            {/* platform instructions */}
            <div className="mt-4">
              <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-2">
                How to install
              </div>
              <div className="flex flex-wrap gap-1.5 mb-2.5">
                {PLATFORMS.map((pl) => {
                  const sel = platform === pl;
                  return (
                    <button
                      key={pl}
                      onClick={() => setPlatform(pl)}
                      className="h-7 px-3 rounded-full text-[11px] font-semibold border transition"
                      style={{
                        background: sel ? ACCENT : "white",
                        borderColor: sel ? ACCENT : "#e5e7eb",
                        color: sel ? "white" : "#374151",
                      }}
                    >
                      {pl}
                    </button>
                  );
                })}
              </div>
              <AnimatePresence mode="wait">
                <motion.div
                  key={platform}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.2 }}
                  className="rounded-xl border border-neutral-200 bg-neutral-50 p-3.5 text-[12px] text-neutral-700 leading-relaxed"
                >
                  {PLATFORM_INSTRUCTIONS[platform]}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
