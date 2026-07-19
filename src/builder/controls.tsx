// Interactive controls rendered inside the conversation. Each control answers
// exactly one decision; nothing here writes config directly — controls hand a
// value back to the engine.
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bell,
  Check,
  ImageIcon,
  Loader2,
  MessageSquare,
  Package,
  Pencil,
  Plus,
  ShoppingBag,
  Sparkles,
  Star,
  Ticket,
  Trash2,
  X,
  Zap,
} from "lucide-react";
import {
  buildEntityRequest,
  collectKeys,
  findAllArrays,
  newEntity,
  THEME_COLORS,
  themeName,
  type AuthKind,
  type ContactItem,
  type EntityCardCfg,
  type EntityIcon,
  type EntityLayout,
  type FaqItem,
  type LsParam,
} from "../widget/config";

const ACCENT = "#f05742";

const pop = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] as const },
};

// ---------- primitives ----------
export function ChoiceCards({
  options,
  value,
  onSelect,
}: {
  options: { value: string; title: string; desc?: string; art?: React.ReactNode }[];
  value?: string;
  onSelect: (v: string) => void;
}) {
  return (
    <motion.div
      {...pop}
      className={`grid gap-2.5 ${options.length > 2 ? "grid-cols-3" : "grid-cols-2"}`}
    >
      {options.map((o) => {
        const sel = value === o.value;
        return (
          <button
            key={o.value}
            onClick={() => onSelect(o.value)}
            className="relative text-left rounded-xl border p-3 transition hover:-translate-y-0.5 hover:shadow-md"
            style={{ borderColor: sel ? ACCENT : "#e5e7eb", background: sel ? "#fff5f2" : "white" }}
          >
            {o.art && (
              <div className="rounded-lg bg-neutral-100 h-20 mb-2 overflow-hidden flex items-center justify-center">
                {o.art}
              </div>
            )}
            <div className="text-[12.5px] font-semibold text-neutral-900">{o.title}</div>
            {o.desc && (
              <div className="text-[11px] text-neutral-500 mt-0.5 leading-snug">{o.desc}</div>
            )}
            {sel && (
              <div
                className="absolute top-2 right-2 h-5 w-5 rounded-full flex items-center justify-center"
                style={{ background: ACCENT }}
              >
                <Check className="h-3 w-3 text-white" strokeWidth={3} />
              </div>
            )}
          </button>
        );
      })}
    </motion.div>
  );
}

export function Chips({
  options,
  value,
  onSelect,
}: {
  options: { value: string; label: string }[];
  value?: string;
  onSelect: (v: string) => void;
}) {
  return (
    <motion.div {...pop} className="flex flex-wrap gap-2">
      {options.map((o) => {
        const sel = value === o.value;
        return (
          <button
            key={o.value}
            onClick={() => onSelect(o.value)}
            className="h-9 px-4 rounded-full text-[12.5px] font-semibold border transition hover:-translate-y-0.5"
            style={{
              background: sel ? ACCENT : "white",
              borderColor: sel ? ACCENT : "#e5e7eb",
              color: sel ? "white" : "#374151",
            }}
          >
            {o.label}
          </button>
        );
      })}
    </motion.div>
  );
}

export function ColorPickerControl({
  value,
  onSelect,
}: {
  value?: string;
  onSelect: (v: string) => void;
}) {
  const [custom, setCustom] = useState(value && !THEME_COLORS.includes(value) ? value : "#8b5cf6");
  return (
    <motion.div {...pop} className="space-y-3">
      <div className="flex flex-wrap gap-2.5">
        {THEME_COLORS.map((c) => (
          <button
            key={c}
            onClick={() => onSelect(c)}
            title={themeName(c)}
            className="h-9 w-9 rounded-full border-2 transition hover:scale-110"
            style={{
              background: c,
              borderColor: value === c ? "#111" : "transparent",
              boxShadow: value === c ? "0 0 0 2px white inset" : undefined,
            }}
          />
        ))}
      </div>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          className="h-9 w-9 rounded-lg cursor-pointer border border-neutral-200 bg-white p-0.5"
        />
        <span className="text-[12px] font-mono text-neutral-500">{custom}</span>
        <button
          onClick={() => onSelect(custom)}
          className="h-8 px-3 rounded-full text-[11.5px] font-semibold border border-neutral-200 text-neutral-700 hover:bg-neutral-50"
        >
          Use custom
        </button>
      </div>
    </motion.div>
  );
}

export function TextControl({
  placeholder,
  initial,
  suggestions,
  onSubmit,
  onSkip,
  submitLabel = "Looks good",
}: {
  placeholder: string;
  initial?: string;
  suggestions?: string[];
  onSubmit: (v: string) => void;
  onSkip?: () => void;
  submitLabel?: string;
}) {
  const [value, setValue] = useState(initial ?? "");
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => ref.current?.focus(), []);
  return (
    <motion.div {...pop} className="space-y-2.5">
      <div className="flex gap-2">
        <input
          ref={ref}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && value.trim() && onSubmit(value)}
          placeholder={placeholder}
          className="flex-1 h-10 px-3.5 rounded-xl border border-neutral-200 bg-white text-[13px] outline-none focus:border-[#f05742] transition"
        />
        <button
          onClick={() => value.trim() && onSubmit(value)}
          disabled={!value.trim()}
          className="h-10 px-4 rounded-xl text-white text-[12.5px] font-semibold disabled:opacity-40 transition"
          style={{ background: ACCENT }}
        >
          {submitLabel}
        </button>
      </div>
      {suggestions && suggestions.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => setValue(s)}
              className="h-7 px-2.5 rounded-full text-[11px] text-neutral-600 border border-dashed border-neutral-300 hover:border-[#f05742] hover:text-[#f05742] transition"
            >
              <Sparkles className="h-3 w-3 inline mr-1" />
              {s}
            </button>
          ))}
        </div>
      )}
      {onSkip && (
        <button
          onClick={onSkip}
          className="text-[11.5px] text-neutral-400 hover:text-neutral-600 underline underline-offset-2"
        >
          Keep the default
        </button>
      )}
    </motion.div>
  );
}

