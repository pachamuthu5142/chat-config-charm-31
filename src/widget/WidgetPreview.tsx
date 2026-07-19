// Animated live preview of the widget. Purely presentational — renders a
// WidgetConfig and never mutates it. Used by the conversational builder.
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bell,
  Bot,
  ChevronRight,
  Home as HomeIcon,
  Mail,
  MessageSquare,
  MoreHorizontal,
  Package,
  Paperclip,
  Phone as PhoneIcon,
  Send,
  ShoppingBag,
  Star,
  Ticket,
  User,
  X,
  Zap,
} from "lucide-react";
import {
  findFirstArray,
  pick,
  type Appearance,
  type Background,
  type EntityCardCfg,
  type EntityIcon,
  type Tab,
  type WidgetConfig,
} from "./config";

type IconComp = React.ComponentType<React.SVGProps<SVGSVGElement>>;
export const ENTITY_ICONS: Record<EntityIcon, IconComp> = {
  ticket: Ticket,
  star: Star,
  package: Package,
  shopping: ShoppingBag,
  bell: Bell,
  zap: Zap,
};

const colorTransition: React.CSSProperties = {
  transition:
    "background 500ms ease, background-color 500ms ease, border-color 500ms ease, color 300ms ease",
};

const sectionMotion = {
  initial: { opacity: 0, y: 14, height: 0 },
  animate: { opacity: 1, y: 0, height: "auto" },
  exit: { opacity: 0, y: -8, height: 0 },
  transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] as const },
};

// ---------- header avatar: uploaded logo or default bot icon ----------
function AvatarLogo({ logoUrl, className }: { logoUrl: string; className?: string }) {
  if (logoUrl) {
    return (
      <img
        src={logoUrl}
        alt="logo"
        className={`rounded-full object-cover bg-white ${className ?? "h-8 w-8"}`}
      />
    );
  }
  return (
    <div
      className={`rounded-full bg-white/20 backdrop-blur flex items-center justify-center ${className ?? "h-8 w-8"}`}
    >
      <Bot className="h-4 w-4 text-white" />
    </div>
  );
}

// ---------- floating launcher button (what visitors see when closed) ----------
function Launcher({ cfg }: { cfg: WidgetConfig }) {
  const side: React.CSSProperties = cfg.position === "right" ? { right: 40 } : { left: 40 };
  return (
    <motion.div
      layout
      className={`absolute bottom-7 flex items-center gap-2 ${cfg.position === "left" ? "flex-row-reverse" : ""}`}
      style={side}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      {cfg.launcherStyle === "icon" ? (
        <>
          <div
            className="h-10 px-4 rounded-full bg-white shadow-lg border border-black/5 flex items-center text-[13px] font-semibold"
            style={{ color: "#1e2028" }}
          >
            {cfg.launcherText}
          </div>
          <button
            className="h-12 w-12 rounded-full shadow-xl flex items-center justify-center text-white"
            style={{ background: cfg.theme, ...colorTransition }}
          >
            <MessageSquare className="h-5 w-5" />
          </button>
        </>
      ) : (
        <button
          className="h-12 px-5 rounded-full shadow-xl flex items-center gap-2 text-white text-[13.5px] font-semibold"
          style={{ background: cfg.theme, ...colorTransition }}
        >
          <MessageSquare className="h-4 w-4" />
          {cfg.launcherText}
        </button>
      )}
    </motion.div>
  );
}

