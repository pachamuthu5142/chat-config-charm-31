import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import { ThemeProvider, CssBaseline, Box, Button, Typography, Stack } from "@mui/material";

import appCss from "../styles.css?url";
import { theme } from "../theme";
import { reportLovableError } from "../lib/lovable-error-reporting";

function CenteredMessage({ children }: { children: ReactNode }) {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: 2,
        bgcolor: "background.default",
      }}
    >
      <Box sx={{ maxWidth: 420, textAlign: "center" }}>{children}</Box>
    </Box>
  );
}

function NotFoundComponent() {
  return (
    <CenteredMessage>
      <Typography variant="h2" sx={{ fontWeight: 700 }}>
        404
      </Typography>
      <Typography variant="h6" sx={{ mt: 1 }}>
        Page not found
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
        The page you're looking for doesn't exist or has been moved.
      </Typography>
      <Button component={Link} to="/" variant="contained" sx={{ mt: 3 }}>
        Go home
      </Button>
    </CenteredMessage>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <CenteredMessage>
      <Typography variant="h6">This page didn't load</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
        Something went wrong on our end. You can try refreshing or head back home.
      </Typography>
      <Stack direction="row" spacing={1} sx={{ mt: 3, justifyContent: "center" }}>
        <Button
          variant="contained"
          onClick={() => {
            router.invalidate();
            reset();
          }}
        >
          Try again
        </Button>
        <Button variant="outlined" href="/">
          Go home
        </Button>
      </Stack>
    </CenteredMessage>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "ChatWidget Configuration" },
      { name: "description", content: "Configure your embeddable chat widget: templates, appearance, content, and installation." },
      { property: "og:title", content: "ChatWidget Configuration" },
      { property: "og:description", content: "Configure your embeddable chat widget: templates, appearance, content, and installation." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "ChatWidget Configuration" },
      { name: "twitter:description", content: "Configure your embeddable chat widget: templates, appearance, content, and installation." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/c266f390-1eca-4e65-a0f8-c05f3e549caa/id-preview-a9911dd8--0d52497c-65ef-40d5-b1c1-a89a93ca4296.lovable.app-1784494345460.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/c266f390-1eca-4e65-a0f8-c05f3e549caa/id-preview-a9911dd8--0d52497c-65ef-40d5-b1c1-a89a93ca4296.lovable.app-1784494345460.png" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
        <Outlet />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