// ---------- floating button (launcher) ----------
export function LauncherControl({
  initial,
  onChange,
  onConfirm,
}: {
  initial: { style: "icon" | "pill"; text: string };
  onChange: (v: { style: "icon" | "pill"; text: string }) => void;
  onConfirm: (v: { style: "icon" | "pill"; text: string }) => void;
}) {
  const [style, setStyle] = useState<"icon" | "pill">(initial.style);
  const [text, setText] = useState(initial.text);

  const set = (s: "icon" | "pill", t: string) => {
    setStyle(s);
    setText(t);
    onChange({ style: s, text: t });
  };

  return (
    <motion.div {...pop} className="space-y-3">
      <div className="grid grid-cols-2 gap-2.5">
        {[
          { value: "icon" as const, label: "Icon + Bubble" },
          { value: "pill" as const, label: "Pill Button" },
        ].map((o) => {
          const sel = style === o.value;
          return (
            <button
              key={o.value}
              onClick={() => set(o.value, text)}
              className="relative text-left rounded-xl border p-3 transition hover:-translate-y-0.5 hover:shadow-md"
              style={{
                borderColor: sel ? ACCENT : "#e5e7eb",
                background: sel ? "#fff5f2" : "white",
              }}
            >
              <div className="rounded-lg bg-neutral-100 h-16 mb-2 flex items-center justify-center gap-1.5">
                {o.value === "icon" ? (
                  <>
                    <span className="h-7 px-2.5 rounded-full bg-white shadow border border-black/5 flex items-center text-[10px] font-bold text-neutral-800">
                      {text || "Hello!"}
                    </span>
                    <span
                      className="h-8 w-8 rounded-full flex items-center justify-center text-white"
                      style={{ background: ACCENT }}
                    >
                      <MessageSquare className="h-3.5 w-3.5" />
                    </span>
                  </>
                ) : (
                  <span
                    className="h-8 px-3 rounded-full flex items-center gap-1.5 text-white text-[10.5px] font-bold"
                    style={{ background: ACCENT }}
                  >
                    <MessageSquare className="h-3 w-3" />
                    {text || "Chat"}
                  </span>
                )}
              </div>
              <div className="text-[12.5px] font-semibold text-neutral-900">{o.label}</div>
              {sel && (
                <div
                  className="absolute top-2 right-2 h-5 w-5 rounded-full flex items-center justify-center"
                  style={{ background: ACCENT }}
                >
                  <Check className="h-3 w-3 text-white" strokeWidth={3} />
                </div>
              )}
            </button>
          );
        })}
      </div>
      <div>
        <div className="text-[11.5px] font-semibold text-neutral-600 mb-1.5">
          Button text <span style={{ color: ACCENT }}>*</span>
        </div>
        <input
          value={text}
          maxLength={35}
          onChange={(e) => set(style, e.target.value)}
          placeholder="Chat with us"
          className="w-full h-10 px-3.5 rounded-xl border border-neutral-200 bg-white text-[13px] outline-none focus:border-[#f05742] transition"
        />
        <div className="text-[10.5px] text-neutral-400 mt-1">{text.length}/35</div>
      </div>
      <button
        onClick={() => onConfirm({ style, text: text.trim() || "Chat with us" })}
        disabled={!text.trim()}
        className="h-9 px-4 rounded-full text-[12.5px] font-semibold text-white disabled:opacity-40"
        style={{ background: ACCENT }}
      >
        Looks good
      </button>
    </motion.div>
  );
}

// ---------- logo upload ----------
export function LogoUploadControl({
  onChange,
  onConfirm,
  onSkip,
}: {
  onChange: (dataUrl: string) => void;
  onConfirm: (dataUrl: string) => void;
  onSkip: () => void;
}) {
  const [dataUrl, setDataUrl] = useState("");
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("That doesn't look like an image — try a PNG, JPG, or SVG.");
      return;
    }
    if (file.size > 1024 * 1024) {
      setError("Keep it under 1 MB — header logos are tiny anyway.");
      return;
    }
    setError("");
    const reader = new FileReader();
    reader.onload = () => {
      const url = String(reader.result);
      setDataUrl(url);
      onChange(url);
    };
    reader.readAsDataURL(file);
  };

  return (
    <motion.div {...pop} className="space-y-2.5">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      <button
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          handleFile(e.dataTransfer.files?.[0]);
        }}
        className="w-full rounded-xl border-2 border-dashed border-neutral-300 hover:border-[#f05742] transition p-5 flex flex-col items-center gap-2 text-neutral-500 hover:text-[#f05742] bg-white"
      >
        {dataUrl ? (
          <img
            src={dataUrl}
            alt="logo preview"
            className="h-14 w-14 rounded-full object-cover border border-neutral-200"
          />
        ) : (
          <ImageIcon className="h-6 w-6" />
        )}
        <span className="text-[12px] font-semibold">
          {dataUrl ? "Choose a different image" : "Upload logo — click or drop an image"}
        </span>
        <span className="text-[10.5px] text-neutral-400">PNG, JPG or SVG · up to 1 MB</span>
      </button>
      {error && <div className="text-[11.5px] text-red-600">{error}</div>}
      <div className="flex items-center gap-3">
        <button
          onClick={() => dataUrl && onConfirm(dataUrl)}
          disabled={!dataUrl}
          className="h-9 px-4 rounded-full text-[12.5px] font-semibold text-white disabled:opacity-40"
          style={{ background: ACCENT }}
        >
          Use this logo
        </button>
        <button
          onClick={onSkip}
          className="text-[11.5px] text-neutral-400 hover:text-neutral-600 underline underline-offset-2"
        >
          Keep the default icon
        </button>
      </div>
    </motion.div>
  );
}