// ---------- typing animation for the greeting ----------
function Typewriter({
  text,
  className,
  style,
}: {
  text: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  const [shown, setShown] = useState(text);
  const prev = useRef(text);
  useEffect(() => {
    if (prev.current === text) return;
    prev.current = text;
    let i = 0;
    setShown("");
    const timer = setInterval(() => {
      i += 1;
      setShown(text.slice(0, i));
      if (i >= text.length) clearInterval(timer);
    }, 18);
    return () => clearInterval(timer);
  }, [text]);
  return (
    <div className={className} style={style}>
      {shown}
      {shown.length < text.length && <span className="animate-pulse">▍</span>}
    </div>
  );
}

// ---------- main canvas ----------
export function WidgetPreview({
  cfg,
  tab,
  setTab,
  entityDraft,
  entityTesting,
  celebrate,
}: {
  cfg: WidgetConfig;
  tab: Tab;
  setTab: (t: Tab) => void;
  /** In-progress entity card from the conversation, shown live before it's committed. */
  entityDraft?: EntityCardCfg | null;
  /** While the conversation tests an API, the preview shows skeleton cards. */
  entityTesting?: boolean;
  /** Plays a confetti-ish celebration overlay when the configuration completes. */
  celebrate?: boolean;
}) {
  const bgIsDark = cfg.appearance === "dark";
  const surface = bgIsDark ? "#1e2028" : "white";
  const surfaceText = bgIsDark ? "#e5e7eb" : "#111827";
  const mutedText = bgIsDark ? "#9ca3af" : "#6b7280";
  const border = bgIsDark ? "rgba(255,255,255,0.08)" : "#eef0f2";

  const entities = useMemo(() => {
    const list = cfg.entities.filter((e) => e.enabled);
    if (entityDraft) return [...list, entityDraft];
    return list;
  }, [cfg.entities, entityDraft]);

  return (
    <div className="absolute inset-0">
      {/* faux website backdrop */}
      <div className="absolute inset-0 p-6 opacity-70">
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

      <AnimatePresence mode="popLayout">
        <motion.div
          key={`${cfg.variant}-${cfg.position}-${cfg.mountMode}`}
          initial={{ opacity: 0, scale: 0.94, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 16 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0 pointer-events-none"
        >
          <div className="absolute inset-0 pointer-events-auto">
            {cfg.mountMode === "element" ? (
              <div className="absolute inset-0 flex items-center justify-center p-8 pt-14">
                <div
                  className="relative w-[400px] max-w-full h-full max-h-[640px] rounded-2xl border-2 border-dashed p-2 flex flex-col"
                  style={{ borderColor: `${cfg.theme}66` }}
                >
                  <div
                    className="absolute -top-2.5 left-4 px-2 text-[10px] font-mono font-semibold rounded"
                    style={{ background: "#eceef1", color: cfg.theme }}
                  >
                    {cfg.mountSelector || "#chat-container"}
                  </div>
                  <div
                    className="flex-1 rounded-xl overflow-hidden flex flex-col shadow-xl"
                    style={{
                      background: surface,
                      border: `1px solid ${border}`,
                      ...{
                        transition: "background 500ms ease, border-color 500ms ease",
                      },
                    }}
                  >
                    {cfg.template === "simple" ? (
                      <SimpleWidgetInner
                        cfg={cfg}
                        surface={surface}
                        surfaceText={surfaceText}
                        mutedText={mutedText}
                        border={border}
                      />
                    ) : (
                      <OverviewWidgetInner
                        cfg={cfg}
                        entities={entities}
                        entityTesting={!!entityTesting}
                        surface={surface}
                        surfaceText={surfaceText}
                        mutedText={mutedText}
                        border={border}
                        tab={tab}
                        setTab={setTab}
                      />
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <WidgetShell
                variant={cfg.variant}
                position={cfg.position}
                theme={cfg.theme}
                surface={surface}
                border={border}
              >
                {cfg.template === "simple" ? (
                  <SimpleWidgetInner
                    cfg={cfg}
                    surface={surface}
                    surfaceText={surfaceText}
                    mutedText={mutedText}
                    border={border}
                  />
                ) : (
                  <OverviewWidgetInner
                    cfg={cfg}
                    entities={entities}
                    entityTesting={!!entityTesting}
                    surface={surface}
                    surfaceText={surfaceText}
                    mutedText={mutedText}
                    border={border}
                    tab={tab}
                    setTab={setTab}
                  />
                )}
              </WidgetShell>
            )}
            {cfg.mountMode === "root" && cfg.variant === "classic" && <Launcher cfg={cfg} />}
          </div>
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>{celebrate && <Celebration theme={cfg.theme} />}</AnimatePresence>
    </div>
  );
}

function Celebration({ theme }: { theme: string }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: 26 }, (_, i) => ({
        left: `${(i * 37) % 100}%`,
        delay: (i % 9) * 0.09,
        color: [theme, "#eab308", "#2563eb", "#16a34a", "#ec4899"][i % 5],
        rotate: (i * 47) % 360,
        size: 6 + (i % 3) * 4,
      })),
    [theme],
  );
  return (
    <motion.div
      className="absolute inset-0 pointer-events-none overflow-hidden"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {pieces.map((p, i) => (
        <motion.div
          key={i}
          className="absolute rounded-sm"
          style={{ left: p.left, top: -12, width: p.size, height: p.size, background: p.color }}
          initial={{ y: -20, rotate: 0, opacity: 1 }}
          animate={{ y: "110vh", rotate: p.rotate + 540, opacity: [1, 1, 0.6] }}
          transition={{ duration: 2.6 + (i % 5) * 0.35, delay: p.delay, ease: "easeIn" }}
        />
      ))}
    </motion.div>
  );
}

function WidgetShell({
  variant,
  position,
  theme,
  surface,
  border,
  children,
}: {
  variant: WidgetConfig["variant"];
  position: WidgetConfig["position"];
  theme: string;
  surface: string;
  border: string;
  children: React.ReactNode;
}) {
  if (variant === "classic") {
    const posStyle: React.CSSProperties =
      position === "right" ? { right: 40, bottom: 96 } : { left: 40, bottom: 96 };
    return (
      <div
        className="absolute w-[360px] h-[600px] max-h-[calc(100%-120px)] rounded-[28px] shadow-2xl overflow-hidden flex flex-col"
        style={{
          ...posStyle,
          background: surface,
          border: `1px solid ${border}`,
          ...colorTransition,
        }}
      >
        {children}
      </div>
    );
  }
  const width = variant === "bold" ? "65%" : "42%";
  const anchor: React.CSSProperties =
    position === "right" ? { right: 0, top: 0, bottom: 0 } : { left: 0, top: 0, bottom: 0 };
  const radius =
    variant === "bold" ? (position === "right" ? "24px 0 0 24px" : "0 24px 24px 0") : "0";
  const borderStyle: React.CSSProperties =
    variant === "bold"
      ? position === "right"
        ? {
            borderTop: `4px solid ${theme}`,
            borderLeft: `4px solid ${theme}`,
            borderBottom: `4px solid ${theme}`,
          }
        : {
            borderTop: `4px solid ${theme}`,
            borderRight: `4px solid ${theme}`,
            borderBottom: `4px solid ${theme}`,
          }
      : position === "right"
        ? { borderLeft: `1px solid ${border}` }
        : { borderRight: `1px solid ${border}` };
  return (
    <div
      className="absolute shadow-2xl flex flex-col overflow-hidden"
      style={{
        ...anchor,
        width,
        background: surface,
        borderRadius: radius,
        ...borderStyle,
        ...colorTransition,
      }}
    >
      {children}
    </div>
  );
}

// ----- Simple widget (chat only) -----
function SimpleWidgetInner({
  cfg,
  surface,
  surfaceText,
  border,
}: {
  cfg: WidgetConfig;
  surface: string;
  surfaceText: string;
  mutedText: string;
  border: string;
}) {
  return (
    <>
      <div
        className="h-14 flex items-center justify-between px-4 shrink-0"
        style={{ background: cfg.theme, ...colorTransition }}
      >
        <div className="flex items-center gap-2 text-white">
          <AvatarLogo logoUrl={cfg.logoUrl} />
          <div className="text-[13px] font-semibold">{cfg.assistantName}</div>
        </div>
        <div className="flex items-center gap-2 text-white/80">
          <MoreHorizontal className="h-4 w-4" />
          <X className="h-4 w-4" />
        </div>
      </div>
      <div
        className="flex-1 p-4 space-y-2.5 overflow-y-auto"
        style={{ background: surface, ...colorTransition }}
      >
        <MsgBubble text="Hey! 👋 How can I help you today?" color="#f3f4f6" fg="#111827" />
        <MsgBubble text="I'd like to know about your pricing." color={cfg.theme} fg="#fff" right />
        <MsgBubble text="Sure — our plans start at $29/mo." color="#f3f4f6" fg="#111827" />
      </div>
      <div
        className="h-14 border-t flex items-center px-3 gap-2 shrink-0"
        style={{ borderColor: border, background: surface, ...colorTransition }}
      >
        <input
          placeholder="Type your message…"
          className="flex-1 h-9 rounded-full px-3 text-[12px] outline-none border"
          style={{ borderColor: border, background: "transparent", color: surfaceText }}
        />
        <button
          className="h-9 w-9 rounded-full flex items-center justify-center text-white"
          style={{ background: cfg.theme, ...colorTransition }}
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
      <div
        className="text-center text-[10px] text-neutral-400 py-1.5"
        style={{ background: surface, ...colorTransition }}
      >
        Powered by ChatWidget
      </div>
    </>
  );
}

// ----- Overview widget (home + messages) -----
function OverviewWidgetInner({
  cfg,
  entities,
  entityTesting,
  surface,
  surfaceText,
  mutedText,
  border,
  tab,
  setTab,
}: {
  cfg: WidgetConfig;
  entities: EntityCardCfg[];
  entityTesting: boolean;
  surface: string;
  surfaceText: string;
  mutedText: string;
  border: string;
  tab: Tab;
  setTab: (t: Tab) => void;
}) {
  const heroBg =
    cfg.background === "solid"
      ? cfg.theme
      : `linear-gradient(180deg, #12142a 0%, ${cfg.theme} 100%)`;

  return (
    <>
      {tab === "home" ? (
        <>
          <div
            className="relative px-5 pt-6 pb-14 shrink-0"
            style={{ background: heroBg, ...colorTransition }}
          >
            <div className="flex items-center justify-between">
              <AvatarLogo logoUrl={cfg.logoUrl} className="h-9 w-9" />
              <X className="h-4 w-4 text-white/80" />
            </div>
            <Typewriter
              text={cfg.greeting}
              className="mt-6 text-white text-[22px] font-bold leading-tight pr-6 min-h-[28px]"
            />
            <div className="text-white/70 text-[12px] mt-2">
              We're here to help — search below or pick an option.
            </div>
          </div>
          <div className="px-4 -mt-6 relative z-10 shrink-0">
            <button
              onClick={() => setTab("messages")}
              className="w-full h-12 rounded-full bg-white shadow-lg flex items-center gap-2 px-4 text-[13px] font-medium text-neutral-700 border border-black/5"
            >
              <MessageSquare className="h-4 w-4" style={{ color: cfg.theme }} />
              Chat with us
              <span className="ml-auto text-[11px] text-neutral-400">Send a message</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 pt-4 pb-2">
            <AnimatePresence initial={false}>
              {cfg.entitiesOn &&
                entities.map((e) => (
                  <motion.div key={e.id} {...sectionMotion} className="overflow-hidden">
                    <div className="pb-4">
                      <EntityCardPreview
                        entity={e}
                        theme={cfg.theme}
                        surfaceText={surfaceText}
                        mutedText={mutedText}
                        border={border}
                        appearance={cfg.appearance}
                      />
                    </div>
                  </motion.div>
                ))}

              {cfg.entitiesOn && entityTesting && (
                <motion.div key="entity-skeleton" {...sectionMotion} className="overflow-hidden">
                  <div className="pb-4 space-y-2">
                    <div
                      className="h-3 w-24 rounded animate-pulse"
                      style={{ background: border }}
                    />
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="rounded-xl border p-3 flex items-center gap-3"
                        style={{ borderColor: border }}
                      >
                        <div
                          className="h-8 w-8 rounded-lg animate-pulse"
                          style={{ background: border }}
                        />
                        <div className="flex-1 space-y-1.5">
                          <div
                            className="h-2.5 w-2/3 rounded animate-pulse"
                            style={{ background: border }}
                          />
                          <div
                            className="h-2 w-1/3 rounded animate-pulse"
                            style={{ background: border }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {cfg.faqOn && cfg.faqItems.length > 0 && (
                <motion.div key="faq" {...sectionMotion} className="overflow-hidden">
                  <div className="pb-4">
                    <div className="text-[12px] font-bold mb-2" style={{ color: surfaceText }}>
                      Quick answers
                    </div>
                    <div
                      className="rounded-xl overflow-hidden border"
                      style={{ borderColor: border }}
                    >
                      {cfg.faqItems.map((f, i) => (
                        <FaqAccordion
                          key={f.id}
                          question={f.question || `Question ${i + 1}`}
                          answer={f.answer}
                          surfaceText={surfaceText}
                          mutedText={mutedText}
                          border={border}
                          theme={cfg.theme}
                          last={i === cfg.faqItems.length - 1}
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {cfg.customLinksOn && cfg.linkItems.length > 0 && (
                <motion.div key="links" {...sectionMotion} className="overflow-hidden">
                  <div className="pb-4 space-y-2">
                    {cfg.linkItems.map((l) => (
                      <a
                        key={l.id}
                        href={l.url || "#"}
                        className="flex items-center justify-between px-4 h-11 rounded-xl border text-[13px] font-semibold"
                        style={{
                          borderColor: border,
                          color: surfaceText,
                          background:
                            cfg.appearance === "dark" ? "rgba(255,255,255,0.03)" : "white",
                        }}
                      >
                        <span>{l.name || l.url || "Untitled link"}</span>
                        <ChevronRight className="h-4 w-4" style={{ color: mutedText }} />
                      </a>
                    ))}
                  </div>
                </motion.div>
              )}

              {cfg.contactOn && cfg.contacts.length > 0 && (
                <motion.div key="contacts" {...sectionMotion} className="overflow-hidden">
                  <div className="pb-4">
                    <div className="text-[12px] font-bold mb-2" style={{ color: surfaceText }}>
                      Get in touch
                    </div>
                    <div className="space-y-2">
                      {cfg.contacts.map((c) => (
                        <div
                          key={c.id}
                          className="rounded-xl border p-3 flex items-center gap-3"
                          style={{
                            borderColor: border,
                            background:
                              cfg.appearance === "dark" ? "rgba(255,255,255,0.03)" : "white",
                          }}
                        >
                          <div
                            className="h-9 w-9 rounded-full flex items-center justify-center text-white"
                            style={{ background: cfg.theme, ...colorTransition }}
                          >
                            <User className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div
                              className="text-[13px] font-semibold truncate"
                              style={{ color: surfaceText }}
                            >
                              {c.name || "Contact"}
                            </div>
                            <div className="text-[11px] truncate" style={{ color: mutedText }}>
                              {c.role || c.email || c.phone}
                            </div>
                          </div>
                          <div className="flex gap-1.5">
                            {c.email && (
                              <div
                                className="h-7 w-7 rounded-full flex items-center justify-center"
                                style={{
                                  background:
                                    cfg.appearance === "dark"
                                      ? "rgba(255,255,255,0.06)"
                                      : "#f3f4f6",
                                }}
                              >
                                <Mail className="h-3.5 w-3.5" style={{ color: mutedText }} />
                              </div>
                            )}
                            {c.phone && (
                              <div
                                className="h-7 w-7 rounded-full flex items-center justify-center"
                                style={{
                                  background:
                                    cfg.appearance === "dark"
                                      ? "rgba(255,255,255,0.06)"
                                      : "#f3f4f6",
                                }}
                              >
                                <PhoneIcon className="h-3.5 w-3.5" style={{ color: mutedText }} />
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {!cfg.faqOn && !cfg.contactOn && !cfg.entitiesOn && !cfg.customLinksOn && (
                <motion.div key="empty" {...sectionMotion} className="overflow-hidden">
                  <div
                    className="rounded-xl border border-dashed p-5 text-center"
                    style={{ borderColor: border }}
                  >
                    <div className="text-[12px] font-semibold" style={{ color: surfaceText }}>
                      Your home tab is waiting ✨
                    </div>
                    <div className="text-[11px] mt-1" style={{ color: mutedText }}>
                      Add FAQ, contacts, or live data cards from the conversation.
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <BottomTabs
            tab={tab}
            setTab={setTab}
            theme={cfg.theme}
            mutedText={mutedText}
            border={border}
            surface={surface}
          />
        </>
      ) : (
        <>
          <div
            className="h-14 flex items-center justify-between px-4 shrink-0"
            style={{ background: cfg.theme, ...colorTransition }}
          >
            <div className="flex items-center gap-2 text-white">
              <AvatarLogo logoUrl={cfg.logoUrl} />
              <div className="text-[13px] font-semibold">Messages</div>
            </div>
            <X className="h-4 w-4 text-white/80" />
          </div>
          <div
            className="flex-1 p-4 space-y-2.5 overflow-y-auto"
            style={{ background: surface, ...colorTransition }}
          >
            <MsgBubble
              text="Welcome back! How can I help you today?"
              color={cfg.appearance === "dark" ? "#2a2c36" : "#f3f4f6"}
              fg={surfaceText}
            />
            <MsgBubble text="Do you offer refunds?" color={cfg.theme} fg="#fff" right />
            <MsgBubble
              text="Yes — full refunds within 30 days, no questions asked."
              color={cfg.appearance === "dark" ? "#2a2c36" : "#f3f4f6"}
              fg={surfaceText}
            />
          </div>
          <div
            className="border-t flex items-center px-3 gap-2 h-14 shrink-0"
            style={{ borderColor: border, background: surface, ...colorTransition }}
          >
            {cfg.attachOn && <Paperclip className="h-4 w-4" style={{ color: mutedText }} />}
            <input
              placeholder="Type your message…"
              className="flex-1 h-9 rounded-full px-3 text-[12px] outline-none border"
              style={{ borderColor: border, background: "transparent", color: surfaceText }}
            />
            <button
              className="h-9 w-9 rounded-full flex items-center justify-center text-white"
              style={{ background: cfg.theme, ...colorTransition }}
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
          <BottomTabs
            tab={tab}
            setTab={setTab}
            theme={cfg.theme}
            mutedText={mutedText}
            border={border}
            surface={surface}
          />
        </>
      )}
    </>
  );
}

// ---------- Entity preview ----------
export function EntityCardPreview({
  entity,
  theme,
  surfaceText,
  mutedText,
  border,
  appearance,
}: {
  entity: EntityCardCfg;
  theme: string;
  surfaceText: string;
  mutedText: string;
  border: string;
  appearance: Appearance;
}) {
  const Icon = ENTITY_ICONS[entity.icon] || Ticket;
  const items: Record<string, unknown>[] = useMemo(() => {
    if (!entity.testResponse) return [];
    try {
      const parsed = JSON.parse(entity.testResponse);
      const source = entity.arrayPath
        ? (pickArray(parsed, entity.arrayPath) ?? findFirstArray(parsed)?.array ?? [])
        : (findFirstArray(parsed)?.array ?? []);
      return source.slice(0, entity.maxItems) as Record<string, unknown>[];
    } catch {
      return [];
    }
  }, [entity.testResponse, entity.arrayPath, entity.maxItems]);

  const getField = (item: Record<string, unknown>, mappingPath: string): string => {
    if (!mappingPath) return "";
    const prefix = entity.arrayPath ? entity.arrayPath + "." : "";
    const relPath = mappingPath.startsWith(prefix) ? mappingPath.slice(prefix.length) : mappingPath;
    return pick(item, relPath);
  };

  const cardBg = appearance === "dark" ? "rgba(255,255,255,0.04)" : "white";

  if (items.length === 0) {
    return (
      <div
        className="rounded-xl border p-3 flex items-center gap-3"
        style={{ borderColor: border, background: cardBg }}
      >
        <div
          className="h-9 w-9 rounded-lg flex items-center justify-center text-white"
          style={{ background: theme, ...colorTransition }}
        >
          <Icon className="h-4 w-4" />
        </div>
        <div className="flex-1">
          <div className="text-[13px] font-bold" style={{ color: surfaceText }}>
            {entity.name}
          </div>
          <div className="text-[11px]" style={{ color: mutedText }}>
            Connect an API to load data
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <Icon className="h-4 w-4" style={{ color: theme }} />
        <div className="text-[12px] font-bold" style={{ color: surfaceText }}>
          {entity.name}
        </div>
      </div>

      {entity.layout === "grid" ? (
        <div className="grid grid-cols-2 gap-2">
          {items.map((it, i) => (
            <div
              key={i}
              className="rounded-xl border p-3"
              style={{ borderColor: border, background: cardBg }}
            >
              <div className="text-[12px] font-semibold" style={{ color: surfaceText }}>
                {getField(it, entity.mapping.title) || "—"}
              </div>
              <div className="text-[11px] mt-0.5" style={{ color: mutedText }}>
                {getField(it, entity.mapping.subtitle)}
              </div>
              {entity.mapping.badge && (
                <div
                  className="mt-2 inline-flex text-[10px] font-semibold px-2 py-0.5 rounded-full"
                  style={{ background: `${theme}22`, color: theme }}
                >
                  {getField(it, entity.mapping.badge)}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : entity.layout === "compact" ? (
        <div className="rounded-xl border overflow-hidden" style={{ borderColor: border }}>
          {items.map((it, i) => (
            <div
              key={i}
              className="flex items-center justify-between px-3 py-2"
              style={{ borderTop: i === 0 ? "none" : `1px solid ${border}`, background: cardBg }}
            >
              <div className="text-[12.5px] font-medium truncate" style={{ color: surfaceText }}>
                {getField(it, entity.mapping.title) || "—"}
              </div>
              {entity.mapping.badge && (
                <div
                  className="text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ml-2"
                  style={{ background: `${theme}22`, color: theme }}
                >
                  {getField(it, entity.mapping.badge)}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : entity.layout === "card" ? (
        <div className="space-y-2">
          {items.map((it, i) => (
            <div
              key={i}
              className="rounded-xl border p-3 shadow-sm"
              style={{ borderColor: border, background: cardBg }}
            >
              <div className="flex items-start gap-3">
                <div
                  className="h-10 w-10 rounded-lg flex items-center justify-center text-white shrink-0"
                  style={{ background: theme, ...colorTransition }}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="text-[13px] font-bold truncate" style={{ color: surfaceText }}>
                      {getField(it, entity.mapping.title) || "—"}
                    </div>
                    {entity.mapping.tag && (
                      <div
                        className="text-[9px] font-bold uppercase tracking-wide"
                        style={{ color: theme }}
                      >
                        {getField(it, entity.mapping.tag)}
                      </div>
                    )}
                  </div>
                  <div className="text-[11px]" style={{ color: mutedText }}>
                    {getField(it, entity.mapping.subtitle)}
                  </div>
                  {entity.mapping.description && (
                    <div className="text-[11px] mt-1" style={{ color: mutedText }}>
                      {getField(it, entity.mapping.description)}
                    </div>
                  )}
                  {entity.mapping.badge && (
                    <div
                      className="mt-2 inline-flex text-[10px] font-semibold px-2 py-0.5 rounded-full"
                      style={{ background: `${theme}22`, color: theme }}
                    >
                      {getField(it, entity.mapping.badge)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div
          className="rounded-xl border overflow-hidden"
          style={{ borderColor: border, background: cardBg }}
        >
          {items.map((it, i) => (
            <div
              key={i}
              className="flex items-center gap-3 px-3 py-2.5"
              style={{ borderTop: i === 0 ? "none" : `1px solid ${border}` }}
            >
              <div
                className="h-8 w-8 rounded-lg flex items-center justify-center text-white shrink-0"
                style={{ background: theme, ...colorTransition }}
              >
                <Icon className="h-3.5 w-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <div
                  className="text-[12.5px] font-semibold truncate"
                  style={{ color: surfaceText }}
                >
                  {getField(it, entity.mapping.title) || "—"}
                </div>
                <div className="text-[11px] truncate" style={{ color: mutedText }}>
                  {getField(it, entity.mapping.subtitle)}
                </div>
              </div>
              {entity.mapping.badge && (
                <div
                  className="text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0"
                  style={{ background: `${theme}22`, color: theme }}
                >
                  {getField(it, entity.mapping.badge)}
                </div>
              )}
              <ChevronRight className="h-4 w-4 shrink-0" style={{ color: mutedText }} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function pickArray(obj: unknown, path: string): unknown[] | null {
  if (!path) return null;
  let cur: unknown = obj;
  for (const p of path.split(".")) {
    if (cur && typeof cur === "object" && p in (cur as Record<string, unknown>)) {
      cur = (cur as Record<string, unknown>)[p];
    } else return null;
  }
  return Array.isArray(cur) ? cur : null;
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
    <div
      className="h-14 border-t flex items-stretch shrink-0"
      style={{ borderColor: border, background: surface, ...colorTransition }}
    >
      {[
        { k: "home" as Tab, label: "Home", icon: HomeIcon },
        { k: "messages" as Tab, label: "Messages", icon: MessageSquare },
      ].map(({ k, label, icon: Icon }) => {
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
    <div
      className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-[12.5px] ${right ? "ml-auto" : ""}`}
      style={{ background: color, color: fg, ...colorTransition }}
    >
      {text}
    </div>
  );
}

function FaqAccordion({
  question,
  answer,
  surfaceText,
  mutedText,
  border,
  theme,
  last,
}: {
  question: string;
  answer: string;
  surfaceText: string;
  mutedText: string;
  border: string;
  theme: string;
  last: boolean;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: last ? "none" : `1px solid ${border}` }}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 text-left"
      >
        <span className="text-[13px] font-semibold pr-3" style={{ color: surfaceText }}>
          {question}
        </span>
        <ChevronRight
          className="h-4 w-4 shrink-0 transition-transform"
          style={{ color: theme, transform: open ? "rotate(90deg)" : "none" }}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && answer && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-3 text-[12px] leading-relaxed" style={{ color: mutedText }}>
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
