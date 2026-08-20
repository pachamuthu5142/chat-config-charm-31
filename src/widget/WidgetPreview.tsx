// Animated live preview of the widget. Purely presentational — renders a
// WidgetConfig and never mutates it. Used by the conversational builder.
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Box } from "@mui/material";
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
function AvatarLogo({ logoUrl, size = 32 }: { logoUrl: string; size?: number }) {
  if (logoUrl) {
    return (
      <Box
        component="img"
        src={logoUrl}
        alt="logo"
        sx={{
          borderRadius: "9999px",
          objectFit: "cover",
          bgcolor: "white",
          height: size,
          width: size,
        }}
      />
    );
  }
  return (
    <Box
      sx={{
        borderRadius: "9999px",
        bgcolor: "rgba(255,255,255,0.2)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: size,
        width: size,
      }}
    >
      <Bot className="h-4 w-4 text-white" style={{ height: 16, width: 16, color: "#fff" }} />
    </Box>
  );
}

// ---------- floating launcher button (what visitors see when closed) ----------
function Launcher({ cfg }: { cfg: WidgetConfig }) {
  const side: React.CSSProperties = cfg.position === "right" ? { right: 40 } : { left: 40 };
  return (
    <Box
      component={motion.div}
      layout
      sx={{
        position: "absolute",
        bottom: 28,
        display: "flex",
        alignItems: "center",
        gap: 1,
        flexDirection: cfg.position === "left" ? "row-reverse" : "row",
      }}
      style={side}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      {cfg.launcherStyle === "icon" ? (
        <>
          <Box
            sx={{
              height: 40,
              px: 2,
              borderRadius: "9999px",
              bgcolor: "white",
              boxShadow: 4,
              border: "1px solid rgba(0,0,0,0.05)",
              display: "flex",
              alignItems: "center",
              fontSize: 13,
              fontWeight: 600,
              color: "#1e2028",
            }}
          >
            {cfg.launcherText}
          </Box>
          <Box
            component="button"
            sx={{
              height: 48,
              width: 48,
              borderRadius: "9999px",
              boxShadow: 6,
              border: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              cursor: "pointer",
            }}
            style={{ background: cfg.theme, ...colorTransition }}
          >
            <MessageSquare style={{ height: 20, width: 20 }} />
          </Box>
        </>
      ) : (
        <Box
          component="button"
          sx={{
            height: 48,
            px: 2.5,
            borderRadius: "9999px",
            boxShadow: 6,
            border: "none",
            display: "flex",
            alignItems: "center",
            gap: 1,
            color: "white",
            fontSize: 13.5,
            fontWeight: 600,
            cursor: "pointer",
          }}
          style={{ background: cfg.theme, ...colorTransition }}
        >
          <MessageSquare style={{ height: 16, width: 16 }} />
          {cfg.launcherText}
        </Box>
      )}
    </Box>
  );
}