// ---------- placement (page root vs specific element) ----------
export function MountControl({
  initial,
  onSubmit,
}: {
  initial: { mode: "root" | "element"; selector: string };
  onSubmit: (v: { mode: "root" | "element"; selector: string }) => void;
}) {
  const [mode, setMode] = useState<"root" | "element">(initial.mode);
  const [selector, setSelector] = useState(initial.selector);

  return (
    <motion.div {...pop} className="space-y-3">
      <div className="grid grid-cols-2 gap-2.5">
        {[
          {
            value: "root" as const,
            title: "Page root",
            desc: "Floats over the page in the corner you chose. The usual choice.",
          },
          {
            value: "element" as const,
            title: "Inside an element",
            desc: "Renders embedded inside a container on your page.",
          },
        ].map((o) => {
          const sel = mode === o.value;
          return (
            <button
              key={o.value}
              onClick={() => setMode(o.value)}
              className="relative text-left rounded-xl border p-3 transition hover:-translate-y-0.5 hover:shadow-md"
              style={{
                borderColor: sel ? ACCENT : "#e5e7eb",
                background: sel ? "#fff5f2" : "white",
              }}
            >
              <div className="rounded-lg bg-neutral-100 h-14 mb-2 p-1.5">
                {o.value === "root" ? (
                  <div className="relative h-full">
                    <div className="h-1.5 w-8 rounded bg-neutral-300" />
                    <div className="h-1.5 w-12 rounded bg-neutral-200 mt-1" />
                    <div
                      className="absolute bottom-0 right-0 h-5 w-5 rounded-md"
                      style={{ background: ACCENT }}
                    />
                  </div>
                ) : (
                  <div className="flex gap-1.5 h-full">
                    <div className="flex-1 space-y-1">
                      <div className="h-1.5 rounded bg-neutral-300" />
                      <div className="h-1.5 rounded bg-neutral-200" />
                    </div>
                    <div
                      className="w-1/2 rounded-md border-2 border-dashed flex items-center justify-center"
                      style={{ borderColor: ACCENT }}
                    >
                      <div className="h-4 w-4 rounded-sm" style={{ background: ACCENT }} />
                    </div>
                  </div>
                )}
              </div>
              <div className="text-[12.5px] font-semibold text-neutral-900">{o.title}</div>
              <div className="text-[11px] text-neutral-500 mt-0.5 leading-snug">{o.desc}</div>
              {sel && (
                <div
                  className="absolute top-2 right-2 h-5 w-5 rounded-full flex items-center justify-center"
                  style={{ background: ACCENT }}
                >
                  <Check className="h-3 w-3 text-white" strokeWidth={3} />
                </div>
              )}
            </button>
          );
        })}
      </div>

      <AnimatePresence initial={false}>
        {mode === "element" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="space-y-1.5 pt-0.5">
              <div className="text-[11.5px] font-semibold text-neutral-600">
                CSS selector of the container <span style={{ color: ACCENT }}>*</span>
              </div>
              <input
                value={selector}
                onChange={(e) => setSelector(e.target.value)}
                placeholder="#chat-container  ·  .support-panel  ·  [data-chat]"
                className="w-full h-10 px-3.5 rounded-xl border border-neutral-200 bg-white text-[13px] font-mono outline-none focus:border-[#f05742] transition"
              />
              <div className="text-[10.5px] text-neutral-400">
                The widget fills this element instead of floating. Make sure it exists on the page.
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => onSubmit({ mode, selector: mode === "element" ? selector.trim() : "" })}
        disabled={mode === "element" && !selector.trim()}
        className="h-9 px-4 rounded-full text-[12.5px] font-semibold text-white disabled:opacity-40 inline-flex items-center gap-1.5"
        style={{ background: ACCENT }}
      >
        <Check className="h-3.5 w-3.5" strokeWidth={3} /> Confirm
      </button>
    </motion.div>
  );
}

