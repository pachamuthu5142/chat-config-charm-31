import { createTheme } from "@mui/material/styles";

/**
 * Single source of truth for the app's Material Design theme.
 * All styling in this project is done with MUI (theme + sx) — no Tailwind, no shadcn.
 */
export const ACCENT = "#f05742";
export const SIDEBAR_BG = "#1e2028";

export const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: ACCENT, contrastText: "#ffffff" },
    secondary: { main: "#1e2028" },
    success: { main: "#22a06b" },
    background: { default: "#f0f1f3", paper: "#ffffff" },
    text: { primary: "#1e2028", secondary: "#5c6070" },
  },
  shape: { borderRadius: 10 },
  typography: {
    fontFamily: '"DM Sans", system-ui, -apple-system, sans-serif',
    h6: { fontWeight: 700 },
    subtitle2: { fontWeight: 700 },
    button: { textTransform: "none", fontWeight: 600 },
  },
  components: {
    MuiButton: { defaultProps: { disableElevation: false } },
    MuiTextField: { defaultProps: { size: "small" } },
    MuiSelect: { defaultProps: { size: "small" } },
  },
});

export default theme;