// ---------- typing animation for the greeting ----------
function Typewriter({
  text,
  sx,
  style,
}: {
  text: string;
  sx?: object;
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
    <Box sx={sx} style={style}>
      {shown}
      {shown.length < text.length && (
        <Box component="span" sx={{ animation: "pulse 1.5s ease-in-out infinite" }}>
          ▍
        </Box>
      )}
    </Box>
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
    <Box sx={{ position: "absolute", inset: 0 }}>
      {/* faux website backdrop */}
      <Box sx={{ position: "absolute", inset: 0, p: 3, opacity: 0.7 }}>
        <Box sx={{ height: 32, width: 160, borderRadius: "6px", bgcolor: "rgba(255,255,255,0.7)", mb: 2 }} />
        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 2 }}>
          <Box sx={{ height: 96, borderRadius: "8px", bgcolor: "rgba(255,255,255,0.6)" }} />
          <Box sx={{ height: 96, borderRadius: "8px", bgcolor: "rgba(255,255,255,0.6)" }} />
          <Box sx={{ height: 96, borderRadius: "8px", bgcolor: "rgba(255,255,255,0.6)" }} />
        </Box>
        <Box sx={{ height: 12, width: 256, borderRadius: "4px", bgcolor: "rgba(255,255,255,0.6)", mt: 3 }} />
        <Box sx={{ height: 12, width: 320, borderRadius: "4px", bgcolor: "rgba(255,255,255,0.5)", mt: 1 }} />
        <Box sx={{ height: 12, width: 208, borderRadius: "4px", bgcolor: "rgba(255,255,255,0.5)", mt: 1 }} />
      </Box>

      <AnimatePresence mode="popLayout">
        <Box
          component={motion.div}
          key={`${cfg.variant}-${cfg.position}-${cfg.mountMode}`}
          initial={{ opacity: 0, scale: 0.94, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 16 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          sx={{ position: "absolute", inset: 0, pointerEvents: "none" }}
        >
          <Box sx={{ position: "absolute", inset: 0, pointerEvents: "auto" }}>
            {cfg.mountMode === "element" ? (
              <Box
                sx={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  p: 4,
                  pt: 7,
                }}
              >
                <Box
                  sx={{
                    position: "relative",
                    width: 400,
                    maxWidth: "100%",
                    height: "100%",
                    maxHeight: 640,
                    borderRadius: "16px",
                    border: "2px dashed",
                    p: 0.5,
                    display: "flex",
                    flexDirection: "column",
                  }}
                  style={{ borderColor: `${cfg.theme}66` }}
                >
                  <Box
                    sx={{
                      position: "absolute",
                      top: -10,
                      left: 16,
                      px: 1,
                      fontSize: 10,
                      fontFamily: "monospace",
                      fontWeight: 600,
                      borderRadius: "4px",
                    }}
                    style={{ background: "#eceef1", color: cfg.theme }}
                  >
                    {cfg.mountSelector || "#chat-container"}
                  </Box>
                  <Box
                    sx={{
                      flex: 1,
                      borderRadius: "12px",
                      overflow: "hidden",
                      display: "flex",
                      flexDirection: "column",
                      boxShadow: 6,
                    }}
                    style={{
                      background: surface,
                      border: `1px solid ${border}`,
                      transition: "background 500ms ease, border-color 500ms ease",
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
                  </Box>
                </Box>
              </Box>
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
          </Box>
        </Box>
      </AnimatePresence>

      <AnimatePresence>{celebrate && <Celebration theme={cfg.theme} />}</AnimatePresence>
    </Box>
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
    <Box
      component={motion.div}
      sx={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {pieces.map((p, i) => (
        <Box
          component={motion.div}
          key={i}
          sx={{ position: "absolute", borderRadius: "2px" }}
          style={{ left: p.left, top: -12, width: p.size, height: p.size, background: p.color }}
          initial={{ y: -20, rotate: 0, opacity: 1 }}
          animate={{ y: "110vh", rotate: p.rotate + 540, opacity: [1, 1, 0.6] }}
          transition={{ duration: 2.6 + (i % 5) * 0.35, delay: p.delay, ease: "easeIn" }}
        />
      ))}
    </Box>
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
      <Box
        sx={{
          position: "absolute",
          width: 360,
          height: 600,
          maxHeight: "calc(100% - 120px)",
          borderRadius: "28px",
          boxShadow: 10,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
        style={{
          ...posStyle,
          background: surface,
          border: `1px solid ${border}`,
          ...colorTransition,
        }}
      >
        {children}
      </Box>
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
    <Box
      sx={{ position: "absolute", boxShadow: 10, display: "flex", flexDirection: "column", overflow: "hidden" }}
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
    </Box>
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
      <Box
        sx={{ height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", px: 2, flexShrink: 0 }}
        style={{ background: cfg.theme, ...colorTransition }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: "white" }}>
          <AvatarLogo logoUrl={cfg.logoUrl} />
          <Box sx={{ fontSize: 13, fontWeight: 600 }}>{cfg.assistantName}</Box>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: "rgba(255,255,255,0.8)" }}>
          <MoreHorizontal style={{ height: 16, width: 16 }} />
          <X style={{ height: 16, width: 16 }} />
        </Box>
      </Box>
      <Box
        sx={{ flex: 1, p: 2, display: "flex", flexDirection: "column", gap: 1.25, overflowY: "auto" }}
        style={{ background: surface, ...colorTransition }}
      >
        <MsgBubble text="Hey! 👋 How can I help you today?" color="#f3f4f6" fg="#111827" />
        <MsgBubble text="I'd like to know about your pricing." color={cfg.theme} fg="#fff" right />
        <MsgBubble text="Sure — our plans start at $29/mo." color="#f3f4f6" fg="#111827" />
      </Box>
      <Box
        sx={{ height: 56, borderTop: "1px solid", display: "flex", alignItems: "center", px: 1.5, gap: 1, flexShrink: 0 }}
        style={{ borderColor: border, background: surface, ...colorTransition }}
      >
        <Box
          component="input"
          placeholder="Type your message…"
          sx={{
            flex: 1,
            height: 36,
            borderRadius: "9999px",
            px: 1.5,
            fontSize: 12,
            outline: "none",
            border: "1px solid",
          }}
          style={{ borderColor: border, background: "transparent", color: surfaceText }}
        />
        <Box
          component="button"
          sx={{ height: 36, width: 36, borderRadius: "9999px", display: "flex", alignItems: "center", justifyContent: "center", color: "white", border: "none", cursor: "pointer" }}
          style={{ background: cfg.theme, ...colorTransition }}
        >
          <Send style={{ height: 16, width: 16 }} />
        </Box>
      </Box>
      <Box
        sx={{ textAlign: "center", fontSize: 10, color: "neutral.400", py: 0.75 }}
        style={{ background: surface, ...colorTransition }}
      >
        Powered by ChatWidget
      </Box>
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
          <Box
            sx={{ position: "relative", px: 2.5, pt: 3, pb: 7, flexShrink: 0 }}
            style={{ background: heroBg, ...colorTransition }}
          >
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <AvatarLogo logoUrl={cfg.logoUrl} size={36} />
              <X style={{ height: 16, width: 16, color: "rgba(255,255,255,0.8)" }} />
            </Box>
            <Typewriter
              text={cfg.greeting}
              sx={{ mt: 3, color: "white", fontSize: 22, fontWeight: 700, lineHeight: 1.2, pr: 3, minHeight: 28 }}
            />
            <Box sx={{ color: "rgba(255,255,255,0.7)", fontSize: 12, mt: 1 }}>
              We're here to help — search below or pick an option.
            </Box>
          </Box>
          <Box sx={{ px: 2, mt: "-24px", position: "relative", zIndex: 10, flexShrink: 0 }}>
            <Box
              component="button"
              onClick={() => setTab("messages")}
              sx={{
                width: "100%",
                height: 48,
                borderRadius: "9999px",
                bgcolor: "white",
                boxShadow: 6,
                display: "flex",
                alignItems: "center",
                gap: 1,
                px: 2,
                fontSize: 13,
                fontWeight: 500,
                color: "neutral.700",
                border: "1px solid rgba(0,0,0,0.05)",
                cursor: "pointer",
              }}
            >
              <MessageSquare style={{ height: 16, width: 16, color: cfg.theme }} />
              Chat with us
              <Box component="span" sx={{ ml: "auto", fontSize: 11, color: "neutral.400" }}>
                Send a message
              </Box>
            </Box>
          </Box>

          <Box sx={{ flex: 1, overflowY: "auto", px: 2, pt: 2, pb: 1 }}>
            <AnimatePresence initial={false}>
              {cfg.entitiesOn &&
                entities.map((e) => (
                  <Box component={motion.div} key={e.id} {...sectionMotion} sx={{ overflow: "hidden" }}>
                    <Box sx={{ pb: 2 }}>
                      <EntityCardPreview
                        entity={e}
                        theme={cfg.theme}
                        surfaceText={surfaceText}
                        mutedText={mutedText}
                        border={border}
                        appearance={cfg.appearance}
                      />
                    </Box>
                  </Box>
                ))}

              {cfg.entitiesOn && entityTesting && (
                <Box component={motion.div} key="entity-skeleton" {...sectionMotion} sx={{ overflow: "hidden" }}>
                  <Box sx={{ pb: 2, display: "flex", flexDirection: "column", gap: 1 }}>
                    <Box
                      sx={{ height: 12, width: 96, borderRadius: "4px", animation: "pulse 1.5s ease-in-out infinite" }}
                      style={{ background: border }}
                    />
                    {[0, 1, 2].map((i) => (
                      <Box
                        key={i}
                        sx={{ borderRadius: "12px", border: "1px solid", p: 1.5, display: "flex", alignItems: "center", gap: 1.5 }}
                        style={{ borderColor: border }}
                      >
                        <Box
                          sx={{ height: 32, width: 32, borderRadius: "8px", animation: "pulse 1.5s ease-in-out infinite" }}
                          style={{ background: border }}
                        />
                        <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 0.75 }}>
                          <Box
                            sx={{ height: 10, width: "66%", borderRadius: "4px", animation: "pulse 1.5s ease-in-out infinite" }}
                            style={{ background: border }}
                          />
                          <Box
                            sx={{ height: 8, width: "33%", borderRadius: "4px", animation: "pulse 1.5s ease-in-out infinite" }}
                            style={{ background: border }}
                          />
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}

              {cfg.faqOn && cfg.faqItems.length > 0 && (
                <Box component={motion.div} key="faq" {...sectionMotion} sx={{ overflow: "hidden" }}>
                  <Box sx={{ pb: 2 }}>
                    <Box sx={{ fontSize: 12, fontWeight: 700, mb: 1 }} style={{ color: surfaceText }}>
                      Quick answers
                    </Box>
                    <Box
                      sx={{ borderRadius: "12px", overflow: "hidden", border: "1px solid" }}
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
                    </Box>
                  </Box>
                </Box>
              )}

              {cfg.customLinksOn && cfg.linkItems.length > 0 && (
                <Box component={motion.div} key="links" {...sectionMotion} sx={{ overflow: "hidden" }}>
                  <Box sx={{ pb: 2, display: "flex", flexDirection: "column", gap: 1 }}>
                    {cfg.linkItems.map((l) => (
                      <Box
                        component="a"
                        key={l.id}
                        href={l.url || "#"}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          px: 2,
                          height: 44,
                          borderRadius: "12px",
                          border: "1px solid",
                          fontSize: 13,
                          fontWeight: 600,
                          textDecoration: "none",
                        }}
                        style={{
                          borderColor: border,
                          color: surfaceText,
                          background:
                            cfg.appearance === "dark" ? "rgba(255,255,255,0.03)" : "white",
                        }}
                      >
                        <Box component="span">{l.name || l.url || "Untitled link"}</Box>
                        <ChevronRight style={{ height: 16, width: 16, color: mutedText }} />
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}

              {cfg.contactOn && cfg.contacts.length > 0 && (
                <Box component={motion.div} key="contacts" {...sectionMotion} sx={{ overflow: "hidden" }}>
                  <Box sx={{ pb: 2 }}>
                    <Box sx={{ fontSize: 12, fontWeight: 700, mb: 1 }} style={{ color: surfaceText }}>
                      Get in touch
                    </Box>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                      {cfg.contacts.map((c) => (
                        <Box
                          key={c.id}
                          sx={{ borderRadius: "12px", border: "1px solid", p: 1.5, display: "flex", alignItems: "center", gap: 1.5 }}
                          style={{
                            borderColor: border,
                            background:
                              cfg.appearance === "dark" ? "rgba(255,255,255,0.03)" : "white",
                          }}
                        >
                          <Box
                            sx={{ height: 36, width: 36, borderRadius: "9999px", display: "flex", alignItems: "center", justifyContent: "center", color: "white" }}
                            style={{ background: cfg.theme, ...colorTransition }}
                          >
                            <User style={{ height: 16, width: 16 }} />
                          </Box>
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Box
                              sx={{ fontSize: 13, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
                              style={{ color: surfaceText }}
                            >
                              {c.name || "Contact"}
                            </Box>
                            <Box
                              sx={{ fontSize: 11, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
                              style={{ color: mutedText }}
                            >
                              {c.role || c.email || c.phone}
                            </Box>
                          </Box>
                          <Box sx={{ display: "flex", gap: 0.75 }}>
                            {c.email && (
                              <Box
                                sx={{ height: 28, width: 28, borderRadius: "9999px", display: "flex", alignItems: "center", justifyContent: "center" }}
                                style={{
                                  background:
                                    cfg.appearance === "dark"
                                      ? "rgba(255,255,255,0.06)"
                                      : "#f3f4f6",
                                }}
                              >
                                <Mail style={{ height: 14, width: 14, color: mutedText }} />
                              </Box>
                            )}
                            {c.phone && (
                              <Box
                                sx={{ height: 28, width: 28, borderRadius: "9999px", display: "flex", alignItems: "center", justifyContent: "center" }}
                                style={{
                                  background:
                                    cfg.appearance === "dark"
                                      ? "rgba(255,255,255,0.06)"
                                      : "#f3f4f6",
                                }}
                              >
                                <PhoneIcon style={{ height: 14, width: 14, color: mutedText }} />
                              </Box>
                            )}
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                </Box>
              )}

              {!cfg.faqOn && !cfg.contactOn && !cfg.entitiesOn && !cfg.customLinksOn && (
                <Box component={motion.div} key="empty" {...sectionMotion} sx={{ overflow: "hidden" }}>
                  <Box
                    sx={{ borderRadius: "12px", border: "1px dashed", p: 2.5, textAlign: "center" }}
                    style={{ borderColor: border }}
                  >
                    <Box sx={{ fontSize: 12, fontWeight: 600 }} style={{ color: surfaceText }}>
                      Your home tab is waiting ✨
                    </Box>
                    <Box sx={{ fontSize: 11, mt: 0.5 }} style={{ color: mutedText }}>
                      Add FAQ, contacts, or live data cards from the conversation.
                    </Box>
                  </Box>
                </Box>
              )}
            </AnimatePresence>
          </Box>

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
          <Box
            sx={{ height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", px: 2, flexShrink: 0 }}
            style={{ background: cfg.theme, ...colorTransition }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: "white" }}>
              <AvatarLogo logoUrl={cfg.logoUrl} />
              <Box sx={{ fontSize: 13, fontWeight: 600 }}>Messages</Box>
            </Box>
            <X style={{ height: 16, width: 16, color: "rgba(255,255,255,0.8)" }} />
          </Box>
          <Box
            sx={{ flex: 1, p: 2, display: "flex", flexDirection: "column", gap: 1.25, overflowY: "auto" }}
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
          </Box>
          <Box
            sx={{ borderTop: "1px solid", display: "flex", alignItems: "center", px: 1.5, gap: 1, height: 56, flexShrink: 0 }}
            style={{ borderColor: border, background: surface, ...colorTransition }}
          >
            {cfg.attachOn && <Paperclip style={{ height: 16, width: 16, color: mutedText }} />}
            <Box
              component="input"
              placeholder="Type your message…"
              sx={{ flex: 1, height: 36, borderRadius: "9999px", px: 1.5, fontSize: 12, outline: "none", border: "1px solid" }}
              style={{ borderColor: border, background: "transparent", color: surfaceText }}
            />
            <Box
              component="button"
              sx={{ height: 36, width: 36, borderRadius: "9999px", display: "flex", alignItems: "center", justifyContent: "center", color: "white", border: "none", cursor: "pointer" }}
              style={{ background: cfg.theme, ...colorTransition }}
            >
              <Send style={{ height: 16, width: 16 }} />
            </Box>
          </Box>
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
      <Box
        sx={{ borderRadius: "12px", border: "1px solid", p: 1.5, display: "flex", alignItems: "center", gap: 1.5 }}
        style={{ borderColor: border, background: cardBg }}
      >
        <Box
          sx={{ height: 36, width: 36, borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", color: "white" }}
          style={{ background: theme, ...colorTransition }}
        >
          <Icon style={{ height: 16, width: 16 }} />
        </Box>
        <Box sx={{ flex: 1 }}>
          <Box sx={{ fontSize: 13, fontWeight: 700 }} style={{ color: surfaceText }}>
            {entity.name}
          </Box>
          <Box sx={{ fontSize: 11 }} style={{ color: mutedText }}>
            Connect an API to load data
          </Box>
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
        <Icon style={{ height: 16, width: 16, color: theme }} />
        <Box sx={{ fontSize: 12, fontWeight: 700 }} style={{ color: surfaceText }}>
          {entity.name}
        </Box>
      </Box>

      {entity.layout === "grid" ? (
        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 1 }}>
          {items.map((it, i) => (
            <Box
              key={i}
              sx={{ borderRadius: "12px", border: "1px solid", p: 1.5 }}
              style={{ borderColor: border, background: cardBg }}
            >
              <Box sx={{ fontSize: 12, fontWeight: 600 }} style={{ color: surfaceText }}>
                {getField(it, entity.mapping.title) || "—"}
              </Box>
              <Box sx={{ fontSize: 11, mt: 0.25 }} style={{ color: mutedText }}>
                {getField(it, entity.mapping.subtitle)}
              </Box>
              {entity.mapping.badge && (
                <Box
                  sx={{ mt: 1, display: "inline-flex", fontSize: 10, fontWeight: 600, px: 1, py: 0.25, borderRadius: "9999px" }}
                  style={{ background: `${theme}22`, color: theme }}
                >
                  {getField(it, entity.mapping.badge)}
                </Box>
              )}
            </Box>
          ))}
        </Box>
      ) : entity.layout === "compact" ? (
        <Box sx={{ borderRadius: "12px", border: "1px solid", overflow: "hidden" }} style={{ borderColor: border }}>
          {items.map((it, i) => (
            <Box
              key={i}
              sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 1.5, py: 1 }}
              style={{ borderTop: i === 0 ? "none" : `1px solid ${border}`, background: cardBg }}
            >
              <Box
                sx={{ fontSize: 12.5, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
                style={{ color: surfaceText }}
              >
                {getField(it, entity.mapping.title) || "—"}
              </Box>
              {entity.mapping.badge && (
                <Box
                  sx={{ fontSize: 10, fontWeight: 600, px: 1, py: 0.25, borderRadius: "9999px", flexShrink: 0, ml: 1 }}
                  style={{ background: `${theme}22`, color: theme }}
                >
                  {getField(it, entity.mapping.badge)}
                </Box>
              )}
            </Box>
          ))}
        </Box>
      ) : entity.layout === "card" ? (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {items.map((it, i) => (
            <Box
              key={i}
              sx={{ borderRadius: "12px", border: "1px solid", p: 1.5, boxShadow: 1 }}
              style={{ borderColor: border, background: cardBg }}
            >
              <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
                <Box
                  sx={{ height: 40, width: 40, borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", color: "white", flexShrink: 0 }}
                  style={{ background: theme, ...colorTransition }}
                >
                  <Icon style={{ height: 16, width: 16 }} />
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Box
                      sx={{ fontSize: 13, fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
                      style={{ color: surfaceText }}
                    >
                      {getField(it, entity.mapping.title) || "—"}
                    </Box>
                    {entity.mapping.tag && (
                      <Box
                        sx={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}
                        style={{ color: theme }}
                      >
                        {getField(it, entity.mapping.tag)}
                      </Box>
                    )}
                  </Box>
                  <Box sx={{ fontSize: 11 }} style={{ color: mutedText }}>
                    {getField(it, entity.mapping.subtitle)}
                  </Box>
                  {entity.mapping.description && (
                    <Box sx={{ fontSize: 11, mt: 0.5 }} style={{ color: mutedText }}>
                      {getField(it, entity.mapping.description)}
                    </Box>
                  )}
                  {entity.mapping.badge && (
                    <Box
                      sx={{ mt: 1, display: "inline-flex", fontSize: 10, fontWeight: 600, px: 1, py: 0.25, borderRadius: "9999px" }}
                      style={{ background: `${theme}22`, color: theme }}
                    >
                      {getField(it, entity.mapping.badge)}
                    </Box>
                  )}
                </Box>
              </Box>
            </Box>
          ))}
        </Box>
      ) : (
        <Box
          sx={{ borderRadius: "12px", border: "1px solid", overflow: "hidden" }}
          style={{ borderColor: border, background: cardBg }}
        >
          {items.map((it, i) => (
            <Box
              key={i}
              sx={{ display: "flex", alignItems: "center", gap: 1.5, px: 1.5, py: 1.25 }}
              style={{ borderTop: i === 0 ? "none" : `1px solid ${border}` }}
            >
              <Box
                sx={{ height: 32, width: 32, borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", color: "white", flexShrink: 0 }}
                style={{ background: theme, ...colorTransition }}
              >
                <Icon style={{ height: 14, width: 14 }} />
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Box
                  sx={{ fontSize: 12.5, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
                  style={{ color: surfaceText }}
                >
                  {getField(it, entity.mapping.title) || "—"}
                </Box>
                <Box
                  sx={{ fontSize: 11, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
                  style={{ color: mutedText }}
                >
                  {getField(it, entity.mapping.subtitle)}
                </Box>
              </Box>
              {entity.mapping.badge && (
                <Box
                  sx={{ fontSize: 10, fontWeight: 600, px: 1, py: 0.25, borderRadius: "9999px", flexShrink: 0 }}
                  style={{ background: `${theme}22`, color: theme }}
                >
                  {getField(it, entity.mapping.badge)}
                </Box>
              )}
              <ChevronRight style={{ height: 16, width: 16, flexShrink: 0, color: mutedText }} />
            </Box>
          ))}
        </Box>
      )}
    </Box>
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
    <Box
      sx={{ height: 56, borderTop: "1px solid", display: "flex", alignItems: "stretch", flexShrink: 0 }}
      style={{ borderColor: border, background: surface, ...colorTransition }}
    >
      {[
        { k: "home" as Tab, label: "Home", icon: HomeIcon },
        { k: "messages" as Tab, label: "Messages", icon: MessageSquare },
      ].map(({ k, label, icon: Icon }) => {
        const active = tab === k;
        return (
          <Box
            component="button"
            key={k}
            onClick={() => setTab(k)}
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 0.25,
              border: "none",
              background: "transparent",
              cursor: "pointer",
            }}
            style={{ color: active ? theme : mutedText }}
          >
            <Icon style={{ height: 18, width: 18 }} />
            <Box component="span" sx={{ fontSize: 10, fontWeight: 600 }}>
              {label}
            </Box>
          </Box>
        );
      })}
    </Box>
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
    <Box
      sx={{ maxWidth: "80%", borderRadius: "16px", px: 1.75, py: 1.25, fontSize: 12.5, ml: right ? "auto" : 0 }}
      style={{ background: color, color: fg, ...colorTransition }}
    >
      {text}
    </Box>
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
    <Box style={{ borderBottom: last ? "none" : `1px solid ${border}` }}>
      <Box
        component="button"
        onClick={() => setOpen(!open)}
        sx={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 2,
          py: 1.5,
          textAlign: "left",
          border: "none",
          background: "transparent",
          cursor: "pointer",
        }}
      >
        <Box component="span" sx={{ fontSize: 13, fontWeight: 600, pr: 1.5 }} style={{ color: surfaceText }}>
          {question}
        </Box>
        <ChevronRight
          style={{
            height: 16,
            width: 16,
            flexShrink: 0,
            transition: "transform 0.2s",
            color: theme,
            transform: open ? "rotate(90deg)" : "none",
          }}
        />
      </Box>
      <AnimatePresence initial={false}>
        {open && answer && (
          <Box
            component={motion.div}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            sx={{ overflow: "hidden" }}
          >
            <Box sx={{ px: 2, pb: 1.5, fontSize: 12, lineHeight: 1.6 }} style={{ color: mutedText }}>
              {answer}
            </Box>
          </Box>
        )}
      </AnimatePresence>
    </Box>
  );
}
