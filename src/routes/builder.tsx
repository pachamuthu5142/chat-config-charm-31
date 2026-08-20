import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Box,
  Button,
  IconButton,
  LinearProgress,
  Stack,
  Typography,
} from "@mui/material";
import {
  ArrowBack,
  Check as CheckIcon,
  ContentCopy,
  Edit as EditIcon,
  Redo,
  RestartAlt,
  SmartToy,
  Undo,
  AutoAwesome,
  Forum,
} from "@mui/icons-material";
import { ACCENT, SIDEBAR_BG } from "../theme";
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
    <Box
      sx={{
        fontFamily: '"DM Sans", ui-sans-serif, system-ui, sans-serif',
        background: "#f7f7f8",
        height: "100vh",
        width: "100vw",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        fontSize: 13,
        color: "neutral.800",
        WebkitFontSmoothing: "antialiased",
      }}
    >
      {/* top bar */}
      <Box
        component="header"
        sx={{
          height: 56,
          flexShrink: 0,
          px: { xs: 2, lg: 3 },
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          borderBottom: "1px solid",
          borderColor: "rgba(0,0,0,0.05)",
          bgcolor: "white",
        }}
      >
        <Box
          component={Link}
          to="/"
          title="Classic form builder"
          sx={{
            height: 32,
            width: 32,
            borderRadius: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "neutral.500",
            textDecoration: "none",
            "&:hover": { bgcolor: "neutral.100" },
          }}
        >
          <ArrowBack sx={{ fontSize: 16 }} />
        </Box>
        <Box
          sx={{
            height: 32,
            width: 32,
            borderRadius: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: ACCENT,
          }}
        >
          <Forum sx={{ fontSize: 16, color: "white" }} />
        </Box>
        <Box sx={{ lineHeight: 1.2 }}>
          <Typography sx={{ fontSize: 13, fontWeight: 700, color: "neutral.900" }}>
            Widget Designer
          </Typography>
          <Typography sx={{ fontSize: 10.5, color: "neutral.400" }}>
            Conversational builder
          </Typography>
        </Box>

        {/* progress */}
        <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", px: 2 }}>
          <Stack
            direction="row"
            sx={{
              width: "100%",
              maxWidth: 224,
              display: { xs: "none", sm: "flex" },
              alignItems: "center",
              gap: 1.25,
            }}
          >
            <Box sx={{ flex: 1, height: 6, borderRadius: 999, bgcolor: "neutral.100", overflow: "hidden" }}>
              <Box
                component={motion.div}
                style={{ background: ACCENT, height: "100%", borderRadius: 999 }}
                animate={{ width: `${b.progress}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </Box>
            <Typography
              sx={{ fontSize: 11, fontWeight: 600, color: "neutral.500", fontVariantNumeric: "tabular-nums" }}
            >
              {b.progress}%
            </Typography>
          </Stack>
        </Box>

        <Stack direction="row" sx={{ alignItems: "center", gap: 0.5 }}>
          <IconBtn title="Undo" disabled={!b.canUndo} onClick={b.undo}>
            <Undo sx={{ fontSize: 16 }} />
          </IconBtn>
          <IconBtn title="Redo" disabled={!b.canRedo} onClick={b.redo}>
            <Redo sx={{ fontSize: 16 }} />
          </IconBtn>
          <IconBtn
            title="Start over"
            disabled={Object.keys(b.answers).length === 0}
            onClick={b.restart}
          >
            <RestartAlt sx={{ fontSize: 16 }} />
          </IconBtn>
        </Stack>
      </Box>

      {/* mobile pane switch */}
      <Stack
        direction="row"
        sx={{ display: { xs: "flex", lg: "none" }, borderBottom: "1px solid", borderColor: "rgba(0,0,0,0.05)", bgcolor: "white" }}
      >
        {(["chat", "preview"] as const).map((k) => (
          <Box
            component="button"
            key={k}
            onClick={() => setMobilePane(k)}
            sx={{
              flex: 1,
              height: 40,
              fontSize: 12,
              fontWeight: 600,
              textTransform: "capitalize",
              border: "none",
              borderBottom: "2px solid",
              transition: "all 0.15s",
              bgcolor: "transparent",
              cursor: "pointer",
              borderColor: mobilePane === k ? ACCENT : "transparent",
              color: mobilePane === k ? "#111" : "#9ca3af",
            }}
          >
            {k === "chat" ? "Conversation" : "Preview"}
          </Box>
        ))}
      </Stack>

      <Box sx={{ flex: 1, display: "flex", minHeight: 0 }}>
        {/* left: conversation */}
        <Box
          component="section"
          sx={{
            display: { xs: mobilePane === "chat" ? "flex" : "none", lg: "flex" },
            flexDirection: "column",
            width: { xs: "100%", lg: 420, xl: 460 },
            flexShrink: 0,
            bgcolor: "white",
            borderRight: "1px solid",
            borderColor: "rgba(0,0,0,0.05)",
          }}
        >
          <Box ref={scrollRef} sx={{ flex: 1, overflowY: "auto", px: 2.5, py: 3, display: "flex", flexDirection: "column", gap: 3 }}>
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
          </Box>
        </Box>

        {/* center: live preview */}
        <Box
          component="section"
          sx={{
            display: { xs: mobilePane === "preview" ? "block" : "none", lg: "block" },
            flex: 1,
            position: "relative",
            minWidth: 0,
            background: "#eceef1",
          }}
        >
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: 48,
              px: 2.5,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              zIndex: 20,
              pointerEvents: "none",
            }}
          >
            <Typography sx={{ fontSize: 10.5, fontWeight: 600, letterSpacing: "0.14em", color: "neutral.400" }}>
              LIVE PREVIEW
            </Typography>
            <Stack direction="row" sx={{ alignItems: "center", gap: 0.75, fontSize: 11, color: "neutral.500" }}>
              <Box sx={{ position: "relative", display: "flex", height: 8, width: 8 }}>
                <Box
                  sx={{
                    position: "absolute",
                    display: "inline-flex",
                    height: "100%",
                    width: "100%",
                    borderRadius: "50%",
                    bgcolor: "success.light",
                    opacity: 0.6,
                    animation: "ping 1.5s cubic-bezier(0,0,0.2,1) infinite",
                    "@keyframes ping": {
                      "75%, 100%": { transform: "scale(2)", opacity: 0 },
                    },
                  }}
                />
                <Box
                  sx={{
                    position: "relative",
                    display: "inline-flex",
                    borderRadius: "50%",
                    height: 8,
                    width: 8,
                    bgcolor: "success.main",
                  }}
                />
              </Box>
              Updates as you answer
            </Stack>
          </Box>
          <WidgetPreview
            cfg={previewCfg}
            tab={previewTab}
            setTab={setPreviewTab}
            entityDraft={entityDraft}
            entityTesting={entityTesting}
            celebrate={celebrate}
          />
        </Box>

        {/* right: configuration timeline */}
        <Box
          component="aside"
          sx={{
            display: { xs: "none", xl: "flex" },
            width: 256,
            flexShrink: 0,
            flexDirection: "column",
            bgcolor: "white",
            borderLeft: "1px solid",
            borderColor: "rgba(0,0,0,0.05)",
          }}
        >
          <Box
            sx={{
              height: 48,
              px: 2,
              display: "flex",
              alignItems: "center",
              fontSize: 10.5,
              fontWeight: 600,
              letterSpacing: "0.14em",
              color: "neutral.400",
              borderBottom: "1px solid",
              borderColor: "rgba(0,0,0,0.05)",
            }}
          >
            YOUR CONFIGURATION
          </Box>
          <Box sx={{ flex: 1, overflowY: "auto", p: 1.5, display: "flex", flexDirection: "column", gap: 0.5 }}>
            <AnimatePresence initial={false}>
              {b.steps
                .filter((s) => s.kind !== "finish")
                .map((step) => {
                  const answered = step.id in b.answers;
                  const active = b.currentStep?.id === step.id || b.editing === step.id;
                  return (
                    <Box
                      component={motion.button}
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
                      sx={{
                        width: "100%",
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 1.25,
                        borderRadius: 2,
                        px: 1.25,
                        py: 1,
                        textAlign: "left",
                        transition: "background 0.15s",
                        border: "none",
                        background: active ? "#fff5f2" : "transparent",
                        cursor: answered ? "pointer" : "default",
                        "&:hover": answered ? { bgcolor: active ? "#fff5f2" : "neutral.50" } : undefined,
                        "&:hover .MuiSvgIcon-fontSizeSmall:last-of-type": { opacity: 1 },
                      }}
                    >
                      <Box
                        sx={{
                          mt: 0.25,
                          height: 20,
                          width: 20,
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          border: "1px solid",
                          transition: "all 0.15s",
                          background: answered ? "#16a34a" : "white",
                          borderColor: answered ? "#16a34a" : active ? ACCENT : "#e5e7eb",
                        }}
                      >
                        {answered ? (
                          <CheckIcon sx={{ fontSize: 12, color: "white" }} />
                        ) : active ? (
                          <Box sx={{ height: 6, width: 6, borderRadius: "50%", background: ACCENT }} />
                        ) : null}
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography sx={{ display: "block", fontSize: 12, fontWeight: 600, color: "neutral.800" }}>
                          {step.label}
                        </Typography>
                        <Typography
                          sx={{
                            display: "block",
                            fontSize: 11,
                            color: "neutral.400",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {answered
                            ? step.summarize(b.answers[step.id], b.config)
                            : active
                              ? "Deciding now…"
                              : "Up next"}
                        </Typography>
                      </Box>
                      {answered && (
                        <EditIcon
                          fontSize="small"
                          sx={{ fontSize: "12px !important", mt: 0.5, color: "neutral.300", opacity: 0, transition: "opacity 0.15s", flexShrink: 0 }}
                        />
                      )}
                    </Box>
                  );
                })}
            </AnimatePresence>
          </Box>
          <ThemeChip theme={previewCfg.theme} />
        </Box>
      </Box>
    </Box>
  );
}

function ThemeChip({ theme }: { theme: string }) {
  return (
    <Stack
      direction="row"
      sx={{
        p: 1.5,
        borderTop: "1px solid",
        borderColor: "rgba(0,0,0,0.05)",
        alignItems: "center",
        gap: 1,
        fontSize: 11,
        color: "neutral.500",
      }}
    >
      <Box
        sx={{
          height: 16,
          width: 16,
          borderRadius: "50%",
          border: "1px solid rgba(0,0,0,0.1)",
          background: theme,
          transition: "background 500ms ease",
        }}
      />
      Brand color · {themeName(theme)}
    </Stack>
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
    <IconButton
      title={title}
      disabled={disabled}
      onClick={onClick}
      size="small"
      sx={{
        height: 32,
        width: 32,
        borderRadius: 2,
        color: "neutral.500",
        "&:hover": { bgcolor: "neutral.100" },
        "&.Mui-disabled": { opacity: 0.3 },
      }}
    >
      {children}
    </IconButton>
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
    <Box
      component={motion.div}
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}
    >
      {/* assistant bubble */}
      <Stack direction="row" sx={{ gap: 1.25 }}>
        <Box
          sx={{
            height: 28,
            width: 28,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            mt: 0.25,
            background: ACCENT,
          }}
        >
          <SmartToy sx={{ fontSize: 14, color: "white" }} />
        </Box>
        <Box sx={{ maxWidth: "85%" }}>
          <Box
            sx={{
              borderRadius: "16px",
              borderTopLeftRadius: 6,
              bgcolor: "neutral.100",
              px: 1.75,
              py: 1.25,
              fontSize: 13,
              lineHeight: 1.6,
              color: "neutral.800",
            }}
          >
            {step.prompt}
          </Box>
          {step.hint && isActive && (
            <Typography sx={{ fontSize: 11, color: "neutral.400", mt: 0.5, ml: 0.5 }}>{step.hint}</Typography>
          )}
        </Box>
      </Stack>

      {/* answered → user bubble with hover-edit */}
      {answered && !isEditing && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            "&:hover button": { opacity: 1 },
          }}
        >
          <Stack direction="row" sx={{ alignItems: "center", gap: 1 }}>
            <Box
              component="button"
              onClick={onEdit}
              sx={{
                opacity: 0,
                transition: "opacity 0.15s, color 0.15s",
                display: "inline-flex",
                alignItems: "center",
                gap: 0.5,
                fontSize: 11,
                fontWeight: 600,
                color: "neutral.400",
                border: "none",
                bgcolor: "transparent",
                cursor: "pointer",
                "&:hover": { color: ACCENT },
              }}
            >
              <EditIcon sx={{ fontSize: 12 }} /> Edit
            </Box>
            <Box
              sx={{
                borderRadius: "16px",
                borderTopRightRadius: 6,
                px: 1.75,
                py: 1.25,
                fontSize: 13,
                fontWeight: 500,
                color: "white",
                maxWidth: "75%",
                background: SIDEBAR_BG,
              }}
            >
              {summary}
            </Box>
          </Stack>
        </Box>
      )}

      {/* active control */}
      {isActive && (
        <Box sx={{ pl: 4.5, display: "flex", flexDirection: "column", gap: 1 }}>
          {children}
          {isEditing && (
            <Box
              component="button"
              onClick={onCancelEdit}
              sx={{
                alignSelf: "flex-start",
                fontSize: 11.5,
                color: "neutral.400",
                textDecoration: "underline",
                textUnderlineOffset: "2px",
                border: "none",
                bgcolor: "transparent",
                cursor: "pointer",
                "&:hover": { color: "neutral.600" },
              }}
            >
              Never mind — keep my answer
            </Box>
          )}
        </Box>
      )}
    </Box>
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
    <Box component={motion.div} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} sx={{ pt: 0.5 }}>
      <Button
        onClick={() => commit()}
        variant="contained"
        disableElevation
        startIcon={<CheckIcon sx={{ fontSize: 14 }} />}
        sx={{
          height: 36,
          px: 2.5,
          borderRadius: 999,
          fontSize: 12.5,
          fontWeight: 600,
          background: ACCENT,
          "&:hover": { background: ACCENT, filter: "brightness(0.95)" },
        }}
      >
        Confirm
      </Button>
    </Box>
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
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      sx={{ display: "flex", flexDirection: "column", gap: 2 }}
    >
      <Stack direction="row" sx={{ gap: 1.25 }}>
        <Box
          sx={{
            height: 28,
            width: 28,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            mt: 0.25,
            background: ACCENT,
          }}
        >
          <AutoAwesome sx={{ fontSize: 14, color: "white" }} />
        </Box>
        <Box
          sx={{
            borderRadius: "16px",
            borderTopLeftRadius: 6,
            bgcolor: "neutral.100",
            px: 1.75,
            py: 1.25,
            fontSize: 13,
            lineHeight: 1.6,
            color: "neutral.800",
            maxWidth: "85%",
          }}
        >
          🎉 Your widget is ready! Here's what we built together:
        </Box>
      </Stack>

      <Box sx={{ pl: 4.5, display: "flex", flexDirection: "column", gap: 1.5 }}>
        <Box sx={{ borderRadius: 3, border: "1px solid", borderColor: "neutral.200", bgcolor: "white", p: 1.5, display: "flex", flexDirection: "column", gap: 0.75 }}>
          {checklist.map((c, i) => (
            <Stack
              component={motion.div}
              key={c.label}
              direction="row"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 + i * 0.12 }}
              sx={{ alignItems: "center", gap: 1, fontSize: 12.5 }}
            >
              <Box
                sx={{
                  height: 20,
                  width: 20,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: c.done ? "#16a34a" : "#e5e7eb",
                }}
              >
                <CheckIcon sx={{ fontSize: 12, color: "white" }} />
              </Box>
              <Typography
                component="span"
                sx={{ fontSize: 12.5, color: c.done ? "neutral.800" : "neutral.400", fontWeight: c.done ? 500 : 400 }}
              >
                {c.label}
                {!c.done && " · skipped"}
              </Typography>
            </Stack>
          ))}
        </Box>

        {!showCode ? (
          <Button
            onClick={() => setShowCode(true)}
            variant="contained"
            disableElevation
            sx={{
              alignSelf: "flex-start",
              height: 40,
              px: 2.5,
              borderRadius: 3,
              color: "white",
              fontSize: 13,
              fontWeight: 600,
              boxShadow: 1,
              background: ACCENT,
              "&:hover": { background: ACCENT, filter: "brightness(0.95)" },
            }}
          >
            Generate embed code
          </Button>
        ) : (
          <Box
            component={motion.div}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            sx={{ overflow: "hidden" }}
          >
            <Box
              sx={{
                position: "relative",
                borderRadius: 3,
                bgcolor: "#171717",
                color: "#f5f5f5",
                p: 2,
                pr: 10,
                fontFamily: "monospace",
                fontSize: 11,
                lineHeight: 1.6,
                whiteSpace: "pre-wrap",
                wordBreak: "break-all",
              }}
            >
              {code}
              <Box
                component="button"
                onClick={() => {
                  navigator.clipboard?.writeText(code);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1500);
                }}
                sx={{
                  position: "absolute",
                  top: 10,
                  right: 10,
                  height: 28,
                  px: 1.25,
                  borderRadius: 1.5,
                  fontSize: 11,
                  fontWeight: 600,
                  color: "#171717",
                  bgcolor: "white",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                  "&:hover": { bgcolor: "neutral.100" },
                }}
              >
                <ContentCopy sx={{ fontSize: 12 }} /> {copied ? "Copied!" : "Copy"}
              </Box>
            </Box>
            <Box sx={{ fontSize: 11.5, color: "neutral.500", mt: 1, display: "flex", flexDirection: "column", gap: 0.25 }}>
              <Box>
                Renders:{" "}
                <Box component="span" sx={{ fontWeight: 500 }}>
                  {b.config.mountMode === "element"
                    ? `inside ${b.config.mountSelector}`
                    : "floating at the page root"}
                </Box>
              </Box>
              {b.config.siteUrls.trim() && (
                <Box>
                  Appears on: <Box component="span" sx={{ fontWeight: 500 }}>{b.config.siteUrls}</Box>
                </Box>
              )}
            </Box>

            {/* platform instructions */}
            <Box sx={{ mt: 2 }}>
              <Typography sx={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "neutral.400", mb: 1 }}>
                How to install
              </Typography>
              <Stack direction="row" sx={{ flexWrap: "wrap", gap: 0.75, mb: 1.25 }}>
                {PLATFORMS.map((pl) => {
                  const sel = platform === pl;
                  return (
                    <Box
                      component="button"
                      key={pl}
                      onClick={() => setPlatform(pl)}
                      sx={{
                        height: 28,
                        px: 1.5,
                        borderRadius: 999,
                        fontSize: 11,
                        fontWeight: 600,
                        border: "1px solid",
                        cursor: "pointer",
                        transition: "all 0.15s",
                        background: sel ? ACCENT : "white",
                        borderColor: sel ? ACCENT : "#e5e7eb",
                        color: sel ? "white" : "#374151",
                      }}
                    >
                      {pl}
                    </Box>
                  );
                })}
              </Stack>
              <AnimatePresence mode="wait">
                <Box
                  component={motion.div}
                  key={platform}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.2 }}
                  sx={{
                    borderRadius: 3,
                    border: "1px solid",
                    borderColor: "neutral.200",
                    bgcolor: "neutral.50",
                    p: 1.75,
                    fontSize: 12,
                    color: "neutral.700",
                    lineHeight: 1.6,
                  }}
                >
                  {PLATFORM_INSTRUCTIONS[platform]}
                </Box>
              </AnimatePresence>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
}