// ---------- FAQ editor ----------
export function FaqControl({
  initial,
  onSubmit,
  onSkip,
}: {
  initial: FaqItem[];
  onSubmit: (items: FaqItem[]) => void;
  onSkip: () => void;
}) {
  const [phase, setPhase] = useState<"gate" | "edit">("gate");
  const [items, setItems] = useState<FaqItem[]>(initial);

  if (phase === "gate") {
    return (
      <motion.div {...pop} className="flex gap-2">
        <button
          onClick={() => setPhase("edit")}
          className="h-9 px-4 rounded-full text-[12.5px] font-semibold text-white"
          style={{ background: ACCENT }}
        >
          Yes, add a FAQ
        </button>
        <button
          onClick={onSkip}
          className="h-9 px-4 rounded-full text-[12.5px] font-semibold border border-neutral-200 text-neutral-600 hover:bg-neutral-50"
        >
          Not now
        </button>
      </motion.div>
    );
  }

  const update = (id: string, patch: Partial<FaqItem>) =>
    setItems((p) => p.map((f) => (f.id === id ? { ...f, ...patch } : f)));
  return (
    <motion.div {...pop} className="space-y-2.5">
      <div className="text-[11.5px] text-neutral-500">
        I've drafted a few common ones — tweak or replace them.
      </div>
      <AnimatePresence initial={false}>
        {items.map((f) => (
          <motion.div
            key={f.id}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="rounded-xl border border-neutral-200 bg-white p-2.5 space-y-1.5">
              <div className="flex gap-2">
                <input
                  value={f.question}
                  onChange={(e) => update(f.id, { question: e.target.value })}
                  placeholder="Question"
                  className="flex-1 h-9 px-3 rounded-lg border border-neutral-200 text-[12.5px] outline-none focus:border-[#f05742]"
                />
                <button
                  onClick={() => setItems((p) => p.filter((x) => x.id !== f.id))}
                  className="text-neutral-400 hover:text-red-500"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <textarea
                value={f.answer}
                onChange={(e) => update(f.id, { answer: e.target.value })}
                placeholder="Answer"
                rows={2}
                className="w-full p-2.5 rounded-lg border border-neutral-200 text-[12.5px] outline-none focus:border-[#f05742] resize-none"
              />
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
      <div className="flex items-center justify-between">
        <button
          onClick={() =>
            setItems((p) => [...p, { id: `f${Date.now()}`, question: "", answer: "" }])
          }
          className="h-8 px-3 rounded-full text-[11.5px] font-semibold border border-dashed border-neutral-300 text-neutral-600 hover:border-[#f05742] hover:text-[#f05742]"
        >
          <Plus className="h-3 w-3 inline mr-1" />
          Add question
        </button>
        <button
          onClick={() => onSubmit(items.filter((f) => f.question.trim()))}
          disabled={items.every((f) => !f.question.trim())}
          className="h-9 px-4 rounded-full text-[12.5px] font-semibold text-white disabled:opacity-40"
          style={{ background: ACCENT }}
        >
          Done — add to widget
        </button>
      </div>
    </motion.div>
  );
}

// ---------- Contacts editor ----------
export function ContactsControl({
  initial,
  onSubmit,
  onSkip,
}: {
  initial: ContactItem[];
  onSubmit: (items: ContactItem[]) => void;
  onSkip: () => void;
}) {
  const [phase, setPhase] = useState<"gate" | "edit">("gate");
  const [items, setItems] = useState<ContactItem[]>(initial);

  if (phase === "gate") {
    return (
      <motion.div {...pop} className="flex gap-2">
        <button
          onClick={() => setPhase("edit")}
          className="h-9 px-4 rounded-full text-[12.5px] font-semibold text-white"
          style={{ background: ACCENT }}
        >
          Yes, show contacts
        </button>
        <button
          onClick={onSkip}
          className="h-9 px-4 rounded-full text-[12.5px] font-semibold border border-neutral-200 text-neutral-600 hover:bg-neutral-50"
        >
          Not now
        </button>
      </motion.div>
    );
  }

  const update = (id: string, patch: Partial<ContactItem>) =>
    setItems((p) => p.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  return (
    <motion.div {...pop} className="space-y-2.5">
      {items.map((c) => (
        <div key={c.id} className="rounded-xl border border-neutral-200 bg-white p-2.5 space-y-1.5">
          <div className="flex gap-2">
            <input
              value={c.name}
              onChange={(e) => update(c.id, { name: e.target.value })}
              placeholder="Name / team"
              className="flex-1 h-9 px-3 rounded-lg border border-neutral-200 text-[12.5px] outline-none focus:border-[#f05742]"
            />
            <input
              value={c.role}
              onChange={(e) => update(c.id, { role: e.target.value })}
              placeholder="Role"
              className="flex-1 h-9 px-3 rounded-lg border border-neutral-200 text-[12.5px] outline-none focus:border-[#f05742]"
            />
            <button
              onClick={() => setItems((p) => p.filter((x) => x.id !== c.id))}
              className="text-neutral-400 hover:text-red-500"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="flex gap-2">
            <input
              value={c.email}
              onChange={(e) => update(c.id, { email: e.target.value })}
              placeholder="email@example.com"
              className="flex-1 h-9 px-3 rounded-lg border border-neutral-200 text-[12.5px] outline-none focus:border-[#f05742]"
            />
            <input
              value={c.phone}
              onChange={(e) => update(c.id, { phone: e.target.value })}
              placeholder="+1 (555) 000-0000"
              className="flex-1 h-9 px-3 rounded-lg border border-neutral-200 text-[12.5px] outline-none focus:border-[#f05742]"
            />
          </div>
        </div>
      ))}
      <div className="flex items-center justify-between">
        <button
          onClick={() =>
            setItems((p) => [
              ...p,
              { id: `c${Date.now()}`, name: "", role: "", email: "", phone: "" },
            ])
          }
          className="h-8 px-3 rounded-full text-[11.5px] font-semibold border border-dashed border-neutral-300 text-neutral-600 hover:border-[#f05742] hover:text-[#f05742]"
        >
          <Plus className="h-3 w-3 inline mr-1" />
          Add contact
        </button>
        <button
          onClick={() => onSubmit(items.filter((c) => c.name.trim()))}
          disabled={items.every((c) => !c.name.trim())}
          className="h-9 px-4 rounded-full text-[12.5px] font-semibold text-white disabled:opacity-40"
          style={{ background: ACCENT }}
        >
          Done — add to widget
        </button>
      </div>
    </motion.div>
  );
}

// ---------- Entity wizard ----------
// Progressive disclosure: preset → method → URL → auth → live test → collection
// → field mapping → layout. Advanced options never appear before the API test
// succeeds. The in-progress card streams to the preview via onDraft.
type WizPhase =
  | "gate"
  | "preset"
  | "method"
  | "url"
  | "auth"
  | "authValue"
  | "testing"
  | "testFailed"
  | "collection"
  | "mapTitle"
  | "mapSubtitle"
  | "mapBadge"
  | "layout"
  | "another";

const PRESETS: {
  value: string;
  title: string;
  icon: EntityIcon;
  name: string;
  art: React.ReactNode;
}[] = [
  {
    value: "orders",
    title: "Orders",
    icon: "shopping",
    name: "Recent Orders",
    art: <ShoppingBag className="h-6 w-6 text-neutral-400" />,
  },
  {
    value: "tickets",
    title: "Tickets",
    icon: "ticket",
    name: "Recent Tickets",
    art: <Ticket className="h-6 w-6 text-neutral-400" />,
  },
  {
    value: "products",
    title: "Products",
    icon: "package",
    name: "Top Products",
    art: <Package className="h-6 w-6 text-neutral-400" />,
  },
  {
    value: "custom",
    title: "Custom",
    icon: "zap",
    name: "My Data",
    art: <Zap className="h-6 w-6 text-neutral-400" />,
  },
];

export const ENTITY_ICON_CHOICES: {
  value: EntityIcon;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}[] = [
  { value: "ticket", icon: Ticket },
  { value: "star", icon: Star },
  { value: "package", icon: Package },
  { value: "shopping", icon: ShoppingBag },
  { value: "bell", icon: Bell },
  { value: "zap", icon: Zap },
];

type WizQA = { q: string; a: string };

export function EntityWizard({
  lsParams,
  onDraft,
  onTesting,
  onSubmit,
  onSkip,
}: {
  /** Widget-level localStorage fields, collected in their own step. */
  lsParams: LsParam[];
  onDraft: (e: EntityCardCfg | null) => void;
  onTesting: (t: boolean) => void;
  onSubmit: (entities: EntityCardCfg[]) => void;
  onSkip: () => void;
}) {
  const [phase, setPhase] = useState<WizPhase>("gate");
  const [draft, setDraft] = useState<EntityCardCfg>(() => newEntity());
  const [committed, setCommitted] = useState<EntityCardCfg[]>([]);
  const [qa, setQa] = useState<WizQA[]>([]);
  const [collections, setCollections] = useState<{ path: string; array: unknown[] }[]>([]);
  const [authKind, setAuthKind] = useState<AuthKind>("none");
  const [testError, setTestError] = useState("");

  const push = (q: string, a: string) => setQa((p) => [...p, { q, a }]);
  const patch = (p: Partial<EntityCardCfg>) => {
    setDraft((d) => {
      const next = { ...d, ...p };
      onDraft(next);
      return next;
    });
  };

  const runTest = async (d: EntityCardCfg) => {
    setPhase("testing");
    onTesting(true);
    setTestError("");
    try {
      // resolve {{ls.*}} placeholders and attach the widget-level localStorage fields
      const req = buildEntityRequest(d, lsParams);
      const init: RequestInit = { method: d.method, headers: req.headers };
      if (d.method === "POST" && req.body.trim()) init.body = req.body;
      const res = await fetch(req.url, init);
      const text = await res.text();
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      const parsed = JSON.parse(text);
      const arrays = findAllArrays(parsed).filter(
        (a) => a.array.length > 0 && typeof a.array[0] === "object",
      );
      if (arrays.length === 0) throw new Error("No array of records found in the response");
      const pretty = JSON.stringify(parsed, null, 2);
      setCollections(arrays);
      onTesting(false);
      if (arrays.length === 1) {
        applyCollection(d, pretty, arrays[0]);
      } else {
        patch({ testResponse: pretty, testStatus: "ok" });
        setPhase("collection");
      }
    } catch (err) {
      onTesting(false);
      setTestError(err instanceof Error ? err.message : String(err));
      setPhase("testFailed");
    }
  };

  const applyCollection = (
    d: EntityCardCfg,
    pretty: string,
    col: { path: string; array: unknown[] },
  ) => {
    const keys = collectKeys(col.array[0], col.path);
    patch({
      ...d,
      testResponse: pretty,
      testStatus: "ok",
      arrayPath: col.path,
      fieldOptions: keys,
    });
    push(
      "Testing API…",
      `Success — found ${keys.length} field${keys.length === 1 ? "" : "s"}${col.path ? ` in “${col.path}”` : ""}`,
    );
    setPhase("mapTitle");
  };

  const fieldChips = (onPick: (f: string) => void, allowNone?: boolean) => (
    <motion.div {...pop} className="flex flex-wrap gap-1.5">
      {draft.fieldOptions.map((f) => (
        <button
          key={f}
          onClick={() => onPick(f)}
          className="h-8 px-3 rounded-full text-[11.5px] font-mono border border-neutral-200 text-neutral-700 hover:border-[#f05742] hover:text-[#f05742] transition"
        >
          {f}
        </button>
      ))}
      {allowNone && (
        <button
          onClick={() => onPick("")}
          className="h-8 px-3 rounded-full text-[11.5px] border border-dashed border-neutral-300 text-neutral-400 hover:text-neutral-600"
        >
          none
        </button>
      )}
    </motion.div>
  );

  const finishEntity = (layout: EntityLayout) => {
    const done = { ...draft, layout };
    setCommitted((p) => [...p, done]);
    onDraft(null);
    push(
      "Which layout?",
      { list: "List", card: "Cards", grid: "Grid", compact: "Compact" }[layout],
    );
    setPhase("another");
  };

  const startAnother = () => {
    const fresh = newEntity();
    setDraft(fresh);
    setQa([]);
    setCollections([]);
    setAuthKind("none");
    setPhase("preset");
  };

  return (
    <div className="space-y-3">
      {committed.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {committed.map((e) => (
            <span
              key={e.id}
              className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-full bg-green-50 border border-green-200 text-green-700 text-[11.5px] font-semibold"
            >
              <Check className="h-3 w-3" /> {e.name}
            </span>
          ))}
        </div>
      )}

      {/* answered sub-questions */}
      {qa.map((x, i) => (
        <div key={i} className="text-[12px] text-neutral-500">
          <span className="text-neutral-400">{x.q}</span>{" "}
          <span className="font-semibold text-neutral-700">{x.a}</span>
        </div>
      ))}

      {phase === "gate" && (
        <motion.div {...pop} className="flex gap-2">
          <button
            onClick={() => setPhase("preset")}
            className="h-9 px-4 rounded-full text-[12.5px] font-semibold text-white"
            style={{ background: ACCENT }}
          >
            Yes, connect my data
          </button>
          <button
            onClick={onSkip}
            className="h-9 px-4 rounded-full text-[12.5px] font-semibold border border-neutral-200 text-neutral-600 hover:bg-neutral-50"
          >
            Not now
          </button>
        </motion.div>
      )}

      {phase === "preset" && (
        <>
          <Ask text="What should this card display?" />
          <ChoiceCards
            options={PRESETS.map((p) => ({ value: p.value, title: p.title, art: p.art }))}
            onSelect={(v) => {
              const p = PRESETS.find((x) => x.value === v)!;
              patch({ name: p.name, icon: p.icon });
              push("What should this card display?", p.title);
              setPhase("method");
            }}
          />
        </>
      )}

      {phase === "method" && (
        <>
          <Ask text="How should I fetch the data?" />
          <Chips
            options={[
              { value: "GET", label: "GET" },
              { value: "POST", label: "POST" },
            ]}
            onSelect={(v) => {
              patch({ method: v as "GET" | "POST" });
              push("How should I fetch the data?", v);
              setPhase("url");
            }}
          />
        </>
      )}

      {phase === "url" && (
        <>
          <Ask text="Paste your API URL and I'll take a look." />
          <TextControl
            placeholder="https://api.example.com/tickets"
            suggestions={[
              "https://jsonplaceholder.typicode.com/todos?_limit=4",
              "https://dummyjson.com/products?limit=4",
            ]}
            submitLabel="Continue"
            onSubmit={(v) => {
              patch({ url: v.trim() });
              push("API URL", v.trim());
              setPhase("auth");
            }}
          />
          {lsParams.length > 0 && (
            <div className="text-[10.5px] text-neutral-400">
              Your data fields ({lsParams.map((p) => p.key).join(", ")}) are attached automatically.
            </div>
          )}
        </>
      )}

      {phase === "auth" && (
        <>
          <Ask text="Does this API need authentication?" />
          <Chips
            options={[
              { value: "none", label: "No auth" },
              { value: "bearer", label: "Bearer token" },
              { value: "apikey", label: "API key" },
              { value: "basic", label: "Basic auth" },
            ]}
            onSelect={(v) => {
              setAuthKind(v as AuthKind);
              push(
                "Authentication?",
                { none: "None", bearer: "Bearer token", apikey: "API key", basic: "Basic auth" }[
                  v as AuthKind
                ],
              );
              if (v === "none") runTest({ ...draft });
              else setPhase("authValue");
            }}
          />
        </>
      )}

      {phase === "authValue" && (
        <>
          <Ask
            text={
              authKind === "bearer"
                ? "Paste the bearer token."
                : authKind === "apikey"
                  ? "Paste the API key (sent as X-API-Key)."
                  : "Enter user:password."
            }
          />
          <TextControl
            placeholder={authKind === "basic" ? "user:password" : "••••••••"}
            submitLabel="Test API"
            onSubmit={(v) => {
              const header =
                authKind === "bearer"
                  ? { key: "Authorization", value: `Bearer ${v.trim()}` }
                  : authKind === "apikey"
                    ? { key: "X-API-Key", value: v.trim() }
                    : { key: "Authorization", value: `Basic ${btoa(v.trim())}` };
              const headers = [...draft.headers, { id: `h${Date.now()}`, ...header }];
              const next = { ...draft, headers };
              patch({ headers });
              push("Credentials", "••••••••");
              runTest(next);
            }}
          />
        </>
      )}

      {phase === "testing" && (
        <motion.div {...pop} className="flex items-center gap-2.5 text-[12.5px] text-neutral-600">
          <Loader2 className="h-4 w-4 animate-spin" style={{ color: ACCENT }} />
          Testing your API… watch the preview.
        </motion.div>
      )}

      {phase === "testFailed" && (
        <motion.div {...pop} className="space-y-2.5">
          <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-[12px] text-red-700">
            Hmm, that didn't work: {testError}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPhase("url")}
              className="h-9 px-4 rounded-full text-[12.5px] font-semibold text-white"
              style={{ background: ACCENT }}
            >
              Change URL
            </button>
            <button
              onClick={() => runTest(draft)}
              className="h-9 px-4 rounded-full text-[12.5px] font-semibold border border-neutral-200 text-neutral-600 hover:bg-neutral-50"
            >
              Retry
            </button>
            <button
              onClick={() => (committed.length > 0 ? onSubmit(committed) : onSkip())}
              className="h-9 px-4 rounded-full text-[12.5px] font-semibold border border-neutral-200 text-neutral-600 hover:bg-neutral-50"
            >
              Give up for now
            </button>
          </div>
        </motion.div>
      )}

      {phase === "collection" && (
        <>
          <Ask
            text={`I found ${collections.length} collections in the response. Which one should power this card?`}
          />
          <Chips
            options={collections.map((c) => ({
              value: c.path || "(root)",
              label: `${c.path || "root"} · ${c.array.length} items`,
            }))}
            onSelect={(v) => {
              const col = collections.find((c) => (c.path || "(root)") === v)!;
              push("Which collection?", col.path || "root");
              applyCollection(draft, draft.testResponse, col);
            }}
          />
        </>
      )}

      {phase === "mapTitle" && (
        <>
          <Ask text="Which field should be the title of each item?" />
          {fieldChips((f) => {
            patch({ mapping: { ...draft.mapping, title: f } });
            push("Title field", f);
            setPhase("mapSubtitle");
          })}
        </>
      )}

      {phase === "mapSubtitle" && (
        <>
          <Ask text="And the subtitle?" />
          {fieldChips((f) => {
            patch({ mapping: { ...draft.mapping, subtitle: f } });
            push("Subtitle field", f || "none");
            setPhase("mapBadge");
          }, true)}
        </>
      )}

      {phase === "mapBadge" && (
        <>
          <Ask text="A status badge? (optional)" />
          {fieldChips((f) => {
            patch({ mapping: { ...draft.mapping, badge: f } });
            push("Badge field", f || "none");
            setPhase("layout");
          }, true)}
        </>
      )}

      {phase === "layout" && (
        <>
          <Ask text="How should the items be laid out?" />
          <Chips
            options={[
              { value: "list", label: "List" },
              { value: "card", label: "Cards" },
              { value: "grid", label: "Grid" },
              { value: "compact", label: "Compact" },
            ]}
            onSelect={(v) => finishEntity(v as EntityLayout)}
          />
        </>
      )}

      {phase === "another" && (
        <motion.div {...pop} className="space-y-2.5">
          <Ask text="Beautiful — it's live in the preview. Add another data card?" />
          <div className="flex gap-2">
            <button
              onClick={startAnother}
              className="h-9 px-4 rounded-full text-[12.5px] font-semibold border border-neutral-200 text-neutral-700 hover:bg-neutral-50"
            >
              <Plus className="h-3 w-3 inline mr-1" />
              Add another
            </button>
            <button
              onClick={() => onSubmit(committed)}
              className="h-9 px-4 rounded-full text-[12.5px] font-semibold text-white"
              style={{ background: ACCENT }}
            >
              That's all — continue
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}

// ---------- widget-level localStorage data fields (own conversation step) ----------
export function LsFieldsControl({
  initial,
  onSubmit,
  onSkip,
}: {
  initial: LsParam[];
  onSubmit: (params: LsParam[]) => void;
  onSkip: () => void;
}) {
  const [phase, setPhase] = useState<"gate" | "edit">(initial.length > 0 ? "edit" : "gate");

  if (phase === "gate") {
    return (
      <motion.div {...pop} className="flex gap-2">
        <button
          onClick={() => setPhase("edit")}
          className="h-9 px-4 rounded-full text-[12.5px] font-semibold text-white"
          style={{ background: ACCENT }}
        >
          Yes, add data fields
        </button>
        <button
          onClick={onSkip}
          className="h-9 px-4 rounded-full text-[12.5px] font-semibold border border-neutral-200 text-neutral-600 hover:bg-neutral-50"
        >
          No, not needed
        </button>
      </motion.div>
    );
  }

  return (
    <div className="space-y-2.5">
      <div className="text-[11.5px] text-neutral-500">
        These are read from the visitor's browser and attached to every entity API request.
      </div>
      <LsParamsEditor initial={initial} onSubmit={onSubmit} />
    </div>
  );
}

// ---------- localStorage params editor ----------
function LsParamsEditor({
  initial,
  onSubmit,
}: {
  initial: LsParam[];
  onSubmit: (params: LsParam[]) => void;
}) {
  const [params, setParams] = useState<LsParam[]>(
    initial.length > 0 ? initial : [{ id: `p${Date.now()}`, key: "", sendAs: "query", name: "" }],
  );

  const update = (id: string, patch: Partial<LsParam>) =>
    setParams((p) => p.map((x) => (x.id === id ? { ...x, ...patch } : x)));

  const peek = (key: string): string | null => {
    if (!key.trim()) return null;
    try {
      return window.localStorage.getItem(key.trim());
    } catch {
      return null;
    }
  };

  const valid = params.filter((p) => p.key.trim());

  return (
    <motion.div {...pop} className="space-y-2.5">
      {params.map((p) => {
        const found = peek(p.key);
        return (
          <div
            key={p.id}
            className="rounded-xl border border-neutral-200 bg-white p-2.5 space-y-1.5"
          >
            <div className="flex gap-2 items-center">
              <input
                value={p.key}
                onChange={(e) => update(p.id, { key: e.target.value })}
                placeholder="localStorage key — e.g. userId"
                className="flex-1 h-9 px-3 rounded-lg border border-neutral-200 text-[12.5px] font-mono outline-none focus:border-[#f05742]"
              />
              <button
                onClick={() => setParams((prev) => prev.filter((x) => x.id !== p.id))}
                className="text-neutral-400 hover:text-red-500"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex gap-2 items-center">
              <select
                value={p.sendAs}
                onChange={(e) => update(p.id, { sendAs: e.target.value as LsParam["sendAs"] })}
                className="h-9 px-2.5 rounded-lg border border-neutral-200 bg-white text-[12px] outline-none focus:border-[#f05742]"
              >
                <option value="query">Query param</option>
                <option value="header">Header</option>
                <option value="body">Body field (POST)</option>
              </select>
              <input
                value={p.name}
                onChange={(e) => update(p.id, { name: e.target.value })}
                placeholder={p.key.trim() ? `sent as “${p.key.trim()}”` : "param / header name"}
                className="flex-1 h-9 px-3 rounded-lg border border-neutral-200 text-[12px] font-mono outline-none focus:border-[#f05742]"
              />
            </div>
            {p.key.trim() && (
              <div className="text-[10.5px] flex items-center gap-1.5">
                {found !== null ? (
                  <span className="text-green-700">
                    ✓ found in this browser:{" "}
                    <span className="font-mono">
                      {found.length > 24 ? `${found.slice(0, 24)}…` : found}
                    </span>
                  </span>
                ) : (
                  <span className="text-amber-600">
                    not set in this browser yet — will be read on your site
                  </span>
                )}
              </div>
            )}
          </div>
        );
      })}
      <div className="text-[10.5px] text-neutral-400">
        Tip: you can also write <span className="font-mono">{"{{ls.key}}"}</span> anywhere in the
        URL or body.
      </div>
      <div className="flex items-center justify-between">
        <button
          onClick={() =>
            setParams((p) => [...p, { id: `p${Date.now()}`, key: "", sendAs: "query", name: "" }])
          }
          className="h-8 px-3 rounded-full text-[11.5px] font-semibold border border-dashed border-neutral-300 text-neutral-600 hover:border-[#f05742] hover:text-[#f05742]"
        >
          <Plus className="h-3 w-3 inline mr-1" />
          Add field
        </button>
        <button
          onClick={() => onSubmit(valid)}
          disabled={valid.length === 0}
          className="h-9 px-4 rounded-full text-[12.5px] font-semibold text-white disabled:opacity-40"
          style={{ background: ACCENT }}
        >
          Continue
        </button>
      </div>
    </motion.div>
  );
}

function Ask({ text }: { text: string }) {
  return (
    <motion.div {...pop} className="text-[13px] text-neutral-800 font-medium">
      {text}
    </motion.div>
  );
}

// ---------- shared bits used by the builder page ----------
export function EditBadge({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="opacity-0 group-hover:opacity-100 transition inline-flex items-center gap-1 text-[11px] font-semibold text-neutral-400 hover:text-[#f05742]"
    >
      <Pencil className="h-3 w-3" /> Edit
    </button>
  );
}

export function DangerIcon() {
  return <Trash2 className="h-4 w-4" />;
}

// mini layout illustrations (ported from the classic form)
export function SimpleMini() {
  return (
    <div className="w-14 h-20 rounded-md bg-white shadow-sm border border-neutral-200 flex flex-col overflow-hidden">
      <div className="h-4" style={{ background: ACCENT }} />
      <div className="flex-1 p-1 space-y-1">
        <div className="h-1.5 w-7 rounded bg-neutral-200" />
        <div className="h-1.5 w-9 rounded bg-neutral-200 ml-auto" />
      </div>
      <div className="h-3 bg-neutral-100" />
    </div>
  );
}
export function OverviewMini() {
  return (
    <div className="w-14 h-20 rounded-md bg-white shadow-sm border border-neutral-200 flex flex-col overflow-hidden">
      <div className="h-7" style={{ background: `linear-gradient(180deg, #1e2038, ${ACCENT})` }} />
      <div className="flex-1 p-1 space-y-1">
        <div className="h-2 rounded bg-neutral-200" />
        <div className="h-2 rounded bg-neutral-200" />
      </div>
      <div className="h-3 bg-neutral-100 flex justify-around items-center">
        <div className="h-1.5 w-1.5 rounded-full" style={{ background: ACCENT }} />
        <div className="h-1.5 w-1.5 rounded-full bg-neutral-300" />
      </div>
    </div>
  );
}
export function ClassicMini() {
  return (
    <div className="w-12 h-16 rounded-lg bg-white shadow border border-neutral-200 flex flex-col overflow-hidden">
      <div className="h-3" style={{ background: ACCENT }} />
      <div className="flex-1 p-1 space-y-1">
        <div className="h-1.5 w-6 rounded bg-neutral-200" />
        <div className="h-1.5 w-5 rounded bg-neutral-200 ml-auto" />
      </div>
    </div>
  );
}
export function BoldMini() {
  return (
    <div className="w-16 h-16 flex justify-end">
      <div
        className="w-10 h-full bg-white rounded-l-md border-l-4 border-t-4 border-b-4 p-1 flex flex-col gap-1"
        style={{ borderColor: ACCENT }}
      >
        <div className="h-2 rounded bg-neutral-200" />
        <div className="h-3 rounded bg-neutral-100" />
        <div className="flex gap-0.5 mt-auto">
          <div className="h-2 w-3.5 rounded-full" style={{ background: ACCENT }} />
          <div className="h-2 w-3.5 rounded-full" style={{ background: ACCENT }} />
        </div>
      </div>
    </div>
  );
}
export function DockedMini() {
  return (
    <div className="w-16 h-16 flex justify-end">
      <div className="w-7 h-full bg-white border border-neutral-300 p-0.5 flex flex-col gap-0.5">
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
